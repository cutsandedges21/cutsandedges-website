import { useLang } from '../i18n/LanguageContext.jsx'
import { CONTACT } from '../i18n/content.js'
import './Legal.css'

const COPY = {
  en: {
    title: 'Privacy Policy',
    body: [
      'Cuts & Edges collects only the information you submit through our quote form — your name, contact details, and property information — for the sole purpose of preparing and responding to your quote request.',
      'We do not sell, rent, or share your personal information with third parties. Your details are used only to contact you about the services you requested.',
      `To ask what information we hold, or to request its deletion, email us at ${CONTACT.email}.`,
    ],
  },
  fr: {
    title: 'Politique de confidentialité',
    body: [
      'Cuts & Edges recueille uniquement les renseignements que vous soumettez via notre formulaire de soumission — votre nom, vos coordonnées et les informations sur votre terrain — dans le seul but de préparer et de répondre à votre demande.',
      'Nous ne vendons, ne louons ni ne partageons vos renseignements personnels avec des tiers. Vos informations servent uniquement à vous contacter au sujet des services demandés.',
      `Pour savoir quels renseignements nous détenons ou pour en demander la suppression, écrivez-nous à ${CONTACT.email}.`,
    ],
  },
}

export default function Privacy() {
  const { lang } = useLang()
  const c = COPY[lang]
  return (
    <section className="section container legal">
      <h1>{c.title}</h1>
      {c.body.map((p, i) => <p key={i}>{p}</p>)}
    </section>
  )
}
