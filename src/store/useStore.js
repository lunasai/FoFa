import { useState, useCallback } from 'react'
import { generateColorScale } from '../lib/colorUtils'

const DEFAULT_COLOR_PALETTES = [
  { id: 'brand', name: 'Brand', baseColor: '#3B82F6', scale: generateColorScale('#3B82F6') },
  { id: 'neutral', name: 'Neutral', baseColor: '#6B7280', scale: generateColorScale('#6B7280') },
  { id: 'success', name: 'Success', baseColor: '#10B981', scale: generateColorScale('#10B981') },
  { id: 'warning', name: 'Warning', baseColor: '#F59E0B', scale: generateColorScale('#F59E0B') },
  { id: 'danger', name: 'Danger', baseColor: '#EF4444', scale: generateColorScale('#EF4444') },
]

const DEFAULT_SEMANTIC_COLOR_TOKENS = [
  { id: 'background.default', name: 'background.default', paletteId: 'neutral', step: 50, description: 'Page background' },
  { id: 'background.subtle', name: 'background.subtle', paletteId: 'neutral', step: 100, description: 'Subtle background for surfaces' },
  { id: 'surface.default', name: 'surface.default', paletteId: 'neutral', step: 0, description: 'Card and panel surfaces', isWhite: true },
  { id: 'surface.raised', name: 'surface.raised', paletteId: 'neutral', step: 50, description: 'Elevated surface (e.g. modals)' },
  { id: 'border.default', name: 'border.default', paletteId: 'neutral', step: 200, description: 'Default border color' },
  { id: 'border.strong', name: 'border.strong', paletteId: 'neutral', step: 400, description: 'Stronger border for emphasis' },
  { id: 'text.primary', name: 'text.primary', paletteId: 'neutral', step: 900, description: 'Primary text — headings, body' },
  { id: 'text.secondary', name: 'text.secondary', paletteId: 'neutral', step: 600, description: 'Secondary text — labels, captions' },
  { id: 'text.disabled', name: 'text.disabled', paletteId: 'neutral', step: 400, description: 'Disabled or placeholder text' },
  { id: 'brand.default', name: 'brand.default', paletteId: 'brand', step: 500, description: 'Primary brand / interactive color' },
  { id: 'brand.hover', name: 'brand.hover', paletteId: 'brand', step: 600, description: 'Brand color on hover' },
  { id: 'brand.subtle', name: 'brand.subtle', paletteId: 'brand', step: 100, description: 'Subtle brand tint for backgrounds' },
  { id: 'brand.text', name: 'brand.text', paletteId: 'brand', step: 700, description: 'Brand-colored text on light bg' },
  { id: 'success.default', name: 'success.default', paletteId: 'success', step: 500, description: 'Success state color' },
  { id: 'success.subtle', name: 'success.subtle', paletteId: 'success', step: 100, description: 'Success background tint' },
  { id: 'warning.default', name: 'warning.default', paletteId: 'warning', step: 500, description: 'Warning state color' },
  { id: 'warning.subtle', name: 'warning.subtle', paletteId: 'warning', step: 100, description: 'Warning background tint' },
  { id: 'danger.default', name: 'danger.default', paletteId: 'danger', step: 500, description: 'Danger / error state color' },
  { id: 'danger.subtle', name: 'danger.subtle', paletteId: 'danger', step: 100, description: 'Danger background tint' },
]

const DEFAULT_TYPOGRAPHY = {
  fontFamily: { sans: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, monospace' },
  scale: [
    { step: 'xs', size: 12, lineHeight: 1.5, weight: 400 },
    { step: 'sm', size: 14, lineHeight: 1.5, weight: 400 },
    { step: 'base', size: 16, lineHeight: 1.5, weight: 400 },
    { step: 'lg', size: 18, lineHeight: 1.4, weight: 400 },
    { step: 'xl', size: 20, lineHeight: 1.4, weight: 500 },
    { step: '2xl', size: 24, lineHeight: 1.3, weight: 500 },
    { step: '3xl', size: 30, lineHeight: 1.25, weight: 600 },
    { step: '4xl', size: 36, lineHeight: 1.2, weight: 700 },
    { step: '5xl', size: 48, lineHeight: 1.1, weight: 700 },
  ],
  semantic: [
    { id: 'heading.xl', name: 'heading.xl', step: '5xl', description: 'Hero headings' },
    { id: 'heading.lg', name: 'heading.lg', step: '3xl', description: 'Section headings (h1)' },
    { id: 'heading.md', name: 'heading.md', step: '2xl', description: 'Sub-section headings (h2)' },
    { id: 'heading.sm', name: 'heading.sm', step: 'xl', description: 'Card and panel headings (h3)' },
    { id: 'body.lg', name: 'body.lg', step: 'lg', description: 'Large body text' },
    { id: 'body.md', name: 'body.md', step: 'base', description: 'Default body text' },
    { id: 'body.sm', name: 'body.sm', step: 'sm', description: 'Small body / supporting text' },
    { id: 'label.md', name: 'label.md', step: 'sm', description: 'Form labels, UI labels' },
    { id: 'label.sm', name: 'label.sm', step: 'xs', description: 'Small labels, badges' },
    { id: 'caption', name: 'caption', step: 'xs', description: 'Captions, helper text' },
  ],
}

const DEFAULT_SPACING = {
  baseUnit: 4,
  scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64],
  grid: { columns: 12, gutter: 24, margin: 32 },
}

const DEFAULT_SHAPES = {
  scale: [
    { step: 'none', value: 0, description: 'No radius — sharp corners' },
    { step: 'xs', value: 2, description: 'Minimal radius' },
    { step: 'sm', value: 4, description: 'Subtle rounding' },
    { step: 'md', value: 8, description: 'Default UI rounding' },
    { step: 'lg', value: 12, description: 'Cards, panels' },
    { step: 'xl', value: 16, description: 'Large cards, modals' },
    { step: '2xl', value: 24, description: 'Feature cards' },
    { step: 'full', value: 9999, description: 'Pills, chips, avatars' },
  ],
  semantic: [
    { id: 'button', name: 'button', step: 'md', description: 'Default button radius' },
    { id: 'input', name: 'input', step: 'md', description: 'Form input radius' },
    { id: 'card', name: 'card', step: 'lg', description: 'Card and panel radius' },
    { id: 'badge', name: 'badge', step: 'full', description: 'Badge and chip radius' },
    { id: 'avatar', name: 'avatar', step: 'full', description: 'Avatar radius' },
    { id: 'modal', name: 'modal', step: 'xl', description: 'Modal and dialog radius' },
    { id: 'tooltip', name: 'tooltip', step: 'sm', description: 'Tooltip radius' },
  ],
}

export function useStore() {
  const [colorPalettes, setColorPalettes] = useState(DEFAULT_COLOR_PALETTES)
  const [semanticColorTokens, setSemanticColorTokens] = useState(DEFAULT_SEMANTIC_COLOR_TOKENS)
  const [typography, setTypography] = useState(DEFAULT_TYPOGRAPHY)
  const [spacing, setSpacing] = useState(DEFAULT_SPACING)
  const [shapes, setShapes] = useState(DEFAULT_SHAPES)

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

  const exportProject = useCallback(() => {
    return { colorPalettes, semanticColorTokens, typography, spacing, shapes }
  }, [colorPalettes, semanticColorTokens, typography, spacing, shapes])

  const importProject = useCallback((data) => {
    if (data.colorPalettes) setColorPalettes(data.colorPalettes)
    if (data.semanticColorTokens) setSemanticColorTokens(data.semanticColorTokens)
    if (data.typography) setTypography(data.typography)
    if (data.spacing) setSpacing(data.spacing)
    if (data.shapes) setShapes(data.shapes)
  }, [])

  return {
    colorPalettes, semanticColorTokens, typography, spacing, shapes,
    updatePaletteBaseColor, updatePaletteStep, addPalette, removePalette,
    updateSemanticToken, setTypography, setSpacing, setShapes,
    exportProject, importProject,
  }
}
