import chroma from 'chroma-js'

export const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

export function generateColorScale(baseHex) {
  try {
    const base = chroma(baseHex)
    const hsl = base.hsl()
    const h = hsl[0] || 0
    const s = hsl[1] || 0

    const lightness = [0.97, 0.94, 0.87, 0.77, 0.64, 0.50, 0.40, 0.31, 0.22, 0.14, 0.09]
    const saturation = [
      Math.min(s * 0.4, 0.25),
      Math.min(s * 0.5, 0.35),
      Math.min(s * 0.6, 0.5),
      Math.min(s * 0.75, 0.65),
      Math.min(s * 0.9, 0.8),
      s,
      Math.min(s * 1.05, 1),
      Math.min(s * 1.05, 1),
      Math.min(s * 1.0, 1),
      Math.min(s * 0.9, 1),
      Math.min(s * 0.8, 1),
    ]

    const scale = {}
    SCALE_STEPS.forEach((step, i) => {
      scale[step] = chroma.hsl(h, saturation[i], lightness[i]).hex()
    })
    return scale
  } catch {
    const scale = {}
    SCALE_STEPS.forEach(step => { scale[step] = baseHex })
    return scale
  }
}

export function isValidHex(hex) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

export function getContrastColor(hex) {
  try {
    return chroma(hex).luminance() > 0.35 ? '#111111' : '#ffffff'
  } catch {
    return '#ffffff'
  }
}

export function resolveSemanticColor(token, palettes) {
  if (token.isWhite) return '#ffffff'
  const palette = palettes.find(p => p.id === token.paletteId)
  if (!palette) return '#cccccc'
  return palette.scale[token.step] || '#cccccc'
}
