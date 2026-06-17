import { useLang } from '../i18n/LanguageContext.jsx'
import Reveal from './Reveal.jsx'
import PillButton from './PillButton.jsx'

export default function CTABand() {
  const { t } = useLang()
  return (
    <section className="section--dark cta-band">
      <Reveal className="container cta-band__inner">
        <h2>{t.home.ctaTitle}</h2>
        <p>{t.home.ctaText}</p>
        <PillButton to="/contact">{t.home.ctaButton}</PillButton>
      </Reveal>
    </section>
  )
}
