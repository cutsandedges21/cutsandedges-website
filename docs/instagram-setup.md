# Instagram Feed — One-Time Setup (via Behold.so)

This connects the website's Instagram strip to the `@cutsandedges21` account using
[Behold.so](https://behold.so), a free service that exposes your posts as a simple JSON
feed. **No Meta developer account and no access tokens are required.** Takes ~10 minutes,
then it runs itself.

## 1. Confirm the account type
`@cutsandedges21` must be a **Business** or **Creator** account (it is). Personal accounts
cannot be connected. Check in the Instagram app: Settings → Account type.

## 2. Create a free Behold account and connect Instagram
1. Go to https://behold.so and sign up (free plan).
2. Add a source / **Connect Instagram**, log in with `@cutsandedges21`, and grant access.
3. Create a feed from that source. The free plan serves up to 6 posts (the site shows 4)
   and includes like and comment counts.

## 3. Copy your JSON feed URL
On the feed's page in Behold, copy its **JSON feed URL** (it looks like
`https://feeds.behold.so/XXXXXXXXXXXX`). This URL is **not secret** — it is safe to expose.

## 4. Add the feed URL to the repo
In the repo on GitHub: **Settings → Secrets and variables → Actions → Variables tab →
New repository variable.**
- **Name:** `BEHOLD_FEED_URL`
- **Value:** the URL you copied in step 3.

(It goes under **Variables**, not Secrets, because the feed URL isn't sensitive.)

## 5. Run it once
Repo → **Actions → "Refresh Instagram feed" → Run workflow.** After it finishes, you
should see a new commit ("chore: refresh Instagram feed") with images in
`public/instagram/` and an updated `src/data/instagram.json`, and the site will redeploy
showing your real posts.

**If the run fails:** open the workflow run log. The most common cause is a missing or
mistyped `BEHOLD_FEED_URL` variable, or the Behold feed not being published yet — recheck
steps 2–4.

## Maintenance
None. The workflow runs every Monday and updates the feed automatically. Behold's free
plan refreshes daily and has a monthly view cap, but because we cache the images into the
repo, **visitor traffic doesn't count against that cap** — only the weekly fetch does. If
you ever change the Instagram account, redo steps 2–4.
