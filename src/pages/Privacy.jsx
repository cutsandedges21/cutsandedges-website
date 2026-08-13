import { useLang } from '../i18n/LanguageContext.jsx'
import { CONTACT } from '../i18n/content.js'
import './Legal.css'

const COPY = {
  en: {
    title: 'Privacy Policy',
    body: [
      'This website does not collect personal information. There are no forms, accounts, or sign-ups — nothing you enter is submitted to or stored by us, because there is nothing to submit.',
      `We only receive your personal information when you choose to contact us directly — by phone at ${CONTACT.phone}, by email at ${CONTACT.email}, or through our social media accounts. In that case we receive only what you send us: typically your name, contact details, and information about your property.`,
      'That information is used for one purpose: preparing your quote and providing the services you asked about. We do not sell, rent, or share it with third parties, and we keep it only as long as needed to serve you.',
      'The site sets no advertising or tracking cookies and runs no analytics. Your language preference (EN or FR) is stored in your own browser and never leaves your device. Web fonts are loaded from Google Fonts, which receives your IP address as part of that request, and photos from our Instagram feed are copied to this site and served from it — viewing them does not share anything with Instagram. Links to Instagram and Facebook take you to those companies’ own sites, where their privacy policies apply.',
      `To ask what information we hold about you, or to request its deletion, email us at ${CONTACT.email} or call ${CONTACT.phone}.`,
    ],
  },
  fr: {
    title: 'Politique de confidentialité',
    body: [
      'Ce site web ne recueille aucun renseignement personnel. Il n’y a aucun formulaire, aucun compte et aucune inscription — rien de ce que vous saisissez ne nous est transmis ni conservé, puisqu’il n’y a rien à soumettre.',
      `Nous recevons vos renseignements personnels uniquement lorsque vous choisissez de nous joindre directement — par téléphone au ${CONTACT.phone}, par courriel à ${CONTACT.email}, ou via nos réseaux sociaux. Nous recevons alors seulement ce que vous nous transmettez : généralement votre nom, vos coordonnées et des informations sur votre terrain.`,
      'Ces renseignements servent à une seule fin : préparer votre soumission et fournir les services demandés. Nous ne les vendons pas, ne les louons pas et ne les partageons pas avec des tiers, et nous ne les conservons que le temps nécessaire pour vous servir.',
      'Le site n’utilise aucun témoin (cookie) publicitaire ou de suivi et n’exécute aucun outil d’analyse. Votre préférence de langue (EN ou FR) est enregistrée dans votre propre navigateur et ne quitte jamais votre appareil. Les polices de caractères proviennent de Google Fonts, qui reçoit votre adresse IP lors de cette requête, et les photos de notre fil Instagram sont copiées sur ce site et servies depuis celui-ci — les consulter ne transmet rien à Instagram. Les liens vers Instagram et Facebook vous dirigent vers les sites de ces entreprises, où leurs propres politiques de confidentialité s’appliquent.',
      `Pour savoir quels renseignements nous détenons à votre sujet ou pour en demander la suppression, écrivez-nous à ${CONTACT.email} ou composez le ${CONTACT.phone}.`,
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
