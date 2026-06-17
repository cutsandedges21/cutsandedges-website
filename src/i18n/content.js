export const CONTACT = {
  phone: '(514) 561-9746', phoneHref: 'tel:5145619746',
  email: 'cutsandedges21@gmail.com',
  instagram: 'https://www.instagram.com/cutsandedges21',
  facebook: 'https://www.facebook.com/cutsandedges21/',
  handle: '@cutsandedges21',
  areas: ['Rivière-des-Prairies', 'Pointe-aux-Trembles', 'Anjou'],
  region: 'Greater Montreal, QC',
}

export const SERVICES = [
  { id: 'mowing',
    en: { name: 'Lawn Mowing & Maintenance', desc: 'Regular mowing, edging, and trimming to keep your lawn pristine week after week.', items: ['Weekly or bi-weekly service', 'Precision edging', 'Debris cleanup'] },
    fr: { name: 'Tonte et entretien', desc: 'Tonte, bordures et taille régulières pour une pelouse impeccable semaine après semaine.', items: ['Service hebdomadaire ou aux deux semaines', 'Bordures de précision', 'Nettoyage des débris'] } },
  { id: 'landscaping',
    en: { name: 'Landscaping', desc: 'Small landscaping jobs to enhance your outdoor space.', items: ['Plant selection', 'Hardscape installation', 'Garden bed maintenance'] },
    fr: { name: 'Aménagement paysager', desc: 'Petits travaux d’aménagement pour rehausser votre espace extérieur.', items: ['Choix de plantes', 'Installation d’aménagements', 'Entretien des plates-bandes'] } },
  { id: 'seasonal',
    en: { name: 'Seasonal Services', desc: 'Keep your lawn healthy year-round with cleanup and seasonal care.', items: ['Spring/fall cleanup', 'Leaf removal', 'Debris clearing'] },
    fr: { name: 'Services saisonniers', desc: 'Gardez votre pelouse en santé toute l’année avec le nettoyage saisonnier.', items: ['Nettoyage printemps/automne', 'Ramassage des feuilles', 'Dégagement des débris'] } },
  { id: 'weeds',
    en: { name: 'Weed Removal', desc: 'Weed control to maintain a clean, healthy lawn without unwanted growth.', items: ['Manual weed removal', 'Regular maintenance', 'Garden bed weeding'] },
    fr: { name: 'Désherbage', desc: 'Contrôle des mauvaises herbes pour une pelouse propre et saine.', items: ['Désherbage manuel', 'Entretien régulier', 'Désherbage des plates-bandes'] } },
]

export const TRUST = [
  { en: 'Modern Equipment', fr: 'Équipement moderne' },
  { en: 'Professional Service', fr: 'Service professionnel' },
  { en: 'Reliable Scheduling', fr: 'Horaire fiable' },
  { en: 'Quality Guaranteed', fr: 'Qualité garantie' },
]

// Testimonials shown verbatim; Claude's stays in French in both UI languages.
export const TESTIMONIALS = [
  { name: 'Robert', place: 'Pointe-aux-Trembles, QC', service: 'Landscaping & Weekly Maintenance', quote: 'Our yard was a mess before Cuts & Edges came in. They cleaned everything up and made it look way better than we expected. Super reliable and easy to deal with.' },
  { name: 'Johnny', place: 'Anjou, QC', service: 'Lawn Maintenance & Weeding', quote: 'Switching to Cuts & Edges was a good call. They just show up every week, no stress, and the lawn always looks great. Can’t complain at all.' },
  { name: 'Claude', place: 'Rivière-des-Prairies, QC', service: 'Seasonal Services', quote: 'On a pris le service de nettoyage saisonnier et franchement, rien à dire. Ils ont tout ramassé, fait l’aération, et le terrain était très beau après. Ça paraît qu’ils font attention aux détails et qu’ils prennent leur travail au sérieux.' },
]

// Gallery clips: optimized footage in /public/videos.
export const GALLERY_CLIPS = [
  { src: '/videos/luxury-drone.mp4', poster: '/videos/luxury-drone-poster.jpg', label: { en: 'Estate flyover', fr: 'Survol de propriété' } },
  { src: '/videos/gallery-drone-curves.mp4', poster: '/videos/gallery-drone-curves-poster.jpg', label: { en: 'Drone pass', fr: 'Survol en drone' } },
  { src: '/videos/gallery-tree-stump.mp4', poster: '/videos/gallery-tree-stump-poster.jpg', label: { en: 'Tree & stump work', fr: 'Travaux d’arbres' } },
  { src: '/videos/gallery-trim-stump.mp4', poster: '/videos/gallery-trim-stump-poster.jpg', label: { en: 'Precision trimming', fr: 'Taille de précision' } },
]
