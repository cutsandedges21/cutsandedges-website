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
        <span className="footer__legal">
          <Link to="/privacy">{t.footer.privacy}</Link> · <Link to="/terms">{t.footer.terms}</Link>
        </span>
      </div>
    </footer>
  )
}
