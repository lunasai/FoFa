import { useState } from 'react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'

function SemanticTokenRow({ entry, shapes, onUpdate }) {
  const [open, setOpen] = useState(false)
  const scaleEntry = shapes.scale.find(s => s.step === entry.step)
  const radiusPx = scaleEntry ? scaleEntry.value : 0
  const previewRadius = Math.min(radiusPx, 32)

  return (
    <div className={clsx('flex items-center gap-4 px-5 py-3 border-b border-white/[0.04] last:border-0')}>
      <div
        className="w-10 h-10 bg-white/10 border border-white/10 flex-shrink-0"
        style={{ borderRadius: `${previewRadius}px` }}
      />
      <div className="flex-1">
        <div className="text-xs font-mono text-white/80">borderRadius.{entry.id}</div>
        <div className="text-[11px] text-white/30">{entry.description}</div>
      </div>
      <div className="text-xs text-white/30 font-mono">
        {radiusPx === 9999 ? '9999px' : `${radiusPx}px`}
      </div>
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-md px-2 py-1"
        >
          {entry.step}
          <ChevronDown size={11} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-10 min-w-[160px] py-1">
            {shapes.scale.map(s => {
              const val = s.value === 9999 ? '9999px' : `${s.value}px`
              return (
                <div
                  key={s.step}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer"
                  onClick={() => { onUpdate(entry.id, s.step); setOpen(false) }}
                >
                  <div
                    className="w-6 h-6 bg-white/10 border border-white/10 flex-shrink-0"
                    style={{ borderRadius: `${Math.min(s.value, 12)}px` }}
                  />
                  <span className="text-xs text-white/60 font-mono">{s.step}</span>
                  <span className="text-xs text-white/30 ml-auto">{val}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ShapesSection({ store }) {
  const { shapes, setShapes } = store

  function updateScaleStep(step, value) {
    setShapes(prev => ({
      ...prev,
      scale: prev.scale.map(e => e.step === step ? { ...e, value: Math.max(0, value) } : e),
    }))
  }

  function updateSemanticMapping(id, newStep) {
    setShapes(prev => ({
      ...prev,
      semantic: prev.semantic.map(e => e.id === id ? { ...e, step: newStep } : e),
    }))
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Shapes</h1>
        <p className="text-sm text-white/40 mt-1">Define border radius scale and semantic shape roles.</p>
      </div>

      {/* Scale */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Radius Scale</h2>
        <div className="grid grid-cols-4 gap-3">
          {shapes.scale.map(entry => {
            const displayRadius = entry.value === 9999 ? 9999 : entry.value
            const previewRadius = Math.min(entry.value, 40)

            return (
              <div
                key={entry.step}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
              >
                {/* Shape preview */}
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 bg-white/10 border border-white/10"
                    style={{ borderRadius: `${previewRadius}px` }}
                  />
                </div>

                <div className="text-xs font-mono text-white/60 text-center mb-3">{entry.step}</div>
                <div className="text-[11px] text-white/30 text-center mb-3">{entry.description}</div>

                {entry.value !== 9999 ? (
                  <div className="flex items-center gap-2 justify-center">
                    <input
                      type="number"
                      value={entry.value}
                      min={0}
                      max={100}
                      onChange={e => updateScaleStep(entry.step, Number(e.target.value))}
                      className="w-16 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center outline-none focus:border-white/30"
                    />
                    <span className="text-xs text-white/30">px</span>
                  </div>
                ) : (
                  <div className="text-center text-xs text-white/30 font-mono">∞ (pill)</div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Semantic tokens */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Semantic Tokens</h2>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03]">
          {shapes.semantic.map(entry => (
            <SemanticTokenRow
              key={entry.id}
              entry={entry}
              shapes={shapes}
              onUpdate={updateSemanticMapping}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
