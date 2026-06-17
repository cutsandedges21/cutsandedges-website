import { useLang } from '../i18n/LanguageContext.jsx'
import { CONTACT } from '../i18n/content.js'

export default function InstagramStrip() {
  const { t } = useLang()
  return (
    <div className="insta">
      <div className="insta__tiles">
        {[0, 1, 2, 3].map(i => <div key={i} className="insta__tile" />)}
      </div>
      <a className="link-underline" href={CONTACT.instagram} target="_blank" rel="noreferrer">
        {CONTACT.handle}
      </a>
    </div>
  )
}
