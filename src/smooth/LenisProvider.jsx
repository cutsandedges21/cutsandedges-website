import { createContext, useContext, useEffect, useRef } from 'react'
import Lenis from 'lenis'

const LenisContext = createContext(null)
export const useLenis = () => useContext(LenisContext)

export function LenisProvider({ children }) {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    ref.current = lenis

    let id
    const raf = time => { lenis.raf(time); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
      ref.current = null
    }
  }, [])

  return <LenisContext.Provider value={ref}>{children}</LenisContext.Provider>
}
