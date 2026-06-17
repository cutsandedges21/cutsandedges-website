# Cuts & Edges Website Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new, mobile-responsive, bilingual (EN/FR) multi-page marketing site for Cuts & Edges with a Khufu's-grade editorial aesthetic and a cinematic drone-video hero.

**Architecture:** Vite + React 19 SPA with React Router (5 pages + privacy/terms). Plain CSS with CSS-variable design tokens; a lightweight i18n context; an IntersectionObserver reveal hook for scroll animations. Static output (no backend) — the quote form posts to a configurable email service with a `mailto:` fallback. Source drone footage is transcoded to web-optimized files in `public/videos/`.

**Tech Stack:** Vite 6, React 19, react-router-dom, plain CSS (CSS Modules-free, token-driven), Google Fonts (Cormorant Garamond + Inter), Vitest for logic tests, ffmpeg for asset prep.

**Reference:** Full content + design decisions in `docs/superpowers/specs/2026-06-17-cuts-and-edges-redesign-design.md`. Pull all verbatim copy (services, testimonials, contact) from there / the i18n dictionaries in Task 3.

---

## File Structure

```
public/videos/
  luxury-drone.mp4            # Home hero (transcoded)
  luxury-drone-poster.jpg     # hero mobile/fallback still
  gallery-*.mp4 / *.jpg       # optimized gallery clips + posters
src/
  main.jsx                    # router mount
  App.jsx                     # <BrowserRouter> + <Layout> + <Routes>
  i18n/
    en.js, fr.js              # string dictionaries
    LanguageContext.jsx       # provider + useT() hook + toggle
    content.js                # shared non-translated data (services, testimonials, contact)
  hooks/
    useReveal.js              # IntersectionObserver fade-up
  components/
    Layout.jsx                # <Nav/> + <Outlet/> + <Footer/>
    Nav.jsx, Nav.css
    Footer.jsx, Footer.css
    Hero.jsx, Hero.css        # reusable page hero (video or static)
    SectionLabel.jsx          # numbered eyebrow "01 / Services"
    PillButton.jsx
    Reveal.jsx                # wrapper using useReveal
    ServiceList.jsx, Testimonials.jsx, InstagramStrip.jsx, CTABand.jsx
    LawnCalculator.jsx, QuoteForm.jsx
  pages/
    Home.jsx, Services.jsx, Gallery.jsx, About.jsx, Contact.jsx, Privacy.jsx, Terms.jsx
    *.css                     # per-page styles
  lib/
    calcLawn.js               # pure lawn-size math (tested)
    validateQuote.js          # pure form validation (tested)
  styles/
    tokens.css                # CSS variables (palette, type, spacing)
    global.css                # reset, base elements, fluid type, utilities
  test/
    calcLawn.test.js, validateQuote.test.js, i18n.test.js
```

---

## Task 0: Asset prep — transcode hero video

**Files:**
- Create: `public/videos/luxury-drone.mp4`, `public/videos/luxury-drone-poster.jpg`

- [ ] **Step 1: Check ffmpeg is available**

Run: `ffmpeg -version`
Expected: prints a version. If "command not found", STOP and tell the user: hero will temporarily use the poster image only; they must export a web MP4 manually. Continue the plan regardless (Hero supports poster-only).

- [ ] **Step 2: Transcode the 234MB source to a web hero clip**

Run (note the space in the source filename is quoted):
```bash
mkdir -p public/videos
ffmpeg -y -i "Videos/luxury drone.mp4" -vf "scale=-2:1080" -an \
  -c:v libx264 -profile:v high -crf 26 -preset slow -movflags +faststart \
  public/videos/luxury-drone.mp4
```
Expected: produces a file roughly 8–20 MB. If it's >25 MB, re-run with `-crf 30`.

- [ ] **Step 3: Generate a poster frame**

Run:
```bash
ffmpeg -y -ss 00:00:02 -i "Videos/luxury drone.mp4" -frames:v 1 -vf "scale=-2:1080" public/videos/luxury-drone-poster.jpg
```
Expected: a JPG ~100–400 KB.

- [ ] **Step 4: Verify outputs exist and are reasonable size**

Run: `ls -la public/videos/`
Expected: `luxury-drone.mp4` (<25 MB) and `luxury-drone-poster.jpg` present.

---

## Task 1: Dependencies, tokens, and global styles

**Files:**
- Modify: `package.json` (add deps)
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Modify: `index.html` (fonts + title), `src/main.jsx` (import styles)

- [ ] **Step 1: Install dependencies**

Run:
```bash
npm install react-router-dom
npm install -D vitest jsdom
```
Expected: installs without error.

- [ ] **Step 2: Add a test script to package.json**

In `package.json` `"scripts"`, add: `"test": "vitest run"`.

- [ ] **Step 3: Add fonts + title to index.html `<head>`**

```html
<title>Cuts & Edges — Precision Lawn Care, Perfected</title>
<meta name="description" content="Professional lawn care in greater Montreal. Mowing, landscaping, seasonal cleanups and weed removal — precision service since 2021." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
```

- [ ] **Step 4: Create `src/styles/tokens.css`**

```css
:root {
  /* palette — Forest & Cream */
  --cream:  #F4EFE4;
  --wheat:  #DCD3BE;
  --forest: #2C4A33;
  --forest-deep: #20351F;
  --gold:   #C9A871;
  --ink:    #22281F;
  --cream-dim: rgba(246,241,230,.82);

  /* type */
  --serif: 'Cormorant Garamond', Georgia, serif;
  --sans:  'Inter', system-ui, sans-serif;

  /* fluid scale */
  --h1: clamp(2.6rem, 7vw, 5.5rem);
  --h2: clamp(2rem, 4.5vw, 3.4rem);
  --h3: clamp(1.4rem, 2.6vw, 1.9rem);
  --label: .72rem;
  --eyebrow-ls: .3em;

  /* spacing */
  --section-y: clamp(4rem, 9vw, 8rem);
  --gutter: clamp(1.25rem, 5vw, 4rem);
  --radius: 14px;
  --maxw: 1240px;
}
```

- [ ] **Step 5: Create `src/styles/global.css`**

```css
*, *::before, *::after { box-sizing: border-box; }
html, body, #root { margin: 0; min-height: 100%; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--sans);
  background: var(--cream);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
}
img, video { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
h1, h2, h3 { font-family: var(--serif); font-weight: 500; line-height: 1.02; margin: 0; }
h1 { font-size: var(--h1); }
h2 { font-size: var(--h2); }
h3 { font-size: var(--h3); }
em { font-style: italic; }

.container { max-width: var(--maxw); margin: 0 auto; padding-inline: var(--gutter); }
.section { padding-block: var(--section-y); }
.eyebrow { font-size: var(--label); letter-spacing: var(--eyebrow-ls); text-transform: uppercase; }
.section--dark { background: var(--forest); color: var(--cream); }
.section--wheat { background: var(--wheat); }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 6: Import both stylesheets in `src/main.jsx`** (replace `./index.css`)

```jsx
import './styles/tokens.css'
import './styles/global.css'
```

- [ ] **Step 7: Verify dev server boots**

Run: `npm run dev` (then stop it).
Expected: starts with no errors; blank cream page.

---

## Task 2: i18n foundation (context + dictionaries + content data)

**Files:**
- Create: `src/i18n/en.js`, `src/i18n/fr.js`, `src/i18n/LanguageContext.jsx`, `src/i18n/content.js`
- Create: `src/test/i18n.test.js`

- [ ] **Step 1: Write the failing test — EN and FR keys must match**

`src/test/i18n.test.js`:
```js
import { describe, it, expect } from 'vitest'
import en from '../i18n/en.js'
import fr from '../i18n/fr.js'

function keys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? keys(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

describe('i18n dictionaries', () => {
  it('FR has exactly the same keys as EN', () => {
    expect(keys(fr).sort()).toEqual(keys(en).sort())
  })
})
```

- [ ] **Step 2: Run it — expect failure (modules missing)**

Run: `npm test -- i18n`
Expected: FAIL (cannot resolve `../i18n/en.js`).

- [ ] **Step 3: Create `src/i18n/en.js`** (translated UI strings; expand per page as pages are built — keep EN/FR in lockstep)

```js
export default {
  nav: { services: 'Services', gallery: 'Gallery', about: 'About', contact: 'Contact', quote: 'Get a Quote' },
  hero: { eyebrow: 'Excellence in Every Cut', titleA: 'Precision Lawn Care,', titleB: 'Perfected', cta: 'Get Free Quote' },
  home: {
    positioning: 'We’re not just maintaining lawns — we’re creating outdoor spaces homeowners love.',
    servicesLabel: 'Services', servicesTitle: 'Comprehensive Lawn Care', servicesLink: 'View all services',
    aboutLabel: 'About', aboutTitle: 'Excellence in Every Cut', yearsStat: '5+', yearsLabel: 'Years Experience', aboutLink: 'Our story',
    testimonialsLabel: 'Testimonials', testimonialsTitle: 'What our customers say', testimonialsLink: 'Read more',
    instaLabel: 'Follow Us', instaTitle: 'See our latest work', instaLink: 'View the gallery',
    ctaTitle: 'Get Your Free Quote', ctaText: 'Tell us about your property and we’ll respond within 24 hours.', ctaButton: 'Get Free Quote',
  },
  services: {
    title: 'Comprehensive Lawn Care Services',
    intro: 'From routine maintenance to complete transformations. We charge per cut, with pricing based on your lawn size.',
    cta: 'Request a quote',
  },
  gallery: { title: 'Our Work', intro: 'Cinematic looks at the properties we care for.', instaTitle: 'Follow along', cta: 'Get a quote' },
  about: {
    title: 'Excellence in Every Cut',
    p1: 'Since 2021, Cuts & Edges has been providing professional lawn care services with a focus on quality and customer satisfaction. We’ve grown to serve our local communities with dedication and precision.',
    p2: 'Our team uses modern equipment and proven techniques to deliver consistent, reliable results. We’re not just maintaining lawns—we’re creating outdoor spaces that homeowners love.',
    yearsStat: '5+', yearsLabel: 'Years Experience',
    trustTitle: 'Why homeowners choose us',
    areaTitle: 'Our Service Area', areaText: 'Serving the greater Montreal area.',
    cta: 'Get your free quote',
  },
  contact: {
    title: 'Get Your Free Quote', intro: 'Tell us about your property and we’ll provide a customized quote within 24 hours.',
    name: 'Full Name', email: 'Email', phone: 'Phone Number', size: 'Lawn Size', address: 'Service Address',
    servicesNeeded: 'Services Needed', details: 'Additional Details', submit: 'Request Free Quote',
    sizeUnknown: 'I don’t know the size of my lawn', calcTitle: 'Lawn Size Calculator',
    calcHelp: 'Enter your lawn’s rough length and width to estimate its size.', length: 'Length (ft)', width: 'Width (ft)',
    calcResult: 'Estimated size', success: 'Thanks! Your request has been sent. We’ll be in touch within 24 hours.',
    error: 'Something went wrong. Please call or email us directly.',
    directTitle: 'Prefer to reach us directly?',
    sizes: { small: 'Small (under 1,500 sq ft)', medium: 'Medium (1,500–2,000 sq ft)', large: 'Large (2,000+ sq ft)' },
  },
  footer: { tagline: 'Professional lawn care that transforms your outdoor space with precision and care.', servicesH: 'Services', companyH: 'Company', contactH: 'Contact', rights: 'All rights reserved.', privacy: 'Privacy Policy', terms: 'Terms of Service' },
}
```

- [ ] **Step 4: Create `src/i18n/fr.js`** (same keys, French values)

```js
export default {
  nav: { services: 'Services', gallery: 'Galerie', about: 'À propos', contact: 'Contact', quote: 'Soumission' },
  hero: { eyebrow: 'L’excellence à chaque coupe', titleA: 'Entretien de pelouse', titleB: 'de précision', cta: 'Soumission gratuite' },
  home: {
    positioning: 'Nous ne faisons pas qu’entretenir des pelouses — nous créons des espaces extérieurs que les propriétaires adorent.',
    servicesLabel: 'Services', servicesTitle: 'Entretien complet de pelouse', servicesLink: 'Voir tous les services',
    aboutLabel: 'À propos', aboutTitle: 'L’excellence à chaque coupe', yearsStat: '5+', yearsLabel: 'Ans d’expérience', aboutLink: 'Notre histoire',
    testimonialsLabel: 'Témoignages', testimonialsTitle: 'Ce que disent nos clients', testimonialsLink: 'Lire plus',
    instaLabel: 'Suivez-nous', instaTitle: 'Voir nos réalisations', instaLink: 'Voir la galerie',
    ctaTitle: 'Obtenez votre soumission gratuite', ctaText: 'Parlez-nous de votre terrain et nous répondrons en 24 heures.', ctaButton: 'Soumission gratuite',
  },
  services: {
    title: 'Services d’entretien de pelouse complets',
    intro: 'De l’entretien régulier aux transformations complètes. Nous facturons par coupe, selon la taille de votre terrain.',
    cta: 'Demander une soumission',
  },
  gallery: { title: 'Nos réalisations', intro: 'Regards cinématographiques sur les terrains que nous entretenons.', instaTitle: 'Suivez-nous', cta: 'Obtenir une soumission' },
  about: {
    title: 'L’excellence à chaque coupe',
    p1: 'Depuis 2021, Cuts & Edges offre des services professionnels d’entretien de pelouse axés sur la qualité et la satisfaction de la clientèle. Nous avons grandi pour servir nos communautés avec dévouement et précision.',
    p2: 'Notre équipe utilise de l’équipement moderne et des techniques éprouvées pour des résultats constants et fiables. Nous ne faisons pas qu’entretenir des pelouses—nous créons des espaces extérieurs que les propriétaires adorent.',
    yearsStat: '5+', yearsLabel: 'Ans d’expérience',
    trustTitle: 'Pourquoi nous choisir',
    areaTitle: 'Notre zone de service', areaText: 'Au service du grand Montréal.',
    cta: 'Obtenez votre soumission gratuite',
  },
  contact: {
    title: 'Obtenez votre soumission gratuite', intro: 'Parlez-nous de votre terrain et nous fournirons une soumission personnalisée en 24 heures.',
    name: 'Nom complet', email: 'Courriel', phone: 'Téléphone', size: 'Taille du terrain', address: 'Adresse',
    servicesNeeded: 'Services requis', details: 'Détails supplémentaires', submit: 'Demander ma soumission',
    sizeUnknown: 'Je ne connais pas la taille de mon terrain', calcTitle: 'Calculateur de taille',
    calcHelp: 'Entrez la longueur et la largeur approximatives pour estimer la taille.', length: 'Longueur (pi)', width: 'Largeur (pi)',
    calcResult: 'Taille estimée', success: 'Merci! Votre demande a été envoyée. Nous vous contacterons en 24 heures.',
    error: 'Une erreur est survenue. Veuillez nous appeler ou nous écrire directement.',
    directTitle: 'Préférez-vous nous joindre directement?',
    sizes: { small: 'Petit (moins de 1 500 pi²)', medium: 'Moyen (1 500–2 000 pi²)', large: 'Grand (2 000+ pi²)' },
  },
  footer: { tagline: 'Entretien de pelouse professionnel qui transforme votre espace extérieur avec précision et soin.', servicesH: 'Services', companyH: 'Entreprise', contactH: 'Contact', rights: 'Tous droits réservés.', privacy: 'Politique de confidentialité', terms: 'Conditions d’utilisation' },
}
```

- [ ] **Step 5: Run the test — expect PASS**

Run: `npm test -- i18n`
Expected: PASS. If FAIL, the dictionaries are out of sync — fix keys until they match.

- [ ] **Step 6: Create `src/i18n/content.js`** (data shared across languages; services have EN/FR fields, testimonials/contact verbatim)

```js
export const CONTACT = {
  phone: '(514) 561-9746', phoneHref: 'tel:5145619746',
  email: 'cutsandedges21@gmail.com',
  instagram: 'https://www.instagram.com/cutsandedges21',
  facebook: 'https://www.facebook.com/cutsandedges21/',
  handle: '@cutsandedges21',
  areas: ['Rivière-des-Prairies', 'Pointe-aux-Trembles', 'Anjou'],
  region: 'Greater Montreal, QC',
}

export const SERVICES = [
  { id: 'mowing', en: { name: 'Lawn Mowing & Maintenance', desc: 'Regular mowing, edging, and trimming to keep your lawn pristine week after week.', items: ['Weekly or bi-weekly service', 'Precision edging', 'Debris cleanup'] },
    fr: { name: 'Tonte et entretien', desc: 'Tonte, bordures et taille régulières pour une pelouse impeccable semaine après semaine.', items: ['Service hebdomadaire ou aux deux semaines', 'Bordures de précision', 'Nettoyage des débris'] } },
  { id: 'landscaping', en: { name: 'Landscaping', desc: 'Small landscaping jobs to enhance your outdoor space.', items: ['Plant selection', 'Hardscape installation', 'Garden bed maintenance'] },
    fr: { name: 'Aménagement paysager', desc: 'Petits travaux d’aménagement pour rehausser votre espace extérieur.', items: ['Choix de plantes', 'Installation d’aménagements', 'Entretien des plates-bandes'] } },
  { id: 'seasonal', en: { name: 'Seasonal Services', desc: 'Keep your lawn healthy year-round with cleanup and seasonal care.', items: ['Spring/fall cleanup', 'Leaf removal', 'Debris clearing'] },
    fr: { name: 'Services saisonniers', desc: 'Gardez votre pelouse en santé toute l’année avec le nettoyage saisonnier.', items: ['Nettoyage printemps/automne', 'Ramassage des feuilles', 'Dégagement des débris'] } },
  { id: 'weeds', en: { name: 'Weed Removal', desc: 'Weed control to maintain a clean, healthy lawn without unwanted growth.', items: ['Manual weed removal', 'Regular maintenance', 'Garden bed weeding'] },
    fr: { name: 'Désherbage', desc: 'Contrôle des mauvaises herbes pour une pelouse propre et saine.', items: ['Désherbage manuel', 'Entretien régulier', 'Désherbage des plates-bandes'] } },
]

export const TRUST = [
  { en: 'Modern Equipment', fr: 'Équipement moderne' },
  { en: 'Professional Service', fr: 'Service professionnel' },
  { en: 'Reliable Scheduling', fr: 'Horaire fiable' },
  { en: 'Quality Guaranteed', fr: 'Qualité garantie' },
]

// Testimonials shown verbatim; Claude's stays in French in both UI languages.
export const TESTIMONIALS = [
  { name: 'Robert', place: 'Pointe-aux-Trembles, QC', service: 'Landscaping & Weekly Maintenance', quote: 'Our yard was a mess before Cuts & Edges came in. They cleaned everything up and made it look way better than we expected. Super reliable and easy to deal with.' },
  { name: 'Johnny', place: 'Anjou, QC', service: 'Lawn Maintenance & Weeding', quote: 'Switching to Cuts & Edges was a good call. They just show up every week, no stress, and the lawn always looks great. Can’t complain at all.' },
  { name: 'Claude', place: 'Rivière-des-Prairies, QC', service: 'Seasonal Services', quote: 'On a pris le service de nettoyage saisonnier et franchement, rien à dire. Ils ont tout ramassé, fait l’aération, et le terrain était très beau après. Ça paraît qu’ils font attention aux détails et qu’ils prennent leur travail au sérieux.' },
]

// Gallery clips: fill with whatever Task 0-style transcodes are produced.
export const GALLERY_CLIPS = [
  { src: '/videos/luxury-drone.mp4', poster: '/videos/luxury-drone-poster.jpg', label: 'Drone flyover' },
]
```

- [ ] **Step 7: Create `src/i18n/LanguageContext.jsx`**

```jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import en from './en.js'
import fr from './fr.js'

const DICTS = { en, fr }
const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')
  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
  }, [lang])
  const toggle = useCallback(() => setLang(l => (l === 'en' ? 'fr' : 'en')), [])
  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t: DICTS[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
```

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: i18n foundation (EN/FR dicts, context, shared content)"
```
(If git is not initialized, skip commit steps throughout — note it once and continue.)

---

## Task 3: Router shell + reveal hook + core UI components

**Files:**
- Modify: `src/App.jsx`, `src/main.jsx`
- Create: `src/hooks/useReveal.js`, `src/components/Reveal.jsx`, `src/components/SectionLabel.jsx`, `src/components/PillButton.jsx`, `src/components/Nav.jsx` + `Nav.css`, `src/components/Footer.jsx` + `Footer.css`, `src/components/Layout.jsx`

- [ ] **Step 1: Create `src/hooks/useReveal.js`**

```js
import { useEffect, useRef, useState } from 'react'

export function useReveal(options = { threshold: 0.15 }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect() }
    }, options)
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, shown]
}
```

- [ ] **Step 2: Create `src/components/Reveal.jsx`**

```jsx
import { useReveal } from '../hooks/useReveal.js'

export default function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const [ref, shown] = useReveal()
  return (
    <Tag ref={ref} className={`reveal ${shown ? 'is-shown' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
```

Add to `global.css`:
```css
.reveal { opacity: 0; transform: translateY(22px); transition: opacity .7s ease, transform .7s ease; }
.reveal.is-shown { opacity: 1; transform: none; }
```

- [ ] **Step 3: Create `src/components/SectionLabel.jsx`**

```jsx
export default function SectionLabel({ index, children }) {
  return (
    <span className="eyebrow section-label">
      {index && <b>{index}</b>}<span>{children}</span>
    </span>
  )
}
```

Add to `global.css`:
```css
.section-label { display: inline-flex; gap: .8rem; align-items: baseline; color: var(--gold); }
.section-label b { font-family: var(--serif); font-size: 1.1rem; font-weight: 600; }
.section-label span { color: inherit; opacity: .85; }
```

- [ ] **Step 4: Create `src/components/PillButton.jsx`**

```jsx
import { Link } from 'react-router-dom'

export default function PillButton({ to, href, variant = 'solid', children, ...rest }) {
  const cls = `pill pill--${variant}`
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>
  return <button className={cls} {...rest}>{children}</button>
}
```

Add to `global.css`:
```css
.pill { display: inline-block; font-size: var(--label); letter-spacing: .2em; text-transform: uppercase;
  border-radius: 999px; padding: .85rem 1.6rem; cursor: pointer; border: 1px solid transparent; transition: .2s; }
.pill--solid { background: var(--gold); color: var(--ink); font-weight: 600; }
.pill--solid:hover { filter: brightness(1.05); }
.pill--ghost { background: transparent; border-color: currentColor; }
.link-underline { font-size: var(--label); letter-spacing: .22em; text-transform: uppercase;
  border-bottom: 1px solid currentColor; padding-bottom: 5px; display: inline-block; }
```

- [ ] **Step 5: Create `src/components/Nav.jsx` + `Nav.css`**

Behavior: fixed overlay; transparent over heroes, gains a cream background after scrolling 40px (toggle a `scrolled` class via scroll listener). Desktop: left links (Services, Gallery, About, Contact), centered wordmark, right EN·FR toggle + "Get a Quote" pill. Mobile (≤860px): wordmark + hamburger → full-screen forest drawer with the links, language toggle, and pill.

```jsx
import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext.jsx'
import './Nav.css'

const links = ['services', 'gallery', 'about', 'contact']

export default function Nav() {
  const { t, lang, toggle } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll(); window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''} ${open ? 'nav--open' : ''}`}>
      <nav className="nav__inner">
        <div className="nav__links nav__links--left">
          {links.map(k => <NavLink key={k} to={`/${k}`} className="nav__link">{t.nav[k]}</NavLink>)}
        </div>
        <Link to="/" className="nav__brand" onClick={() => setOpen(false)}>Cuts &amp; Edges</Link>
        <div className="nav__right">
          <button className="nav__lang" onClick={toggle} aria-label="Toggle language">
            <span className={lang === 'en' ? 'on' : ''}>EN</span> · <span className={lang === 'fr' ? 'on' : ''}>FR</span>
          </button>
          <Link to="/contact" className="pill pill--ghost nav__quote">{t.nav.quote}</Link>
          <button className="nav__burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
            <i /><i /><i />
          </button>
        </div>
      </nav>
      <div className="nav__drawer">
        {links.map(k => <NavLink key={k} to={`/${k}`} className="nav__drawer-link" onClick={() => setOpen(false)}>{t.nav[k]}</NavLink>)}
        <Link to="/contact" className="pill pill--solid" onClick={() => setOpen(false)}>{t.nav.quote}</Link>
        <button className="nav__lang" onClick={toggle}>EN · FR</button>
      </div>
    </header>
  )
}
```

`Nav.css` (key rules; refine spacing as needed):
```css
.nav { position: fixed; inset: 0 0 auto 0; z-index: 50; color: var(--cream); transition: background .3s, color .3s; }
.nav--scrolled { background: var(--cream); color: var(--ink); box-shadow: 0 1px 0 rgba(34,40,31,.08); }
.nav__inner { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 1.1rem var(--gutter); }
.nav__links--left { display: flex; gap: 1.6rem; }
.nav__link { font-size: var(--label); letter-spacing: .18em; text-transform: uppercase; }
.nav__brand { grid-column: 2; font-family: var(--serif); font-weight: 600; font-size: 1.5rem; letter-spacing: .04em; text-align: center; }
.nav__right { justify-self: end; display: flex; align-items: center; gap: 1rem; }
.nav__lang { background: none; border: 0; color: inherit; font: inherit; font-size: var(--label); letter-spacing: .14em; cursor: pointer; }
.nav__lang .on { color: var(--gold); }
.nav__burger { display: none; flex-direction: column; gap: 5px; background: none; border: 0; cursor: pointer; width: 28px; }
.nav__burger i { height: 1.5px; background: currentColor; }
.nav__drawer { display: none; }
@media (max-width: 860px) {
  .nav__links--left, .nav__quote { display: none; }
  .nav__inner { grid-template-columns: 1fr auto 1fr; }
  .nav__burger { display: flex; }
  .nav__right .nav__lang { display: none; }
  .nav__drawer { position: fixed; inset: 0; background: var(--forest); color: var(--cream);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.8rem;
    transform: translateY(-100%); transition: transform .4s ease; }
  .nav--open .nav__drawer { transform: none; }
  .nav__drawer-link { font-family: var(--serif); font-size: 2rem; }
}
```

- [ ] **Step 6: Create `src/components/Footer.jsx` + `Footer.css`**

Deep-forest footer: wordmark + tagline + social links; columns for Services / Company / Contact; bottom row © + privacy/terms. Pull labels from `t.footer`, data from `CONTACT`.

```jsx
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext.jsx'
import { CONTACT } from '../i18n/content.js'
import './Footer.css'

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="footer section--dark">
      <div className="container footer__grid">
        <div>
          <div className="footer__brand">Cuts &amp; Edges</div>
          <p className="footer__tagline">{t.footer.tagline}</p>
          <div className="footer__socials">
            <a href={CONTACT.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a href={CONTACT.facebook} target="_blank" rel="noreferrer">Facebook</a>
          </div>
        </div>
        <div>
          <h3 className="footer__h">{t.footer.servicesH}</h3>
          <Link to="/services">{t.nav.services}</Link>
          <Link to="/gallery">{t.nav.gallery}</Link>
        </div>
        <div>
          <h3 className="footer__h">{t.footer.companyH}</h3>
          <Link to="/about">{t.nav.about}</Link>
          <Link to="/contact">{t.nav.contact}</Link>
        </div>
        <div>
          <h3 className="footer__h">{t.footer.contactH}</h3>
          <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <p className="footer__area">{CONTACT.areas.join(' · ')}</p>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Cuts &amp; Edges. {t.footer.rights}</span>
        <span><Link to="/privacy">{t.footer.privacy}</Link> · <Link to="/terms">{t.footer.terms}</Link></span>
      </div>
    </footer>
  )
}
```

`Footer.css`:
```css
.footer { padding-block: clamp(3rem,7vw,5rem) 2rem; }
.footer__grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.4fr; gap: 2rem; }
.footer__brand { font-family: var(--serif); font-size: 1.7rem; font-weight: 600; }
.footer__tagline { max-width: 34ch; opacity: .8; font-size: .95rem; }
.footer__socials { display: flex; gap: 1.2rem; margin-top: 1rem; font-size: var(--label); letter-spacing: .14em; text-transform: uppercase; }
.footer__h { font-size: var(--label); letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin-bottom: 1rem; }
.footer__grid a, .footer__area { display: block; opacity: .85; margin-bottom: .5rem; font-size: .95rem; }
.footer__bottom { display: flex; justify-content: space-between; gap: 1rem; margin-top: 2.5rem;
  padding-top: 1.5rem; border-top: 1px solid rgba(246,241,230,.18); font-size: .8rem; opacity: .7; }
@media (max-width: 760px) { .footer__grid { grid-template-columns: 1fr 1fr; } .footer__bottom { flex-direction: column; } }
```

- [ ] **Step 7: Create `src/components/Layout.jsx`**

```jsx
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Nav from './Nav.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (<><Nav /><main><Outlet /></main><Footer /></>)
}
```

- [ ] **Step 8: Wire the router in `src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Services from './pages/Services.jsx'
import Gallery from './pages/Gallery.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
```

- [ ] **Step 9: Add temporary page stubs so the app compiles**

Create each `src/pages/*.jsx` returning `export default function X(){ return <section className="section container"><h1>X</h1></section> }`. These are replaced in Tasks 4–9.

- [ ] **Step 10: Verify the app renders and routes work**

Run: `npm run dev`. In the browser, confirm nav appears, wordmark centered, links route between stub pages, EN·FR toggle flips nav labels, and the mobile drawer opens at ≤860px (use devtools responsive mode). Stop the server.

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "feat: router shell, nav, footer, reveal + core UI components"
```

---

## Task 4: Reusable Hero + Home page

**Files:**
- Create: `src/components/Hero.jsx` + `Hero.css`, `src/components/CTABand.jsx`, `src/components/Testimonials.jsx`, `src/components/InstagramStrip.jsx`, `src/components/ServiceList.jsx`
- Replace: `src/pages/Home.jsx` + create `src/pages/Home.css`

- [ ] **Step 1: Create `src/components/Hero.jsx` + `Hero.css`**

Reusable hero. Props: `video` (src), `poster`, `eyebrow`, `titleA`, `titleB` (italic), `cta` ({label,to}), `short` (bool for non-home shorter heroes). On small screens or reduced-motion, render the poster `<img>` instead of autoplay `<video>`.

```jsx
import { Link } from 'react-router-dom'
import './Hero.css'

export default function Hero({ video, poster, eyebrow, titleA, titleB, cta, short = false }) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <section className={`hero ${short ? 'hero--short' : ''}`}>
      <div className="hero__media">
        {video && !reduce
          ? <video className="hero__video" autoPlay muted loop playsInline poster={poster} preload="metadata"><source src={video} type="video/mp4" /></video>
          : <img className="hero__video" src={poster} alt="" />}
        <div className="hero__scrim" />
      </div>
      <div className="hero__content">
        {eyebrow && <p className="eyebrow hero__eyebrow">{eyebrow}</p>}
        <h1 className="hero__title">{titleA}<br /><em>{titleB}</em></h1>
        {cta && <Link to={cta.to} className="link-underline hero__cta">{cta.label}</Link>}
      </div>
    </section>
  )
}
```

`Hero.css`:
```css
.hero { position: relative; min-height: 100svh; display: grid; place-items: center; color: var(--cream); overflow: hidden; }
.hero--short { min-height: 70svh; }
.hero__media, .hero__video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero__scrim { position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(20,30,20,.45), rgba(20,30,20,.2) 35%, rgba(20,30,20,.55)); }
.hero__content { position: relative; text-align: center; padding: 0 var(--gutter); max-width: 18ch; }
.hero__eyebrow { margin-bottom: 1.6rem; opacity: .9; }
.hero__title { font-size: var(--h1); }
.hero__cta { margin-top: 2rem; }
@media (max-width: 600px) { .hero__content { max-width: 100%; } }
```

- [ ] **Step 2: Create `src/components/CTABand.jsx`**

```jsx
import { useLang } from '../i18n/LanguageContext.jsx'
import Reveal from './Reveal.jsx'
import PillButton from './PillButton.jsx'

export default function CTABand() {
  const { t } = useLang()
  return (
    <section className="section--dark cta-band">
      <Reveal className="container cta-band__inner">
        <h2>{t.home.ctaTitle}</h2>
        <p>{t.home.ctaText}</p>
        <PillButton to="/contact">{t.home.ctaButton}</PillButton>
      </Reveal>
    </section>
  )
}
```
Add to `global.css`:
```css
.cta-band { padding-block: var(--section-y); }
.cta-band__inner { text-align: center; display: grid; gap: 1.2rem; place-items: center; }
.cta-band__inner p { max-width: 46ch; opacity: .85; }
```

- [ ] **Step 3: Create `src/components/ServiceList.jsx`** (compact preview list used on Home)

```jsx
import { useLang } from '../i18n/LanguageContext.jsx'
import { SERVICES } from '../i18n/content.js'
import Reveal from './Reveal.jsx'

export default function ServiceList() {
  const { lang } = useLang()
  return (
    <div className="service-list">
      {SERVICES.map((s, i) => (
        <Reveal key={s.id} className="service-list__row">
          <span className="service-list__num">{String(i + 1).padStart(2, '0')}</span>
          <h3>{s[lang].name}</h3>
          <p>{s[lang].desc}</p>
        </Reveal>
      ))}
    </div>
  )
}
```
Add to `global.css`:
```css
.service-list__row { display: grid; grid-template-columns: auto 1fr; gap: .4rem 1.5rem; padding: 1.8rem 0; border-top: 1px solid rgba(34,40,31,.14); align-items: baseline; }
.service-list__num { font-family: var(--serif); color: var(--gold); font-size: 1.2rem; }
.service-list__row p { grid-column: 2; opacity: .8; }
```

- [ ] **Step 4: Create `src/components/Testimonials.jsx`**

```jsx
import { TESTIMONIALS } from '../i18n/content.js'
import Reveal from './Reveal.jsx'

export default function Testimonials({ limit }) {
  const items = limit ? TESTIMONIALS.slice(0, limit) : TESTIMONIALS
  return (
    <div className="testimonials">
      {items.map(tm => (
        <Reveal key={tm.name} className="testimonial">
          <p className="testimonial__quote">“{tm.quote}”</p>
          <p className="testimonial__name">{tm.name}</p>
          <p className="testimonial__meta">{tm.place} · {tm.service}</p>
        </Reveal>
      ))}
    </div>
  )
}
```
Add to `global.css`:
```css
.testimonials { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2rem; }
.testimonial__quote { font-family: var(--serif); font-size: 1.25rem; line-height: 1.4; }
.testimonial__name { font-weight: 600; margin-top: 1rem; }
.testimonial__meta { font-size: var(--label); letter-spacing: .1em; text-transform: uppercase; opacity: .6; }
```

- [ ] **Step 5: Create `src/components/InstagramStrip.jsx`** (handle + link; tile placeholders until photos provided)

```jsx
import { useLang } from '../i18n/LanguageContext.jsx'
import { CONTACT } from '../i18n/content.js'

export default function InstagramStrip() {
  const { t } = useLang()
  return (
    <div className="insta">
      <div className="insta__tiles">{[0,1,2,3].map(i => <div key={i} className="insta__tile" />)}</div>
      <a className="link-underline" href={CONTACT.instagram} target="_blank" rel="noreferrer">{CONTACT.handle}</a>
    </div>
  )
}
```
Add to `global.css`:
```css
.insta__tiles { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 1.5rem; }
.insta__tile { aspect-ratio: 1; background: var(--wheat); border-radius: 8px; }
@media (max-width: 600px){ .insta__tiles { grid-template-columns: repeat(2,1fr); } }
```

- [ ] **Step 6: Build `src/pages/Home.jsx`**

Compose: `<Hero video poster ... />` + positioning section + services preview (SectionLabel `01`) + about teaser (`02`, with 5+ stat) + testimonials (`03`, limit 3) + Instagram (`04`) + `<CTABand/>`. Use `t.home.*`, `Reveal`, `SectionLabel`, `PillButton`. Each content block wrapped in `.section .container`.

```jsx
import { useLang } from '../i18n/LanguageContext.jsx'
import Hero from '../components/Hero.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import PillButton from '../components/PillButton.jsx'
import ServiceList from '../components/ServiceList.jsx'
import Testimonials from '../components/Testimonials.jsx'
import InstagramStrip from '../components/InstagramStrip.jsx'
import CTABand from '../components/CTABand.jsx'

export default function Home() {
  const { t } = useLang()
  return (
    <>
      <Hero video="/videos/luxury-drone.mp4" poster="/videos/luxury-drone-poster.jpg"
        eyebrow={t.hero.eyebrow} titleA={t.hero.titleA} titleB={t.hero.titleB} cta={{ label: t.hero.cta, to: '/contact' }} />

      <section className="section container">
        <Reveal as="h2" className="home__statement">{t.home.positioning}</Reveal>
      </section>

      <section className="section container">
        <SectionLabel index="01">{t.home.servicesLabel}</SectionLabel>
        <h2>{t.home.servicesTitle}</h2>
        <ServiceList />
        <PillButton to="/services" variant="ghost">{t.home.servicesLink}</PillButton>
      </section>

      <section className="section--wheat"><div className="section container home__about">
        <div><SectionLabel index="02">{t.home.aboutLabel}</SectionLabel><h2>{t.home.aboutTitle}</h2>
          <PillButton to="/about" variant="ghost">{t.home.aboutLink}</PillButton></div>
        <div className="home__stat"><span className="home__statnum">{t.home.yearsStat}</span><span>{t.home.yearsLabel}</span></div>
      </div></section>

      <section className="section container">
        <SectionLabel index="03">{t.home.testimonialsLabel}</SectionLabel>
        <h2>{t.home.testimonialsTitle}</h2>
        <Testimonials limit={3} />
      </section>

      <section className="section container">
        <SectionLabel index="04">{t.home.instaLabel}</SectionLabel>
        <h2>{t.home.instaTitle}</h2>
        <InstagramStrip />
      </section>

      <CTABand />
    </>
  )
}
```
Add to `Home.css` (import it in Home.jsx):
```css
.home__statement { font-size: var(--h2); max-width: 24ch; }
.home__about { display: flex; justify-content: space-between; align-items: center; gap: 2rem; flex-wrap: wrap; }
.home__stat { text-align: right; }
.home__statnum { font-family: var(--serif); font-size: clamp(3rem,8vw,6rem); color: var(--forest); display: block; line-height: 1; }
```

- [ ] **Step 7: Verify Home renders with hero video + sections**

Run: `npm run dev`, open `/`. Confirm: hero video plays muted/looped (or poster on mobile width), sections fade in on scroll, numbered labels show, EN·FR switches all copy. Stop server.

- [ ] **Step 8: Screenshot Home desktop + mobile for review**

Use Playwright (or browser devtools) at 1280px and 390px widths; eyeball spacing/legibility over the video. Note any fixes and apply.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: hero + home page with all sections"
```

---

## Task 5: Services page

**Files:** Replace `src/pages/Services.jsx`; create `src/pages/Services.css`

- [ ] **Step 1: Build Services page** — short hero (`title` from `t.services.title`, no video — wheat or forest background), intro line with the per-cut pricing note, then `SERVICES.map` into alternating full-width rows (image/placeholder one side, numbered heading + desc + `items` list other side), then a quote CTA (`PillButton to="/contact"`).

```jsx
import { useLang } from '../i18n/LanguageContext.jsx'
import { SERVICES } from '../i18n/content.js'
import Reveal from '../components/Reveal.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import PillButton from '../components/PillButton.jsx'
import './Services.css'

export default function Services() {
  const { t, lang } = useLang()
  return (
    <>
      <header className="services-hero section--dark"><div className="container">
        <h1>{t.services.title}</h1><p>{t.services.intro}</p>
      </div></header>
      {SERVICES.map((s, i) => (
        <section key={s.id} className={`section container service-row ${i % 2 ? 'service-row--alt' : ''}`}>
          <Reveal className="service-row__media" />
          <Reveal className="service-row__body">
            <SectionLabel index={String(i + 1).padStart(2, '0')}>{t.nav.services}</SectionLabel>
            <h2>{s[lang].name}</h2>
            <p>{s[lang].desc}</p>
            <ul className="service-row__items">{s[lang].items.map(it => <li key={it}>{it}</li>)}</ul>
          </Reveal>
        </section>
      ))}
      <section className="section container" style={{ textAlign: 'center' }}>
        <PillButton to="/contact">{t.services.cta}</PillButton>
      </section>
    </>
  )
}
```

`Services.css`:
```css
.services-hero { padding-block: clamp(7rem,14vw,11rem) clamp(3rem,7vw,5rem); }
.services-hero p { max-width: 52ch; opacity: .85; margin-top: 1rem; }
.service-row { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(1.5rem,4vw,4rem); align-items: center; }
.service-row--alt .service-row__media { order: 2; }
.service-row__media { aspect-ratio: 4/3; background: var(--wheat); border-radius: var(--radius); }
.service-row__items { list-style: none; padding: 0; margin-top: 1.2rem; }
.service-row__items li { padding: .5rem 0; border-top: 1px solid rgba(34,40,31,.12); }
@media (max-width: 760px){ .service-row { grid-template-columns: 1fr; } .service-row--alt .service-row__media { order: 0; } }
```

- [ ] **Step 2: Verify + responsive check + commit**

Run `npm run dev`, open `/services`, check alternating rows collapse to single column on mobile. Commit: `git add -A && git commit -m "feat: services page"`.

---

## Task 6: Gallery page

**Files:** Replace `src/pages/Gallery.jsx`; create `src/pages/Gallery.css`

- [ ] **Step 1: Build Gallery page** — short hero (`t.gallery.title`/`intro`), a featured video player + grid from `GALLERY_CLIPS` (each `<video controls muted loop playsInline poster>` lazy via `preload="none"`), before/after placeholder tiles, then an Instagram section (`InstagramStrip` + Facebook link), then quote CTA.

```jsx
import { useLang } from '../i18n/LanguageContext.jsx'
import { GALLERY_CLIPS, CONTACT } from '../i18n/content.js'
import Reveal from '../components/Reveal.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import InstagramStrip from '../components/InstagramStrip.jsx'
import PillButton from '../components/PillButton.jsx'
import './Gallery.css'

export default function Gallery() {
  const { t } = useLang()
  return (
    <>
      <header className="section--wheat gallery-hero"><div className="container">
        <h1>{t.gallery.title}</h1><p>{t.gallery.intro}</p></div></header>
      <section className="section container">
        <div className="gallery-grid">
          {GALLERY_CLIPS.map((c, i) => (
            <Reveal key={i} className="gallery-clip">
              <video src={c.src} poster={c.poster} muted loop playsInline controls preload="none" />
              <span className="eyebrow">{c.label}</span>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section container">
        <SectionLabel index="02">{t.gallery.instaTitle}</SectionLabel>
        <InstagramStrip />
        <a className="link-underline" href={CONTACT.facebook} target="_blank" rel="noreferrer">Facebook</a>
      </section>
      <section className="section container" style={{ textAlign: 'center' }}>
        <PillButton to="/contact">{t.gallery.cta}</PillButton>
      </section>
    </>
  )
}
```

`Gallery.css`:
```css
.gallery-hero { padding-block: clamp(7rem,14vw,11rem) clamp(3rem,7vw,5rem); }
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap: 1.5rem; }
.gallery-clip video { width: 100%; border-radius: var(--radius); aspect-ratio: 16/9; object-fit: cover; background: var(--ink); }
.gallery-clip .eyebrow { display: block; margin-top: .6rem; color: var(--gold); }
```

- [ ] **Step 2: Verify + commit** — `git add -A && git commit -m "feat: gallery page"`.

---

## Task 7: About page

**Files:** Replace `src/pages/About.jsx`; create `src/pages/About.css`

- [ ] **Step 1: Build About page** — short hero (`t.about.title`), story (`p1`/`p2`) beside the 5+ stat, the 4 `TRUST` points as a row, all 3 `Testimonials` (no limit), service-area block listing `CONTACT.areas` + `region`, then CTA.

```jsx
import { useLang } from '../i18n/LanguageContext.jsx'
import { TRUST, CONTACT } from '../i18n/content.js'
import Reveal from '../components/Reveal.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import Testimonials from '../components/Testimonials.jsx'
import PillButton from '../components/PillButton.jsx'
import './About.css'

export default function About() {
  const { t, lang } = useLang()
  return (
    <>
      <header className="section--dark about-hero"><div className="container"><h1>{t.about.title}</h1></div></header>
      <section className="section container about-story">
        <Reveal><p>{t.about.p1}</p><p>{t.about.p2}</p></Reveal>
        <Reveal className="about-stat"><span className="about-stat__num">{t.about.yearsStat}</span><span>{t.about.yearsLabel}</span></Reveal>
      </section>
      <section className="section--wheat"><div className="section container">
        <SectionLabel index="02">{t.about.trustTitle}</SectionLabel>
        <div className="about-trust">{TRUST.map(x => <div key={x.en} className="about-trust__item">{x[lang]}</div>)}</div>
      </div></section>
      <section className="section container">
        <SectionLabel index="03">{t.home.testimonialsLabel}</SectionLabel>
        <Testimonials />
      </section>
      <section className="section container about-area">
        <SectionLabel index="04">{t.about.areaTitle}</SectionLabel>
        <h2>{t.about.areaText}</h2>
        <div className="about-area__list">{CONTACT.areas.map(a => <span key={a}>{a}</span>)}</div>
      </section>
      <section className="section container" style={{ textAlign: 'center' }}><PillButton to="/contact">{t.about.cta}</PillButton></section>
    </>
  )
}
```

`About.css`:
```css
.about-hero { padding-block: clamp(7rem,14vw,11rem) clamp(3rem,7vw,5rem); }
.about-story { display: grid; grid-template-columns: 2fr 1fr; gap: 3rem; align-items: start; }
.about-story p { max-width: 60ch; margin-bottom: 1.2rem; }
.about-stat { text-align: right; }
.about-stat__num { font-family: var(--serif); font-size: clamp(3rem,8vw,6rem); color: var(--forest); display: block; line-height: 1; }
.about-trust { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; margin-top: 2rem; }
.about-trust__item { padding: 1.4rem; background: var(--cream); border-radius: var(--radius); text-align: center; font-size: .95rem; }
.about-area__list { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1.5rem; font-family: var(--serif); font-size: 1.4rem; }
.about-area__list span:not(:last-child)::after { content: ' ·'; color: var(--gold); }
@media (max-width: 760px){ .about-story { grid-template-columns: 1fr; } .about-stat { text-align: left; } .about-trust { grid-template-columns: 1fr 1fr; } }
```

- [ ] **Step 2: Verify + commit** — `git add -A && git commit -m "feat: about page"`.

---

## Task 8: Lawn calculator + quote form + Contact page

**Files:**
- Create: `src/lib/calcLawn.js`, `src/lib/validateQuote.js`, `src/test/calcLawn.test.js`, `src/test/validateQuote.test.js`
- Create: `src/components/LawnCalculator.jsx`, `src/components/QuoteForm.jsx`
- Replace: `src/pages/Contact.jsx`; create `src/pages/Contact.css`

- [ ] **Step 1: Write failing test for `calcLawn`**

`src/test/calcLawn.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { sizeBucket } from '../lib/calcLawn.js'

describe('sizeBucket', () => {
  it('classifies small/medium/large by sq ft', () => {
    expect(sizeBucket(1000).id).toBe('small')   // < 1500
    expect(sizeBucket(1500).id).toBe('medium')  // 1500–2000 inclusive
    expect(sizeBucket(2000).id).toBe('medium')
    expect(sizeBucket(2500).id).toBe('large')   // > 2000
  })
  it('computes area from length × width', () => {
    expect(sizeBucket(0, { length: 40, width: 50 }).sqft).toBe(2000)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npm test -- calcLawn`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement `src/lib/calcLawn.js`**

```js
export function sizeBucket(sqftInput, dims) {
  const sqft = dims ? Math.round((dims.length || 0) * (dims.width || 0)) : Math.round(sqftInput || 0)
  let id = 'small'
  if (sqft > 2000) id = 'large'
  else if (sqft >= 1500) id = 'medium'
  return { id, sqft }
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `npm test -- calcLawn`
Expected: PASS.

- [ ] **Step 5: Write failing test for `validateQuote`**

`src/test/validateQuote.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { validateQuote } from '../lib/validateQuote.js'

describe('validateQuote', () => {
  it('requires name, valid email, phone, and >=1 service', () => {
    const errors = validateQuote({ name: '', email: 'bad', phone: '', services: [] })
    expect(errors.name).toBeTruthy()
    expect(errors.email).toBeTruthy()
    expect(errors.phone).toBeTruthy()
    expect(errors.services).toBeTruthy()
  })
  it('passes a complete valid submission', () => {
    const errors = validateQuote({ name: 'Jo', email: 'jo@x.com', phone: '5145619746', services: ['mowing'] })
    expect(Object.keys(errors)).toHaveLength(0)
  })
})
```

- [ ] **Step 6: Run — expect FAIL**, then implement `src/lib/validateQuote.js`:

```js
export function validateQuote(v) {
  const e = {}
  if (!v.name || !v.name.trim()) e.name = 'required'
  if (!v.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = 'invalid'
  if (!v.phone || v.phone.replace(/\D/g, '').length < 10) e.phone = 'invalid'
  if (!v.services || v.services.length === 0) e.services = 'required'
  return e
}
```
Run: `npm test -- validateQuote` → PASS.

- [ ] **Step 7: Create `src/components/LawnCalculator.jsx`** (uses `sizeBucket`; calls `onResult(bucketId)` to prefill the form)

```jsx
import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext.jsx'
import { sizeBucket } from '../lib/calcLawn.js'

export default function LawnCalculator({ onResult }) {
  const { t } = useLang()
  const [d, setD] = useState({ length: '', width: '' })
  const [res, setRes] = useState(null)
  const run = () => {
    const r = sizeBucket(0, { length: +d.length, width: +d.width })
    setRes(r); onResult?.(r.id)
  }
  return (
    <div className="calc">
      <h3>{t.contact.calcTitle}</h3>
      <p>{t.contact.calcHelp}</p>
      <div className="calc__row">
        <label>{t.contact.length}<input type="number" value={d.length} onChange={e => setD({ ...d, length: e.target.value })} /></label>
        <label>{t.contact.width}<input type="number" value={d.width} onChange={e => setD({ ...d, width: e.target.value })} /></label>
      </div>
      <button type="button" className="pill pill--ghost" onClick={run}>{t.contact.calcTitle}</button>
      {res && <p className="calc__result">{t.contact.calcResult}: <b>{res.sqft} sq ft — {t.contact.sizes[res.id]}</b></p>}
    </div>
  )
}
```

- [ ] **Step 8: Create `src/components/QuoteForm.jsx`** — controlled fields, `validateQuote` on submit, POST to `import.meta.env.VITE_FORM_ENDPOINT` (Formspree) as JSON; on network failure or missing endpoint, fall back to building a `mailto:` link. Show success/error from `t.contact`. Accept a `prefillSize` prop (set by the calculator).

```jsx
import { useState, useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext.jsx'
import { SERVICES, CONTACT } from '../i18n/content.js'
import { validateQuote } from '../lib/validateQuote.js'

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || ''

export default function QuoteForm({ prefillSize }) {
  const { t, lang } = useLang()
  const [v, setV] = useState({ name: '', email: '', phone: '', size: 'medium', address: '', services: [], details: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  useEffect(() => { if (prefillSize) setV(s => ({ ...s, size: prefillSize })) }, [prefillSize])

  const toggleService = id => setV(s => ({ ...s, services: s.services.includes(id) ? s.services.filter(x => x !== id) : [...s.services, id] }))

  const submit = async e => {
    e.preventDefault()
    const errs = validateQuote(v); setErrors(errs)
    if (Object.keys(errs).length) return
    setStatus('sending')
    try {
      if (!ENDPOINT) throw new Error('no endpoint')
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(v) })
      if (!r.ok) throw new Error('bad status')
      setStatus('success')
    } catch {
      // mailto fallback
      const body = encodeURIComponent(`Name: ${v.name}\nEmail: ${v.email}\nPhone: ${v.phone}\nSize: ${v.size}\nAddress: ${v.address}\nServices: ${v.services.join(', ')}\nDetails: ${v.details}`)
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Quote request — ' + v.name)}&body=${body}`
      setStatus('idle')
    }
  }

  if (status === 'success') return <p className="form__success">{t.contact.success}</p>

  return (
    <form className="quote-form" onSubmit={submit} noValidate>
      <div className="quote-form__grid">
        <label>{t.contact.name}*<input value={v.name} onChange={e => setV({ ...v, name: e.target.value })} aria-invalid={!!errors.name} /></label>
        <label>{t.contact.email}*<input type="email" value={v.email} onChange={e => setV({ ...v, email: e.target.value })} aria-invalid={!!errors.email} /></label>
        <label>{t.contact.phone}*<input value={v.phone} onChange={e => setV({ ...v, phone: e.target.value })} aria-invalid={!!errors.phone} /></label>
        <label>{t.contact.size}
          <select value={v.size} onChange={e => setV({ ...v, size: e.target.value })}>
            <option value="small">{t.contact.sizes.small}</option>
            <option value="medium">{t.contact.sizes.medium}</option>
            <option value="large">{t.contact.sizes.large}</option>
          </select>
        </label>
      </div>
      <label>{t.contact.address}<input value={v.address} onChange={e => setV({ ...v, address: e.target.value })} /></label>
      <fieldset className="quote-form__services" aria-invalid={!!errors.services}>
        <legend>{t.contact.servicesNeeded}*</legend>
        {SERVICES.map(s => (
          <label key={s.id} className="checkbox">
            <input type="checkbox" checked={v.services.includes(s.id)} onChange={() => toggleService(s.id)} />{s[lang].name}
          </label>
        ))}
      </fieldset>
      <label>{t.contact.details}<textarea rows="4" value={v.details} onChange={e => setV({ ...v, details: e.target.value })} /></label>
      <button className="pill pill--solid" disabled={status === 'sending'}>{t.contact.submit}</button>
      {status === 'error' && <p className="form__error">{t.contact.error}</p>}
    </form>
  )
}
```

- [ ] **Step 9: Build `src/pages/Contact.jsx`** wiring calculator → form prefill

```jsx
import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext.jsx'
import { CONTACT } from '../i18n/content.js'
import QuoteForm from '../components/QuoteForm.jsx'
import LawnCalculator from '../components/LawnCalculator.jsx'
import './Contact.css'

export default function Contact() {
  const { t } = useLang()
  const [size, setSize] = useState(null)
  return (
    <>
      <header className="section--dark contact-hero"><div className="container">
        <h1>{t.contact.title}</h1><p>{t.contact.intro}</p></div></header>
      <section className="section container contact-grid">
        <QuoteForm prefillSize={size} />
        <aside className="contact-aside">
          <LawnCalculator onResult={setSize} />
          <div className="contact-direct">
            <h3>{t.contact.directTitle}</h3>
            <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={CONTACT.instagram} target="_blank" rel="noreferrer">{CONTACT.handle}</a>
            <p>{CONTACT.areas.join(' · ')} — {CONTACT.region}</p>
          </div>
        </aside>
      </section>
    </>
  )
}
```

`Contact.css`:
```css
.contact-hero { padding-block: clamp(7rem,14vw,11rem) clamp(3rem,7vw,5rem); }
.contact-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: clamp(2rem,5vw,4rem); align-items: start; }
.quote-form label, .calc label { display: block; font-size: var(--label); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 1rem; }
.quote-form input, .quote-form select, .quote-form textarea, .calc input {
  display: block; width: 100%; margin-top: .4rem; padding: .8rem; border: 1px solid var(--wheat);
  border-radius: 8px; background: #fff; font: inherit; text-transform: none; letter-spacing: normal; }
.quote-form [aria-invalid="true"] { border-color: #b4502f; }
.quote-form__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.quote-form__services { border: 0; padding: 0; margin: 0 0 1rem; }
.checkbox { display: flex; align-items: center; gap: .6rem; text-transform: none; letter-spacing: normal; font-size: .95rem; }
.checkbox input { width: auto; margin: 0; }
.calc { background: var(--wheat); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 1.5rem; }
.calc__row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.contact-direct a, .contact-direct p { display: block; margin-bottom: .5rem; }
.form__success { font-family: var(--serif); font-size: 1.4rem; color: var(--forest); }
.form__error { color: #b4502f; margin-top: 1rem; }
@media (max-width: 860px){ .contact-grid { grid-template-columns: 1fr; } .quote-form__grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 10: Run all tests**

Run: `npm test`
Expected: i18n, calcLawn, validateQuote all PASS.

- [ ] **Step 11: Verify form + calculator in browser**

Run `npm run dev`, open `/contact`. Submit empty → inline invalid states. Run calculator (e.g. 40×50 → 2000 sq ft, Medium) → confirm form's Lawn Size updates. Submit valid with no `VITE_FORM_ENDPOINT` set → opens mail client (mailto fallback). Stop server.

- [ ] **Step 12: Commit** — `git add -A && git commit -m "feat: contact page, quote form (email/mailto), lawn calculator + tests"`.

---

## Task 9: Privacy & Terms pages

**Files:** Replace `src/pages/Privacy.jsx`, `src/pages/Terms.jsx`

- [ ] **Step 1: Build simple static legal pages** — short header + readable prose container. Reuse the original site's intent (data use, service terms). Keep concise; these are low-traffic.

```jsx
// Privacy.jsx (Terms.jsx mirrors structure with terms copy)
export default function Privacy() {
  return (
    <section className="section container" style={{ maxWidth: 760, paddingTop: '8rem' }}>
      <h1>Privacy Policy</h1>
      <p>Cuts & Edges collects only the information you submit through our quote form (name, contact details, and property information) for the sole purpose of responding to your request. We do not sell or share your information. To request deletion, email cutsandedges21@gmail.com.</p>
    </section>
  )
}
```

- [ ] **Step 2: Verify routes render + commit** — `git add -A && git commit -m "feat: privacy and terms pages"`.

---

## Task 10: Responsive QA, polish, and production build

**Files:** touch CSS as needed across components.

- [ ] **Step 1: Cross-page responsive sweep**

Run `npm run dev`. In devtools, test widths **390px, 768px, 1280px** on every route. Verify: nav drawer works; no horizontal scroll; hero readable; grids stack; tap targets ≥44px; footer reflows. Fix issues in the relevant CSS.

- [ ] **Step 2: Reduced-motion + video fallback check**

Enable "prefers-reduced-motion" in devtools rendering. Confirm reveals show immediately and the hero shows the poster image (no autoplay video). 

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: builds with no errors; warns only on chunk size (acceptable). Then `npm run preview` and click through all routes.

- [ ] **Step 4: Lighthouse / sanity pass (optional)**

In preview, run a quick Lighthouse mobile check; address any obvious a11y issues (image alt, contrast, labels).

- [ ] **Step 5: Final commit**

```bash
git add -A && git commit -m "chore: responsive QA, reduced-motion, production build verified"
```

---

## Self-Review (completed against spec)

- **§3 Design system** → Tasks 1 (tokens/global), 3 (components). ✓
- **§4 Pages** → Home (T4), Services (T5), Gallery (T6), About (T7), Contact (T8), Privacy/Terms (T9). ✓
- **§5 i18n EN/FR** → Task 2 (dicts + context + key-parity test). ✓
- **§6 Responsiveness** → mobile CSS in each task + Task 10 sweep. ✓
- **§7 Video asset handling** → Task 0 (transcode + poster), Hero poster fallback (T4). ✓
- **§8 Tech/structure** → Tasks 1–3 (Vite/React Router/tokens/structure). ✓
- **Form emails owner + mailto fallback** → Task 8 (QuoteForm). ✓
- **Lawn calculator** → Task 8 (calcLawn + LawnCalculator, tested). ✓
- **Testimonials incl. French, locations, Instagram** → content.js (T2), Home/About/Gallery/Footer. ✓

No placeholder steps; types consistent (`sizeBucket`, `validateQuote`, `useLang`, `t.*` keys used as defined). Open items (Formspree endpoint via `VITE_FORM_ENDPOINT`, before/after photos, logo file) carry documented fallbacks and do not block any task.
