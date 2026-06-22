import { describe, it, expect } from 'vitest'
import {
  mediaType, pickImageUrl, trimCaption, transformMedia, selectLatest, feedItems,
} from '../lib/instagram.js'

// Helper to build a Behold-style sizes object.
const sizes = urls => Object.fromEntries(
  Object.entries(urls).map(([k, mediaUrl]) => [k, { mediaUrl, width: 100, height: 100 }])
)

describe('mediaType', () => {
  it('maps carousels, images, and videos', () => {
    expect(mediaType({ mediaType: 'CAROUSEL_ALBUM' })).toBe('CAROUSEL')
    expect(mediaType({ mediaType: 'IMAGE' })).toBe('IMAGE')
    expect(mediaType({ mediaType: 'VIDEO' })).toBe('VIDEO')
  })
})

describe('pickImageUrl', () => {
  it('prefers the large size', () => {
    expect(pickImageUrl({ sizes: sizes({ small: 's.webp', large: 'l.webp' }) })).toBe('l.webp')
  })
  it('falls back through the size preference order', () => {
    expect(pickImageUrl({ sizes: sizes({ small: 's.webp', medium: 'm.webp' }) })).toBe('m.webp')
  })
  it('falls back to the first carousel child when the post has no sizes', () => {
    const post = { mediaType: 'CAROUSEL_ALBUM', children: [{ sizes: sizes({ large: 'c.webp' }) }] }
    expect(pickImageUrl(post)).toBe('c.webp')
  })
  it('returns null when no usable image exists', () => {
    expect(pickImageUrl({})).toBeNull()
    expect(pickImageUrl({ mediaType: 'CAROUSEL_ALBUM', children: [] })).toBeNull()
  })
})

describe('trimCaption', () => {
  it('returns empty string for missing captions', () => {
    expect(trimCaption(undefined)).toBe('')
  })
  it('leaves short captions unchanged', () => {
    expect(trimCaption('Fresh cut')).toBe('Fresh cut')
  })
  it('trims long captions on a word boundary with an ellipsis', () => {
    const caption = 'a'.repeat(60) + ' ' + 'b'.repeat(80) // 141 chars
    expect(trimCaption(caption, 120)).toBe('a'.repeat(60) + '…')
  })
  it('hard-cuts a long caption that has no spaces', () => {
    expect(trimCaption('a'.repeat(150), 120)).toBe('a'.repeat(120) + '…')
  })
  it('never splits an emoji across the cut boundary', () => {
    const caption = '🌱'.repeat(150) // each emoji is a surrogate pair
    const out = trimCaption(caption, 10)
    expect(out).toBe('🌱'.repeat(10) + '…')
    expect(out).not.toContain('�') // no replacement char from a broken pair
  })
})

describe('transformMedia', () => {
  it('builds the stored shape with engagement counts and prefers prunedCaption', () => {
    const post = {
      id: '123', mediaType: 'IMAGE', sizes: sizes({ large: 'x.webp' }),
      caption: 'Hi #lawn', prunedCaption: 'Hi', permalink: 'https://insta/p/123',
      timestamp: '2026-06-20T14:00:00+0000', likeCount: 75, commentsCount: 3,
    }
    expect(transformMedia(post, '/instagram/123.webp')).toEqual({
      id: '123', type: 'IMAGE', image: '/instagram/123.webp',
      caption: 'Hi', permalink: 'https://insta/p/123',
      timestamp: '2026-06-20T14:00:00+0000', likes: 75, comments: 3,
    })
  })
  it('falls back to caption when prunedCaption is absent, and omits hidden counts', () => {
    const post = { id: '9', mediaType: 'IMAGE', caption: 'Hello', permalink: 'p', timestamp: 't' }
    const out = transformMedia(post, '/instagram/9.webp')
    expect(out.caption).toBe('Hello')
    expect(out).not.toHaveProperty('likes')
    expect(out).not.toHaveProperty('comments')
  })
})

describe('selectLatest', () => {
  it('keeps the first N posts that have a usable image', () => {
    const list = [
      { id: '1', sizes: sizes({ large: 'a.webp' }) },
      { id: '2' },                                      // no image → skipped
      { id: '3', sizes: sizes({ large: 'c.webp' }) },
      { id: '4', sizes: sizes({ large: 'd.webp' }) },
      { id: '5', sizes: sizes({ large: 'e.webp' }) },
    ]
    expect(selectLatest(list, 3).map(m => m.id)).toEqual(['1', '3', '4'])
  })
  it('returns [] for non-array input', () => {
    expect(selectLatest(null, 4)).toEqual([])
  })
})

describe('feedItems', () => {
  it('slices to the limit', () => {
    const data = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
    expect(feedItems(data, 2).map(x => x.id)).toEqual(['a', 'b'])
  })
  it('returns [] for empty or non-array data (triggers fallback)', () => {
    expect(feedItems([], 4)).toEqual([])
    expect(feedItems(null, 4)).toEqual([])
  })
})
