import { useLang } from '../i18n/LanguageContext.jsx'
import { SERVICES } from '../i18n/content.js'
import Hero from '../components/Hero.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import PillButton from '../components/PillButton.jsx'
import './Services.css'

export default function Services() {
  const { t, lang } = useLang()
  return (
    <>
      <Hero short
        video="/videos/hero-services.mp4" poster="/videos/hero-services-poster.jpg"
        eyebrow={t.nav.services} title={t.services.title} />

      <section className="section container">
        <Reveal as="p" className="page-intro">{t.services.intro}</Reveal>
      </section>

      {SERVICES.map((s, i) => (
        <section key={s.id} className={`section container service-row ${i % 2 ? 'service-row--alt' : ''}`}>
          <Reveal className="service-row__media" />
          <Reveal className="service-row__body">
            <SectionLabel index={String(i + 1).padStart(2, '0')}>{t.nav.services}</SectionLabel>
            <h2>{s[lang].name}</h2>
            <p>{s[lang].desc}</p>
            <ul className="service-row__items">
              {s[lang].items.map(it => <li key={it}>{it}</li>)}
            </ul>
          </Reveal>
        </section>
      ))}

      <section className="section container services-cta">
        <PillButton to="/contact">{t.services.cta}</PillButton>
      </section>
    </>
  )
}
