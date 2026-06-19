import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'
import { SCALE_STEPS, isValidHex, getContrastColor, resolveSemanticColor } from '../lib/colorUtils'
import { ColorPickerPopover } from '../components/ColorPicker'
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
          {canRemove && (
            <button
              onClick={() => onRemove(palette.id)}
              className="text-white/20 hover:text-red-400 transition-colors p-1"
            >
              <Trash2 size={14} />
            </button>
          )}
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
          </div>
        </div>
      )}
    </div>
  )
}

function SemanticTokenRow({ token, palettes, onUpdate }) {
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
        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-white/80">{token.id}</div>
          {token.concept.state && (
            <span className="text-[9px] font-mono text-white/30 bg-white/[0.06] rounded px-1.5 py-0.5 flex-shrink-0">
              {token.concept.state}
            </span>
          )}
        </div>
        <div className="text-[11px] text-white/30 truncate">{token.description}</div>
      </div>

      {/* Value */}
      <div className="text-[11px] font-mono text-white/30">{resolvedValue}</div>

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
  const { colorPalettes, semanticColorTokens, updatePaletteBaseColor, updatePaletteStep, addPalette, removePalette, updateSemanticToken } = store
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [showAddForm, setShowAddForm] = useState(false)

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
        <p className="text-sm text-white/40 mt-1">Define color scales, then map them to semantic roles.</p>
      </div>

      {/* Palettes */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase">Primitive Scales</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportJson}
              className="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
            >
              Import JSON
            </button>
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
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase">Semantic Tokens</h2>
          <span className="text-xs text-white/20">Map to primitive scales above</span>
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
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
