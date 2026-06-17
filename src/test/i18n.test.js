import { describe, it, expect } from 'vitest'
import en from '../i18n/en.js'
import fr from '../i18n/fr.js'

function keys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? keys(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

describe('i18n dictionaries', () => {
  it('FR has exactly the same keys as EN', () => {
    expect(keys(fr).sort()).toEqual(keys(en).sort())
  })
})
