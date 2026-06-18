import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext.jsx'
import './HomeHero.css'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

export default function HomeHero() {
  const { t } = useLang()
  const reduce = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const stageRef = useRef(null)
  const wordRef = useRef(null)
  const lettersRef = useRef([])
  const mediaRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (reduce) return
    const stage = stageRef.current
    if (!stage) return
    let raf = null

    const update = () => {
      const vh = window.innerHeight
      const rect = stage.getBoundingClientRect()
      const p = clamp(-rect.top / vh, 0, 1)   // 0 at top → 1 after one viewport of scroll
      const e = easeInOut(p)

      // collapse the giant C & E up into the logo position
      const word = wordRef.current
      if (word) {
        const scale = 1 - e * 0.86                       // 1 → ~0.14
        const ty = -e * (vh / 2 - 42)                    // viewport centre → near the top bar
        word.style.transform = `translate(-50%, calc(-50% + ${ty}px)) scale(${scale})`
        word.style.opacity = String(1 - clamp((p - 0.72) / 0.28, 0, 1))
      }

      // pull the spread-out letters together
      const spread = Math.min(window.innerWidth * 0.30, 360)
      lettersRef.current.forEach((el, i) => {
        if (el) el.style.transform = `translateX(${(i - 1) * spread * (1 - e)}px)`
      })

      // slow cinematic zoom on the footage
      if (mediaRef.current) mediaRef.current.style.transform = `scale(${1 + e * 0.12})`

      // reveal the real hero headline as the intro clears
      const c = contentRef.current
      if (c) {
        const cp = clamp((p - 0.45) / 0.4, 0, 1)
        c.style.opacity = String(cp)
        c.style.transform = `translateY(${(1 - cp) * 28}px)`
        c.style.pointerEvents = cp > 0.5 ? 'auto' : 'none'
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
    <div className={`home-stage ${reduce ? 'home-stage--static' : ''}`} ref={stageRef}>
      <section className="hero home-hero">
        <div className="hero__media" ref={mediaRef}>
          <video className="hero__video" autoPlay muted loop playsInline
            poster="/videos/luxury-drone-poster.jpg" preload="metadata">
            <source src="/videos/luxury-drone.mp4" type="video/mp4" />
          </video>
          <div className="hero__scrim" />
        </div>

        {!reduce && (
          <div className="home-intro" ref={wordRef} aria-hidden="true">
            <div className="home-intro__inner">
              {['C', '&', 'E'].map((ch, i) => (
                <span key={i} className="home-intro__l" ref={el => (lettersRef.current[i] = el)}>{ch}</span>
              ))}
            </div>
          </div>
        )}

        <div className="hero__content home-hero__content" ref={contentRef}>
          <p className="eyebrow hero__eyebrow">{t.hero.eyebrow}</p>
          <h1 className="hero__title">{t.hero.titleA}<br /><em>{t.hero.titleB}</em></h1>
          <Link to="/contact" className="link-underline hero__cta">{t.hero.cta}</Link>
        </div>

        <span className="hero__scroll" aria-hidden="true">↓</span>
      </section>
    </div>
  )
}
