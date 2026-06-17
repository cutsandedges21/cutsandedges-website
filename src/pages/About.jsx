import { useLang } from '../i18n/LanguageContext.jsx'
import { TRUST, CONTACT } from '../i18n/content.js'
import Hero from '../components/Hero.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import Testimonials from '../components/Testimonials.jsx'
import PillButton from '../components/PillButton.jsx'
import './About.css'

export default function About() {
  const { t, lang } = useLang()
  return (
    <>
      <Hero short
        video="/videos/hero-about.mp4" poster="/videos/hero-about-poster.jpg"
        eyebrow={t.nav.about} title={t.about.title} />

      <section className="section container about-story">
        <Reveal className="about-story__text">
          <p>{t.about.p1}</p>
          <p>{t.about.p2}</p>
        </Reveal>
        <Reveal className="about-stat">
          <span className="about-stat__num">{t.about.yearsStat}</span>
          <span className="about-stat__label">{t.about.yearsLabel}</span>
        </Reveal>
      </section>

      <section className="section--wheat">
        <div className="section container">
          <SectionLabel index="02">{t.about.trustTitle}</SectionLabel>
          <div className="about-trust">
            {TRUST.map(x => <Reveal key={x.en} className="about-trust__item">{x[lang]}</Reveal>)}
          </div>
        </div>
      </section>

      <section className="section container">
        <SectionLabel index="03">{t.home.testimonialsLabel}</SectionLabel>
        <h2 className="about-h2">{t.home.testimonialsTitle}</h2>
        <Testimonials />
      </section>

      <section className="section container about-area">
        <SectionLabel index="04">{t.about.areaTitle}</SectionLabel>
        <h2 className="about-h2">{t.about.areaText}</h2>
        <div className="about-area__list">
          {CONTACT.areas.map(a => <span key={a}>{a}</span>)}
        </div>
      </section>

      <section className="section container about-cta">
        <PillButton to="/contact">{t.about.cta}</PillButton>
      </section>
    </>
  )
}
