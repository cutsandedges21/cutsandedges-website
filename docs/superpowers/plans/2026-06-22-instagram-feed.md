# Instagram Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder Instagram strip with the 4 latest `@cutsandedges21` posts (4 on Gallery, 2 on Home), kept fresh by a free weekly GitHub Action that caches images into the repo.

**Architecture:** A weekly GitHub Action runs a Node script that refreshes the long-lived Instagram token, fetches recent media via `graph.instagram.com/me/media`, downloads each image into `public/instagram/`, and writes `src/data/instagram.json`. The push triggers the existing Netlify/Vercel auto-deploy. `InstagramStrip` reads the committed JSON at build time and falls back to placeholder tiles when the data is empty, so the build never depends on a live API call.

**Tech Stack:** React 19 + Vite 6, Vitest (pure-ESM unit tests, no DOM), Node 20 built-in `fetch`, GitHub Actions, `gh` CLI.

**Conventions:** All modules are ESM (`"type": "module"`). Tests live in `src/test/*.test.js` and import from `src/lib/`. End every commit message with a second `-m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"`. Work happens on the existing `instagram-feed` branch.

**Reference:** Design spec at `docs/superpowers/specs/2026-06-22-instagram-feed-design.md`.

---

### Task 1: Pure data-shaping library + tests

The shared, network-free logic used by both the fetch script and the React component. TDD.

**Files:**
- Create: `src/lib/instagram.js`
- Test: `src/test/instagram.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/test/instagram.test.js`:

```js
import { describe, it, expect } from 'vitest'
import {
  mediaType, pickImageUrl, trimCaption, transformMedia, selectLatest, feedItems,
} from '../lib/instagram.js'

describe('mediaType', () => {
  it('maps reels, carousels, images, and videos', () => {
    expect(mediaType({ media_type: 'VIDEO', media_product_type: 'REELS' })).toBe('REELS')
    expect(mediaType({ media_type: 'CAROUSEL_ALBUM' })).toBe('CAROUSEL')
    expect(mediaType({ media_type: 'IMAGE' })).toBe('IMAGE')
    expect(mediaType({ media_type: 'VIDEO', media_product_type: 'FEED' })).toBe('VIDEO')
  })
})

describe('pickImageUrl', () => {
  it('uses media_url for images', () => {
    expect(pickImageUrl({ media_type: 'IMAGE', media_url: 'a.jpg' })).toBe('a.jpg')
  })
  it('uses thumbnail_url for videos/reels', () => {
    expect(pickImageUrl({ media_type: 'VIDEO', thumbnail_url: 't.jpg' })).toBe('t.jpg')
  })
  it('uses the first child for carousels', () => {
    const media = { media_type: 'CAROUSEL_ALBUM', children: { data: [{ media_type: 'IMAGE', media_url: 'c.jpg' }] } }
    expect(pickImageUrl(media)).toBe('c.jpg')
  })
  it('returns null when no usable image exists', () => {
    expect(pickImageUrl({ media_type: 'VIDEO' })).toBeNull()
    expect(pickImageUrl({ media_type: 'CAROUSEL_ALBUM', children: { data: [] } })).toBeNull()
  })
})

describe('trimCaption', () => {
  it('returns empty string for missing captions', () => {
    expect(trimCaption(undefined)).toBe('')
  })
  it('leaves short captions unchanged', () => {
    expect(trimCaption('Fresh cut')).toBe('Fresh cut')
  })
  it('trims long captions on a word boundary with an ellipsis', () => {
    const caption = 'a'.repeat(60) + ' ' + 'b'.repeat(80) // 141 chars
    expect(trimCaption(caption, 120)).toBe('a'.repeat(60) + '…')
  })
})

describe('transformMedia', () => {
  it('builds the stored shape with engagement counts', () => {
    const media = {
      id: '123', media_type: 'IMAGE', media_url: 'x.jpg',
      caption: 'Hi', permalink: 'https://insta/p/123',
      timestamp: '2026-06-20T14:00:00+0000', like_count: 75, comments_count: 3,
    }
    expect(transformMedia(media, '/instagram/123.jpg')).toEqual({
      id: '123', type: 'IMAGE', image: '/instagram/123.jpg',
      caption: 'Hi', permalink: 'https://insta/p/123',
      timestamp: '2026-06-20T14:00:00+0000', likes: 75, comments: 3,
    })
  })
  it('omits counts that are hidden/absent', () => {
    const media = { id: '9', media_type: 'IMAGE', media_url: 'x.jpg', caption: '', permalink: 'p', timestamp: 't' }
    const out = transformMedia(media, '/instagram/9.jpg')
    expect(out).not.toHaveProperty('likes')
    expect(out).not.toHaveProperty('comments')
  })
})

describe('selectLatest', () => {
  it('keeps the first N items that have a usable image', () => {
    const list = [
      { id: '1', media_type: 'IMAGE', media_url: 'a.jpg' },
      { id: '2', media_type: 'VIDEO' },                 // no image → skipped
      { id: '3', media_type: 'IMAGE', media_url: 'c.jpg' },
      { id: '4', media_type: 'IMAGE', media_url: 'd.jpg' },
      { id: '5', media_type: 'IMAGE', media_url: 'e.jpg' },
    ]
    expect(selectLatest(list, 3).map(m => m.id)).toEqual(['1', '3', '4'])
  })
  it('returns [] for non-array input', () => {
    expect(selectLatest(null, 4)).toEqual([])
  })
})

describe('feedItems', () => {
  it('slices to the limit', () => {
    const data = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
    expect(feedItems(data, 2).map(x => x.id)).toEqual(['a', 'b'])
  })
  it('returns [] for empty or non-array data (triggers fallback)', () => {
    expect(feedItems([], 4)).toEqual([])
    expect(feedItems(null, 4)).toEqual([])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- instagram`
Expected: FAIL — cannot resolve `../lib/instagram.js` (module not found).

- [ ] **Step 3: Write the implementation**

Create `src/lib/instagram.js`:

```js
// Pure helpers for shaping Instagram Graph API media into the data our UI renders.
// No network or filesystem access here so it can be unit-tested in isolation.

// Normalize Instagram's media-type fields into a single display type.
export function mediaType(media) {
  if (media.media_product_type === 'REELS') return 'REELS'
  if (media.media_type === 'CAROUSEL_ALBUM') return 'CAROUSEL'
  return media.media_type // 'IMAGE' | 'VIDEO'
}

// Choose the best still-image URL (cover frame for video/reels, first child for
// carousels). Returns null when no usable image exists.
export function pickImageUrl(media) {
  if (media.media_type === 'VIDEO') return media.thumbnail_url || null
  if (media.media_type === 'CAROUSEL_ALBUM') {
    const first = media.children && media.children.data && media.children.data[0]
    if (!first) return null
    return first.media_type === 'VIDEO'
      ? first.thumbnail_url || null
      : first.media_url || null
  }
  return media.media_url || null
}

// Trim a caption to maxLen characters on a word boundary, adding an ellipsis.
export function trimCaption(caption, maxLen = 120) {
  if (!caption) return ''
  const clean = caption.trim()
  if (clean.length <= maxLen) return clean
  const slice = clean.slice(0, maxLen)
  const lastSpace = slice.lastIndexOf(' ')
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd() + '…'
}

// Transform one raw API media object into our stored shape.
// imagePath is the local cached path the caller assigns (e.g. "/instagram/<id>.jpg").
export function transformMedia(media, imagePath) {
  const item = {
    id: media.id,
    type: mediaType(media),
    image: imagePath,
    caption: trimCaption(media.caption),
    permalink: media.permalink,
    timestamp: media.timestamp,
  }
  if (Number.isInteger(media.like_count)) item.likes = media.like_count
  if (Number.isInteger(media.comments_count)) item.comments = media.comments_count
  return item
}

// From a raw API media list, keep the first `limit` items that have a usable image.
export function selectLatest(list, limit = 4) {
  if (!Array.isArray(list)) return []
  return list.filter(m => pickImageUrl(m) !== null).slice(0, limit)
}

// What the component should render: the feed sliced to `limit`,
// or [] (which triggers the placeholder fallback).
export function feedItems(data, limit) {
  if (!Array.isArray(data)) return []
  return data.slice(0, limit)
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- instagram`
Expected: PASS — all describe blocks green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/instagram.js src/test/instagram.test.js
git commit -m "feat: add pure Instagram media-shaping helpers" \
  -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Seed data file and image directory

The component imports the JSON, so the file must exist (seeded empty → fallback renders until the first fetch runs).

**Files:**
- Create: `src/data/instagram.json`
- Create: `public/instagram/.gitkeep`

- [ ] **Step 1: Create the seed data file**

Create `src/data/instagram.json` with exactly:

```json
[]
```

- [ ] **Step 2: Create the image directory placeholder**

Create an empty file `public/instagram/.gitkeep` (no content) so the cache directory exists in the repo.

- [ ] **Step 3: Verify the build still works**

Run: `npm run build`
Expected: build succeeds (no import errors).

- [ ] **Step 4: Commit**

```bash
git add src/data/instagram.json public/instagram/.gitkeep
git commit -m "chore: seed empty Instagram feed data + cache dir" \
  -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Update the InstagramStrip component

Render real tiles from the data, accept a `limit` prop, and fall back to placeholders when empty.

**Files:**
- Modify: `src/components/InstagramStrip.jsx` (full rewrite — currently 16 lines)

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/components/InstagramStrip.jsx` with:

```jsx
import { CONTACT } from '../i18n/content.js'
import instagramData from '../data/instagram.json'
import { feedItems } from '../lib/instagram.js'

export default function InstagramStrip({ limit = 4 }) {
  const items = feedItems(instagramData, limit)

  const handleLink = (
    <a className="link-underline" href={CONTACT.instagram} target="_blank" rel="noreferrer">
      {CONTACT.handle}
    </a>
  )

  // Fallback: no data yet (e.g. before first fetch) → placeholder tiles.
  if (items.length === 0) {
    return (
      <div className="insta">
        <div className="insta__tiles">
          {Array.from({ length: limit }, (_, i) => <div key={i} className="insta__tile" />)}
        </div>
        {handleLink}
      </div>
    )
  }

  return (
    <div className="insta">
      <div className="insta__tiles">
        {items.map(post => (
          <a
            key={post.id}
            className="insta__tile insta__tile--live"
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
          >
            <img className="insta__img" src={post.image} alt={post.caption || 'Instagram post'} loading="lazy" />
            <div className="insta__overlay">
              <p className="insta__stats">
                {post.likes != null && <span>♥ {post.likes}</span>}
                {post.comments != null && <span>💬 {post.comments}</span>}
              </p>
              {post.caption && <p className="insta__caption">{post.caption}</p>}
            </div>
          </a>
        ))}
      </div>
      {handleLink}
    </div>
  )
}
```

(Note: the previous version imported `useLang` but never used `t`; that unused import is intentionally dropped.)

- [ ] **Step 2: Run unit tests and build to verify nothing broke**

Run: `npm test`
Expected: PASS (all existing + Task 1 tests).
Run: `npm run build`
Expected: build succeeds. With seeded `[]` data, the strip renders placeholder tiles (fallback path).

- [ ] **Step 3: Commit**

```bash
git add src/components/InstagramStrip.jsx
git commit -m "feat: render real Instagram tiles with limit prop and fallback" \
  -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Wire placement (Home = 2, Gallery = 4)

**Files:**
- Modify: `src/pages/Home.jsx:54`
- Modify: `src/pages/Gallery.jsx:25`

- [ ] **Step 1: Set the Home limit**

In `src/pages/Home.jsx`, change the line:

```jsx
        <InstagramStrip />
```

to:

```jsx
        <InstagramStrip limit={2} />
```

- [ ] **Step 2: Set the Gallery limit**

In `src/pages/Gallery.jsx`, change the line:

```jsx
        <InstagramStrip />
```

to:

```jsx
        <InstagramStrip limit={4} />
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.jsx src/pages/Gallery.jsx
git commit -m "feat: show 2 Instagram tiles on Home, 4 on Gallery" \
  -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Tile styling

Add styles for live tiles (image + always-visible caption/counts overlay). Works on mobile (no hover dependency).

**Files:**
- Modify: `src/styles/global.css` (the `/* ── instagram strip ── */` block, currently lines 69–72)

- [ ] **Step 1: Add the live-tile styles**

In `src/styles/global.css`, find:

```css
/* ── instagram strip ── */
.insta__tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.insta__tile { aspect-ratio: 1; background: var(--wheat); border-radius: 8px; }
@media (max-width: 600px) { .insta__tiles { grid-template-columns: repeat(2, 1fr); } }
```

Replace that block with:

```css
/* ── instagram strip ── */
.insta__tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.insta__tile { aspect-ratio: 1; background: var(--wheat); border-radius: 8px; }
.insta__tile--live { position: relative; overflow: hidden; display: block; color: #fff; }
.insta__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.insta__overlay {
  position: absolute; inset: 0; padding: .7rem;
  display: flex; flex-direction: column; justify-content: flex-end;
  background: linear-gradient(to top, rgba(0, 0, 0, .65), rgba(0, 0, 0, 0) 60%);
}
.insta__stats { display: flex; gap: .9rem; font-size: .85rem; font-weight: 600; margin: 0 0 .3rem; }
.insta__caption {
  font-size: .8rem; line-height: 1.3; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
@media (max-width: 600px) { .insta__tiles { grid-template-columns: repeat(2, 1fr); } }
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "style: caption and engagement overlay for live Instagram tiles" \
  -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Fetch script

Node script that refreshes the token, fetches media, caches images, prunes stale files, and writes the data file. Verified manually (network + filesystem; the pure logic it relies on is already tested in Task 1).

**Files:**
- Create: `scripts/fetch-instagram.mjs`

- [ ] **Step 1: Create the script**

Create `scripts/fetch-instagram.mjs`:

```js
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
```

- [ ] **Step 2: Verify the script parses and reports the missing token**

Run (without a token, to confirm it loads and guards correctly):
`IG_ACCESS_TOKEN= node scripts/fetch-instagram.mjs`
Expected: prints `IG_ACCESS_TOKEN is not set.` and exits non-zero. (A real end-to-end run happens after the owner completes Task 8 setup.)

- [ ] **Step 3: Commit**

```bash
git add scripts/fetch-instagram.mjs
git commit -m "feat: add Instagram fetch-and-cache script" \
  -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: GitHub Actions workflow

Runs the script weekly, persists the refreshed token to the repo secret, and commits any changes (which triggers the Netlify/Vercel deploy).

**Files:**
- Create: `.github/workflows/instagram.yml`

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/instagram.yml`:

```yaml
name: Refresh Instagram feed

on:
  schedule:
    - cron: '0 9 * * 1' # 09:00 UTC every Monday
  workflow_dispatch: {}

permissions:
  contents: write

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Fetch latest Instagram posts
        id: fetch
        env:
          IG_ACCESS_TOKEN: ${{ secrets.IG_ACCESS_TOKEN }}
        run: node scripts/fetch-instagram.mjs

      - name: Persist refreshed token
        if: steps.fetch.outputs.token != ''
        env:
          GH_TOKEN: ${{ secrets.IG_REFRESH_PAT }}
          NEW_TOKEN: ${{ steps.fetch.outputs.token }}
        run: echo "$NEW_TOKEN" | gh secret set IG_ACCESS_TOKEN

      - name: Commit updated feed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add src/data/instagram.json public/instagram
          if git diff --cached --quiet; then
            echo "No feed changes."
          else
            git commit -m "chore: refresh Instagram feed"
            git push
          fi
```

- [ ] **Step 2: Validate YAML syntax**

Run: `node -e "import('node:fs').then(fs => console.log(fs.readFileSync('.github/workflows/instagram.yml','utf8').length + ' bytes OK'))"`
Expected: prints a byte count (file is readable). Final validation happens when the workflow runs on GitHub.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/instagram.yml
git commit -m "ci: weekly Instagram feed refresh workflow" \
  -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Owner setup checklist doc

The exact steps the owner performs once to enable the feed. No code — a reference document.

**Files:**
- Create: `docs/instagram-setup.md`

- [ ] **Step 1: Create the doc**

Create `docs/instagram-setup.md`:

```markdown
# Instagram Feed — One-Time Setup

This connects the website's Instagram strip to the `@cutsandedges21` account. You do
this once (~20 minutes). After that, a weekly GitHub Action keeps it running by itself.
Everything here is free.

## 1. Confirm the account type
`@cutsandedges21` must be a **Business** or **Creator** account (it is). Personal
accounts cannot use the API. Check in the Instagram app: Settings → Account type.

## 2. Create a Meta app
1. Go to https://developers.facebook.com/ and log in / create a free developer account.
2. **My Apps → Create App → Business → Next.**
3. Name it (e.g. "Cuts & Edges Website") and create it.
4. In the app dashboard: **Add product → Instagram → "API setup with Instagram login".**

## 3. Generate a long-lived access token
1. Under "API setup with Instagram login", add `@cutsandedges21` as the connected
   account and log in when prompted (grant the requested permissions).
2. Generate an access token for the account. This is a short-lived (1-hour) token.
3. Exchange it for a 60-day long-lived token. From any terminal, run (replace the
   placeholders with your app's values from the app dashboard → App settings → Basic):

   ```bash
   curl -s "https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=APP_SECRET&access_token=SHORT_LIVED_TOKEN"
   ```

   Copy the `access_token` value from the JSON response — this is your **long-lived token**.

## 4. Create a GitHub token (so the Action can save the refreshed token)
1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.**
2. Repository access: **Only select repositories → `cutsandedges21/cutsandedges-website`.**
3. Permissions → Repository permissions → **Secrets: Read and write.**
4. Generate and copy the token (starts with `github_pat_...`).

## 5. Add both secrets to the repo
In the repo on GitHub: **Settings → Secrets and variables → Actions → New repository secret.**
Add two:
- `IG_ACCESS_TOKEN` → the long-lived token from step 3.
- `IG_REFRESH_PAT` → the GitHub token from step 4.

## 6. Run it once
Repo → **Actions → "Refresh Instagram feed" → Run workflow.** After it finishes, you
should see a new commit ("chore: refresh Instagram feed") with images in
`public/instagram/` and updated `src/data/instagram.json`, and the site will redeploy
showing your real posts.

## Maintenance
None. The workflow runs every Monday, refreshes the token, and updates the feed
automatically. If you ever change the Instagram account, repeat steps 3 and 5.
```

- [ ] **Step 2: Commit**

```bash
git add docs/instagram-setup.md
git commit -m "docs: Instagram feed owner setup checklist" \
  -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final verification (after all tasks)

- [ ] Run `npm test` → all tests pass.
- [ ] Run `npm run build` → succeeds; strip shows placeholder fallback with empty data.
- [ ] Owner completes `docs/instagram-setup.md` and triggers the workflow once.
- [ ] Confirm `public/instagram/` has images, `src/data/instagram.json` has up to 4 posts, and Home (2 tiles) / Gallery (4 tiles) render the real feed with caption + counts.
- [ ] Open the PR from `instagram-feed` → `main` once the live feed is verified.
