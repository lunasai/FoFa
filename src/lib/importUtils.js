import { generateColorScale, SCALE_STEPS } from './colorUtils'

// Parse a DTCG-format tokens.json into a structured import payload
export function parseDTCGFile(json) {
  const result = {
    colorPalettes: [],
    semanticColorTokens: [],
    typography: null,
    spacing: null,
    shapes: null,
    raw: json,
  }

  // --- Primitive color palettes ---
  const colorBlock = json.color || {}
  Object.entries(colorBlock).forEach(([paletteName, steps]) => {
    if (typeof steps !== 'object') return
    const scale = {}
    let hasSteps = false
    SCALE_STEPS.forEach(step => {
      const entry = steps[step]
      if (entry && entry.$value) {
        scale[step] = entry.$value
        hasSteps = true
      }
    })
    if (hasSteps) {
      // Fill any missing steps by generating from the 500 stop or first available
      const base = scale[500] || Object.values(scale)[Math.floor(Object.values(scale).length / 2)]
      const generated = base ? generateColorScale(base) : {}
      SCALE_STEPS.forEach(step => {
        if (!scale[step]) scale[step] = generated[step] || '#cccccc'
      })
      result.colorPalettes.push({
        id: paletteName,
        name: paletteName.charAt(0).toUpperCase() + paletteName.slice(1),
        baseColor: scale[500] || Object.values(scale)[0],
        scale,
      })
    }
  })

  // --- Semantic color tokens ---
  const semBlock = json.semantic?.color || {}
  function flattenSemantic(obj, prefix = '') {
    Object.entries(obj).forEach(([key, val]) => {
      const path = prefix ? `${prefix}.${key}` : key
      if (val && val.$value) {
        result.semanticColorTokens.push({
          id: path,
          rawValue: val.$value,
          description: val.$description || '',
          ref: val.$ref || null,
        })
      } else if (val && typeof val === 'object' && !val.$type) {
        flattenSemantic(val, path)
      }
    })
  }
  flattenSemantic(semBlock)

  // --- Typography ---
  if (json.typography) {
    result.typography = json.typography
  }

  // --- Spacing ---
  if (json.spacing) {
    result.spacing = json.spacing
  }

  // --- Shapes / border radius ---
  if (json.borderRadius) {
    result.shapes = json.borderRadius
  }

  return result
}

// Resolve which existing palette a semantic $ref points to
// e.g. "{color.brand.500}" → { paletteId: 'brand', step: 500 }
export function resolveRef(ref) {
  if (!ref || typeof ref !== 'string') return null
  const match = ref.match(/\{color\.([^.]+)\.(\d+)\}/)
  if (!match) return null
  return { paletteId: match[1], step: Number(match[2]) }
}
