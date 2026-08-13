import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext.jsx'
import { CONTACT, SERVICES } from '../i18n/content.js'
import Hero from '../components/Hero.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import PillButton from '../components/PillButton.jsx'
import './Contact.css'

export default function Contact() {
  const { t, lang } = useLang()
  return (
    <>
      <Hero
        video="/videos/hero-contact.mp4" poster="/videos/hero-contact-poster.jpg"
        eyebrow={t.nav.contact} title={t.contact.title} />

      <section className="section container">
        <Reveal as="p" className="page-intro">{t.contact.intro}</Reveal>
      </section>

      <section className="section container">
        <SectionLabel index="01">{t.contact.directTitle}</SectionLabel>
        <div className="contact-methods">
          <Reveal as="a" className="contact-method" href={CONTACT.phoneHref}>
            <span className="contact-method__label">{t.contact.phoneLabel}</span>
            <span className="contact-method__value">{CONTACT.phone}</span>
            <span className="contact-method__note">{t.contact.phoneNote}</span>
          </Reveal>
          <Reveal as="a" className="contact-method" href={`mailto:${CONTACT.email}`} delay={0.08}>
            <span className="contact-method__label">{t.contact.emailLabel}</span>
            <span className="contact-method__value">{CONTACT.email}</span>
            <span className="contact-method__note">{t.contact.emailNote}</span>
          </Reveal>
          <Reveal
            as="a" className="contact-method" href={CONTACT.instagram}
            target="_blank" rel="noreferrer" delay={0.16}>
            <span className="contact-method__label">{t.contact.socialLabel}</span>
            <span className="contact-method__value">{CONTACT.handle}</span>
            <span className="contact-method__note">{t.contact.socialNote}</span>
          </Reveal>
        </div>
      </section>

      <section className="section--wheat">
        <div className="section container">
          <SectionLabel index="02">{t.contact.askTitle}</SectionLabel>
          <h2 className="contact-h2">{t.contact.askLead}</h2>
          <ul className="contact-ask">
            {t.contact.askItems.map((item, i) => (
              <Reveal as="li" key={item} className="contact-ask__item" delay={i * 0.06}>{item}</Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section container contact-cols">
        <Reveal>
          <SectionLabel index="03">{t.contact.servicesTitle}</SectionLabel>
          <ul className="contact-services">
            {SERVICES.map(s => <li key={s.id}>{s[lang].name}</li>)}
          </ul>
          <Link className="link-underline" to="/services">{t.contact.servicesLink}</Link>
        </Reveal>
        <Reveal delay={0.1}>
          <SectionLabel index="04">{t.contact.pricingTitle}</SectionLabel>
          <p className="contact-pricing">{t.contact.pricingText}</p>
        </Reveal>
      </section>

      <section className="section container contact-area">
        <SectionLabel index="05">{t.contact.areaTitle}</SectionLabel>
        <h2 className="contact-h2">{t.contact.areaText}</h2>
        <div className="contact-area__list">
          {CONTACT.areas.map(a => <span key={a}>{a}</span>)}
        </div>
      </section>

      <section className="section--dark cta-band">
        <Reveal className="container cta-band__inner">
          <h2>{t.contact.ctaTitle}</h2>
          <p>{t.contact.ctaText}</p>
          <PillButton href={CONTACT.phoneHref}>{CONTACT.phone}</PillButton>
        </Reveal>
      </section>
    </>
  )
}
