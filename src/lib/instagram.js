// Pure helpers for shaping Behold.so JSON-feed posts into the data our UI renders.
// (Behold proxies the @cutsandedges21 Instagram account — see docs/instagram-setup.md.)
// No network or filesystem access here so it can be unit-tested in isolation.

// Behold size keys in descending preference for a tile image.
const SIZE_PREFERENCE = ['large', 'medium', 'full', 'small']

// Normalize Behold's mediaType into our display type.
// Behold does not distinguish reels (they arrive as VIDEO), which is fine — every
// post renders as a still image in the strip and `type` is only a hint.
export function mediaType(post) {
  return post.mediaType === 'CAROUSEL_ALBUM' ? 'CAROUSEL' : post.mediaType // 'IMAGE' | 'VIDEO'
}

// Pick the best optimized image URL from a Behold `sizes` object, or null.
function urlFromSizes(sizes) {
  if (!sizes) return null
  for (const key of SIZE_PREFERENCE) {
    if (sizes[key] && sizes[key].mediaUrl) return sizes[key].mediaUrl
  }
  return null
}

// Choose the best still-image URL for a post. Carousels fall back to their first child.
// Returns null when no usable image exists.
export function pickImageUrl(post) {
  const direct = urlFromSizes(post.sizes)
  if (direct) return direct
  const child = Array.isArray(post.children) && post.children[0]
  if (child) return urlFromSizes(child.sizes) || child.mediaUrl || null
  return null
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

// Transform one Behold post into our stored shape.
// imagePath is the local cached path the caller assigns (e.g. "/instagram/<id>.webp").
// Prefers prunedCaption (hashtags removed) for a cleaner tile caption.
export function transformMedia(post, imagePath) {
  const item = {
    id: post.id,
    type: mediaType(post),
    image: imagePath,
    caption: trimCaption(post.prunedCaption || post.caption),
    permalink: post.permalink,
    timestamp: post.timestamp,
  }
  if (Number.isInteger(post.likeCount)) item.likes = post.likeCount
  if (Number.isInteger(post.commentsCount)) item.comments = post.commentsCount
  return item
}

// Used by the fetch script: from the Behold posts array, keep the first `limit`
// items that have a usable image.
export function selectLatest(posts, limit = 4) {
  if (!Array.isArray(posts)) return []
  return posts.filter(p => pickImageUrl(p) !== null).slice(0, limit)
}

// Used by the InstagramStrip component: the already-stored feed sliced to `limit`,
// or [] (which triggers the placeholder fallback).
export function feedItems(data, limit) {
  if (!Array.isArray(data)) return []
  return data.slice(0, limit)
}
