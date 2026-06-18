import { useState, useCallback } from 'react'
import { generateColorScale } from '../lib/colorUtils'
import { DEFAULT_VOCABULARY } from '../lib/vocabularyUtils'

const DEFAULT_COLOR_PALETTES = [
  { id: 'brand', name: 'Brand', baseColor: '#3B82F6', scale: generateColorScale('#3B82F6') },
  { id: 'neutral', name: 'Neutral', baseColor: '#6B7280', scale: generateColorScale('#6B7280') },
  { id: 'success', name: 'Success', baseColor: '#10B981', scale: generateColorScale('#10B981') },
  { id: 'warning', name: 'Warning', baseColor: '#F59E0B', scale: generateColorScale('#F59E0B') },
  { id: 'danger', name: 'Danger', baseColor: '#EF4444', scale: generateColorScale('#EF4444') },
]

// concept: stable semantic identity, separate from the displayed name
const DEFAULT_SEMANTIC_COLOR_TOKENS = [
  { id: 'background.default', paletteId: 'neutral', step: 50,  description: 'Page background',
    concept: { category: 'background', variant: 'default' } },
  { id: 'background.subtle',  paletteId: 'neutral', step: 100, description: 'Subtle background for surfaces',
    concept: { category: 'background', variant: 'subtle' } },
  { id: 'surface.default',    paletteId: 'neutral', step: 0,   description: 'Card and panel surfaces', isWhite: true,
    concept: { category: 'surface', variant: 'default' } },
  { id: 'surface.raised',     paletteId: 'neutral', step: 50,  description: 'Elevated surface (e.g. modals)',
    concept: { category: 'surface', variant: 'raised' } },
  { id: 'border.default',     paletteId: 'neutral', step: 200, description: 'Default border color',
    concept: { category: 'border', variant: 'default' } },
  { id: 'border.strong',      paletteId: 'neutral', step: 400, description: 'Stronger border for emphasis',
    concept: { category: 'border', variant: 'strong' } },
  { id: 'text.primary',       paletteId: 'neutral', step: 900, description: 'Primary text — headings, body',
    concept: { category: 'text', variant: 'scale', isScale: true, scaleRank: 1, tshirtStep: 'lg', descriptive: 'primary' } },
  { id: 'text.secondary',     paletteId: 'neutral', step: 600, description: 'Secondary text — labels, captions',
    concept: { category: 'text', variant: 'scale', isScale: true, scaleRank: 2, tshirtStep: 'md', descriptive: 'secondary' } },
  { id: 'text.disabled',      paletteId: 'neutral', step: 400, description: 'Disabled or placeholder text',
    concept: { category: 'text', variant: 'scale', isScale: true, scaleRank: 3, tshirtStep: 'sm', descriptive: 'disabled' } },
  { id: 'brand.default',      paletteId: 'brand',   step: 500, description: 'Primary brand / interactive color',
    concept: { category: 'brand', variant: 'default' } },
  { id: 'brand.hover',        paletteId: 'brand',   step: 600, description: 'Brand color on hover',
    concept: { category: 'brand', variant: 'hover' } },
  { id: 'brand.subtle',       paletteId: 'brand',   step: 100, description: 'Subtle brand tint for backgrounds',
    concept: { category: 'brand', variant: 'subtle' } },
  { id: 'brand.text',         paletteId: 'brand',   step: 700, description: 'Brand-colored text on light bg',
    concept: { category: 'brand', variant: 'text' } },
  { id: 'success.default',    paletteId: 'success', step: 500, description: 'Success state color',
    concept: { category: 'success', variant: 'default' } },
  { id: 'success.subtle',     paletteId: 'success', step: 100, description: 'Success background tint',
    concept: { category: 'success', variant: 'subtle' } },
  { id: 'warning.default',    paletteId: 'warning', step: 500, description: 'Warning state color',
    concept: { category: 'warning', variant: 'default' } },
  { id: 'warning.subtle',     paletteId: 'warning', step: 100, description: 'Warning background tint',
    concept: { category: 'warning', variant: 'subtle' } },
  { id: 'danger.default',     paletteId: 'danger',  step: 500, description: 'Danger / error state color',
    concept: { category: 'danger', variant: 'default' } },
  { id: 'danger.subtle',      paletteId: 'danger',  step: 100, description: 'Danger background tint',
    concept: { category: 'danger', variant: 'subtle' } },
]

const DEFAULT_TYPOGRAPHY = {
  fontFamily: { sans: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, monospace' },
  scale: [
    { step: 'xs',   size: 12, lineHeight: 1.5,  weight: 400 },
    { step: 'sm',   size: 14, lineHeight: 1.5,  weight: 400 },
    { step: 'base', size: 16, lineHeight: 1.5,  weight: 400 },
    { step: 'lg',   size: 18, lineHeight: 1.4,  weight: 400 },
    { step: 'xl',   size: 20, lineHeight: 1.4,  weight: 500 },
    { step: '2xl',  size: 24, lineHeight: 1.3,  weight: 500 },
    { step: '3xl',  size: 30, lineHeight: 1.25, weight: 600 },
    { step: '4xl',  size: 36, lineHeight: 1.2,  weight: 700 },
    { step: '5xl',  size: 48, lineHeight: 1.1,  weight: 700 },
  ],
  semantic: [
    { id: 'heading.xl', step: '5xl', description: 'Hero headings',
      concept: { role: 'heading', scaleRank: 1, tshirtStep: 'xl' } },
    { id: 'heading.lg', step: '3xl', description: 'Section headings (h1)',
      concept: { role: 'heading', scaleRank: 2, tshirtStep: 'lg' } },
    { id: 'heading.md', step: '2xl', description: 'Sub-section headings (h2)',
      concept: { role: 'heading', scaleRank: 3, tshirtStep: 'md' } },
    { id: 'heading.sm', step: 'xl',  description: 'Card and panel headings (h3)',
      concept: { role: 'heading', scaleRank: 4, tshirtStep: 'sm' } },
    { id: 'body.lg',    step: 'lg',  description: 'Large body text',
      concept: { role: 'body', scaleRank: 1, tshirtStep: 'lg' } },
    { id: 'body.md',    step: 'base',description: 'Default body text',
      concept: { role: 'body', scaleRank: 2, tshirtStep: 'md' } },
    { id: 'body.sm',    step: 'sm',  description: 'Small body / supporting text',
      concept: { role: 'body', scaleRank: 3, tshirtStep: 'sm' } },
    { id: 'label.md',   step: 'sm',  description: 'Form labels, UI labels',
      concept: { role: 'label', scaleRank: 1, tshirtStep: 'md' } },
    { id: 'label.sm',   step: 'xs',  description: 'Small labels, badges',
      concept: { role: 'label', scaleRank: 2, tshirtStep: 'sm' } },
    { id: 'caption',    step: 'xs',  description: 'Captions, helper text',
      concept: { role: 'caption', scaleRank: null, tshirtStep: null } },
  ],
}

const DEFAULT_SPACING = {
  baseUnit: 4,
  scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64],
  grid: { columns: 12, gutter: 24, margin: 32 },
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
    { id: 'button',  step: 'md',   description: 'Default button radius',
      concept: { role: 'button',  isScale: false } },
    { id: 'input',   step: 'md',   description: 'Form input radius',
      concept: { role: 'input',   isScale: false } },
    { id: 'card',    step: 'lg',   description: 'Card and panel radius',
      concept: { role: 'card',    isScale: false } },
    { id: 'badge',   step: 'full', description: 'Badge and chip radius',
      concept: { role: 'badge',   isScale: false } },
    { id: 'avatar',  step: 'full', description: 'Avatar radius',
      concept: { role: 'avatar',  isScale: false } },
    { id: 'modal',   step: 'xl',   description: 'Modal and dialog radius',
      concept: { role: 'modal',   isScale: false } },
    { id: 'tooltip', step: 'sm',   description: 'Tooltip radius',
      concept: { role: 'tooltip', isScale: false } },
  ],
}

export function useStore() {
  const [colorPalettes, setColorPalettes]             = useState(DEFAULT_COLOR_PALETTES)
  const [semanticColorTokens, setSemanticColorTokens] = useState(DEFAULT_SEMANTIC_COLOR_TOKENS)
  const [typography, setTypography]                   = useState(DEFAULT_TYPOGRAPHY)
  const [spacing, setSpacing]                         = useState(DEFAULT_SPACING)
  const [shapes, setShapes]                           = useState(DEFAULT_SHAPES)
  const [vocabulary, setVocabulary]                   = useState(DEFAULT_VOCABULARY)

  const updatePaletteBaseColor = useCallback((id, hex) => {
    setColorPalettes(prev => prev.map(p =>
      p.id === id ? { ...p, baseColor: hex, scale: generateColorScale(hex) } : p
    ))
  }, [])

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
    setSemanticColorTokens(prev => prev.map(t => t.id === tokenId ? { ...t, ...updates } : t))
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

  const applyImport = useCallback(({ palettes, semanticTokens }) => {
    if (palettes)       setColorPalettes(palettes)
    if (semanticTokens) setSemanticColorTokens(semanticTokens)
  }, [])

  const exportProject = useCallback(() => {
    return { colorPalettes, semanticColorTokens, typography, spacing, shapes, vocabulary }
  }, [colorPalettes, semanticColorTokens, typography, spacing, shapes, vocabulary])

  const importProject = useCallback((data) => {
    if (data.colorPalettes)        setColorPalettes(data.colorPalettes)
    if (data.semanticColorTokens)  setSemanticColorTokens(data.semanticColorTokens)
    if (data.typography)           setTypography(data.typography)
    if (data.spacing)              setSpacing(data.spacing)
    if (data.shapes)               setShapes(data.shapes)
    if (data.vocabulary)           setVocabulary(data.vocabulary)
  }, [])

  return {
    colorPalettes, semanticColorTokens, typography, spacing, shapes, vocabulary,
    updatePaletteBaseColor, updatePaletteStep, addPalette, removePalette,
    updateSemanticToken, setTypography, setSpacing, setShapes, updateVocabulary,
    applyImport, exportProject, importProject,
  }
}
