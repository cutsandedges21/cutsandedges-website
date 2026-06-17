import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext.jsx'
import { sizeBucket } from '../lib/calcLawn.js'

export default function LawnCalculator({ onResult }) {
  const { t } = useLang()
  const [d, setD] = useState({ length: '', width: '' })
  const [res, setRes] = useState(null)

  const run = () => {
    const r = sizeBucket(0, { length: +d.length, width: +d.width })
    setRes(r)
    onResult?.(r.id)
  }

  return (
    <div className="calc">
      <h3 className="calc__title">{t.contact.calcTitle}</h3>
      <p className="calc__help">{t.contact.calcHelp}</p>
      <div className="calc__row">
        <label>{t.contact.length}
          <input type="number" min="0" value={d.length} onChange={e => setD({ ...d, length: e.target.value })} />
        </label>
        <label>{t.contact.width}
          <input type="number" min="0" value={d.width} onChange={e => setD({ ...d, width: e.target.value })} />
        </label>
      </div>
      <button type="button" className="pill pill--ghost calc__btn" onClick={run}>{t.contact.calcTitle}</button>
      {res && (
        <p className="calc__result">{t.contact.calcResult}: <b>{res.sqft.toLocaleString()} sq ft — {t.contact.sizes[res.id]}</b></p>
      )}
    </div>
  )
}
