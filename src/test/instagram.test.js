import { describe, it, expect } from 'vitest'
import {
  mediaType, pickImageUrl, trimCaption, transformMedia, selectLatest, feedItems,
} from '../lib/instagram.js'

describe('mediaType', () => {
  it('maps reels, carousels, images, and videos', () => {
    expect(mediaType({ media_type: 'VIDEO', media_product_type: 'REELS' })).toBe('REELS')
    expect(mediaType({ media_type: 'CAROUSEL_ALBUM' })).toBe('CAROUSEL')
    expect(mediaType({ media_type: 'IMAGE' })).toBe('IMAGE')
    expect(mediaType({ media_type: 'VIDEO', media_product_type: 'FEED' })).toBe('VIDEO')
  })
})

describe('pickImageUrl', () => {
  it('uses media_url for images', () => {
    expect(pickImageUrl({ media_type: 'IMAGE', media_url: 'a.jpg' })).toBe('a.jpg')
  })
  it('uses thumbnail_url for videos/reels', () => {
    expect(pickImageUrl({ media_type: 'VIDEO', thumbnail_url: 't.jpg' })).toBe('t.jpg')
  })
  it('uses the first child for carousels', () => {
    const media = { media_type: 'CAROUSEL_ALBUM', children: { data: [{ media_type: 'IMAGE', media_url: 'c.jpg' }] } }
    expect(pickImageUrl(media)).toBe('c.jpg')
  })
  it('returns null when no usable image exists', () => {
    expect(pickImageUrl({ media_type: 'VIDEO' })).toBeNull()
    expect(pickImageUrl({ media_type: 'CAROUSEL_ALBUM', children: { data: [] } })).toBeNull()
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
})

describe('transformMedia', () => {
  it('builds the stored shape with engagement counts', () => {
    const media = {
      id: '123', media_type: 'IMAGE', media_url: 'x.jpg',
      caption: 'Hi', permalink: 'https://insta/p/123',
      timestamp: '2026-06-20T14:00:00+0000', like_count: 75, comments_count: 3,
    }
    expect(transformMedia(media, '/instagram/123.jpg')).toEqual({
      id: '123', type: 'IMAGE', image: '/instagram/123.jpg',
      caption: 'Hi', permalink: 'https://insta/p/123',
      timestamp: '2026-06-20T14:00:00+0000', likes: 75, comments: 3,
    })
  })
  it('omits counts that are hidden/absent', () => {
    const media = { id: '9', media_type: 'IMAGE', media_url: 'x.jpg', caption: '', permalink: 'p', timestamp: 't' }
    const out = transformMedia(media, '/instagram/9.jpg')
    expect(out).not.toHaveProperty('likes')
    expect(out).not.toHaveProperty('comments')
  })
})

describe('selectLatest', () => {
  it('keeps the first N items that have a usable image', () => {
    const list = [
      { id: '1', media_type: 'IMAGE', media_url: 'a.jpg' },
      { id: '2', media_type: 'VIDEO' },                 // no image → skipped
      { id: '3', media_type: 'IMAGE', media_url: 'c.jpg' },
      { id: '4', media_type: 'IMAGE', media_url: 'd.jpg' },
      { id: '5', media_type: 'IMAGE', media_url: 'e.jpg' },
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
