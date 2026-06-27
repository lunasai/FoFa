import chroma from 'chroma-js'

export const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

// Ease in-out: t in [0,1], returns value between 0 and 1 with smooth acceleration
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export function generateColorScale(baseHex) {
  try {
    const base = chroma(baseHex)
    const [h, s, L] = base.hsl()
    const hue = h || 0
    const sat = s || 0
    const baseL = L ?? 0.5

    // Light side: step 50 → step 400, from maxL down to just above baseL
    // Dark side:  step 600 → step 950, from just below baseL down to minL
    // Step 500 = baseL exactly
    const maxL = 0.97
    const minL = 0.04

    const lightness = SCALE_STEPS.map((_, i) => {
      if (i === 5) return baseL  // step 500 = exact base color
      if (i < 5) {
        // light side: t=0 at index 0 (step 50), t=1 at index 5 (step 500)
        const t = easeInOut(i / 5)
        return maxL + (baseL - maxL) * t
      } else {
        // dark side: t=0 at index 5 (step 500), t=1 at index 10 (step 950)
        const t = easeInOut((i - 5) / 5)
        return baseL + (minL - baseL) * t
      }
    })

    // Saturation: anchored to base sat at step 500, reduced toward the extremes
    const satMults = [0.30, 0.45, 0.60, 0.75, 0.88, 1.0, 1.05, 1.05, 0.95, 0.85, 0.70]
    const saturation = satMults.map(m => Math.min(sat * m, 1))

    const scale = {}
    SCALE_STEPS.forEach((step, i) => {
      scale[step] = chroma.hsl(hue, saturation[i], lightness[i]).hex()
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

export function contrastRatio(hex1, hex2) {
  try {
    const l1 = chroma(hex1).luminance()
    const l2 = chroma(hex2).luminance()
    const lighter = Math.max(l1, l2)
    const darker  = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
  } catch {
    return 1
  }
}

export function wcagLevel(ratio) {
  if (ratio >= 7)   return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3)   return 'AA Large'
  return 'Fail'
}

export function getContrastColor(hex) {
  try {
    return chroma(hex).luminance() > 0.35 ? '#111111' : '#ffffff'
  } catch {
    return '#ffffff'
  }
}

// Returns { step, paletteId? } for a token that should be auto-managed,
// or null if the token has fixed/neutral rules that shouldn't be touched.
export function computeAutoConfig(tokenId, palettes) {
  const parts = tokenId.split('.')
  const category = parts[1]

  if (category === 'bg') {
    if (tokenId.endsWith('.subtle'))       return { step: 100 }
    if (tokenId.endsWith('.solid.hover'))  return { step: 600 }
    if (tokenId.endsWith('.solid.active')) return { step: 700 }
    if (tokenId.endsWith('.solid'))        return { step: 500 }
    return null
  }

  if (category === 'on') {
    const variant = parts[2]
    const palette = palettes.find(p => p.id === variant)
    if (!palette) return null
    const solidHex = palette.scale[500]
    if (!solidHex) return null
    const c50  = contrastRatio(palette.scale[50]  || '#ffffff', solidHex)
    const c900 = contrastRatio(palette.scale[900] || '#000000', solidHex)
    return { paletteId: variant, step: c50 >= c900 ? 50 : 900 }
  }

  if (category === 'text') {
    const role = parts[2]
    if (['primary', 'secondary', 'disabled'].includes(role)) return null
    const palette = palettes.find(p => p.id === role)
    if (!palette) return { step: 900 }
    // Lightest step that passes AA (4.5:1) against white — max brand character, guaranteed readable
    const passing = SCALE_STEPS.filter(s => contrastRatio(palette.scale[s] || '#000', '#ffffff') >= 4.5)
    return { step: passing[0] ?? 900 }
  }

  if (category === 'border') {
    const role = parts[2]
    if (['default', 'strong'].includes(role)) return null
    return { step: 300 }
  }

  return null
}

export function resolveSemanticColor(token, palettes) {
  if (token.isWhite) return '#ffffff'
  const palette = palettes.find(p => p.id === token.paletteId)
  if (!palette) return '#cccccc'
  return palette.scale[token.step] || '#cccccc'
}
