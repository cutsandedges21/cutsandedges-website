// Fetches the latest Instagram posts via the Behold.so JSON feed, caches their images
// into public/instagram/, and writes src/data/instagram.json. Run weekly by GitHub
// Actions (see .github/workflows/instagram.yml) or locally with BEHOLD_FEED_URL set.
//
// No Instagram/Meta token is needed — the Behold feed URL is public and safe to expose.
// Caching images into the repo keeps the site fast and self-contained, and means
// visitor traffic never counts against Behold's free monthly view cap.

import { writeFile, mkdir, readdir, unlink } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { selectLatest, transformMedia, pickImageUrl } from '../src/lib/instagram.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const IMAGE_DIR = join(ROOT, 'public', 'instagram')
const DATA_FILE = join(ROOT, 'src', 'data', 'instagram.json')

const feedUrl = process.env.BEHOLD_FEED_URL
if (!feedUrl) {
  console.error('BEHOLD_FEED_URL is not set.')
  process.exit(1)
}

async function fetchFeed(url) {
  const res = await fetch(url)
  if (!res.ok) {
    // Cap the logged body so an unexpectedly large response can't flood the log.
    const body = (await res.text()).slice(0, 500)
    throw new Error(`Behold feed fetch failed: HTTP ${res.status} — ${body}`)
  }
  const json = await res.json()
  return Array.isArray(json.posts) ? json.posts : []
}

const EXT_BY_TYPE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

// Download an image and save it as <id>.<ext>, picking the extension from the response
// content-type (Behold may serve jpg or webp). Returns the filename written.
async function downloadImage(imageUrl, id) {
  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`Image download failed: HTTP ${res.status}`)
  const type = (res.headers.get('content-type') || '').split(';')[0].trim()
  const filename = `${id}.${EXT_BY_TYPE[type] || 'jpg'}`
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(join(IMAGE_DIR, filename), buf)
  return filename
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

  const posts = await fetchFeed(feedUrl)
  const latest = selectLatest(posts, 4)

  // Guard: never wipe a good feed if the fetch transiently returns no imageable posts.
  if (latest.length === 0) {
    console.log('::warning::Behold feed returned no posts with a usable image; keeping existing feed data.')
    return
  }

  const items = []
  const keep = new Set(['.gitkeep'])
  for (const post of latest) {
    const filename = await downloadImage(pickImageUrl(post), post.id)
    keep.add(filename)
    items.push(transformMedia(post, `/instagram/${filename}`))
  }

  await pruneImages(keep)
  await writeFile(DATA_FILE, JSON.stringify(items, null, 2) + '\n')
  console.log(`Wrote ${items.length} posts to src/data/instagram.json`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
