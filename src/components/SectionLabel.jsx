export default function SectionLabel({ index, children }) {
  return (
    <span className="eyebrow section-label">
      {index && <b>{index}</b>}<span>{children}</span>
    </span>
  )
}
