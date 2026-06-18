import { resolveSemanticColor } from './colorUtils'
import { SCALE_STEPS } from './colorUtils'

export function buildTokensJson(store) {
  const { colorPalettes, semanticColorTokens, typography, spacing, shapes } = store
  const tokens = {}

  // Color primitives
  tokens.color = {}
  colorPalettes.forEach(palette => {
    tokens.color[palette.id] = {}
    SCALE_STEPS.forEach(step => {
      tokens.color[palette.id][step] = {
        $value: palette.scale[step],
        $type: 'color',
      }
    })
  })

  // Color semantic
  tokens.semantic = { color: {} }
  semanticColorTokens.forEach(token => {
    const parts = token.id.split('.')
    let obj = tokens.semantic.color
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        obj[part] = {
          $value: resolveSemanticColor(token, colorPalettes),
          $type: 'color',
          $description: token.description,
          $ref: token.isWhite ? '#ffffff' : `{color.${token.paletteId}.${token.step}}`,
        }
      } else {
        obj[part] = obj[part] || {}
        obj = obj[part]
      }
    })
  })

  // Typography
  tokens.typography = {
    fontFamily: typography.fontFamily,
    scale: {},
    semantic: {},
  }
  typography.scale.forEach(entry => {
    tokens.typography.scale[entry.step] = {
      size: { $value: `${entry.size}px`, $type: 'dimension' },
      lineHeight: { $value: entry.lineHeight, $type: 'number' },
      weight: { $value: entry.weight, $type: 'fontWeight' },
    }
  })
  typography.semantic.forEach(entry => {
    const scaleEntry = typography.scale.find(s => s.step === entry.step)
    tokens.typography.semantic[entry.id] = {
      $value: entry.step,
      $description: entry.description,
      size: scaleEntry ? `${scaleEntry.size}px` : undefined,
      weight: scaleEntry ? scaleEntry.weight : undefined,
    }
  })

  // Spacing
  tokens.spacing = {
    baseUnit: { $value: `${spacing.baseUnit}px`, $type: 'dimension' },
    scale: {},
    grid: {
      columns: { $value: spacing.grid.columns },
      gutter: { $value: `${spacing.grid.gutter}px`, $type: 'dimension' },
      margin: { $value: `${spacing.grid.margin}px`, $type: 'dimension' },
    },
  }
  spacing.scale.forEach(multiplier => {
    const px = multiplier * spacing.baseUnit
    tokens.spacing.scale[`${multiplier}`] = { $value: `${px}px`, $type: 'dimension' }
  })

  // Shapes
  tokens.borderRadius = { scale: {}, semantic: {} }
  shapes.scale.forEach(entry => {
    tokens.borderRadius.scale[entry.step] = {
      $value: entry.value === 9999 ? '9999px' : `${entry.value}px`,
      $type: 'dimension',
      $description: entry.description,
    }
  })
  shapes.semantic.forEach(entry => {
    const scaleEntry = shapes.scale.find(s => s.step === entry.step)
    tokens.borderRadius.semantic[entry.id] = {
      $value: scaleEntry ? (scaleEntry.value === 9999 ? '9999px' : `${scaleEntry.value}px`) : '0px',
      $type: 'dimension',
      $description: entry.description,
      $ref: `{borderRadius.scale.${entry.step}}`,
    }
  })

  return tokens
}

export function buildDesignMd(store) {
  const { colorPalettes, semanticColorTokens, typography, spacing, shapes } = store
  const lines = []

  lines.push('# Design System Foundations')
  lines.push('')
  lines.push('This file defines the complete token vocabulary for this design system. It is intended to be read by AI coding agents to implement the design system correctly. Always use semantic tokens in components — never reference primitive scale values directly.')
  lines.push('')

  // COLOR
  lines.push('---')
  lines.push('')
  lines.push('## Color')
  lines.push('')
  lines.push('### Primitive Color Scales')
  lines.push('')
  lines.push('Each palette runs from 50 (lightest) to 950 (darkest).')
  lines.push('')
  colorPalettes.forEach(palette => {
    lines.push(`#### ${palette.name}`)
    lines.push('')
    SCALE_STEPS.forEach(step => {
      lines.push(`- \`color.${palette.id}.${step}\` — \`${palette.scale[step]}\``)
    })
    lines.push('')
  })

  lines.push('### Semantic Color Tokens')
  lines.push('')
  lines.push('Use these tokens in all components. They map to primitive scale values above.')
  lines.push('')

  const groups = {}
  semanticColorTokens.forEach(token => {
    const group = token.id.split('.')[0]
    groups[group] = groups[group] || []
    groups[group].push(token)
  })

  Object.entries(groups).forEach(([group, tokens]) => {
    lines.push(`#### ${group.charAt(0).toUpperCase() + group.slice(1)}`)
    lines.push('')
    tokens.forEach(token => {
      const palette = colorPalettes.find(p => p.id === token.paletteId)
      const value = token.isWhite ? '#ffffff' : (palette?.scale[token.step] || 'N/A')
      const ref = token.isWhite ? 'white' : `${token.paletteId}.${token.step}`
      lines.push(`- \`${token.id}\` — \`${value}\` (→ \`${ref}\`) — ${token.description}`)
    })
    lines.push('')
  })

  // TYPOGRAPHY
  lines.push('---')
  lines.push('')
  lines.push('## Typography')
  lines.push('')
  lines.push(`- **Sans font:** \`${typography.fontFamily.sans}\``)
  lines.push(`- **Mono font:** \`${typography.fontFamily.mono}\``)
  lines.push('')
  lines.push('### Type Scale')
  lines.push('')
  typography.scale.forEach(entry => {
    lines.push(`- \`typography.scale.${entry.step}\` — ${entry.size}px / line-height ${entry.lineHeight} / weight ${entry.weight}`)
  })
  lines.push('')
  lines.push('### Semantic Type Tokens')
  lines.push('')
  lines.push('Use these roles in components, not raw scale values.')
  lines.push('')
  typography.semantic.forEach(entry => {
    const scaleEntry = typography.scale.find(s => s.step === entry.step)
    const detail = scaleEntry ? `${scaleEntry.size}px / weight ${scaleEntry.weight}` : entry.step
    lines.push(`- \`${entry.id}\` — ${detail} (→ \`${entry.step}\`) — ${entry.description}`)
  })
  lines.push('')

  // SPACING
  lines.push('---')
  lines.push('')
  lines.push('## Spacing & Grid')
  lines.push('')
  lines.push(`- **Base unit:** ${spacing.baseUnit}px`)
  lines.push('')
  lines.push('### Spacing Scale')
  lines.push('')
  lines.push('Values are expressed as multiples of the base unit.')
  lines.push('')
  spacing.scale.forEach(multiplier => {
    const px = multiplier * spacing.baseUnit
    lines.push(`- \`spacing.${multiplier}\` — ${px}px`)
  })
  lines.push('')
  lines.push('### Grid')
  lines.push('')
  lines.push(`- **Columns:** ${spacing.grid.columns}`)
  lines.push(`- **Gutter:** ${spacing.grid.gutter}px`)
  lines.push(`- **Margin:** ${spacing.grid.margin}px`)
  lines.push('')

  // SHAPES
  lines.push('---')
  lines.push('')
  lines.push('## Border Radius (Shapes)')
  lines.push('')
  lines.push('### Radius Scale')
  lines.push('')
  shapes.scale.forEach(entry => {
    const val = entry.value === 9999 ? '9999px (full)' : `${entry.value}px`
    lines.push(`- \`borderRadius.${entry.step}\` — ${val} — ${entry.description}`)
  })
  lines.push('')
  lines.push('### Semantic Shape Tokens')
  lines.push('')
  shapes.semantic.forEach(entry => {
    const scaleEntry = shapes.scale.find(s => s.step === entry.step)
    const val = scaleEntry ? (scaleEntry.value === 9999 ? '9999px' : `${scaleEntry.value}px`) : '0px'
    lines.push(`- \`borderRadius.${entry.id}\` — ${val} (→ \`${entry.step}\`) — ${entry.description}`)
  })
  lines.push('')

  lines.push('---')
  lines.push('')
  lines.push('## Usage Rules')
  lines.push('')
  lines.push('- **Always use semantic tokens in components.** Never reference primitive scale values (e.g. `color.brand.500`) directly in component code.')
  lines.push('- **Text on colored backgrounds:** ensure sufficient contrast. Use `text.primary` on `background.default`, `brand.text` on `brand.subtle`.')
  lines.push('- **Interactive elements** (buttons, links, focus rings) use `brand.default` and `brand.hover`.')
  lines.push('- **Borders** use `border.default` for standard outlines, `border.strong` for emphasis or focus states.')
  lines.push('- **Spacing** must use values from the spacing scale — no arbitrary pixel values.')
  lines.push('- **Typography** roles must be applied semantically — use `heading.lg` for page titles, `body.md` for body copy, `label.md` for form labels.')
  lines.push('')

  return lines.join('\n')
}

export function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
