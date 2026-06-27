import { useState, useEffect } from 'react'
import { Plus, ChevronDown, ChevronUp, X } from 'lucide-react'
import clsx from 'clsx'
import { SCALE_STEPS, isValidHex, getContrastColor, resolveSemanticColor, computeAutoConfig, contrastRatio, wcagLevel } from '../lib/colorUtils'
import { ColorPickerPopover } from '../components/ColorPicker'
import { SectionHeading } from '../components/SectionHeading'

function PairingRow({ fgHex, bgHex, fgLabel, bgLabel, sans, mono }) {
  const ratio = contrastRatio(fgHex, bgHex)
  const level = wcagLevel(ratio)
  const lvlColor = level === 'AAA' ? '#4ade80' : level === 'AA' ? '#86efac' : level === 'AA Large' ? '#fbbf24' : '#f87171'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ background: bgHex, borderRadius: 6, padding: '5px 12px', flexShrink: 0, width: 52, textAlign: 'center', boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }}>
        <span style={{ color: fgHex, fontFamily: sans, fontSize: 14, fontWeight: 700, lineHeight: 1 }}>Aa</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontFamily: mono, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fgLabel}</div>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontFamily: mono, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bgLabel}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: mono, fontSize: 11 }}>{ratio.toFixed(2)}:1</span>
        <span style={{ color: lvlColor, fontFamily: mono, fontSize: 10, fontWeight: 600, background: `${lvlColor}22`, borderRadius: 4, padding: '2px 6px', border: `1px solid ${lvlColor}44` }}>{level}</span>
      </div>
    </div>
  )
}

function PairingGroup({ title, pairs, sans, mono }) {
  return (
    <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', padding: '16px 20px', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontFamily: mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      {pairs.map((p, i) => <PairingRow key={i} {...p} sans={sans} mono={mono} />)}
    </div>
  )
}

function templateDefsForPalette(paletteId) {
  const p = paletteId
  const P = p.charAt(0).toUpperCase() + p.slice(1)
  return [
    { id: `color.bg.${p}.subtle`,       category: 'bg',     description: `${P} subtle background` },
    { id: `color.bg.${p}.solid`,        category: 'bg',     description: `Solid ${P} fill — buttons, badges` },
    { id: `color.bg.${p}.solid.hover`,  category: 'bg',     description: `${P} solid on hover`, concept: { state: 'hover' } },
    { id: `color.bg.${p}.solid.active`, category: 'bg',     description: `${P} solid on active`, concept: { state: 'active' } },
    { id: `color.on.${p}`,              category: 'on',     description: `Text/icons on solid ${P} bg` },
    { id: `color.text.${p}`,            category: 'text',   description: `${P}-colored text` },
    { id: `color.border.${p}`,          category: 'border', description: `${P}-colored border` },
  ]
}

function buildToken(def, paletteId, palettes) {
  const auto = computeAutoConfig(def.id, palettes)
  return {
    id: def.id,
    paletteId: auto?.paletteId ?? paletteId,
    step: auto?.step ?? 500,
    description: def.description,
    concept: { category: def.category, role: paletteId, ...(def.concept || {}) },
  }
}

function TokenWizardModal({ palettes, existingTokens, onAdd, onClose }) {
  const [mode, setMode] = useState('palette')
  const [palId, setPalId] = useState(palettes[0]?.id || '')
  const [checked, setChecked] = useState(new Set())

  // Custom mode state
  const [customSuffix, setCustomSuffix] = useState('')
  const [customPalId, setCustomPalId] = useState(palettes[0]?.id || '')
  const [customStep, setCustomStep] = useState(500)
  const [customDesc, setCustomDesc] = useState('')

  const existingIds = new Set(existingTokens.map(t => t.id))
  const allTemplates = templateDefsForPalette(palId)
  const templates = allTemplates.filter(t => !existingIds.has(t.id))

  // Reset checked when palette changes
  useEffect(() => { setChecked(new Set(templates.map(t => t.id))) }, [palId])

  // Auto-suggest step for custom token
  useEffect(() => {
    if (!customSuffix) return
    const fakeId = `color.${customSuffix}`
    const auto = computeAutoConfig(fakeId, palettes)
    if (auto?.step) setCustomStep(auto.step)
  }, [customSuffix, customPalId])

  function toggleCheck(id) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleAddFromPalette() {
    const selected = templates.filter(t => checked.has(t.id))
    const tokens = selected.map(def => buildToken(def, palId, palettes))
    onAdd(tokens)
    onClose()
  }

  function handleAddCustom() {
    const suffix = customSuffix.trim()
    if (!suffix) return
    const id = `color.${suffix}`
    if (existingIds.has(id)) return
    onAdd([{
      id,
      paletteId: customPalId,
      step: customStep,
      description: customDesc || id,
      concept: { category: suffix.split('.')[0], role: customPalId },
    }])
    setCustomSuffix('')
    setCustomDesc('')
  }

  const palette = palettes.find(p => p.id === palId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Add color role</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors"><X size={16} /></button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {[['palette', 'Default set'], ['custom', 'Custom']].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setMode(v)}
              className={clsx(
                'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                mode === v ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
              )}
            >{label}</button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {mode === 'palette' && (
            <div className="space-y-3">
              {/* Palette selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-14 flex-shrink-0">Palette</span>
                <div className="relative flex-1">
                  <select
                    value={palId}
                    onChange={e => setPalId(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none appearance-none cursor-pointer"
                  >
                    {palettes.map(p => (
                      <option key={p.id} value={p.id} style={{ background: '#111' }}>{p.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">▾</div>
                </div>
              </div>

              {/* Template checklist */}
              <div className="rounded-xl border border-white/[0.08] overflow-hidden">
                {allTemplates.map((t, i) => {
                  const exists = existingIds.has(t.id)
                  const auto = computeAutoConfig(t.id, palettes)
                  const step = auto?.step ?? 500
                  const hex = palette?.scale[step]
                  return (
                    <label
                      key={t.id}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-2.5 transition-colors',
                        i > 0 && 'border-t border-white/[0.04]',
                        exists ? 'opacity-35 cursor-default' : 'cursor-pointer hover:bg-white/[0.03]'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={exists || checked.has(t.id)}
                        disabled={exists}
                        onChange={() => !exists && toggleCheck(t.id)}
                        className="accent-white/60 flex-shrink-0"
                      />
                      {hex && (
                        <div className="w-4 h-4 rounded flex-shrink-0 border border-white/10" style={{ background: hex }} />
                      )}
                      <span className="text-xs font-mono text-white/70 flex-1">{t.id}</span>
                      {exists
                        ? <span className="text-[10px] text-white/25 flex-shrink-0">added</span>
                        : <span className="text-[10px] font-mono text-white/25 flex-shrink-0">{palId} · {step}</span>
                      }
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {mode === 'custom' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-14 flex-shrink-0">Name</span>
                <div className="flex items-center gap-1.5 flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2">
                  <span className="text-xs font-mono text-white/25">color.</span>
                  <input
                    autoFocus
                    value={customSuffix}
                    onChange={e => setCustomSuffix(e.target.value)}
                    placeholder="bg.purple.subtle"
                    className="flex-1 bg-transparent text-xs font-mono text-white outline-none placeholder-white/15"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-14 flex-shrink-0">Palette</span>
                <div className="relative flex-1">
                  <select
                    value={customPalId}
                    onChange={e => setCustomPalId(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none appearance-none cursor-pointer"
                  >
                    {palettes.map(p => (
                      <option key={p.id} value={p.id} style={{ background: '#111' }}>{p.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">▾</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-14 flex-shrink-0">Step</span>
                <div className="relative flex-1">
                  <select
                    value={customStep}
                    onChange={e => setCustomStep(Number(e.target.value))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none appearance-none cursor-pointer"
                  >
                    {SCALE_STEPS.map(s => (
                      <option key={s} value={s} style={{ background: '#111' }}>{s}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">▾</div>
                </div>
                {(() => {
                  const hex = palettes.find(p => p.id === customPalId)?.scale[customStep]
                  return hex ? <div className="w-6 h-6 rounded border border-white/10 flex-shrink-0" style={{ background: hex }} /> : null
                })()}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-14 flex-shrink-0">Note</span>
                <input
                  value={customDesc}
                  onChange={e => setCustomDesc(e.target.value)}
                  placeholder="Optional note"
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none placeholder-white/15"
                />
              </div>
              {customSuffix && (
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                  <span className="text-[10px] text-white/30 font-mono">color.</span>
                  <span className="text-[10px] text-white/70 font-mono">{customSuffix}</span>
                  {existingIds.has(`color.${customSuffix}`) && (
                    <span className="ml-2 text-[10px] text-amber-400/70">already exists</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="text-xs text-white/40 hover:text-white/70 px-3 py-1.5 transition-colors">Cancel</button>
          {mode === 'palette' ? (
            <button
              onClick={handleAddFromPalette}
              disabled={checked.size === 0 || templates.length === 0}
              className="text-xs font-medium text-white bg-white/10 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg transition-colors"
            >
              Add {checked.size > 0 ? `${checked.size} ` : ''}role{checked.size !== 1 ? 's' : ''}
            </button>
          ) : (
            <button
              onClick={handleAddCustom}
              disabled={!customSuffix.trim() || existingIds.has(`color.${customSuffix.trim()}`)}
              className="text-xs font-medium text-white bg-white/10 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg transition-colors"
            >
              Add color role
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
function HexInput({ value, onChange }) {
  const [draft, setDraft] = useState(value)
  const [focused, setFocused] = useState(false)

  const display = focused ? draft : value

  function handleChange(e) {
    const raw = e.target.value
    setDraft(raw)
    const normalized = raw.startsWith('#') ? raw : `#${raw}`
    if (isValidHex(normalized)) onChange(normalized)
  }

  function handleFocus() {
    setDraft(value)
    setFocused(true)
  }

  function handleBlur() {
    setFocused(false)
    setDraft(value)
  }

  return (
    <input
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="w-full bg-transparent text-[11px] font-mono text-white/60 focus:text-white outline-none text-center"
      spellCheck={false}
    />
  )
}

function ColorSwatch({ hex, step, onChange, size = 'md' }) {
  const contrast = getContrastColor(hex)
  const heights = { sm: 'h-10', md: 'h-14', lg: 'h-20' }

  return (
    <ColorPickerPopover value={hex} onChange={onChange}>
      <div
        className={clsx('relative rounded-lg overflow-hidden group cursor-pointer flex-1', heights[size])}
        style={{ backgroundColor: hex }}
        title={`${step}: ${hex}`}
      >
        <div
          className="absolute bottom-0 left-0 right-0 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-center"
          style={{ color: contrast, backgroundColor: `${hex}99` }}
        >
          <span className="text-[9px] font-mono">{hex}</span>
        </div>
      </div>
    </ColorPickerPopover>
  )
}

function PaletteRow({ palette, onBaseColorChange, onStepChange, onRemove, canRemove }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4">
        <ColorPickerPopover value={palette.baseColor} onChange={hex => onBaseColorChange(palette.id, hex)}>
          <div
            className="w-8 h-8 rounded-lg flex-shrink-0 cursor-pointer"
            style={{ backgroundColor: palette.baseColor }}
          />
        </ColorPickerPopover>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">{palette.name}</div>
          <div className="text-xs text-white/30 font-mono">{palette.baseColor}</div>
        </div>

        {/* Mini scale preview */}
        <div className="flex gap-0.5 items-center">
          {SCALE_STEPS.map(step => (
            <div
              key={step}
              className="w-4 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: palette.scale[step] }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-white/30 hover:text-white/70 transition-colors p-1"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded scale editor */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/[0.06]">
          <div className="pt-4">
            <div className="flex gap-1.5">
              {SCALE_STEPS.map(step => (
                <div key={step} className="flex-1 flex flex-col gap-1.5">
                  <ColorSwatch
                    hex={palette.scale[step]}
                    step={step}
                    onChange={hex => onStepChange(palette.id, step, hex)}
                    size="lg"
                  />
                  <div className="text-center">
                    <span className="text-[10px] text-white/30">{step}</span>
                    <div className="mt-0.5">
                      <HexInput
                        value={palette.scale[step]}
                        onChange={hex => onStepChange(palette.id, step, hex)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delete */}
            {canRemove && (
              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => onRemove(palette.id)}
                  className="flex items-center gap-1.5 text-[11px] text-white/20 hover:text-red-400 transition-colors"
                >
                  <X size={12} /> Remove palette
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SemanticTokenRow({ token, palettes, onUpdate, onRemove }) {
  const resolvedValue = resolveSemanticColor(token, palettes)
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
      {/* Swatch */}
      <div
        className="w-8 h-8 rounded-lg flex-shrink-0 border border-white/10"
        style={{ backgroundColor: resolvedValue }}
      />

      {/* Token name */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-mono text-white/80">{token.id}</div>
        <div className="text-[11px] text-white/30 truncate">{token.description}</div>
      </div>

      {/* Value */}
      <div className="text-[11px] font-mono text-white/30">{resolvedValue}</div>

      {/* Remove */}
      {onRemove && (
        <button onClick={() => onRemove(token.id)} className="text-white/15 hover:text-red-400 transition-colors p-1 flex-shrink-0">
          <X size={12} />
        </button>
      )}

      {/* Mapping dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-md px-2 py-1"
        >
          {token.isWhite ? 'white' : `${token.paletteId} · ${token.step}`}
          <ChevronDown size={11} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-10 min-w-[200px] py-1 max-h-64 overflow-y-auto">
            <div
              className="px-3 py-2 hover:bg-white/5 cursor-pointer text-xs text-white/60 hover:text-white"
              onClick={() => { onUpdate(token.id, { isWhite: true }); setOpen(false) }}
            >
              white (#ffffff)
            </div>
            {palettes.map(palette =>
              SCALE_STEPS.map(step => (
                <div
                  key={`${palette.id}-${step}`}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer"
                  onClick={() => { onUpdate(token.id, { paletteId: palette.id, step, isWhite: false }); setOpen(false) }}
                >
                  <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: palette.scale[step] }} />
                  <span className="text-xs text-white/60 font-mono">{palette.id}.{step}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ColorSection({ store }) {
  const { colorPalettes, semanticColorTokens, typography, updatePaletteBaseColor, updatePaletteStep, addPalette, removePalette, updateSemanticToken, addSemanticTokens, removeSemanticToken } = store

  function color(tokenId) {
    const token = semanticColorTokens.find(t => t.id === tokenId)
    if (!token) return '#cccccc'
    return resolveSemanticColor(token, colorPalettes)
  }

  const familyKeys = Object.keys(typography?.fontFamily ?? {})
  const sans = typography?.fontFamily?.sans ?? typography?.fontFamily?.[familyKeys[0]] ?? 'system-ui, sans-serif'
  const mono = typography?.fontFamily?.mono ?? typography?.fontFamily?.[familyKeys.find(k => /mono/i.test(k))] ?? 'ui-monospace, monospace'

  const bg     = color('color.bg.default')
  const surf   = color('color.surface.default')
  const border = color('color.border.default')
  const tp     = color('color.text.primary')
  const ts     = color('color.text.secondary')
  const td     = color('color.text.disabled')
  const brand  = color('color.bg.brand.solid')
  const brandH = color('color.bg.brand.solid.hover')
  const brandS = color('color.bg.brand.subtle')
  const brandT = color('color.text.brand')
  const onBrand   = color('color.on.brand')
  const successC  = color('color.bg.success.solid')
  const warningC  = color('color.bg.warning.solid')
  const dangerC   = color('color.bg.danger.solid')
  const successBg = color('color.bg.success.subtle')
  const warningBg = color('color.bg.warning.subtle')
  const dangerBg  = color('color.bg.danger.subtle')
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  function handleAdd() {
    if (!newName.trim()) return
    addPalette(newName.trim(), newColor)
    setNewName('')
    setNewColor('#6366f1')
    setShowAddForm(false)
  }

  function handleImportJson() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result)
          // Accept flat {name: hex} or {name: {50: hex, 100: hex, ...}}
          Object.entries(data).forEach(([name, value]) => {
            if (typeof value === 'string') {
              addPalette(name, value)
            }
          })
        } catch {
          alert('Invalid JSON file.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // Group semantic tokens by category from concept metadata
  const groups = {}
  semanticColorTokens.forEach(token => {
    const group = token.concept?.category || token.id.split('.')[1] || token.id.split('.')[0]
    groups[group] = groups[group] || []
    groups[group].push(token)
  })

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Color</h1>
        <p className="text-sm text-white/40 mt-1">Mix your palettes, then map them to roles.</p>
      </div>

      {/* Palettes */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <SectionHeading
            label="Color Palettes"
            techAlias="primitive tokens"
            tooltip="Raw color values organized as named scales (50–900). In the DTCG spec these are global tokens — the source of truth every color role references. Change a palette and all mapped roles update automatically."
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(v => !v)}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
            >
              <Plus size={12} /> Add palette
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="mb-4 flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="w-8 h-8 rounded-lg overflow-hidden relative flex-shrink-0" style={{ backgroundColor: newColor }}>
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
            </div>
            <input
              autoFocus
              placeholder="Palette name (e.g. Purple)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
            />
            <button onClick={handleAdd} className="text-xs font-medium text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-colors">Add</button>
            <button onClick={() => setShowAddForm(false)} className="text-xs text-white/30 hover:text-white/60">Cancel</button>
          </div>
        )}

        <div className="space-y-3">
          {colorPalettes.map(palette => (
            <PaletteRow
              key={palette.id}
              palette={palette}
              onBaseColorChange={updatePaletteBaseColor}
              onStepChange={updatePaletteStep}
              onRemove={removePalette}
              canRemove={colorPalettes.length > 1}
            />
          ))}
        </div>
      </section>

      {/* Semantic tokens */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionHeading
            label="Color Roles"
            techAlias="semantic tokens"
            tooltip="Colors bound to a specific UI purpose — background, text, border, surface. They reference palette steps, not raw hex values, so swapping a palette reshades your entire UI in one step."
          />
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
          >
            <Plus size={12} /> Add color role
          </button>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] divide-y divide-white/[0.04]">
          {Object.entries(groups).map(([group, tokens]) => (
            <div key={group} className="px-5 py-3">
              <div className="text-[10px] font-semibold tracking-widest text-white/20 uppercase mb-2">{group}</div>
              {tokens.map(token => (
                <SemanticTokenRow
                  key={token.id}
                  token={token}
                  palettes={colorPalettes}
                  onUpdate={updateSemanticToken}
                  onRemove={removeSemanticToken}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      {showWizard && (
        <TokenWizardModal
          palettes={colorPalettes}
          existingTokens={semanticColorTokens}
          onAdd={addSemanticTokens}
          onClose={() => setShowWizard(false)}
        />
      )}

      {/* Accessibility — contrast pairings */}
      <section className="mt-10">
        <div className="flex items-baseline gap-3 mb-4">
          <SectionHeading label="Accessibility" techAlias="WCAG 2.1 contrast" tooltip="Contrast ratios for all key text/background pairings. AA requires 4.5:1 for normal text, 3:1 for large text. AAA requires 7:1." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <PairingGroup title="Core text" border={border} sans={sans} mono={mono} pairs={[
            { fgHex: tp, bgHex: bg,   fgLabel: 'color.text.primary',   bgLabel: 'color.bg.default' },
            { fgHex: tp, bgHex: surf, fgLabel: 'color.text.primary',   bgLabel: 'color.surface.default' },
            { fgHex: ts, bgHex: bg,   fgLabel: 'color.text.secondary', bgLabel: 'color.bg.default' },
            { fgHex: ts, bgHex: surf, fgLabel: 'color.text.secondary', bgLabel: 'color.surface.default' },
            { fgHex: td, bgHex: bg,   fgLabel: 'color.text.disabled',  bgLabel: 'color.bg.default' },
          ]} />
          <PairingGroup title="Brand" border={border} sans={sans} mono={mono} pairs={[
            { fgHex: onBrand, bgHex: brand,  fgLabel: 'color.on.brand',   bgLabel: 'color.bg.brand.solid' },
            { fgHex: onBrand, bgHex: brandH, fgLabel: 'color.on.brand',   bgLabel: 'color.bg.brand.solid.hover' },
            { fgHex: brandT,  bgHex: bg,     fgLabel: 'color.text.brand', bgLabel: 'color.bg.default' },
            { fgHex: brandT,  bgHex: brandS, fgLabel: 'color.text.brand', bgLabel: 'color.bg.brand.subtle' },
          ]} />
          <PairingGroup title="Status — solid" border={border} sans={sans} mono={mono} pairs={[
            { fgHex: color('color.on.success'), bgHex: successC, fgLabel: 'color.on.success', bgLabel: 'color.bg.success.solid' },
            { fgHex: color('color.on.warning'), bgHex: warningC, fgLabel: 'color.on.warning', bgLabel: 'color.bg.warning.solid' },
            { fgHex: color('color.on.danger'),  bgHex: dangerC,  fgLabel: 'color.on.danger',  bgLabel: 'color.bg.danger.solid' },
          ]} />
          <PairingGroup title="Status — subtle" border={border} sans={sans} mono={mono} pairs={[
            { fgHex: color('color.text.success'), bgHex: successBg, fgLabel: 'color.text.success', bgLabel: 'color.bg.success.subtle' },
            { fgHex: color('color.text.warning'), bgHex: warningBg, fgLabel: 'color.text.warning', bgLabel: 'color.bg.warning.subtle' },
            { fgHex: color('color.text.danger'),  bgHex: dangerBg,  fgLabel: 'color.text.danger',  bgLabel: 'color.bg.danger.subtle' },
          ]} />
        </div>
      </section>

      {/* Rationale */}
      <section className="mt-10 rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 py-7">
        <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-5">How color works here</h2>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="text-[11px] font-semibold text-white/50 mb-1.5">Two layers</div>
            <p className="text-[13px] text-white/35 leading-relaxed">Raw palettes give you every shade. Color roles name them by job — not by number. Components only ever see the role layer.</p>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-white/50 mb-1.5">Positions, not values</div>
            <p className="text-[13px] text-white/35 leading-relaxed">Each role anchors to a position in the scale — pale end for backgrounds, mid for fills, dark end for text. Change the hue, the logic holds.</p>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-white/50 mb-1.5">Auto contrast</div>
            <p className="text-[13px] text-white/35 leading-relaxed">Foreground tokens on solid fills are picked automatically. The system tests both ends of the scale and chooses whichever clears WCAG AA.</p>
          </div>
        </div>
      </section>

    </div>
  )
}
