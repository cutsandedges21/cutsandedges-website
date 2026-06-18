import { useState, useLayoutEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext.jsx'
import './Nav.css'

const links = ['services', 'gallery', 'about', 'contact']
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

export default function Nav() {
  const { t, lang, toggle } = useLang()
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const reduce = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const headerRef = useRef(null)
  const brandRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  // The wordmark is a SINGLE element. On the home page it starts blown up and
  // centred over the hero video, then a scroll-driven transform shrinks it into
  // the navbar slot — so the giant "C & E" literally becomes the navbar text.
  // It stays "C & E" until the bar's bottom edge meets the hero's ↓ scroll cue,
  // at which point the bar fills cream and it expands into "Cuts & Edges".
  const [brandFull, setBrandFull] = useState(!isHome || reduce)

  useLayoutEffect(() => {
    let raf = null
    const header = headerRef.current
    const brand = brandRef.current

    const update = () => {
      raf = null
      const morph = isHome && !reduce && !open
      if (morph && header && brand) {
        const stage = document.querySelector('.home-stage')
        const cue = document.querySelector('.hero__scroll')
        const vh = window.innerHeight
        const navH = header.offsetHeight
        const p = stage ? clamp(-stage.getBoundingClientRect().top / vh, 0, 1) : 0
        const e = easeInOut(p)

        // airy letter-spacing while giant, tightening to fit the bar as it docks
        const fontPx = parseFloat(getComputedStyle(brand).fontSize) || 24
        const lsEm = 0.04 + 0.36 * (1 - e)   // .40em giant → .04em docked
        brand.style.letterSpacing = `${lsEm}em`

        // size the giant by LETTER HEIGHT (≈ clamp(4.5rem, 24vw, 20rem)) so the
        // wide spacing pushes the wordmark out instead of shrinking the glyphs;
        // only rein the scale back if it would overflow the viewport width
        const giantPx = clamp(window.innerWidth * 0.48, 144, 640)
        let giantScale = clamp(giantPx / fontPx, 1, 40)
        const naturalW = brand.offsetWidth || 1
        const maxW = window.innerWidth * 0.94
        if (naturalW * giantScale > maxW) giantScale = maxW / naturalW
        const scale = 1 + (giantScale - 1) * (1 - e)
        const ty = (vh / 2 - navH / 2) * (1 - e)
        const tx = (lsEm * fontPx * scale) / 2   // cancel trailing letter-spacing so it stays centred
        brand.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`

        // fill the bar + expand to "Cuts & Edges" once its bottom edge reaches
        // the ↓ scroll cue (i.e. the hero has scrolled out under the navbar)
        const past = cue ? cue.getBoundingClientRect().top <= navH : p >= 1
        setScrolled(past)
        setBrandFull(past)
      } else {
        if (brand) { brand.style.transform = ''; brand.style.letterSpacing = '' }
        setScrolled(window.scrollY > 40)
        setBrandFull(true)
      }
    }

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [isHome, reduce, open])

  return (
    <header ref={headerRef} className={`nav ${scrolled ? 'nav--scrolled' : ''} ${open ? 'nav--open' : ''}`}>
      <nav className="nav__inner">
        <div className="nav__links nav__links--left">
          {links.map(k => <NavLink key={k} to={`/${k}`} className="nav__link">{t.nav[k]}</NavLink>)}
        </div>
        <Link
          to="/"
          ref={brandRef}
          className={`nav__brand ${isHome && !reduce ? 'nav__brand--morph' : ''} ${brandFull || open ? 'nav__brand--full' : ''}`}
          onClick={() => setOpen(false)}
        >
          C<span className="nav__brand-rest">uts</span>
          <span className="nav__brand-sep">&amp;</span>
          E<span className="nav__brand-rest">dges</span>
        </Link>
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
        <button className="nav__lang nav__lang--drawer" onClick={toggle}>
          <span className={lang === 'en' ? 'on' : ''}>EN</span> · <span className={lang === 'fr' ? 'on' : ''}>FR</span>
        </button>
      </div>
    </header>
  )
}
