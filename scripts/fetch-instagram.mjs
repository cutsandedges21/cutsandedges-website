// Fetches the latest Instagram posts for @cutsandedges21, caches their images into
// public/instagram/, and writes src/data/instagram.json. Run weekly by GitHub Actions
// (see .github/workflows/instagram.yml) or locally with IG_ACCESS_TOKEN set.

import { writeFile, mkdir, readdir, unlink, appendFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { selectLatest, transformMedia, pickImageUrl } from '../src/lib/instagram.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const IMAGE_DIR = join(ROOT, 'public', 'instagram')
const DATA_FILE = join(ROOT, 'src', 'data', 'instagram.json')
const FIELDS = 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,children{media_url,media_type,thumbnail_url}'

const token = process.env.IG_ACCESS_TOKEN
if (!token) {
  console.error('IG_ACCESS_TOKEN is not set.')
  process.exit(1)
}

// Refresh the long-lived token (no-op if it is <24h old). Returns the new token or null.
async function refreshToken(currentToken) {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`Token refresh skipped (HTTP ${res.status}). Continuing with current token.`)
    return null
  }
  const json = await res.json()
  return json.access_token || null
}

async function fetchMedia(activeToken) {
  const url = `https://graph.instagram.com/me/media?fields=${encodeURIComponent(FIELDS)}&limit=12&access_token=${activeToken}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Media fetch failed: HTTP ${res.status} — ${await res.text()}`)
  const json = await res.json()
  return Array.isArray(json.data) ? json.data : []
}

async function downloadImage(imageUrl, destPath) {
  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`Image download failed: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(destPath, buf)
}

// Remove cached images that are no longer part of the current feed (keep .gitkeep).
async function pruneImages(keepFilenames) {
  const existing = await readdir(IMAGE_DIR)
  for (const name of existing) {
    if (name === '.gitkeep') continue
    if (!keepFilenames.has(name)) await unlink(join(IMAGE_DIR, name))
  }
}

async function main() {
  await mkdir(IMAGE_DIR, { recursive: true })

  const newToken = await refreshToken(token)
  const activeToken = newToken || token

  const media = await fetchMedia(activeToken)
  const latest = selectLatest(media, 4)

  const items = []
  const keep = new Set(['.gitkeep'])
  for (const m of latest) {
    const filename = `${m.id}.jpg`
    await downloadImage(pickImageUrl(m), join(IMAGE_DIR, filename))
    keep.add(filename)
    items.push(transformMedia(m, `/instagram/${filename}`))
  }

  await pruneImages(keep)
  await writeFile(DATA_FILE, JSON.stringify(items, null, 2) + '\n')
  console.log(`Wrote ${items.length} posts to src/data/instagram.json`)

  // Hand the refreshed token back to the workflow so it can update the repo secret.
  if (newToken && process.env.GITHUB_OUTPUT) {
    console.log(`::add-mask::${newToken}`)
    await appendFile(process.env.GITHUB_OUTPUT, `token=${newToken}\n`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
