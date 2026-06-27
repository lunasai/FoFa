import { useState, useRef, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import clsx from 'clsx'
import { StepNameEditor } from '../components/StepNameEditor'
import { ScaleTable, ScaleRow, InlineNameEdit } from '../components/ScaleTable'
import { SectionHeading } from '../components/SectionHeading'

const REM_BASE = 16
const PREVIEW_H = 112 // h-28
const inputCls = 'bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center outline-none focus:border-white/30'

function toRem(px) {
  return parseFloat((px / REM_BASE).toFixed(4))
}

// ── Labeled numeric field (used inside the integrated grid editor) ─────────────

function LabeledNum({ label, value, onChange, suffix, min = 0, max = 99999, step = 1 }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold text-white/20 uppercase tracking-wider text-center">{label}</span>
      <div className="flex items-center justify-center gap-1.5">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(Number(e.target.value))}
          className={`w-[68px] ${inputCls}`}
        />
        <span className="text-[10px] text-white/20 w-7">{suffix}</span>
      </div>
    </div>
  )
}

// ── Spacing step row ──────────────────────────────────────────────────────────

function StepRow({ entry, autoFocusName, onConsumedAutoFocus, onValueChange, onRename, onRemove, isAnchor }) {
  const barW = Math.min(entry.value, 176)
  return (
    <ScaleRow>
      {/* Bar preview */}
      <div className="w-44 flex-shrink-0 flex items-center">
        <div className="h-3 bg-white/25 rounded-sm" style={{ width: Math.max(barW, 2) }} />
      </div>

      {/* Name — inline edit */}
      <div className="flex-1 min-w-0">
        <InlineNameEdit value={entry.step} onRename={onRename} autoFocus={autoFocusName} onConsumedAutoFocus={onConsumedAutoFocus} />
      </div>

      {/* Value (px) */}
      <div className="flex items-center justify-end gap-1.5 w-[84px]">
        <input
          type="number"
          value={entry.value}
          min={0}
          onChange={e => onValueChange(entry.step, Number(e.target.value))}
          className={`w-14 ${inputCls}`}
        />
        <span className="text-[10px] text-white/20">px</span>
      </div>

      {/* rem */}
      <span className="w-16 text-right text-[10px] font-mono text-white/15">{toRem(entry.value)}rem</span>

      {/* Remove */}
      <div className="w-[18px] flex justify-end">
        {!isAnchor && (
          <button onClick={() => onRemove(entry.step)} className="text-white/20 hover:text-red-400 transition-colors">
            <X size={12} />
          </button>
        )}
      </div>
    </ScaleRow>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SpacingSection({ store }) {
  const {
    spacing, setSpacing, updateSpacingStepName,
    addBreakpoint, updateBreakpoint, renameBreakpoint, removeBreakpoint,
  } = store

  const breakpoints = spacing.breakpoints ?? []
  const sorted = [...breakpoints].sort((a, b) => a.width - b.width)
  const maxBp = sorted[sorted.length - 1]

  const [previewId, setPreviewId] = useState(maxBp?.id)
  const selected = breakpoints.find(b => b.id === previewId) ?? maxBp

  const [autoEditStep, setAutoEditStep] = useState(null)

  // Measure the preview canvas so we can zoom out wide breakpoints to fit.
  const previewRef = useRef(null)
  const [previewW, setPreviewW] = useState(0)
  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => setPreviewW(entries[0].contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const scale = previewW > 0 && selected && selected.width > previewW
    ? previewW / selected.width
    : 1

  function handleRemoveBreakpoint(id) {
    const remaining = sorted.filter(b => b.id !== id)
    if (remaining.length) setPreviewId(remaining[remaining.length - 1].id)
    removeBreakpoint(id)
  }

  function updateStepValue(step, value) {
    setSpacing(prev => ({
      ...prev,
      scale: prev.scale.map(s => s.step === step ? { ...s, value: Math.max(0, value) } : s),
    }))
  }

  function addStep() {
    setSpacing(prev => {
      const names = new Set(prev.scale.map(s => s.step))
      let n = prev.scale.length + 1
      let name = `step-${n}`
      while (names.has(name)) { n++; name = `step-${n}` }
      const last = prev.scale[prev.scale.length - 1]
      const newValue = last ? last.value + 16 : 16
      setAutoEditStep(name)
      return { ...prev, scale: [...prev.scale, { step: name, value: newValue }] }
    })
  }

  function removeStep(step) {
    setSpacing(prev => ({ ...prev, scale: prev.scale.filter(s => s.step !== step) }))
  }

  const isAnchor = step => spacing.scale.find(s => s.step === step)?.value === 0

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">Layout</h1>
        <p className="text-sm text-white/40 mt-1">Breakpoints, grids, and spacing — consistent on every screen.</p>
      </div>

      {/* Grid + breakpoints (integrated) */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <SectionHeading
            label="Grid & Breakpoints"
            techAlias="breakpoint tokens"
            tooltip="Viewport width definitions that drive the responsive grid (columns, gutter, margin) and the fluid type scaling range. Referenced by both the layout system and the type scale's clamp() calculations."
          />
          <button
            onClick={addBreakpoint}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
          >
            <Plus size={12} /> Add breakpoint
          </button>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
          {selected ? (
            <>
              {/* Breakpoint tabs */}
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-lg p-0.5 mb-5 w-fit">
                {sorted.map(bp => (
                  <button
                    key={bp.id}
                    onClick={() => setPreviewId(bp.id)}
                    className={clsx(
                      'flex items-baseline gap-1.5 text-[11px] font-medium px-3 py-1 rounded-md transition-colors',
                      selected.id === bp.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                    )}
                  >
                    <span>{bp.id}</span>
                    <span className="text-[10px] font-mono opacity-50">{bp.width}</span>
                  </button>
                ))}
              </div>

              {/* Grid preview — rendered at true px width, zoomed out to fit the canvas */}
              <div ref={previewRef} className={clsx('relative flex bg-white/[0.03] rounded-lg overflow-hidden h-28', scale === 1 ? 'justify-center' : 'justify-start')}>
                <div
                  className="flex-shrink-0"
                  style={{
                    width: `${selected.width}px`,
                    height: `${PREVIEW_H / scale}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: scale === 1 ? 'top center' : 'top left',
                    paddingLeft: `${selected.margin}px`,
                    paddingRight: `${selected.margin}px`,
                  }}
                >
                  <div className="flex h-full" style={{ gap: `${selected.gutter}px` }}>
                    {Array.from({ length: Math.min(selected.columns, 24) }).map((_, i) => (
                      <div key={i} className="flex-1 h-full rounded-sm bg-white/[0.06] border border-white/[0.07]" />
                    ))}
                  </div>
                </div>

                {/* Scale badge — only shown when zoomed out */}
                {scale < 1 && (
                  <div className="absolute top-2 right-2 text-[10px] font-mono text-white/35 bg-black/40 border border-white/[0.08] rounded px-1.5 py-0.5">
                    {Math.round(scale * 100)}% scale
                  </div>
                )}
              </div>

              {/* Inline editable values for the selected breakpoint */}
              <div className="mt-5 flex items-end gap-5 pt-4 border-t border-white/[0.06]">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">Name</span>
                  <div className="h-[26px] flex items-center">
                    <StepNameEditor value={selected.id} onChange={n => renameBreakpoint(selected.id, n)} />
                  </div>
                </div>
                <div className="flex-1" />
                <LabeledNum label="Width"   value={selected.width}   onChange={v => updateBreakpoint(selected.id, { width: v })}   suffix="px"   min={0} max={4096} />
                <LabeledNum label="Columns" value={selected.columns} onChange={v => updateBreakpoint(selected.id, { columns: v })} suffix="cols" min={1} max={24} />
                <LabeledNum label="Gutter"  value={selected.gutter}  onChange={v => updateBreakpoint(selected.id, { gutter: v })}  suffix="px"   min={0} max={128} />
                <LabeledNum label="Margin"  value={selected.margin}  onChange={v => updateBreakpoint(selected.id, { margin: v })}  suffix="px"   min={0} max={256} />
                <div className="h-[26px] flex items-center">
                  {breakpoints.length > 1 && (
                    <button
                      onClick={() => handleRemoveBreakpoint(selected.id)}
                      className="text-white/20 hover:text-red-400 transition-colors"
                      title="Remove breakpoint"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-xs text-white/30 text-center py-6">No breakpoints yet — the canvas is blank.</div>
          )}
        </div>
      </section>

      {/* Spacing scale */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <SectionHeading
            label="Spacing"
            techAlias="primitive tokens"
            tooltip="Base spacing values used directly in layouts or referenced by component-level semantic tokens. Exported as CSS custom properties (e.g. var(--spacing-md))."
          />
          <button
            onClick={addStep}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
          >
            <Plus size={12} /> Add spacing
          </button>
        </div>

        <ScaleTable columns={[
          { label: 'Preview', width: 'w-44' },
          { label: 'Name', grow: true },
          { label: 'Value', width: 'w-[84px]', align: 'center' },
          { label: 'rem', width: 'w-16', align: 'right' },
          { label: '', width: 'w-[18px]' },
        ]}>
          {spacing.scale.map(entry => (
            <StepRow
              key={entry.step}
              entry={entry}
              autoFocusName={autoEditStep === entry.step}
              onConsumedAutoFocus={() => setAutoEditStep(null)}
              onValueChange={updateStepValue}
              onRename={updateSpacingStepName}
              onRemove={removeStep}
              isAnchor={isAnchor(entry.step)}
            />
          ))}
        </ScaleTable>
      </section>
    </div>
  )
}
