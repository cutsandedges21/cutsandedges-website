import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import en from './en.js'
import fr from './fr.js'

const DICTS = { en, fr }
const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')
  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
  }, [lang])
  const toggle = useCallback(() => setLang(l => (l === 'en' ? 'fr' : 'en')), [])
  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t: DICTS[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
