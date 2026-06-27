import { useState } from 'react'
import clsx from 'clsx'
import { Plus, X, ChevronDown } from 'lucide-react'
import { StepNameEditor } from '../components/StepNameEditor'
import { SectionHeading } from '../components/SectionHeading'

const inputCls = 'bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center outline-none focus:border-white/30'
const dropdownCls = 'bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-white/30 font-mono cursor-pointer'
const modalFieldCls = 'w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none appearance-none cursor-pointer'

function radiusPreview(value, box) {
  return value === 9999 ? box / 2 : Math.min(value, box / 2)
}

// ── Radius scale card ─────────────────────────────────────────────────────────

function RadiusCard({ entry, onValueChange, onRename, onRemove, isAnchor }) {
  const isPill = entry.value === 9999
  return (
    <div className="group relative rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      {/* Remove */}
      {!isAnchor && (
        <button
          onClick={() => onRemove(entry.step)}
          className="absolute top-2 right-2 text-white/15 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
          title="Remove radius"
        >
          <X size={13} />
        </button>
      )}

      {/* Name */}
      <div className="flex justify-center mb-3">
        <StepNameEditor value={entry.step} onChange={n => onRename(entry.step, n)} />
      </div>

      {/* Shape preview — full width, taller */}
      <div
        className="w-full h-24 bg-white/10 border border-white/10 mb-3"
        style={{ borderRadius: `${radiusPreview(entry.value, 96)}px` }}
      />

      {/* Value — close to preview */}
      {isPill ? (
        <div className="text-center text-xs text-white/30 font-mono mb-2">∞ pill</div>
      ) : (
        <div className="flex items-center gap-2 justify-center mb-2">
          <input
            type="number"
            value={entry.value}
            min={0}
            max={100}
            step={1}
            onChange={e => onValueChange(entry.step, Number(e.target.value))}
            className={`w-16 ${inputCls}`}
          />
          <span className="text-xs text-white/30">px</span>
        </div>
      )}

      {/* Description — quietest */}
      <div className="text-[10px] text-white/20 text-center min-h-[14px]">{entry.description}</div>
    </div>
  )
}

// ── Semantic token row ────────────────────────────────────────────────────────

function SemanticTokenRow({ entry, shapes, onUpdate, onRemove, index, total }) {
  const [open, setOpen] = useState(false)
  const scaleEntry = shapes.scale.find(s => s.step === entry.step)
  const radiusPx = scaleEntry ? scaleEntry.value : 0

  return (
    <div className={clsx('flex items-center gap-4 px-5 py-3', index < total - 1 && 'border-b border-white/[0.04]')}>
      <div
        className="w-10 h-10 bg-white/10 border border-white/10 flex-shrink-0"
        style={{ borderRadius: `${radiusPreview(radiusPx, 40)}px` }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-mono text-white/80 truncate">{entry.id}</div>
        <div className="text-[11px] text-white/30 truncate">{entry.description}</div>
      </div>
      <div className="text-xs text-white/30 font-mono">
        {radiusPx === 9999 ? '∞' : `${radiusPx}px`}
      </div>

      {/* Mapping dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-md px-2 py-1 font-mono"
        >
          {entry.step}
          <ChevronDown size={11} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-10 min-w-[160px] py-1">
            {shapes.scale.map(s => {
              const val = s.value === 9999 ? '∞' : `${s.value}px`
              return (
                <div
                  key={s.step}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer"
                  onClick={() => { onUpdate(entry.id, s.step); setOpen(false) }}
                >
                  <div
                    className="w-6 h-6 bg-white/10 border border-white/10 flex-shrink-0"
                    style={{ borderRadius: `${radiusPreview(s.value, 24)}px` }}
                  />
                  <span className="text-xs text-white/60 font-mono">{s.step}</span>
                  <span className="text-xs text-white/30 ml-auto">{val}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(entry.id)}
        className="text-white/15 hover:text-red-400 transition-colors flex-shrink-0"
        title="Remove token"
      >
        <X size={12} />
      </button>
    </div>
  )
}

// ── Add semantic token modal (custom only) ────────────────────────────────────

function ShapeTokenModal({ shapes, existingIds, onAdd, onClose }) {
  const [suffix, setSuffix] = useState('')
  const [step, setStep] = useState(shapes.scale.find(s => s.step === 'md')?.step ?? shapes.scale[0]?.step ?? '')
  const [desc, setDesc] = useState('')

  const trimmed = suffix.trim()
  const id = `radius.${trimmed}`
  const exists = trimmed ? existingIds.has(id) : false
  const canAdd = !!trimmed && !exists

  const scaleEntry = shapes.scale.find(s => s.step === step)
  const previewVal = scaleEntry ? scaleEntry.value : 0

  function handleAdd() {
    if (!canAdd) return
    onAdd({
      id,
      step,
      description: desc.trim() || id,
      concept: { role: trimmed, isScale: false },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-[480px] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Add semantic token</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors"><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3">
          {/* Live preview */}
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] py-6 flex justify-center">
            <div
              className="w-16 h-16 bg-white/10 border border-white/10"
              style={{ borderRadius: `${radiusPreview(previewVal, 64)}px` }}
            />
          </div>

          {/* Name */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 w-14 flex-shrink-0">Name</span>
            <div className="flex items-center gap-1.5 flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2">
              <span className="text-xs font-mono text-white/25">radius.</span>
              <input
                autoFocus
                value={suffix}
                onChange={e => setSuffix(e.target.value)}
                placeholder="popover"
                className="flex-1 bg-transparent text-xs font-mono text-white outline-none placeholder-white/15"
              />
            </div>
          </div>

          {/* Step */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 w-14 flex-shrink-0">Radius</span>
            <div className="relative flex-1">
              <select value={step} onChange={e => setStep(e.target.value)} className={modalFieldCls}>
                {shapes.scale.map(s => (
                  <option key={s.step} value={s.step} style={{ background: '#111' }}>
                    {s.step} · {s.value === 9999 ? 'pill' : `${s.value}px`}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">▾</div>
            </div>
          </div>

          {/* Note */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 w-14 flex-shrink-0">Note</span>
            <input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Optional note"
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none placeholder-white/15"
            />
          </div>

          {trimmed && (
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
              <span className="text-[10px] text-white/30 font-mono">radius.</span>
              <span className="text-[10px] text-white/70 font-mono">{trimmed}</span>
              {exists && <span className="ml-2 text-[10px] text-amber-400/70">already exists</span>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="text-xs text-white/40 hover:text-white/70 px-3 py-1.5 transition-colors">Cancel</button>
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="text-xs font-medium text-white bg-white/10 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg transition-colors"
          >
            Add token
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ShapesSection({ store }) {
  const { shapes, setShapes, updateShapeStepName } = store
  const [showTokenModal, setShowTokenModal] = useState(false)

  function updateScaleStep(step, value) {
    setShapes(prev => ({
      ...prev,
      scale: prev.scale.map(e => e.step === step ? { ...e, value: Math.max(0, value) } : e),
    }))
  }

  function addRadiusStep() {
    setShapes(prev => {
      const names = new Set(prev.scale.map(s => s.step))
      let n = prev.scale.length + 1
      let name = `step-${n}`
      while (names.has(name)) { n++; name = `step-${n}` }
      const pillIdx = prev.scale.findIndex(s => s.value === 9999)
      const last = pillIdx > 0 ? prev.scale[pillIdx - 1] : prev.scale[prev.scale.length - 1]
      const newEntry = { step: name, value: (last && last.value !== 9999 ? last.value : 24) + 4, description: '' }
      const scale = [...prev.scale]
      if (pillIdx >= 0) scale.splice(pillIdx, 0, newEntry)
      else scale.push(newEntry)
      return { ...prev, scale }
    })
  }

  function removeRadiusStep(step) {
    setShapes(prev => ({ ...prev, scale: prev.scale.filter(e => e.step !== step) }))
  }

  function updateSemanticMapping(id, newStep) {
    setShapes(prev => ({
      ...prev,
      semantic: prev.semantic.map(e => e.id === id ? { ...e, step: newStep } : e),
    }))
  }

  function addSemantic(token) {
    setShapes(prev => ({ ...prev, semantic: [...prev.semantic, token] }))
  }

  function removeSemantic(id) {
    setShapes(prev => ({ ...prev, semantic: prev.semantic.filter(e => e.id !== id) }))
  }

  const isAnchor = entry => entry.value === 0 || entry.value === 9999

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Shapes</h1>
        <p className="text-sm text-white/40 mt-1">Corners, from razor-sharp to perfectly round.</p>
      </div>

      {/* Radius scale */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <SectionHeading
            label="Radius Scale"
            techAlias="primitive tokens"
            tooltip="Raw border-radius values forming your shape vocabulary. Each named step is the source of truth that shape role tokens reference — change a step here and every assigned component updates."
          />
          <button
            onClick={addRadiusStep}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
          >
            <Plus size={12} /> Add radius
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {shapes.scale.map(entry => (
            <RadiusCard
              key={entry.step}
              entry={entry}
              onValueChange={updateScaleStep}
              onRename={updateShapeStepName}
              onRemove={removeRadiusStep}
              isAnchor={isAnchor(entry)}
            />
          ))}
        </div>
      </section>

      {/* Semantic tokens */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionHeading
            label="Shape Roles"
            techAlias="semantic tokens"
            tooltip="Border-radius values bound to specific UI components — button, input, card, modal. They reference radius scale steps so a single scale change reshapes every assigned component at once."
          />
          <button
            onClick={() => setShowTokenModal(true)}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
          >
            <Plus size={12} /> Add semantic token
          </button>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03]">
          {shapes.semantic.map((entry, i) => (
            <SemanticTokenRow
              key={entry.id}
              entry={entry}
              index={i}
              total={shapes.semantic.length}
              shapes={shapes}
              onUpdate={updateSemanticMapping}
              onRemove={removeSemantic}
            />
          ))}
        </div>
      </section>

      {showTokenModal && (
        <ShapeTokenModal
          shapes={shapes}
          existingIds={new Set(shapes.semantic.map(t => t.id))}
          onAdd={addSemantic}
          onClose={() => setShowTokenModal(false)}
        />
      )}
    </div>
  )
}
