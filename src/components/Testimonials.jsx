import { TESTIMONIALS } from '../i18n/content.js'
import Reveal from './Reveal.jsx'

export default function Testimonials({ limit }) {
  const items = limit ? TESTIMONIALS.slice(0, limit) : TESTIMONIALS
  return (
    <div className="testimonials">
      {items.map(tm => (
        <Reveal key={tm.name} className="testimonial">
          <p className="testimonial__quote">“{tm.quote}”</p>
          <p className="testimonial__name">{tm.name}</p>
          <p className="testimonial__meta">{tm.place} · {tm.service}</p>
        </Reveal>
      ))}
    </div>
  )
}
