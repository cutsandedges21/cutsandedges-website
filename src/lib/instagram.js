// Pure helpers for shaping Instagram Graph API media into the data our UI renders.
// No network or filesystem access here so it can be unit-tested in isolation.

// Normalize Instagram's media-type fields into a single display type.
// media_product_type is only present for AD/FEED/STORY/REELS; when absent the strict
// check falls through. A plain feed video therefore returns its raw 'VIDEO' media_type.
export function mediaType(media) {
  if (media.media_product_type === 'REELS') return 'REELS'
  if (media.media_type === 'CAROUSEL_ALBUM') return 'CAROUSEL'
  return media.media_type // 'IMAGE' | 'VIDEO'
}

// Choose the best still-image URL (cover frame for video/reels, first child for
// carousels). Returns null when no usable image exists.
export function pickImageUrl(media) {
  if (media.media_type === 'VIDEO') return media.thumbnail_url || null
  if (media.media_type === 'CAROUSEL_ALBUM') {
    const first = media.children && media.children.data && media.children.data[0]
    if (!first) return null
    return first.media_type === 'VIDEO'
      ? first.thumbnail_url || null
      : first.media_url || null
  }
  return media.media_url || null
}

// Trim a caption to maxLen characters on a word boundary, adding an ellipsis.
// Counts by Unicode code points (via spread) so an emoji is never split mid-pair.
export function trimCaption(caption, maxLen = 120) {
  if (!caption) return ''
  const clean = caption.trim()
  const chars = [...clean]
  if (chars.length <= maxLen) return clean
  const slice = chars.slice(0, maxLen).join('')
  const lastSpace = slice.lastIndexOf(' ')
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd() + '…'
}

// Transform one raw API media object into our stored shape.
// imagePath is the local cached path the caller assigns (e.g. "/instagram/<id>.jpg").
export function transformMedia(media, imagePath) {
  const item = {
    id: media.id,
    type: mediaType(media),
    image: imagePath,
    caption: trimCaption(media.caption),
    permalink: media.permalink,
    timestamp: media.timestamp,
  }
  if (Number.isInteger(media.like_count)) item.likes = media.like_count
  if (Number.isInteger(media.comments_count)) item.comments = media.comments_count
  return item
}

// Used by the fetch script: from a raw API media list, keep the first `limit`
// items that have a usable image.
export function selectLatest(list, limit = 4) {
  if (!Array.isArray(list)) return []
  return list.filter(m => pickImageUrl(m) !== null).slice(0, limit)
}

// Used by the InstagramStrip component: the already-stored feed sliced to `limit`,
// or [] (which triggers the placeholder fallback).
export function feedItems(data, limit) {
  if (!Array.isArray(data)) return []
  return data.slice(0, limit)
}
