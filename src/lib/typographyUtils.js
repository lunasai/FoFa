export function computeClamp(sizeEntry, viewport = { min: 320, max: 1440 }, baseSize = 16) {
  const { min, max } = sizeEntry
  if (!min || !max || min === max) return `${min ?? max}rem`
  const minPx = min * baseSize
  const maxPx = max * baseSize
  const slope = (maxPx - minPx) / (viewport.max - viewport.min)
  const intercept = minPx - slope * viewport.min
  return `clamp(${min}rem, ${intercept.toFixed(4)}px + ${(slope * 100).toFixed(4)}vw, ${max}rem)`
}

export function resolveSemanticTypographyStyle(token, typography) {
  const { size: sizeSteps, weight: weightSteps, leading: leadingSteps, tracking: trackingSteps, baseSize = 16, viewport } = typography
  const sizeEntry    = sizeSteps?.find(s => s.step === token.size)
  const weightEntry  = weightSteps?.find(s => s.step === token.weight)
  const leadingEntry = leadingSteps?.find(s => s.step === token.leading)
  const trackingEntry = trackingSteps?.find(s => s.step === token.tracking)
  return {
    fontSize:      sizeEntry ? computeClamp(sizeEntry, viewport, baseSize) : '1rem',
    fontWeight:    weightEntry?.value  ?? 400,
    lineHeight:    leadingEntry?.value ?? 1.5,
    letterSpacing: `${trackingEntry?.value ?? 0}em`,
  }
}
