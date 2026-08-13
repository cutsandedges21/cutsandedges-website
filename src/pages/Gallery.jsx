import { useLang } from '../i18n/LanguageContext.jsx'
import { CONTACT, BEFORE_AFTER, JOB_DETAILS } from '../i18n/content.js'
import Hero from '../components/Hero.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import InstagramStrip from '../components/InstagramStrip.jsx'
import PillButton from '../components/PillButton.jsx'
import './Gallery.css'

export default function Gallery() {
  const { t, lang } = useLang()
  return (
    <>
      <Hero
        video="/videos/hero-gallery.mp4" poster="/videos/hero-gallery-poster.jpg"
        eyebrow={t.nav.gallery} title={t.gallery.title} />

      <section className="section container">
        <Reveal as="p" className="page-intro">{t.gallery.intro}</Reveal>
      </section>

      <section className="section container">
        <SectionLabel index="01">{t.gallery.baTitle}</SectionLabel>
        <h2 className="gallery-h2">{t.gallery.baLead}</h2>
        <div className="ba-list">
          {BEFORE_AFTER.map(job => (
            <Reveal key={job.id} className="ba-job">
              <div className="ba-pair" style={{ '--ba-ratio': job.ratio }}>
                <figure className="ba-shot">
                  <img src={job.before} alt={`${t.gallery.before} — ${job[lang]}`} loading="lazy" />
                  <figcaption className="ba-shot__tag">{t.gallery.before}</figcaption>
                </figure>
                <figure className="ba-shot">
                  <img src={job.after} alt={`${t.gallery.after} — ${job[lang]}`} loading="lazy" />
                  <figcaption className="ba-shot__tag ba-shot__tag--after">{t.gallery.after}</figcaption>
                </figure>
              </div>
              <p className="ba-job__caption">{job[lang]}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section--wheat">
        <div className="section container">
          <SectionLabel index="02">{t.gallery.detailTitle}</SectionLabel>
          <h2 className="gallery-h2">{t.gallery.detailLead}</h2>
          <div className="job-details">
            {JOB_DETAILS.map((d, i) => (
              <Reveal key={d.src} as="figure" className="job-detail" delay={i * 0.08}>
                <img src={d.src} alt={d[lang]} loading="lazy" />
                <figcaption>{d[lang]}</figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <SectionLabel index="03">{t.gallery.instaTitle}</SectionLabel>
        <h2 className="gallery-insta-h">{CONTACT.handle}</h2>
        <InstagramStrip limit={4} />
        <div className="gallery-social-links">
          <a className="link-underline" href={CONTACT.instagram} target="_blank" rel="noreferrer">Instagram</a>
          <a className="link-underline" href={CONTACT.facebook} target="_blank" rel="noreferrer">Facebook</a>
        </div>
      </section>

      <section className="section container gallery-cta">
        <PillButton to="/contact">{t.gallery.cta}</PillButton>
      </section>
    </>
  )
}
