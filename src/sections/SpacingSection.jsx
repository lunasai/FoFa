import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { StepNameEditor } from '../components/StepNameEditor'

export default function SpacingSection({ store }) {
  const { spacing, setSpacing, updateSpacingStepName } = store
  const [newStepName, setNewStepName] = useState('')

  const maxValue = Math.max(...spacing.scale.map(s => s.value), 1)

  function updateStepValue(step, value) {
    setSpacing(prev => ({
      ...prev,
      scale: prev.scale.map(s => s.step === step ? { ...s, value: Math.max(0, value) } : s),
    }))
  }

  function addStep() {
    const name = newStepName.trim() || `step-${spacing.scale.length + 1}`
    const last = spacing.scale[spacing.scale.length - 1]
    const newValue = last ? last.value + 16 : 16
    setSpacing(prev => ({ ...prev, scale: [...prev.scale, { step: name, value: newValue }] }))
    setNewStepName('')
  }

  function removeStep(step) {
    setSpacing(prev => ({ ...prev, scale: prev.scale.filter(s => s.step !== step) }))
  }

  function updateGrid(key, val) {
    setSpacing(prev => ({ ...prev, grid: { ...prev.grid, [key]: val } }))
  }

  // anchor = cannot be deleted (value === 0)
  const isAnchor = step => spacing.scale.find(s => s.step === step)?.value === 0

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Spacing</h1>
        <p className="text-sm text-white/40 mt-1">Define your spacing scale and grid layout.</p>
      </div>

      {/* Scale */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase">Scale</h2>
          <div className="flex items-center gap-2">
            <input
              value={newStepName}
              onChange={e => setNewStepName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addStep()}
              placeholder="step name"
              className="w-28 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-white/20 outline-none focus:border-white/25"
            />
            <button
              onClick={addStep}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
            >
              <Plus size={12} /> Add step
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
          {/* Bar chart */}
          <div className="flex items-end gap-2 h-24 mb-3">
            {spacing.scale.map(s => {
              const heightPct = maxValue > 0 ? (s.value / maxValue) * 100 : 0
              return (
                <div key={s.step} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full bg-white/20 rounded-t-sm transition-all"
                    style={{ height: `${Math.max(s.value > 0 ? 4 : 2, heightPct)}%` }}
                  />
                </div>
              )
            })}
          </div>

          {/* Step labels + values + controls */}
          <div className="flex items-start gap-2">
            {spacing.scale.map(s => (
              <div key={s.step} className="flex-1 flex flex-col items-center gap-1 group/step min-w-0">
                <StepNameEditor
                  value={s.step}
                  onChange={newName => updateSpacingStepName(s.step, newName)}
                  size="sm"
                />
                <input
                  type="number"
                  value={s.value}
                  min={0}
                  onChange={e => updateStepValue(s.step, Number(e.target.value))}
                  className="w-full bg-transparent text-[9px] font-mono text-white/30 text-center outline-none focus:text-white/60 border-0"
                />
                {!isAnchor(s.step) && (
                  <button
                    onClick={() => removeStep(s.step)}
                    className="opacity-0 group-hover/step:opacity-100 transition-opacity text-white/20 hover:text-red-400"
                  >
                    <X size={9} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Grid</h2>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            {[
              { key: 'columns', label: 'Columns', min: 1, max: 24, suffix: '' },
              { key: 'gutter',  label: 'Gutter',  min: 0, max: 64, suffix: 'px' },
              { key: 'margin',  label: 'Margin',  min: 0, max: 128, suffix: 'px' },
            ].map(({ key, label, min, max, suffix }) => (
              <div key={key}>
                <div className="text-xs text-white/40 mb-2">{label}</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={spacing.grid[key]}
                    min={min}
                    max={max}
                    onChange={e => updateGrid(key, Number(e.target.value))}
                    className="w-20 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center outline-none focus:border-white/30"
                  />
                  {suffix && <span className="text-xs text-white/30">{suffix}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Grid visual */}
          <div
            className="relative bg-white/[0.03] rounded-lg overflow-hidden h-20"
            style={{ paddingLeft: `${Math.min(spacing.grid.margin, 40)}px`, paddingRight: `${Math.min(spacing.grid.margin, 40)}px` }}
          >
            <div className="flex h-full" style={{ gap: `${Math.min(spacing.grid.gutter, 12)}px` }}>
              {Array.from({ length: Math.min(spacing.grid.columns, 12) }).map((_, i) => (
                <div key={i} className="flex-1 h-full bg-white/[0.06] rounded-sm" />
              ))}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-white/20 text-center">
            {spacing.grid.columns} cols / {spacing.grid.gutter}px gutter / {spacing.grid.margin}px margin
          </div>
        </div>
      </section>
    </div>
  )
}
