export function validateQuote(v) {
  const e = {}
  if (!v.name || !v.name.trim()) e.name = 'required'
  if (!v.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = 'invalid'
  if (!v.phone || v.phone.replace(/\D/g, '').length < 10) e.phone = 'invalid'
  if (!v.services || v.services.length === 0) e.services = 'required'
  return e
}
