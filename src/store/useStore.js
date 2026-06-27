import { useState, useCallback } from 'react'
import { generateColorScale, computeAutoConfig } from '../lib/colorUtils'
import { DEFAULT_VOCABULARY, generateStepNamesForScale } from '../lib/vocabularyUtils'

const DEFAULT_COLOR_PALETTES = [
  { id: 'brand', name: 'Brand', baseColor: '#3B82F6', scale: generateColorScale('#3B82F6') },
  { id: 'neutral', name: 'Neutral', baseColor: '#6B7280', scale: generateColorScale('#6B7280') },
  { id: 'success', name: 'Success', baseColor: '#10B981', scale: generateColorScale('#10B981') },
  { id: 'warning', name: 'Warning', baseColor: '#F59E0B', scale: generateColorScale('#F59E0B') },
  { id: 'danger', name: 'Danger', baseColor: '#EF4444', scale: generateColorScale('#EF4444') },
]

// concept: { category, role, state? } — stable semantic identity, separate from displayed name
const DEFAULT_SEMANTIC_COLOR_TOKENS = [
  { id: 'color.bg.default',          paletteId: 'neutral', step: 50,  description: 'Page background',
    concept: { category: 'bg', role: 'default' } },
  { id: 'color.bg.subtle',           paletteId: 'neutral', step: 100, description: 'Subtle background for surfaces',
    concept: { category: 'bg', role: 'subtle' } },
  { id: 'color.bg.brand.subtle',        paletteId: 'brand',   step: 100, description: 'Brand subtle background',
    concept: { category: 'bg', role: 'brand' } },
  { id: 'color.bg.success.subtle',      paletteId: 'success', step: 100, description: 'Success subtle background',
    concept: { category: 'bg', role: 'success' } },
  { id: 'color.bg.warning.subtle',      paletteId: 'warning', step: 100, description: 'Warning subtle background',
    concept: { category: 'bg', role: 'warning' } },
  { id: 'color.bg.danger.subtle',       paletteId: 'danger',  step: 100, description: 'Danger subtle background',
    concept: { category: 'bg', role: 'danger' } },
  { id: 'color.bg.brand.solid',       paletteId: 'brand',   step: 500, description: 'Solid brand fill — buttons, badges',
    concept: { category: 'bg', role: 'brand' } },
  { id: 'color.bg.brand.solid.hover',  paletteId: 'brand',  step: 600, description: 'Brand solid on hover',
    concept: { category: 'bg', role: 'brand', state: 'hover' } },
  { id: 'color.bg.brand.solid.active', paletteId: 'brand',  step: 700, description: 'Brand solid on active/press',
    concept: { category: 'bg', role: 'brand', state: 'active' } },
  { id: 'color.bg.success.solid',     paletteId: 'success', step: 500, description: 'Solid success fill — badges, indicators',
    concept: { category: 'bg', role: 'success' } },
  { id: 'color.bg.warning.solid',     paletteId: 'warning', step: 500, description: 'Solid warning fill — badges, indicators',
    concept: { category: 'bg', role: 'warning' } },
  { id: 'color.bg.danger.solid',      paletteId: 'danger',  step: 500, description: 'Solid danger fill — badges, indicators',
    concept: { category: 'bg', role: 'danger' } },
  { id: 'color.on.brand',   paletteId: 'brand',   step: 50,  description: 'Text/icons on solid brand bg',
    concept: { category: 'on', role: 'brand' } },
  { id: 'color.on.success', paletteId: 'success', step: 50,  description: 'Text/icons on solid success bg',
    concept: { category: 'on', role: 'success' } },
  { id: 'color.on.warning', paletteId: 'warning', step: 900, description: 'Text/icons on solid warning bg',
    concept: { category: 'on', role: 'warning' } },
  { id: 'color.on.danger',  paletteId: 'danger',  step: 50,  description: 'Text/icons on solid danger bg',
    concept: { category: 'on', role: 'danger' } },
  { id: 'color.surface.default',     paletteId: 'neutral', step: 0,   description: 'Card and panel surfaces', isWhite: true,
    concept: { category: 'surface', role: 'default' } },
  { id: 'color.surface.raised',      paletteId: 'neutral', step: 50,  description: 'Elevated surface (e.g. modals)',
    concept: { category: 'surface', role: 'raised' } },
  { id: 'color.border.default',      paletteId: 'neutral', step: 200, description: 'Default border color',
    concept: { category: 'border', role: 'default' } },
  { id: 'color.border.strong',       paletteId: 'neutral', step: 400, description: 'Stronger border for emphasis',
    concept: { category: 'border', role: 'strong' } },
  { id: 'color.border.brand',        paletteId: 'brand',   step: 300, description: 'Brand-colored border',
    concept: { category: 'border', role: 'brand' } },
  { id: 'color.border.success',      paletteId: 'success', step: 300, description: 'Success-colored border',
    concept: { category: 'border', role: 'success' } },
  { id: 'color.border.warning',      paletteId: 'warning', step: 300, description: 'Warning-colored border',
    concept: { category: 'border', role: 'warning' } },
  { id: 'color.border.danger',       paletteId: 'danger',  step: 300, description: 'Danger-colored border',
    concept: { category: 'border', role: 'danger' } },
  { id: 'color.text.primary',        paletteId: 'neutral', step: 900, description: 'Primary text — headings, body',
    concept: { category: 'text', role: 'primary' } },
  { id: 'color.text.secondary',      paletteId: 'neutral', step: 600, description: 'Secondary text — labels, captions',
    concept: { category: 'text', role: 'secondary' } },
  { id: 'color.text.disabled',       paletteId: 'neutral', step: 400, description: 'Disabled or placeholder text',
    concept: { category: 'text', role: 'disabled' } },
  { id: 'color.text.brand',          paletteId: 'brand',   step: 700, description: 'Brand-colored text',
    concept: { category: 'text', role: 'brand' } },
  { id: 'color.text.success',        paletteId: 'success', step: 700, description: 'Success-colored text',
    concept: { category: 'text', role: 'success' } },
  { id: 'color.text.warning',        paletteId: 'warning', step: 700, description: 'Warning-colored text',
    concept: { category: 'text', role: 'warning' } },
  { id: 'color.text.danger',         paletteId: 'danger',  step: 700, description: 'Danger-colored text',
    concept: { category: 'text', role: 'danger' } },
]

const DEFAULT_TYPOGRAPHY = {
  fontFamily: { sans: '"Inter", sans-serif', mono: '"JetBrains Mono", monospace' },
  fontMeta: {
    sans: { family: 'Inter', category: 'sans-serif', source: 'google', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap' },
    mono: { family: 'JetBrains Mono', category: 'monospace', source: 'google', url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap' },
  },
  baseSize: 16,
  viewport: { min: 320, max: 1440 },
  viewportAnchors: { min: 'sm', max: 'lg' },
  size: [
    { step: 'xs',  min: 0.75,  max: 0.75  },
    { step: 'sm',  min: 0.875, max: 0.875 },
    { step: 'md',  min: 1,     max: 1     },
    { step: 'lg',  min: 1,     max: 1.125 },
    { step: 'xl',  min: 1.125, max: 1.25  },
    { step: '2xl', min: 1.25,  max: 1.5   },
    { step: '3xl', min: 1.5,   max: 1.875 },
    { step: '4xl', min: 1.875, max: 2.25  },
    { step: '5xl', min: 2.25,  max: 3     },
  ],
  semantic: [
    { id: 'type.heading.xl', size: '5xl', family: 'sans', weight: 700, leading: 1.1,   tracking: -0.05,  description: 'Hero headings',               concept: { role: 'heading', scaleRank: 1, tshirtStep: 'xl' } },
    { id: 'type.heading.lg', size: '3xl', family: 'sans', weight: 700, leading: 1.1,   tracking: -0.025, description: 'Section headings (h1)',        concept: { role: 'heading', scaleRank: 2, tshirtStep: 'lg' } },
    { id: 'type.heading.md', size: '2xl', family: 'sans', weight: 600, leading: 1.25,  tracking: -0.025, description: 'Sub-section headings (h2)',    concept: { role: 'heading', scaleRank: 3, tshirtStep: 'md' } },
    { id: 'type.heading.sm', size: 'xl',  family: 'sans', weight: 600, leading: 1.25,  tracking: 0,      description: 'Card and panel headings (h3)', concept: { role: 'heading', scaleRank: 4, tshirtStep: 'sm' } },
    { id: 'type.body.lg',    size: 'lg',  family: 'sans', weight: 400, leading: 1.625, tracking: 0,      description: 'Large body text',              concept: { role: 'body',    scaleRank: 1, tshirtStep: 'lg' } },
    { id: 'type.body.md',    size: 'md',  family: 'sans', weight: 400, leading: 1.5,   tracking: 0,      description: 'Default body text',            concept: { role: 'body',    scaleRank: 2, tshirtStep: 'md' } },
    { id: 'type.body.sm',    size: 'sm',  family: 'sans', weight: 400, leading: 1.5,   tracking: 0,      description: 'Small body / supporting text', concept: { role: 'body',    scaleRank: 3, tshirtStep: 'sm' } },
    { id: 'type.label.md',   size: 'sm',  family: 'sans', weight: 500, leading: 1.5,   tracking: 0.025,  description: 'Form labels, UI labels',       concept: { role: 'label',   scaleRank: 1, tshirtStep: 'md' } },
    { id: 'type.label.sm',   size: 'xs',  family: 'sans', weight: 500, leading: 1.5,   tracking: 0.05,   description: 'Small labels, badges',         concept: { role: 'label',   scaleRank: 2, tshirtStep: 'sm' } },
    { id: 'type.caption',    size: 'xs',  family: 'sans', weight: 400, leading: 1.5,   tracking: 0.025,  description: 'Captions, helper text',        concept: { role: 'caption', scaleRank: null, tshirtStep: null } },
  ],
}

// Breakpoints are single-width anchors. The set's smallest/largest width also
// drives typography's fluid range (see deriveViewport). Each carries its own
// responsive grid config (columns / gutter / margin).
const DEFAULT_BREAKPOINTS = [
  { id: 'sm', width: 390,  columns: 4,  gutter: 16, margin: 16 },
  { id: 'md', width: 768,  columns: 8,  gutter: 24, margin: 24 },
  { id: 'lg', width: 1280, columns: 12, gutter: 32, margin: 32 },
]

const DEFAULT_SPACING = {
  scale: [
    { step: 'none', value: 0 },
    { step: 'xs',   value: 4 },
    { step: 'sm',   value: 8 },
    { step: 'md',   value: 12 },
    { step: 'lg',   value: 16 },
    { step: 'xl',   value: 24 },
    { step: '2xl',  value: 40 },
    { step: '3xl',  value: 64 },
  ],
  breakpoints: DEFAULT_BREAKPOINTS,
}

// Fluid range anchors to two chosen breakpoint tokens. Falls back to the
// smallest / largest breakpoint widths when an anchor id is missing.
function deriveViewport(breakpoints, anchors) {
  const bps = breakpoints ?? []
  const widths = bps.map(b => b.width).filter(w => Number.isFinite(w))
  const fallbackMin = widths.length ? Math.min(...widths) : 320
  const fallbackMax = widths.length ? Math.max(...widths) : 1440
  const minBp = bps.find(b => b.id === anchors?.min)
  const maxBp = bps.find(b => b.id === anchors?.max)
  return {
    min: minBp ? minBp.width : fallbackMin,
    max: maxBp ? maxBp.width : fallbackMax,
  }
}

const DEFAULT_SHAPES = {
  scale: [
    { step: 'none', value: 0,    description: 'No radius — sharp corners' },
    { step: 'xs',   value: 2,    description: 'Minimal radius' },
    { step: 'sm',   value: 4,    description: 'Subtle rounding' },
    { step: 'md',   value: 8,    description: 'Default UI rounding' },
    { step: 'lg',   value: 12,   description: 'Cards, panels' },
    { step: 'xl',   value: 16,   description: 'Large cards, modals' },
    { step: '2xl',  value: 24,   description: 'Feature cards' },
    { step: 'full', value: 9999, description: 'Pills, chips, avatars' },
  ],
  semantic: [
    { id: 'radius.button',  step: 'md',   description: 'Default button radius',
      concept: { role: 'button',  isScale: false } },
    { id: 'radius.input',   step: 'md',   description: 'Form input radius',
      concept: { role: 'input',   isScale: false } },
    { id: 'radius.card',    step: 'lg',   description: 'Card and panel radius',
      concept: { role: 'card',    isScale: false } },
    { id: 'radius.badge',   step: 'full', description: 'Badge and chip radius',
      concept: { role: 'badge',   isScale: false } },
    { id: 'radius.avatar',  step: 'full', description: 'Avatar radius',
      concept: { role: 'avatar',  isScale: false } },
    { id: 'radius.modal',   step: 'xl',   description: 'Modal and dialog radius',
      concept: { role: 'modal',   isScale: false } },
    { id: 'radius.tooltip', step: 'sm',   description: 'Tooltip radius',
      concept: { role: 'tooltip', isScale: false } },
  ],
}

function slugifyFamilyKey(raw) {
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function applyAutoSteps(tokens, palettes) {
  return tokens.map(token => {
    if (token.manualStep) return token
    const auto = computeAutoConfig(token.id, palettes)
    if (!auto) return token
    const { isWhite: _drop, ...autoFields } = auto
    return { ...token, ...autoFields }
  })
}

export function useStore() {
  const [colorPalettes, setColorPalettes]             = useState(DEFAULT_COLOR_PALETTES)
  const [semanticColorTokens, setSemanticColorTokens] = useState(() =>
    applyAutoSteps(DEFAULT_SEMANTIC_COLOR_TOKENS, DEFAULT_COLOR_PALETTES)
  )
  const [typography, setTypography]                   = useState(DEFAULT_TYPOGRAPHY)
  const [spacing, setSpacing]                         = useState(DEFAULT_SPACING)
  const [shapes, setShapes]                           = useState(DEFAULT_SHAPES)
  const [vocabulary, setVocabulary] = useState(DEFAULT_VOCABULARY)

  const recomputeSemanticSteps = useCallback((updatedPalettes) => {
    setSemanticColorTokens(prev => applyAutoSteps(prev, updatedPalettes))
  }, [])

  const updatePaletteBaseColor = useCallback((id, hex) => {
    const newPalettes = colorPalettes.map(p =>
      p.id === id ? { ...p, baseColor: hex, scale: generateColorScale(hex) } : p
    )
    setColorPalettes(newPalettes)
    recomputeSemanticSteps(newPalettes)
  }, [colorPalettes, recomputeSemanticSteps])

  const updatePaletteStep = useCallback((paletteId, step, hex) => {
    setColorPalettes(prev => prev.map(p =>
      p.id === paletteId ? { ...p, scale: { ...p.scale, [step]: hex } } : p
    ))
  }, [])

  const addPalette = useCallback((name, baseColor) => {
    const id = name.toLowerCase().replace(/\s+/g, '-')
    setColorPalettes(prev => [...prev, { id, name, baseColor, scale: generateColorScale(baseColor) }])
  }, [])

  const removePalette = useCallback((id) => {
    setColorPalettes(prev => prev.filter(p => p.id !== id))
  }, [])

  const updateSemanticToken = useCallback((tokenId, updates) => {
    setSemanticColorTokens(prev => prev.map(t =>
      t.id === tokenId ? { ...t, ...updates, manualStep: true } : t
    ))
  }, [])

  const addSemanticTokens = useCallback((tokens) => {
    setSemanticColorTokens(prev => {
      const existingIds = new Set(prev.map(t => t.id))
      const newTokens = tokens.filter(t => !existingIds.has(t.id))
      return [...prev, ...newTokens]
    })
  }, [])

  const removeSemanticToken = useCallback((tokenId) => {
    setSemanticColorTokens(prev => prev.filter(t => t.id !== tokenId))
  }, [])

  const updateVocabulary = useCallback((path, value) => {
    setVocabulary(prev => {
      const next = { ...prev }
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] }
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }, [])

  const addFontFamily = useCallback(() => {
    setTypography(prev => {
      const keys = Object.keys(prev.fontFamily)
      let key = 'untitled'
      let n = 1
      while (keys.includes(key)) { n++; key = `untitled-${n}` }
      return { ...prev, fontFamily: { ...prev.fontFamily, [key]: 'system-ui, sans-serif' } }
    })
  }, [])

  const updateFontFamilyStack = useCallback((key, stack) => {
    setTypography(prev => ({ ...prev, fontFamily: { ...prev.fontFamily, [key]: stack } }))
  }, [])

  // Assign a concrete typeface (from the Google Fonts picker or a pasted URL) to a family slot.
  const selectFontFamily = useCallback((key, payload) => {
    setTypography(prev => ({
      ...prev,
      fontFamily: { ...prev.fontFamily, [key]: payload.stack },
      fontMeta: {
        ...(prev.fontMeta || {}),
        [key]: { family: payload.family, url: payload.url, category: payload.category, source: payload.source },
      },
    }))
  }, [])

  const renameFontFamily = useCallback((oldKey, rawNew) => {
    const newKey = slugifyFamilyKey(rawNew)
    setTypography(prev => {
      if (!newKey || newKey === oldKey) return prev
      if (Object.prototype.hasOwnProperty.call(prev.fontFamily, newKey)) return prev
      const fontFamily = Object.fromEntries(
        Object.entries(prev.fontFamily).map(([k, v]) => (k === oldKey ? [newKey, v] : [k, v]))
      )
      const fontMeta = { ...(prev.fontMeta || {}) }
      if (fontMeta[oldKey]) { fontMeta[newKey] = fontMeta[oldKey]; delete fontMeta[oldKey] }
      const semantic = prev.semantic.map(s =>
        (s.family ?? 'sans') === oldKey ? { ...s, family: newKey } : s
      )
      return { ...prev, fontFamily, fontMeta, semantic }
    })
  }, [])

  const removeFontFamily = useCallback((key) => {
    setTypography(prev => {
      const keys = Object.keys(prev.fontFamily)
      if (keys.length <= 1) return prev
      const fallback = keys.find(k => k !== key)
      const fontFamily = { ...prev.fontFamily }
      delete fontFamily[key]
      const fontMeta = { ...(prev.fontMeta || {}) }
      delete fontMeta[key]
      const semantic = prev.semantic.map(s =>
        (s.family ?? 'sans') === key ? { ...s, family: fallback } : s
      )
      return { ...prev, fontFamily, fontMeta, semantic }
    })
  }, [])

  const addTypographySemantic = useCallback((token) => {
    setTypography(prev => {
      if (prev.semantic.some(s => s.id === token.id)) return prev
      return { ...prev, semantic: [...prev.semantic, token] }
    })
  }, [])

  const removeTypographySemantic = useCallback((id) => {
    setTypography(prev => ({ ...prev, semantic: prev.semantic.filter(s => s.id !== id) }))
  }, [])

  const updateTypographyStepName = useCallback((oldStep, newStep) => {
    const trimmed = newStep.trim()
    if (!trimmed || trimmed === oldStep) return
    setTypography(prev => ({
      ...prev,
      size:     prev.size.map(s => s.step === oldStep ? { ...s, step: trimmed } : s),
      semantic: prev.semantic.map(s => s.size === oldStep ? { ...s, size: trimmed } : s),
    }))
  }, [])

  const updateShapeStepName = useCallback((oldStep, newStep) => {
    const trimmed = newStep.trim()
    if (!trimmed || trimmed === oldStep) return
    setShapes(prev => ({
      ...prev,
      scale:    prev.scale.map(s => s.step === oldStep ? { ...s, step: trimmed } : s),
      semantic: prev.semantic.map(s => s.step === oldStep ? { ...s, step: trimmed } : s),
    }))
  }, [])

  const updateSpacingStepName = useCallback((oldStep, newStep) => {
    const trimmed = newStep.trim()
    if (!trimmed || trimmed === oldStep) return
    setSpacing(prev => ({
      ...prev,
      scale: prev.scale.map(s => s.step === oldStep ? { ...s, step: trimmed } : s),
    }))
  }, [])

  const addBreakpoint = useCallback(() => {
    setSpacing(prev => {
      const ids = new Set(prev.breakpoints.map(b => b.id))
      let n = prev.breakpoints.length + 1
      let id = `bp-${n}`
      while (ids.has(id)) { n++; id = `bp-${n}` }
      const widest = Math.max(...prev.breakpoints.map(b => b.width), 0)
      const last = prev.breakpoints[prev.breakpoints.length - 1]
      return {
        ...prev,
        breakpoints: [...prev.breakpoints, {
          id,
          width: widest + 256,
          columns: last?.columns ?? 12,
          gutter: last?.gutter ?? 24,
          margin: last?.margin ?? 24,
        }],
      }
    })
  }, [])

  const updateBreakpoint = useCallback((id, patch) => {
    setSpacing(prev => ({
      ...prev,
      breakpoints: prev.breakpoints.map(b => b.id === id ? { ...b, ...patch } : b),
    }))
  }, [])

  const renameBreakpoint = useCallback((oldId, raw) => {
    const newId = slugifyFamilyKey(raw)
    setSpacing(prev => {
      if (!newId || newId === oldId) return prev
      if (prev.breakpoints.some(b => b.id === newId)) return prev
      return { ...prev, breakpoints: prev.breakpoints.map(b => b.id === oldId ? { ...b, id: newId } : b) }
    })
  }, [])

  const removeBreakpoint = useCallback((id) => {
    setSpacing(prev => {
      if (prev.breakpoints.length <= 1) return prev
      return { ...prev, breakpoints: prev.breakpoints.filter(b => b.id !== id) }
    })
  }, [])

  const switchCategoryScale = useCallback((category, newScale) => {
    if (category === 'typography') {
      setTypography(prev => {
        const newNames = generateStepNamesForScale(prev.size, newScale)
        return {
          ...prev,
          size:     prev.size.map((s, i) => ({ ...s, step: newNames[i] })),
          semantic: prev.semantic.map(s => {
            const idx = prev.size.findIndex(ps => ps.step === s.size)
            return idx >= 0 ? { ...s, size: newNames[idx] } : s
          }),
        }
      })
    } else if (category === 'spacing') {
      setSpacing(prev => {
        const newNames = generateStepNamesForScale(prev.scale, newScale)
        return { ...prev, scale: prev.scale.map((s, i) => ({ ...s, step: newNames[i] })) }
      })
    } else if (category === 'shapes') {
      setShapes(prev => {
        const newNames = generateStepNamesForScale(prev.scale, newScale)
        return {
          ...prev,
          scale:    prev.scale.map((s, i) => ({ ...s, step: newNames[i] })),
          semantic: prev.semantic.map(s => {
            const idx = prev.scale.findIndex(ps => ps.step === s.step)
            return idx >= 0 ? { ...s, step: newNames[idx] } : s
          }),
        }
      })
    }
    updateVocabulary(`scales.${category}`, newScale)
  }, [updateVocabulary])

  const restoreCategoryScale = useCallback((category, snapshot) => {
    if (category === 'typography') {
      setTypography(prev => ({ ...prev, size: snapshot.size, semantic: snapshot.semantic }))
    } else if (category === 'spacing') {
      setSpacing(prev => ({ ...prev, scale: snapshot.scale }))
    } else if (category === 'shapes') {
      setShapes(prev => ({ ...prev, scale: snapshot.scale, semantic: snapshot.semantic }))
    }
    updateVocabulary(`scales.${category}`, snapshot.scaleValue)
  }, [updateVocabulary])

  const applyImport = useCallback(({ palettes, semanticTokens }) => {
    if (palettes)       setColorPalettes(palettes)
    if (semanticTokens) setSemanticColorTokens(semanticTokens)
  }, [])

  const exportProject = useCallback(() => {
    const typographyOut = { ...typography, viewport: deriveViewport(spacing.breakpoints, typography.viewportAnchors) }
    return { colorPalettes, semanticColorTokens, typography: typographyOut, spacing, shapes, vocabulary }
  }, [colorPalettes, semanticColorTokens, typography, spacing, shapes, vocabulary])

  const importProject = useCallback((data) => {
    if (data.colorPalettes)        setColorPalettes(data.colorPalettes)
    if (data.semanticColorTokens)  setSemanticColorTokens(data.semanticColorTokens)
    if (data.typography)           setTypography(data.typography)
    if (data.spacing) {
      const sp = data.spacing
      setSpacing(sp.breakpoints ? sp : { ...sp, breakpoints: DEFAULT_BREAKPOINTS })
    }
    if (data.shapes)               setShapes(data.shapes)
    if (data.vocabulary)           setVocabulary(data.vocabulary)
  }, [])

  // Typography's fluid range is derived from the breakpoint set (single source of truth).
  const typographyDerived = { ...typography, viewport: deriveViewport(spacing.breakpoints, typography.viewportAnchors) }

  return {
    colorPalettes, semanticColorTokens, typography: typographyDerived, spacing, shapes, vocabulary,
    updatePaletteBaseColor, updatePaletteStep, addPalette, removePalette,
    updateSemanticToken, addSemanticTokens, removeSemanticToken, recomputeSemanticSteps,
    setTypography, setSpacing, setShapes, updateVocabulary,
    addFontFamily, updateFontFamilyStack, selectFontFamily, renameFontFamily, removeFontFamily,
    addTypographySemantic, removeTypographySemantic,
    updateTypographyStepName, updateShapeStepName, updateSpacingStepName,
    addBreakpoint, updateBreakpoint, renameBreakpoint, removeBreakpoint,
    switchCategoryScale, restoreCategoryScale,
    applyImport, exportProject, importProject,
  }
}
