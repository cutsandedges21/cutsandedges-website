# Cuts & Edges — Instagram Feed Design Spec

**Date:** 2026-06-22
**Status:** Approved (design); ready for implementation planning

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

## 4. Instagram API Details (verified 2026-06)

- **API:** "Instagram API with Instagram Login" (successor to the shut-down Basic
  Display API). Host: `graph.instagram.com`.
- **Account:** must be Business or Creator (✓ `@cutsandedges21` is Business).
- **App review:** **not required** for reading your *own* account ("Standard Access").
- **Media fetch:**
  `GET https://graph.instagram.com/me/media?fields=id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,children{media_url,media_type,thumbnail_url}&access_token=…`
  (`children{…}` is required so carousel albums expose a usable image, since a
  `CAROUSEL_ALBUM`'s top-level `media_url` can be null.)
- **Media types:** photos use `media_url`; **reels/videos** return `media_type=VIDEO`
  (with `media_product_type=REELS`) and use `thumbnail_url` for the cover image;
  carousels use the first child's image.
- **Token lifecycle:** short-lived (1h) → long-lived (60 days) → refreshed via
  `GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=…`.
  Refresh returns a **new** token value with a fresh 60-day expiry (old token stays
  valid until its original expiry), so the new value **must be persisted** for the next
  run.
- **Rate limit:** 200 requests/hour/account — we use ~2/day.

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

- **Unit (Vitest, `src/test/`):** `transform()` over a committed sample API-response
  fixture — covers photo vs. reel vs. carousel, missing `like_count`, and caption
  trimming. No network.
- **Component:** `InstagramStrip` renders real tiles from sample data; renders
  placeholders when data is empty.
- **Manual:** run `fetch-instagram.mjs` locally once with a token to confirm output;
  then trigger the workflow via "Run workflow" and confirm images land in
  `public/instagram/` and the strip renders them live.

## 9. One-Time Setup (owner-performed, ~20 min, free)

Documented as a step-by-step checklist in the repo. Summary:
1. Confirm `@cutsandedges21` is a Business/Creator account (✓).
2. Create a free Meta developer account → new **Business** app → add **Instagram** →
   "API setup with Instagram login."
3. Generate a token; use a provided one-time command to exchange it into a 60-day
   long-lived token and read the account user ID.
4. Create a GitHub **fine-grained PAT** with "Secrets: write" permission.
5. Add two GitHub repo secrets: `IG_ACCESS_TOKEN` (long-lived token) and
   `IG_REFRESH_PAT` (the PAT).

After setup, the feed is self-maintaining: the weekly Action keeps the token alive and
the posts current.

## 10. Files Touched

| File | Change |
|---|---|
| `scripts/fetch-instagram.mjs` | new — fetch/transform/cache/write |
| `.github/workflows/instagram.yml` | new — scheduled fetch + token persist + commit |
| `src/data/instagram.json` | new — generated data (seeded with `[]`) |
| `public/instagram/` | new — cached images (generated) |
| `src/components/InstagramStrip.jsx` | edit — read data, `limit` prop, fallback |
| `src/pages/Home.jsx` | edit — `<InstagramStrip limit={2} />` |
| `src/pages/Gallery.jsx` | edit — `<InstagramStrip limit={4} />` |
| `src/styles/global.css` | edit — caption/counts tile styling |
| `src/test/instagram.test.js` | new — `transform()` + fallback tests |
| `docs/.../instagram-setup.md` | new — owner setup checklist |
