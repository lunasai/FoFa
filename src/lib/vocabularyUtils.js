export const COLOR_SCALE_OPTIONS = [
  { value: 'numeric-100', label: 'Numeric 100s', example: 'color.brand.50 → 500 → 950' },
  { value: 'linear-12',   label: 'Linear 1–11',  example: 'color.brand.1 → 6 → 11' },
]

export const TYPOGRAPHY_SCALE_OPTIONS = [
  { value: 'tshirt',      label: 'T-shirt',      example: 'xs · sm · md · lg · xl · 2xl' },
  { value: 'numeric-100', label: 'Numeric 100s',  example: '100 · 200 · 300 · 400 · 500' },
  { value: 'linear',      label: 'Linear 1–N',    example: '1 · 2 · 3 · 4 · 5 · 6' },
]

export const SPACING_SCALE_OPTIONS = [
  { value: 'tshirt',      label: 'T-shirt',      example: 'none · xs · sm · md · lg · xl' },
  { value: 'numeric-100', label: 'Numeric 100s',  example: '0 · 100 · 200 · 300 · 400' },
  { value: 'linear',      label: 'Linear 1–N',    example: '0 · 1 · 2 · 3 · 4 · 5' },
]

export const RADIUS_SCALE_OPTIONS = [
  { value: 'tshirt',      label: 'T-shirt',      example: 'none · xs · sm · md · full' },
  { value: 'numeric-100', label: 'Numeric 100s',  example: '0 · 100 · 200 · 300 · full' },
  { value: 'linear',      label: 'Linear 1–N',    example: '0 · 1 · 2 · 3 · full' },
]

const TSHIRT_NAMES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl']

const NUMERIC_TO_LINEAR = {
  50: 1, 100: 2, 200: 3, 300: 4, 400: 5,
  500: 6, 600: 7, 700: 8, 800: 9, 900: 10, 950: 11,
}

export function formatColorStep(step, colorScale) {
  if (colorScale === 'linear-12') return NUMERIC_TO_LINEAR[step] ?? step
  return step
}

// Rename scale steps to match a new scale format.
// Steps with value=0  → 'none' (tshirt) or '0' (others).
// Steps with value=9999 → always 'full'.
// All other steps get sequential names based on scale.
export function generateStepNamesForScale(steps, scale) {
  const regulars = steps.filter(s => s.value !== 0 && s.value !== 9999)
  return steps.map(s => {
    if (s.value === 9999) return 'full'
    if (s.value === 0) return scale === 'tshirt' ? 'none' : '0'
    const rank = regulars.indexOf(s)
    if (scale === 'tshirt')      return TSHIRT_NAMES[rank] ?? `step-${rank + 1}`
    if (scale === 'numeric-100') return String((rank + 1) * 100)
    if (scale === 'linear')      return String(rank + 1)
    return s.step
  })
}

export const DEFAULT_VOCABULARY = {
  scales: {
    color:      'numeric-100',
    typography: 'tshirt',
    spacing:    'tshirt',
    shapes:     'tshirt',
  },
}

export function deriveColorTokenName(concept, _vocab) {
  const { category, role, state } = concept
  let name = `color.${category}.${role}`
  if (state) name += `.${state}`
  return name
}

export function deriveTypographyTokenName(concept, vocab) {
  if (!concept.tshirtStep) return concept.role
  const style = vocab?.scales?.typography || 'tshirt'
  const scale = style === 'numeric-100' ? String(concept.scaleRank * 100) : concept.tshirtStep
  return `${concept.role}.${scale}`
}

export function deriveShapeTokenName(concept, vocab) {
  if (!concept.isScale) return concept.role
  const style = vocab?.scales?.shapes || 'tshirt'
  if (style === 'numeric-100') return `${concept.role}.${concept.scaleRank * 100}`
  if (style === 'tshirt')      return `${concept.role}.${concept.tshirtStep}`
  return `${concept.role}.${concept.descriptive}`
}
