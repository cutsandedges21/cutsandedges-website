# Cuts & Edges — Instagram Feed Design Spec

**Date:** 2026-06-22
**Status:** Implemented

> **Revision 2026-06-22 — data source changed to Behold.so.** The owner could not create
> a Meta developer account, so the official Instagram Graph API path (own Meta app +
> long-lived token + refresh + PAT) was replaced with the free **Behold.so** JSON feed.
> Behold runs the Meta app on its side; you connect Instagram through Behold and get a
> public JSON feed URL (no token, no developer account) that still includes like/comment
> counts. The architecture below is otherwise unchanged: a scheduled GitHub Action fetches
> the feed, caches images into the repo, and commits `src/data/instagram.json`, which the
> `InstagramStrip` component renders. Sections 4 and 9 reflect Behold; the token/refresh/PAT
> machinery in the original Graph-API write-up no longer applies. Owner setup is in
> `docs/instagram-setup.md`.

## 1. Overview

Replace the placeholder Instagram strip with a real feed of the **4 latest posts**
from the `@cutsandedges21` Instagram **Business** account. Each tile shows the post
image, caption, and like/comment counts, and links out to the post on Instagram.

The feed is populated by a **scheduled GitHub Action** (no backend, no runtime API
calls) that fetches posts via the official Instagram API, caches the images into the
repo, and commits a JSON data file. The push triggers the existing Netlify/Vercel
auto-deploy. Everything is **free**.

This mirrors the approach used by spot6management.com (image + caption + engagement
counts, with images mirrored to their own CDN to avoid Instagram's expiring URLs).

## 2. Goals & Non-Goals

**Goals**
- Show the **4 most recent posts of any type** (reels, photos, or carousels).
- Each tile: cached image + trimmed caption + ♥ like count + 💬 comment count, linking
  to the post's permalink.
- **Gallery** shows all 4; **Home** (section 04) shows the 2 most recent.
- Stay **$0** and require **no server** — fits the existing static Vite build.
- Never visibly break: the site builds and renders even if the API or Action fails.
- Feed stays fresh (~weekly) and the access token never expires unattended.

**Non-Goals (out of scope)**
- No real-time updates (weekly refresh is sufficient).
- No actual comment **text** — counts only (matches the spot6 approach).
- No autoplaying video in the strip — reels render as their cover thumbnail.
- No third-party widget/SaaS.
- No display of stories or non-owned accounts.

## 3. Chosen Approach

**Scheduled GitHub Action + cached images committed to the repo.**

```
                  ┌─────────────── GitHub Actions (cron: weekly) ──────────────┐
   GH Secrets ───▶│  1. Refresh long-lived token  (graph.instagram.com)         │
 (token, PAT)     │  2. GET /me/media?fields=...,like_count,comments_count       │
                  │  3. Download image (or reel cover) → public/instagram/<id>.jpg│
                  │  4. Write src/data/instagram.json                            │
                  │  5. Save refreshed token back to repo secret (via PAT)       │
                  │  6. git commit + push (only if changed)                      │
                  └───────────────────────────┬─────────────────────────────────┘
                                               │ push triggers
                                               ▼
                                  Netlify / Vercel auto-rebuild
                                               │
                                               ▼
   InstagramStrip.jsx ──imports──▶ src/data/instagram.json + /instagram/*.jpg
```

Approaches considered and rejected:
- **Build-time fetch only** — feed goes stale between deploys and the token dies if the
  site isn't rebuilt within 60 days. Fragile.
- **Runtime serverless proxy** — hits Instagram on every visit (slower, rate limits),
  images still expire, and a cron is still needed to refresh the token. More moving
  parts, no benefit here.

## 4. Data Source — Behold.so JSON feed (verified 2026-06)

- **Why Behold:** the owner could not create a Meta developer account. Behold runs the
  Meta app on its side, so connecting Instagram needs no developer account and the feed
  needs **no token** (the feed URL is public and safe to expose).
- **Account:** must be Business or Creator (✓ `@cutsandedges21` is Business).
- **Free plan:** up to 6 posts (we use 4), daily refresh, includes like/comment counts.
  There is a monthly *view* cap — mitigated by fetching server-side and caching images
  into the repo, so visitor traffic never hits Behold.
- **Feed fetch:** `GET <BEHOLD_FEED_URL>` → JSON `{ ..., posts: [...] }`.
- **Post fields used:** `id`, `mediaType` (`IMAGE`|`VIDEO`|`CAROUSEL_ALBUM`), `permalink`,
  `caption` / `prunedCaption` (hashtags removed — preferred for display), `likeCount`,
  `commentsCount`, `timestamp`, and `sizes` (`small`/`medium`/`large`/`full`, each with
  `mediaUrl`). Carousels also carry a `children` array.
- **Image selection:** use `sizes` (prefer `large` → `medium` → `full` → `small`);
  carousels fall back to the first child. Behold serves optimized **webp** images, so
  reels/videos already expose a usable cover image via `sizes` (no `thumbnail_url` needed).
- **No token, no refresh, no PAT** — the `BEHOLD_FEED_URL` is stored as a non-secret repo
  **variable**.

## 5. Components

### 5.1 `scripts/fetch-instagram.mjs`
Node script, no new runtime dependencies (uses built-in `fetch`). Responsibilities:
1. Refresh the long-lived token; capture the new token value.
2. Fetch recent media with the field set above.
3. Take the latest 4 items (any type). Map each via a pure `transform()` function to
   the data shape in §6.
4. Download each item's image (photo `media_url`, reel/video `thumbnail_url`, carousel
   first child) to `public/instagram/<id>.jpg`.
5. Prune `public/instagram/` of files not in the current 4.
6. Write `src/data/instagram.json`.
7. Output the refreshed token so the workflow can save it back to the secret.

The `transform()` logic is a **pure, exported function** so it can be unit-tested
without network access.

### 5.2 `.github/workflows/instagram.yml`
- Triggers: `schedule` (weekly cron) + `workflow_dispatch` (manual "Run workflow").
- Steps: checkout → setup Node → run `fetch-instagram.mjs` with `IG_ACCESS_TOKEN` →
  write refreshed token back to the `IG_ACCESS_TOKEN` secret using `IG_REFRESH_PAT`
  (via `gh secret set`) → commit & push `src/data/instagram.json` and
  `public/instagram/*` if changed (using the default `GITHUB_TOKEN`).
- Note: a push by `GITHUB_TOKEN` still fires the Netlify/Vercel deploy webhook.

### 5.3 `InstagramStrip.jsx` (updated)
- New `limit` prop (default 4), same pattern as `Testimonials limit={2}`.
- Imports `src/data/instagram.json`, slices to `limit`, renders each tile: cached
  image, ♥ likes · 💬 comments, caption clamped to ~2 lines, whole tile links to
  `permalink` (`target="_blank" rel="noreferrer"`).
- **Fallback:** if the data is empty/missing, render today's behavior — plain
  placeholder tiles + the `@cutsandedges21` handle link. The component never throws and
  the build never depends on a live API call.

### 5.4 Placement
- **Gallery** (`src/pages/Gallery.jsx`): `<InstagramStrip limit={4} />`.
- **Home** (`src/pages/Home.jsx`, section 04): `<InstagramStrip limit={2} />`.

### 5.5 Styling
Extend the existing `.insta` / `.insta__tile` rules in `src/styles/global.css`. Tiles
keep their current proportions; caption + counts are layered in. Reels and photos
render identically (both are still images).

## 6. Data Contract — `src/data/instagram.json`

Array of up to 4 objects:

```json
[
  {
    "id": "178414...",
    "type": "REELS",
    "image": "/instagram/178414.jpg",
    "caption": "Fresh cut this week ✂️",
    "likes": 75,
    "comments": 3,
    "permalink": "https://www.instagram.com/reel/DPu2.../",
    "timestamp": "2026-06-20T14:00:00+0000"
  }
]
```

- `type`: one of `IMAGE | CAROUSEL | REELS | VIDEO`.
- `image`: always a local path under `/instagram/` (never a remote Instagram URL).
- `likes`/`comments`: integers; if `like_count` is hidden/absent it is omitted and the
  component hides that figure rather than showing 0.
- Committed to the repo so the build is fully self-contained.

## 7. Error Handling

- **Before first run / empty data:** component falls back to placeholder tiles.
- **Fetch run fails:** no commit happens; the last good `instagram.json` and images stay
  in place, so the live site is unaffected.
- **Token within 24h of issuance:** refresh is skipped that run (cannot refresh
  <24h-old tokens); fetch still proceeds with the current token.
- **A media item missing an image URL:** that item is skipped; the script keeps up to 4
  valid items.

## 8. Testing

- **Unit (Vitest, `src/test/`):** the pure helpers in `src/lib/instagram.js`
  (`mediaType`, `pickImageUrl`, `trimCaption`, `transformMedia`, `selectLatest`,
  `feedItems`) over Behold-shaped fixtures — covers image/video/carousel, missing
  counts, caption trimming (incl. emoji boundaries), and the empty→fallback decision.
  No network, no DOM. (The project has no React Testing Library, so component rendering
  is verified via build, not a render test.)
- **Manual:** run `fetch-instagram.mjs` locally once with `BEHOLD_FEED_URL` set to
  confirm output; then trigger the workflow via "Run workflow" and confirm images land
  in `public/instagram/` and the strip renders them live.

## 9. One-Time Setup (owner-performed, ~10 min, free)

Documented as a step-by-step checklist in `docs/instagram-setup.md`. Summary:
1. Confirm `@cutsandedges21` is a Business/Creator account (✓).
2. Sign up free at behold.so, connect Instagram, create a feed.
3. Copy the feed's public JSON URL.
4. Add it as a GitHub repo **variable** `BEHOLD_FEED_URL` (Settings → Secrets and
   variables → Actions → Variables). No secrets needed.
5. Run the workflow once via "Run workflow".

After setup, the feed is self-maintaining: the weekly Action refreshes the posts. No
token to keep alive.

## 10. Files Touched

| File | Change |
|---|---|
| `scripts/fetch-instagram.mjs` | new — fetch/transform/cache/write |
| `.github/workflows/instagram.yml` | new — scheduled Behold fetch + commit (no secrets) |
| `src/data/instagram.json` | new — generated data (seeded with `[]`) |
| `public/instagram/` | new — cached images (generated) |
| `src/components/InstagramStrip.jsx` | edit — read data, `limit` prop, fallback |
| `src/pages/Home.jsx` | edit — `<InstagramStrip limit={2} />` |
| `src/pages/Gallery.jsx` | edit — `<InstagramStrip limit={4} />` |
| `src/styles/global.css` | edit — caption/counts tile styling |
| `src/test/instagram.test.js` | new — `transform()` + fallback tests |
| `docs/.../instagram-setup.md` | new — owner setup checklist |
