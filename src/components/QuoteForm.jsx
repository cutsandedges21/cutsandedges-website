import { useState, useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext.jsx'
import { SERVICES, CONTACT } from '../i18n/content.js'
import { validateQuote } from '../lib/validateQuote.js'

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || ''

export default function QuoteForm({ prefillSize }) {
  const { t, lang } = useLang()
  const [v, setV] = useState({ name: '', email: '', phone: '', size: 'm', address: '', services: [], details: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  useEffect(() => { if (prefillSize) setV(s => ({ ...s, size: prefillSize })) }, [prefillSize])

  const toggleService = id => setV(s => ({
    ...s,
    services: s.services.includes(id) ? s.services.filter(x => x !== id) : [...s.services, id],
  }))

  const submit = async e => {
    e.preventDefault()
    const errs = validateQuote(v)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setStatus('sending')
    try {
      if (!ENDPOINT) throw new Error('no endpoint')
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(v),
      })
      if (!r.ok) throw new Error('bad status')
      setStatus('success')
    } catch {
      // mailto fallback (no backend / endpoint unreachable)
      const body = encodeURIComponent(
        `Name: ${v.name}\nEmail: ${v.email}\nPhone: ${v.phone}\nLawn Size: ${t.contact.sizes[v.size] || v.size}\n` +
        `Address: ${v.address}\nServices: ${v.services.join(', ')}\nDetails: ${v.details}`
      )
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Quote request — ' + v.name)}&body=${body}`
      setStatus('idle')
    }
  }

  if (status === 'success') return <p className="form__success">{t.contact.success}</p>

  return (
    <form className="quote-form" onSubmit={submit} noValidate>
      <div className="quote-form__grid">
        <label>{t.contact.name} *
          <input value={v.name} onChange={e => setV({ ...v, name: e.target.value })} aria-invalid={!!errors.name} />
        </label>
        <label>{t.contact.email} *
          <input type="email" value={v.email} onChange={e => setV({ ...v, email: e.target.value })} aria-invalid={!!errors.email} />
        </label>
        <label>{t.contact.phone} *
          <input value={v.phone} onChange={e => setV({ ...v, phone: e.target.value })} aria-invalid={!!errors.phone} />
        </label>
        <label>{t.contact.size}
          <select value={v.size} onChange={e => setV({ ...v, size: e.target.value })}>
            {Object.entries(t.contact.sizes).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <label>{t.contact.address} *
        <input value={v.address} onChange={e => setV({ ...v, address: e.target.value })} aria-invalid={!!errors.address} />
      </label>

      <fieldset className="quote-form__services" aria-invalid={!!errors.services}>
        <legend>{t.contact.servicesNeeded} *</legend>
        {SERVICES.map(s => (
          <label key={s.id} className="checkbox">
            <input type="checkbox" checked={v.services.includes(s.id)} onChange={() => toggleService(s.id)} />
            {s[lang].name}
          </label>
        ))}
      </fieldset>

      <label>{t.contact.details}
        <textarea rows="4" value={v.details} onChange={e => setV({ ...v, details: e.target.value })} />
      </label>

      <button className="pill pill--solid quote-form__submit" disabled={status === 'sending'}>{t.contact.submit}</button>
      {status === 'error' && <p className="form__error">{t.contact.error}</p>}
    </form>
  )
}
