import { useLang } from '../i18n/LanguageContext.jsx'
import { SERVICES } from '../i18n/content.js'
import Reveal from './Reveal.jsx'

export default function ServiceList() {
  const { lang } = useLang()
  return (
    <div className="service-list">
      {SERVICES.map((s, i) => (
        <Reveal key={s.id} className="service-list__row" delay={i * 0.08}>
          <span className="service-list__num">{String(i + 1).padStart(2, '0')}</span>
          <h3>{s[lang].name}</h3>
          <p>{s[lang].desc}</p>
        </Reveal>
      ))}
    </div>
  )
}
