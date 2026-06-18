import { useState } from 'react'
import clsx from 'clsx'
import { Plus, Minus } from 'lucide-react'

export default function SpacingSection({ store }) {
  const { spacing, setSpacing } = store

  function updateBaseUnit(val) {
    const n = Math.max(1, Math.min(16, val))
    setSpacing(prev => ({ ...prev, baseUnit: n }))
  }

  function updateGrid(key, val) {
    setSpacing(prev => ({ ...prev, grid: { ...prev.grid, [key]: val } }))
  }

  function addMultiplier() {
    const last = spacing.scale[spacing.scale.length - 1]
    const next = last + (last >= 16 ? 8 : last >= 8 ? 4 : 1)
    setSpacing(prev => ({ ...prev, scale: [...prev.scale, next] }))
  }

  function removeLastMultiplier() {
    if (spacing.scale.length <= 2) return
    setSpacing(prev => ({ ...prev, scale: prev.scale.slice(0, -1) }))
  }

  const maxPx = Math.max(...spacing.scale) * spacing.baseUnit

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Spacing</h1>
        <p className="text-sm text-white/40 mt-1">Set your base unit and spacing scale.</p>
      </div>

      {/* Base unit */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Base Unit</h2>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateBaseUnit(spacing.baseUnit - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
              >
                <Minus size={14} />
              </button>
              <div className="text-center w-16">
                <div className="text-3xl font-bold text-white">{spacing.baseUnit}</div>
                <div className="text-xs text-white/30">px</div>
              </div>
              <button
                onClick={() => updateBaseUnit(spacing.baseUnit + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex-1 h-px bg-white/[0.06]" />

            <div className="text-sm text-white/30">
              All spacing values are multiples of this unit.
              <span className="text-white/50 ml-2">1 unit = {spacing.baseUnit}px</span>
            </div>
          </div>

          {/* Mini visual */}
          <div className="mt-6 flex items-end gap-1 h-16">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div
                key={n}
                className="bg-white/10 rounded-sm flex-shrink-0"
                style={{ width: `${n * spacing.baseUnit * 4}px`, height: `${n * spacing.baseUnit * 4}px`, maxWidth: '64px', maxHeight: '64px' }}
                title={`${n} × ${spacing.baseUnit}px = ${n * spacing.baseUnit}px`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Spacing scale */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase">Scale</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={removeLastMultiplier}
              className="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
            >
              Remove last
            </button>
            <button
              onClick={addMultiplier}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
            >
              <Plus size={12} /> Add step
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
          {/* Bars */}
          <div className="flex items-end gap-2 h-32 mb-3">
            {spacing.scale.map(multiplier => {
              const px = multiplier * spacing.baseUnit
              const heightPct = maxPx > 0 ? (px / maxPx) * 100 : 0
              return (
                <div key={multiplier} className="flex flex-col items-center gap-1 flex-1" title={`${multiplier} × ${spacing.baseUnit}px = ${px}px`}>
                  <div
                    className="w-full bg-white/20 rounded-t-sm transition-all"
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                  />
                </div>
              )
            })}
          </div>

          {/* Labels */}
          <div className="flex items-start gap-2">
            {spacing.scale.map(multiplier => {
              const px = multiplier * spacing.baseUnit
              return (
                <div key={multiplier} className="flex-1 text-center">
                  <div className="text-[10px] font-mono text-white/50">{multiplier}</div>
                  <div className="text-[9px] text-white/25">{px}px</div>
                </div>
              )
            })}
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
              { key: 'gutter', label: 'Gutter', min: 0, max: 64, suffix: 'px' },
              { key: 'margin', label: 'Margin', min: 0, max: 128, suffix: 'px' },
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
            <div className="flex h-full gap-0" style={{ gap: `${Math.min(spacing.grid.gutter, 12)}px` }}>
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
