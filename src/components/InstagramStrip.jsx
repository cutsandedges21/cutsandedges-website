import { CONTACT } from '../i18n/content.js'
import instagramData from '../data/instagram.json'
import { feedItems } from '../lib/instagram.js'

export default function InstagramStrip({ limit = 4 }) {
  const items = feedItems(instagramData, limit)

  const handleLink = (
    <a className="link-underline" href={CONTACT.instagram} target="_blank" rel="noreferrer">
      {CONTACT.handle}
    </a>
  )

  // Fallback: no data yet (e.g. before first fetch) → placeholder tiles.
  if (items.length === 0) {
    return (
      <div className="insta">
        <div className="insta__tiles">
          {Array.from({ length: limit }, (_, i) => <div key={i} className="insta__tile" />)}
        </div>
        {handleLink}
      </div>
    )
  }

  return (
    <div className="insta">
      <div className="insta__tiles">
        {items.map(post => (
          <a
            key={post.id}
            className="insta__tile insta__tile--live"
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
          >
            <img className="insta__img" src={post.image} alt={post.caption || 'Instagram post'} loading="lazy" />
            <div className="insta__overlay">
              <p className="insta__stats">
                {post.likes != null && <span>♥ {post.likes}</span>}
                {post.comments != null && <span>💬 {post.comments}</span>}
              </p>
              {post.caption && <p className="insta__caption">{post.caption}</p>}
            </div>
          </a>
        ))}
      </div>
      {handleLink}
    </div>
  )
}
