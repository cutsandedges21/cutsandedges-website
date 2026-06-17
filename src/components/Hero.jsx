import { Link } from 'react-router-dom'
import './Hero.css'

export default function Hero({ video, poster, eyebrow, title, cta, short = false }) {
  const reduce = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <section className={`hero ${short ? 'hero--short' : ''}`}>
      <div className="hero__media">
        {video && !reduce
          ? (
            <video className="hero__video" autoPlay muted loop playsInline poster={poster} preload="metadata">
              <source src={video} type="video/mp4" />
            </video>
          )
          : <img className="hero__video" src={poster} alt="" />}
        <div className="hero__scrim" />
      </div>
      <div className="hero__content">
        {eyebrow && <p className="eyebrow hero__eyebrow">{eyebrow}</p>}
        <h1 className="hero__title">{title}</h1>
        {cta && <Link to={cta.to} className="link-underline hero__cta">{cta.label}</Link>}
      </div>
      {!short && <span className="hero__scroll" aria-hidden="true">↓</span>}
    </section>
  )
}
