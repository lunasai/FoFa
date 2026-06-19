export const COLOR_SCALE_OPTIONS = [
  { value: 'numeric-100', label: 'Numeric 100s', example: 'color.brand.50 → 500 → 950' },
  { value: 'linear-12',   label: 'Linear 1–11',  example: 'color.brand.1 → 6 → 11' },
]

const NUMERIC_TO_LINEAR = {
  50: 1, 100: 2, 200: 3, 300: 4, 400: 5,
  500: 6, 600: 7, 700: 8, 800: 9, 900: 10, 950: 11,
}

export function formatColorStep(step, colorScale) {
  if (colorScale === 'linear-12') return NUMERIC_TO_LINEAR[step] ?? step
  return step
}

export const DEFAULT_VOCABULARY = {
  scales: {
    color:      'numeric-100',
    typography: 'tshirt',
    spacing:    'linear',
    shapes:     'tshirt',
  },
}

// Name is fixed structure — vocabulary no longer drives aliases/variants
export function deriveColorTokenName(concept, _vocab) {
  const { category, role, state } = concept
  let name = `color.${category}.${role}`
  if (state) name += `.${state}`
  return name
}

export function deriveTypographyTokenName(concept, vocab) {
  if (!concept.tshirtStep) return concept.role
  const style = vocab?.scales?.typography || 'tshirt'
  const scale = style === 'numeric' ? String(concept.scaleRank) : concept.tshirtStep
  return `${concept.role}.${scale}`
}

export function deriveShapeTokenName(concept, vocab) {
  if (!concept.isScale) return concept.role
  const style = vocab?.scales?.shapes || 'tshirt'
  if (style === 'numeric') return `${concept.role}.${concept.scaleRank}`
  if (style === 'tshirt')  return `${concept.role}.${concept.tshirtStep}`
  return `${concept.role}.${concept.descriptive}`
}
