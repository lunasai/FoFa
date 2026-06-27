import { resolveSemanticColor, SCALE_STEPS } from './colorUtils'
import { deriveColorTokenName, deriveTypographyTokenName, DEFAULT_VOCABULARY, formatColorStep } from './vocabularyUtils'
import { computeClamp } from './typographyUtils'

export function buildTokensJson(store) {
  const { colorPalettes, semanticColorTokens, typography, spacing, shapes, vocabulary = DEFAULT_VOCABULARY } = store
  const colorScale = vocabulary?.scales?.color || 'numeric-100'
  const tokens = {}

  // Color primitives — step key format follows colorScale setting
  tokens.color = {}
  colorPalettes.forEach(palette => {
    tokens.color[palette.id] = {}
    SCALE_STEPS.forEach(step => {
      const key = formatColorStep(step, colorScale)
      tokens.color[palette.id][key] = {
        $value: palette.scale[step],
        $type: 'color',
      }
    })
  })

  // Color semantic — name derived from concept (always color.{category}.{role}[.{state}])
  // JSON structure: tokens.color.semantic.{category}.{role}[.{state}]
  tokens.color.semantic = {}
  semanticColorTokens.forEach(token => {
    const derivedName = deriveColorTokenName(token.concept)
    // derivedName = "color.{category}.{role}[.{state}]" — skip the leading "color." for nesting
    const parts = derivedName.split('.').slice(1)
    const refStep = formatColorStep(token.step, colorScale)
    let obj = tokens.color.semantic
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        obj[part] = {
          $value: resolveSemanticColor(token, colorPalettes),
          $type: 'color',
          $description: token.description,
          $ref: token.isWhite ? '#ffffff' : `{color.${token.paletteId}.${refStep}}`,
        }
      } else {
        obj[part] = obj[part] || {}
        obj = obj[part]
      }
    })
  })

  // Typography
  const typoVp   = typography.viewport ?? { min: 320, max: 1440 }
  const typoBase = typography.baseSize ?? 16
  const fontImports = [...new Set(Object.values(typography.fontMeta || {}).map(m => m?.url).filter(Boolean))]
  tokens.typography = { fontFamily: typography.fontFamily, fontImports, size: {}, semantic: {} }
  ;(typography.size ?? []).forEach(entry => {
    tokens.typography.size[entry.step] = {
      $value: computeClamp(entry, typoVp, typoBase),
      $type: 'dimension',
      min: { $value: `${entry.min}rem` },
      max: { $value: `${entry.max}rem` },
    }
  })
  ;(typography.semantic ?? []).forEach(entry => {
    const sizeEntry = (typography.size ?? []).find(s => s.step === entry.size)
    tokens.typography.semantic[entry.id] = {
      $description: entry.description,
      size:     { $value: sizeEntry ? computeClamp(sizeEntry, typoVp, typoBase) : entry.size, $ref: `{typography.size.${entry.size}}` },
      family:   { $value: typography.fontFamily?.[entry.family] ?? entry.family, $ref: `{typography.fontFamily.${entry.family ?? 'sans'}}` },
      weight:   { $value: entry.weight,   $type: 'fontWeight' },
      leading:  { $value: entry.leading,  $type: 'number' },
      tracking: { $value: `${entry.tracking}em`, $type: 'dimension' },
    }
  })

  // Breakpoints — single-width anchors
  const breakpoints = spacing.breakpoints ?? []
  tokens.breakpoint = {}
  breakpoints.forEach(bp => {
    tokens.breakpoint[bp.id] = { $value: `${bp.width}px`, $type: 'dimension' }
  })

  // Spacing
  tokens.spacing = { scale: {}, grid: {} }
  spacing.scale.forEach(s => {
    tokens.spacing.scale[s.step] = { $value: `${s.value}px`, $type: 'dimension' }
  })
  // Responsive grid — one config per breakpoint
  breakpoints.forEach(bp => {
    tokens.spacing.grid[bp.id] = {
      breakpoint: { $value: `${bp.width}px`, $type: 'dimension', $ref: `{breakpoint.${bp.id}}` },
      columns: { $value: bp.columns },
      gutter: { $value: `${bp.gutter}px`, $type: 'dimension' },
      margin: { $value: `${bp.margin}px`, $type: 'dimension' },
    }
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
  const { colorPalettes, semanticColorTokens, typography, spacing, shapes, vocabulary = DEFAULT_VOCABULARY } = store
  const colorScale = vocabulary?.scales?.color || 'numeric-100'
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
      const key = formatColorStep(step, colorScale)
      lines.push(`- \`color.${palette.id}.${key}\` — \`${palette.scale[step]}\``)
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
      const refStep = formatColorStep(token.step, colorScale)
      const ref = token.isWhite ? 'white' : `${token.paletteId}.${refStep}`
      const name = deriveColorTokenName(token.concept)
      lines.push(`- \`${name}\` — \`${value}\` (→ \`color.${ref}\`) — ${token.description}`)
    })
    lines.push('')
  })

  // TYPOGRAPHY
  lines.push('---')
  lines.push('')
  lines.push('## Typography')
  lines.push('')
  const mdVp = typography.viewport ?? { min: 320, max: 1440 }
  const mdBase = typography.baseSize ?? 16
  Object.entries(typography.fontFamily ?? {}).forEach(([key, stack]) => {
    const meta = typography.fontMeta?.[key]
    const imp = meta?.url ? ` — import: \`@import url('${meta.url}');\`` : ''
    lines.push(`- **${key} font:** \`${stack}\`${imp}`)
  })
  lines.push(`- **Base size:** ${mdBase}px  |  **Viewport:** ${mdVp.min}px → ${mdVp.max}px`)
  lines.push('')
  lines.push('### Size Scale')
  lines.push('')
  ;(typography.size ?? []).forEach(entry => {
    lines.push(`- \`typography.size.${entry.step}\` — ${computeClamp(entry, mdVp, mdBase)}`)
  })
  lines.push('')
  lines.push('### Semantic Type Tokens')
  lines.push('')
  lines.push('Use these roles in components, not raw scale values.')
  lines.push('')
  ;(typography.semantic ?? []).forEach(entry => {
    const name = deriveTypographyTokenName(entry.concept, vocabulary)
    lines.push(`- \`${name}\` — size: ${entry.size} / family: ${entry.family ?? 'sans'} / weight: ${entry.weight} / leading: ${entry.leading} / tracking: ${entry.tracking}em — ${entry.description}`)
  })
  lines.push('')

  // SPACING
  lines.push('---')
  lines.push('')
  lines.push('## Spacing & Grid')
  lines.push('')
  lines.push('### Spacing Scale')
  lines.push('')
  spacing.scale.forEach(s => {
    lines.push(`- \`spacing.${s.step}\` — ${s.value}px`)
  })
  lines.push('')
  lines.push('### Breakpoints')
  lines.push('')
  lines.push('Single-width anchors. The smallest and largest also define the fluid typography range.')
  lines.push('')
  ;(spacing.breakpoints ?? []).forEach(bp => {
    lines.push(`- \`breakpoint.${bp.id}\` — ${bp.width}px`)
  })
  lines.push('')
  lines.push('### Responsive Grid')
  lines.push('')
  lines.push('| Breakpoint | Min width | Columns | Gutter | Margin |')
  lines.push('| --- | --- | --- | --- | --- |')
  ;(spacing.breakpoints ?? []).forEach(bp => {
    lines.push(`| \`${bp.id}\` | ${bp.width}px | ${bp.columns} | ${bp.gutter}px | ${bp.margin}px |`)
  })
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
