import { useLang } from '../i18n/LanguageContext.jsx'
import { GALLERY_CLIPS, CONTACT } from '../i18n/content.js'
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
        <div className="gallery-grid">
          {GALLERY_CLIPS.map((c, i) => (
            <Reveal key={i} className={`gallery-clip ${i === 0 ? 'gallery-clip--feature' : ''}`}>
              <video src={c.src} poster={c.poster} muted loop playsInline controls preload="none" />
              <span className="eyebrow gallery-clip__label">{c.label[lang]}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section container">
        <SectionLabel index="02">{t.gallery.instaTitle}</SectionLabel>
        <h2 className="gallery-insta-h">{CONTACT.handle}</h2>
        <InstagramStrip />
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
