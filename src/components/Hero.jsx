import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Hero.css'

export default function Hero({ video, poster, eyebrow, title, cta, short = false }) {
  const reduce = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const sectionRef = useRef(null)
  const mediaRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (reduce) return
    const section = sectionRef.current
    if (!section) return
    let raf = null
    const update = () => {
      const vh = window.innerHeight
      const p = Math.min(Math.max(-section.getBoundingClientRect().top / vh, 0), 1)
      if (mediaRef.current) mediaRef.current.style.transform = `scale(${1 + p * 0.12})`
      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(${p * 70}px)`
        contentRef.current.style.opacity = String(Math.max(0, 1 - p * 1.1))
      }
      raf = null
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduce])

  return (
    <section ref={sectionRef} className={`hero ${short ? 'hero--short' : ''}`}>
      <div className="hero__media" ref={mediaRef}>
        {video && !reduce
          ? (
            <video className="hero__video" autoPlay muted loop playsInline poster={poster} preload="metadata">
              <source src={video} type="video/mp4" />
            </video>
          )
          : <img className="hero__video" src={poster} alt="" />}
        <div className="hero__scrim" />
      </div>
      <div className="hero__content" ref={contentRef}>
        {eyebrow && <p className="eyebrow hero__eyebrow">{eyebrow}</p>}
        <h1 className="hero__title">{title}</h1>
        {cta && <Link to={cta.to} className="link-underline hero__cta">{cta.label}</Link>}
      </div>
      {!short && <span className="hero__scroll" aria-hidden="true">↓</span>}
    </section>
  )
}
