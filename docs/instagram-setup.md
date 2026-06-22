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

**If the run fails with an auth/permission error:** in the Meta app dashboard, make sure
`@cutsandedges21` is listed as the connected/authorized account under "API setup with
Instagram login" (re-do step 3 to mint a fresh token if needed). The app can stay in
Development mode for your own account, but the account must be connected to the app.

## Maintenance
None. The workflow runs every Monday, refreshes the token, and updates the feed
automatically. If you ever change the Instagram account, repeat steps 3 and 5.
