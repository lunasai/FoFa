export const CATEGORY_OPTIONS = {
  background: ['background', 'bg', 'backdrop'],
  text:       ['text', 'fg', 'foreground', 'copy'],
  border:     ['border', 'outline', 'stroke', 'ring'],
  surface:    ['surface', 'layer', 'panel', 'card'],
  brand:      ['brand', 'accent', 'primary', 'theme'],
}

export const VARIANT_OPTIONS = {
  default: ['default', 'base', 'primary', 'DEFAULT'],
  subtle:  ['subtle', 'muted', 'light', 'soft', 'tint'],
}

export const SCALE_OPTIONS = {
  color:      ['descriptive', 'tshirt', 'numeric'],
  typography: ['tshirt', 'numeric'],
  shapes:     ['descriptive', 'tshirt', 'numeric'],
}

export const SCALE_LABELS = {
  descriptive: 'Descriptive (primary / secondary)',
  tshirt:      'T-shirt (sm / md / lg / xl)',
  numeric:     'Numeric (1 / 2 / 3)',
}

export const DEFAULT_VOCABULARY = {
  categories: {
    background: 'background',
    text:       'text',
    border:     'border',
    surface:    'surface',
    brand:      'brand',
  },
  variants: {
    default: 'default',
    subtle:  'subtle',
  },
  scales: {
    color:      'descriptive',
    typography: 'tshirt',
    shapes:     'descriptive',
  },
}

export function deriveColorTokenName(concept, vocab) {
  const cat = vocab.categories[concept.category] || concept.category

  let variant
  if (concept.isScale) {
    const style = vocab.scales.color
    if (style === 'numeric')  variant = String(concept.scaleRank)
    else if (style === 'tshirt') variant = concept.tshirtStep
    else variant = concept.descriptive
  } else {
    if (concept.variant === 'default') variant = vocab.variants.default
    else if (concept.variant === 'subtle') variant = vocab.variants.subtle
    else variant = concept.variant
  }

  return `${cat}.${variant}`
}

export function deriveTypographyTokenName(concept, vocab) {
  if (!concept.tshirtStep) return concept.role
  const style = vocab.scales.typography
  const scale = style === 'numeric' ? String(concept.scaleRank) : concept.tshirtStep
  return `${concept.role}.${scale}`
}

export function deriveShapeTokenName(concept, vocab) {
  if (!concept.isScale) return concept.role
  const style = vocab.scales.shapes
  if (style === 'numeric') return `${concept.role}.${concept.scaleRank}`
  if (style === 'tshirt')  return `${concept.role}.${concept.tshirtStep}`
  return `${concept.role}.${concept.descriptive}`
}
