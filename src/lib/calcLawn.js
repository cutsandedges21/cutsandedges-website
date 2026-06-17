export function sizeBucket(sqftInput, dims) {
  const sqft = dims ? Math.round((dims.length || 0) * (dims.width || 0)) : Math.round(sqftInput || 0)
  let id = 'small'
  if (sqft > 2000) id = 'large'
  else if (sqft >= 1500) id = 'medium'
  return { id, sqft }
}
