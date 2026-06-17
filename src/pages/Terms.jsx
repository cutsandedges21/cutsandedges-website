import { useLang } from '../i18n/LanguageContext.jsx'
import { CONTACT } from '../i18n/content.js'
import './Legal.css'

const COPY = {
  en: {
    title: 'Terms of Service',
    body: [
      'Cuts & Edges provides residential lawn care services in the greater Montreal area. Quotes are estimates based on the property information you provide; final pricing is confirmed before work begins. We charge per cut, with pricing based on lawn size.',
      'Service scheduling is weather-dependent and may be adjusted to protect your lawn and ensure quality results. We will make reasonable efforts to notify you of any changes.',
      `By requesting a quote you agree to be contacted regarding your request. Questions about these terms can be sent to ${CONTACT.email} or ${CONTACT.phone}.`,
    ],
  },
  fr: {
    title: 'Conditions d’utilisation',
    body: [
      'Cuts & Edges offre des services résidentiels d’entretien de pelouse dans le grand Montréal. Les soumissions sont des estimations basées sur les renseignements fournis; le prix final est confirmé avant le début des travaux. Nous facturons par coupe, selon la taille du terrain.',
      'La planification des services dépend de la météo et peut être ajustée afin de protéger votre pelouse et d’assurer un résultat de qualité. Nous ferons des efforts raisonnables pour vous informer de tout changement.',
      `En demandant une soumission, vous acceptez d’être contacté au sujet de votre demande. Pour toute question concernant ces conditions, écrivez à ${CONTACT.email} ou composez le ${CONTACT.phone}.`,
    ],
  },
}

export default function Terms() {
  const { lang } = useLang()
  const c = COPY[lang]
  return (
    <section className="section container legal">
      <h1>{c.title}</h1>
      {c.body.map((p, i) => <p key={i}>{p}</p>)}
    </section>
  )
}
