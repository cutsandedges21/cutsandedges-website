import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Nav from './Nav.jsx'
import Footer from './Footer.jsx'
import { useLenis } from '../smooth/LenisProvider.jsx'

export default function Layout() {
  const { pathname } = useLocation()
  const lenisRef = useLenis()
  useEffect(() => {
    if (lenisRef?.current) lenisRef.current.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, lenisRef])
  return (
    <>
      <Nav />
      <main><Outlet /></main>
      <Footer />
    </>
  )
}
