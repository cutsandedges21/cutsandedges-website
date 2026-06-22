import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext.jsx'
import { CONTACT } from '../i18n/content.js'
import Hero from '../components/Hero.jsx'
import QuoteForm from '../components/QuoteForm.jsx'
import LawnCalculator from '../components/LawnCalculator.jsx'
import './Contact.css'

export default function Contact() {
  const { t } = useLang()
  const [size, setSize] = useState(null)
  return (
    <>
      <Hero
        video="/videos/hero-contact.mp4" poster="/videos/hero-contact-poster.jpg"
        eyebrow={t.nav.contact} title={t.contact.title} />

      <section className="section container">
        <p className="page-intro">{t.contact.intro}</p>
      </section>

      <section className="section container contact-grid">
        <QuoteForm prefillSize={size} />
        <aside className="contact-aside">
          <LawnCalculator onResult={setSize} />
          <div className="contact-direct">
            <h3 className="contact-direct__title">{t.contact.directTitle}</h3>
            <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={CONTACT.instagram} target="_blank" rel="noreferrer">{CONTACT.handle}</a>
            <p className="contact-direct__area">{CONTACT.areas.join(' · ')} — {CONTACT.region}</p>
          </div>
        </aside>
      </section>
    </>
  )
}
