import { describe, it, expect } from 'vitest'
import { sizeBucket } from '../lib/calcLawn.js'

describe('sizeBucket', () => {
  it('classifies small/medium/large by sq ft', () => {
    expect(sizeBucket(1000).id).toBe('small')   // < 1500
    expect(sizeBucket(1500).id).toBe('medium')  // 1500–2000 inclusive
    expect(sizeBucket(2000).id).toBe('medium')
    expect(sizeBucket(2500).id).toBe('large')   // > 2000
  })
  it('computes area from length × width', () => {
    expect(sizeBucket(0, { length: 40, width: 50 }).sqft).toBe(2000)
  })
})
