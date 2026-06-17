# Cuts & Edges — Website

A bilingual (EN/FR), mobile-responsive marketing site for Cuts & Edges lawn care, built with Vite + React. Editorial, cinematic design with full-bleed drone-video heroes on every page.

## Run

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # preview the production build
npm test           # run unit tests (i18n parity, lawn calc, form validation)
```

## Pages

`/` Home · `/services` · `/gallery` · `/about` · `/contact` · `/privacy` · `/terms`

## Quote form (email delivery)

The contact form has **no backend**. To receive submissions by email, create a free form
endpoint (e.g. [Formspree](https://formspree.io)) and set it in a `.env` file:

```
VITE_FORM_ENDPOINT=https://formspree.io/f/your-form-id
```

If no endpoint is configured (or it fails), the form falls back to opening the visitor's
email client addressed to `cutsandedges21@gmail.com`.

## Content & translations

- UI strings: `src/i18n/en.js` and `src/i18n/fr.js` (kept in lockstep — a test enforces it).
- Shared data (services, testimonials, contact info, gallery clips): `src/i18n/content.js`.

## Videos

Optimized, web-ready clips live in `public/videos/` (transcoded from the originals in
`Videos/`). To regenerate or swap a hero clip, transcode the source to ~1080p with capped
bitrate, e.g.:

```bash
ffmpeg -ss 3 -t 18 -i "Videos/<source>.mp4" -vf "scale=-2:1080,fps=30" -an \
  -c:v libx264 -crf 28 -maxrate 3000k -bufsize 6000k -movflags +faststart \
  public/videos/<name>.mp4
# poster:
ffmpeg -ss 4 -i "Videos/<source>.mp4" -frames:v 1 -vf "scale=-2:1080" public/videos/<name>-poster.jpg
```

Hero assignments are set per page in `src/pages/*.jsx`.

## Design & planning docs

`docs/superpowers/specs/` (design spec) and `docs/superpowers/plans/` (implementation plan).
