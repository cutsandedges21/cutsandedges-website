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
        <button className="nav__lang nav__lang--drawer" onClick={toggle}>
          <span className={lang === 'en' ? 'on' : ''}>EN</span> · <span className={lang === 'fr' ? 'on' : ''}>FR</span>
        </button>
      </div>
    </header>
  )
}
