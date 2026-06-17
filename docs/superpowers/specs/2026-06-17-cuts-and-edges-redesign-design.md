# Cuts & Edges — Website Redesign Design Spec

**Date:** 2026-06-17
**Status:** Approved (design); ready for implementation planning

## 1. Overview

Build a **completely new** marketing website for **Cuts & Edges**, a Montreal lawn-care
company. Content/information comes from the existing site
(https://cutsandedges.base44.app). The visual language is a refined, editorial,
cinematic aesthetic inspired by three reference sites — **khufus.com (primary north
star)**, aircenter.space, and monads.ch.

This is a **static visual redesign** (no backend/database). The quote form emails the
owner; the lawn calculator is a client-side widget.

## 2. Goals & Non-Goals

**Goals**
- Multi-page site that feels Khufu's-grade: warm, minimal, cinematic, lots of whitespace.
- Preserve all real content from the original (services, testimonials, locations, contact).
- Bilingual **EN/FR** with a toggle.
- **Fully mobile responsive** (mobile-first, hard requirement).
- Cinematic **video hero** on Home using the owner's drone footage.

**Non-Goals (out of scope)**
- No backend, database, accounts, or admin dashboard.
- No e-commerce/payments.
- No CMS — content is in-code (i18n dictionaries).
- Hosting/deploy not part of this build (static output deployable to Netlify/Vercel/etc.).

## 3. Design System

**Palette — "Forest & Cream"**
| Token | Hex | Use |
|---|---|---|
| cream | `#F4EFE4` | default page background |
| wheat | `#DCD3BE` | panels / alt sections |
| forest | `#2C4A33` | primary (dark sections, buttons, accents) |
| gold | `#C9A871` | accent (CTAs, rules, emphasis) |
| ink | `#22281F` | body text on light |

Light/dark rhythm: most sections are light (cream); hero, CTA bands, and footer go deep
**forest** with cream text.

**Typography**
- Headlines: **Cormorant Garamond** (serif), medium weight, with *italic* emphasis on a key word.
- Labels/eyebrows/nav/body: **Inter** — small, letter-spaced, uppercase for labels.
- Fluid type scale (clamp-based) so headlines shrink gracefully on mobile.

**Recurring components**
- Minimal overlay nav: links left · **Cuts & Edges** wordmark center · EN·FR + hamburger right.
  On mobile collapses to wordmark + hamburger → full-screen slide-in drawer.
- Tiny uppercase eyebrow labels + **numbered section markers** (`01 / Services`).
- Pill buttons: solid gold (primary), ghost outline (secondary); quiet underlined text links.
- Deep-forest footer: contact, service area, Instagram/Facebook, EN·FR, legal links.

**Motion** (restrained; honors `prefers-reduced-motion`)
- Soft fade/rise as sections enter the viewport.
- Subtle parallax on the hero video.
- Hover underlines / gentle button states.
- Optional brief intro fade on first load (lightweight nod to Khufu's intro).

## 4. Pages

Routes: `/` `/services` `/gallery` `/about` `/contact` (+ `/privacy`, `/terms` as simple
static pages preserved from the original).

### 4.1 Home (`/`)
1. **Cinematic video hero** — full-bleed `luxury drone.mp4` (web-optimized) as background,
   dark forest gradient overlay, centered: eyebrow "Excellence in Every Cut", headline
   "Precision Lawn Care, *Perfected*", single underlined CTA "Get Free Quote". Mobile: poster
   image fallback instead of autoplaying video.
2. **Positioning line** (`01`) — "We're not just maintaining lawns — we're creating outdoor
   spaces homeowners love."
3. **Services preview** — the 4 services, elegant; link → Services.
4. **About teaser** — "Excellence in Every Cut" + **5+ Years** stat; link → About.
5. **Featured testimonials** — Robert / Johnny / Claude; link → About.
6. **Instagram strip** — @cutsandedges21 + latest-work tiles; link → Gallery.
7. **CTA band** (forest) — "Get Your Free Quote" → Contact.
8. Footer.

### 4.2 Services (`/services`)
- Header: "Comprehensive Lawn Care Services" + "We charge per cut, with pricing based on
  your lawn size."
- 4 alternating full-width sections, each numbered, with bullet lists:
  1. **Lawn Mowing & Maintenance** — Weekly/bi-weekly service · Precision edging · Debris cleanup
  2. **Landscaping** — Plant selection · Hardscape installation · Garden bed maintenance
  3. **Seasonal Services** — Spring/fall cleanup · Leaf removal · Debris clearing
  4. **Weed Removal** — Manual weed removal · Regular maintenance · Garden bed weeding
- Quote CTA. Footer.

### 4.3 Gallery (`/gallery`)
- Header: "Our Work."
- **Drone footage showcase** — web-optimized clips from the owner's footage (featured player
  + grid). Lazy-loaded; posters on mobile.
- Before/after work tiles (placeholder slots until real photos provided).
- **Instagram** section — @cutsandedges21 + Facebook links.
- CTA. Footer.

### 4.4 About (`/about`)
- Header: "Excellence in Every Cut."
- Story (both original paragraphs, "Since 2021…") + **5+ Years Experience** stat.
- 4 trust points: Modern Equipment · Professional Service · Reliable Scheduling · Quality Guaranteed.
- **All 3 testimonials** (incl. the French one, shown in FR regardless of UI language).
- **Service area** — Rivière-des-Prairies, Pointe-aux-Trembles, Anjou (greater Montreal).
- CTA. Footer.

### 4.5 Contact (`/contact`)
- Header: "Get Your Free Quote" / "customized quote within 24 hours."
- **Quote form** — Full Name*, Email*, Phone*, Lawn Size (Small <1,500 / Medium 1,500–2,000 /
  Large 2,000+), Service Address, Services Needed (checkboxes), Additional Details. Submits via
  a configurable email service (Formspree endpoint in env/config) with a `mailto:` fallback.
  Client-side validation + success/error states.
- **Lawn Calculator** widget — "I don't know my lawn size": enter length × width → sq ft →
  recommends a size bucket and prefills the form's Lawn Size.
- Direct contact: (514) 561-9746, cutsandedges21@gmail.com, Instagram/Facebook, service area.
- Footer.

## 5. Internationalization (EN/FR)
- Lightweight i18n: per-locale string dictionaries; a `useLanguage` context + `EN·FR` toggle
  in nav/footer; preference persisted to `localStorage`. Default **EN**.
- Claude testimonial stays in original French in both languages.
- `<html lang>` updates with the active locale.

## 6. Responsiveness (hard requirement)
- Mobile-first CSS; breakpoints roughly: ≤640 (mobile), 641–1024 (tablet), >1024 (desktop).
- Nav → hamburger drawer on mobile. All multi-column layouts stack. Tap targets ≥44px.
- Hero: autoplay muted-loop video on desktop/tablet; **poster image** (no autoplay) on small
  screens / data-saver / reduced-motion.
- Fluid `clamp()` typography and spacing.

## 7. Asset Handling (video)
- Source clips live in `Videos/` (filenames contain spaces; up to 234 MB each — unusable raw).
- Build step: transcode chosen clips with ffmpeg to web-safe names in `public/videos/`:
  - `luxury-drone.mp4` (Home hero), ~1080p, H.264, ~8–15 MB, faststart; optional `.webm`.
  - Generate `luxury-drone-poster.jpg` (first frame) for mobile/fallback.
  - Gallery clips compressed similarly (shorter, smaller).
- If ffmpeg is unavailable, fall back to using a poster image only and flag for manual export.

## 8. Tech Stack & Structure
- **Vite + React 19** (already scaffolded) + **React Router** for the 5 routes.
- Plain CSS (CSS variables for tokens) or CSS Modules — no heavy UI framework, to keep the
  bespoke editorial look. Google Fonts via `<link>` (Cormorant Garamond + Inter).
- IntersectionObserver-based reveal hook for scroll animations.
- Proposed structure:
  ```
  public/videos/                 # optimized video + posters
  src/
    main.jsx, App.jsx            # router + layout shell
    i18n/ (en.js, fr.js, LanguageContext.jsx)
    components/ (Nav, Footer, Hero, SectionLabel, PillButton, Reveal, ...)
    pages/ (Home, Services, Gallery, About, Contact, Privacy, Terms)
    styles/ (tokens.css, global.css)
  ```

## 9. Content Reference (verbatim from original)
- Brand: **Cuts & Edges** — lawn care, **Est. 2021**, **5+ years**.
- Phone **(514) 561-9746**, email **cutsandedges21@gmail.com**.
- Socials: Facebook & Instagram **@cutsandedges21**.
- Service area: Rivière-des-Prairies, Pointe-aux-Trembles, Anjou (greater Montreal, QC).
- Testimonials: Robert (Pointe-aux-Trembles) · Johnny (Anjou) · Claude (RDP, FR).
- Tagline used in hero: "Precision Lawn Care, Perfected"; eyebrow "Excellence in Every Cut".

## 10. Open Items / Assumptions
- **Formspree (or similar) endpoint** needed for live form email delivery; until provided, the
  form uses a placeholder endpoint + `mailto:` fallback. (No backend.)
- Before/after gallery photos not yet provided — placeholder slots used.
- Logo: original uses a small wordmark/logo image; we render a Cormorant text wordmark unless a
  logo file is supplied.
- Git not initialized in this project; spec saved to disk, not committed.
