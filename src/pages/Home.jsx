import { useLang } from '../i18n/LanguageContext.jsx'
import HomeHero from '../components/HomeHero.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import PillButton from '../components/PillButton.jsx'
import ServiceList from '../components/ServiceList.jsx'
import Testimonials from '../components/Testimonials.jsx'
import InstagramStrip from '../components/InstagramStrip.jsx'
import CTABand from '../components/CTABand.jsx'
import './Home.css'

export default function Home() {
  const { t } = useLang()
  return (
    <>
      <HomeHero />

      <section className="section container">
        <Reveal as="h2" className="home__statement">{t.home.positioning}</Reveal>
      </section>

      <section className="section container">
        <SectionLabel index="01">{t.home.servicesLabel}</SectionLabel>
        <h2 className="home__h2">{t.home.servicesTitle}</h2>
        <ServiceList />
        <div className="home__more">
          <PillButton to="/services" variant="ghost">{t.home.servicesLink}</PillButton>
        </div>
      </section>

      <section className="section--wheat">
        <div className="section container home__about">
          <div>
            <SectionLabel index="02">{t.home.aboutLabel}</SectionLabel>
            <h2 className="home__h2">{t.home.aboutTitle}</h2>
            <PillButton to="/about" variant="ghost">{t.home.aboutLink}</PillButton>
          </div>
          <div className="home__stat">
            <span className="home__statnum">{t.home.yearsStat}</span>
            <span className="home__statlabel">{t.home.yearsLabel}</span>
          </div>
        </div>
      </section>

      <section className="section container">
        <SectionLabel index="03">{t.home.testimonialsLabel}</SectionLabel>
        <h2 className="home__h2">{t.home.testimonialsTitle}</h2>
        <Testimonials limit={2} />
      </section>

      <section className="section container">
        <SectionLabel index="04">{t.home.instaLabel}</SectionLabel>
        <h2 className="home__h2">{t.home.instaTitle}</h2>
        <InstagramStrip limit={2} />
      </section>

      <CTABand />
    </>
  )
}
