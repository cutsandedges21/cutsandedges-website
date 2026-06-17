import { describe, it, expect } from 'vitest'
import { validateQuote } from '../lib/validateQuote.js'

describe('validateQuote', () => {
  it('requires name, valid email, phone, and >=1 service', () => {
    const errors = validateQuote({ name: '', email: 'bad', phone: '', services: [] })
    expect(errors.name).toBeTruthy()
    expect(errors.email).toBeTruthy()
    expect(errors.phone).toBeTruthy()
    expect(errors.services).toBeTruthy()
  })
  it('passes a complete valid submission', () => {
    const errors = validateQuote({ name: 'Jo', email: 'jo@x.com', phone: '5145619746', services: ['mowing'] })
    expect(Object.keys(errors)).toHaveLength(0)
  })
})
