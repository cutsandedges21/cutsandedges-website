import { Link } from 'react-router-dom'

export default function PillButton({ to, href, variant = 'solid', children, ...rest }) {
  const cls = `pill pill--${variant}`
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>
  return <button className={cls} {...rest}>{children}</button>
}
