import { useState } from 'react'
import clsx from 'clsx'
import { StepNameEditor } from '../components/StepNameEditor'

const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900]

function ScaleRow({ entry, fontFamily, onChange, onRenameStep }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
      {/* Preview */}
      <div
        className="w-48 flex-shrink-0 overflow-hidden"
        style={{
          fontFamily,
          fontSize: `${Math.min(entry.size, 32)}px`,
          fontWeight: entry.weight,
          lineHeight: entry.lineHeight,
          color: 'rgba(255,255,255,0.9)',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        Aa
      </div>

      <div className="w-16 flex-shrink-0">
        <StepNameEditor value={entry.step} onChange={newName => onRenameStep(entry.step, newName)} />
      </div>

      {/* Size */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="number"
          value={entry.size}
          min={10}
          max={120}
          onChange={e => onChange({ ...entry, size: Number(e.target.value) })}
          className="w-16 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center outline-none focus:border-white/30"
        />
        <span className="text-xs text-white/20">px</span>
      </div>

      {/* Line height */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="number"
          value={entry.lineHeight}
          min={1}
          max={3}
          step={0.05}
          onChange={e => onChange({ ...entry, lineHeight: Number(e.target.value) })}
          className="w-16 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center outline-none focus:border-white/30"
        />
        <span className="text-xs text-white/20">lh</span>
      </div>

      {/* Weight */}
      <select
        value={entry.weight}
        onChange={e => onChange({ ...entry, weight: Number(e.target.value) })}
        className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-white/30"
      >
        {WEIGHTS.map(w => (
          <option key={w} value={w} style={{ background: '#111' }}>{w}</option>
        ))}
      </select>

      {/* Full size label */}
      <div className="text-xs text-white/20 ml-auto">{entry.size}px / {entry.lineHeight} / {entry.weight}</div>
    </div>
  )
}

export default function TypographySection({ store }) {
  const { typography, setTypography, updateTypographyStepName } = store

  function updateScale(step, updated) {
    setTypography(prev => ({
      ...prev,
      scale: prev.scale.map(e => e.step === step ? updated : e),
    }))
  }

  function updateSemanticStep(id, newStep) {
    setTypography(prev => ({
      ...prev,
      semantic: prev.semantic.map(e => e.id === id ? { ...e, step: newStep } : e),
    }))
  }

  function updateFontFamily(key, value) {
    setTypography(prev => ({
      ...prev,
      fontFamily: { ...prev.fontFamily, [key]: value },
    }))
  }

  const SAMPLE_TEXT = 'The quick brown fox'

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Typography</h1>
        <p className="text-sm text-white/40 mt-1">Define font families, size scale, and semantic text roles.</p>
      </div>

      {/* Font families */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Font Families</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'sans', label: 'Sans / UI' },
            { key: 'mono', label: 'Monospace' },
          ].map(({ key, label }) => (
            <div key={key} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="text-xs text-white/40 mb-3">{label}</div>
              <input
                value={typography.fontFamily[key]}
                onChange={e => updateFontFamily(key, e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none border-b border-white/10 focus:border-white/30 pb-1 transition-colors"
              />
              <div
                className="mt-4 text-2xl text-white/70"
                style={{ fontFamily: typography.fontFamily[key] }}
              >
                {SAMPLE_TEXT}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Type scale */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Type Scale</h2>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5">
          <div className="flex items-center gap-4 py-2 border-b border-white/[0.06]">
            <div className="w-48 text-[10px] font-semibold text-white/20 uppercase tracking-wider">Preview</div>
            <div className="text-[10px] font-semibold text-white/20 uppercase tracking-wider w-16">Step</div>
            <div className="text-[10px] font-semibold text-white/20 uppercase tracking-wider w-24">Size</div>
            <div className="text-[10px] font-semibold text-white/20 uppercase tracking-wider w-24">Line Height</div>
            <div className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">Weight</div>
          </div>
          {[...typography.scale].reverse().map(entry => (
            <ScaleRow
              key={entry.step}
              entry={entry}
              fontFamily={typography.fontFamily.sans}
              onChange={updated => updateScale(entry.step, updated)}
              onRenameStep={updateTypographyStepName}
            />
          ))}
        </div>
      </section>

      {/* Semantic tokens */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Semantic Tokens</h2>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03]">
          {typography.semantic.map((entry, i) => {
            const scaleEntry = typography.scale.find(s => s.step === entry.step)
            return (
              <div key={entry.id} className={clsx('flex items-center gap-4 px-5 py-3', i !== typography.semantic.length - 1 && 'border-b border-white/[0.04]')}>
                {/* Preview */}
                <div
                  className="w-48 flex-shrink-0 overflow-hidden whitespace-nowrap"
                  style={{
                    fontFamily: typography.fontFamily.sans,
                    fontSize: scaleEntry ? `${Math.min(scaleEntry.size, 28)}px` : '16px',
                    fontWeight: scaleEntry ? scaleEntry.weight : 400,
                    lineHeight: scaleEntry ? scaleEntry.lineHeight : 1.5,
                    color: 'rgba(255,255,255,0.85)',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {SAMPLE_TEXT}
                </div>

                {/* Token name */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-white/80">{entry.id}</div>
                  <div className="text-[11px] text-white/30">{entry.description}</div>
                </div>

                {/* Step selector */}
                <select
                  value={entry.step}
                  onChange={e => updateSemanticStep(entry.id, e.target.value)}
                  className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-white/30 font-mono"
                >
                  {typography.scale.map(s => (
                    <option key={s.step} value={s.step} style={{ background: '#111' }}>{s.step}</option>
                  ))}
                </select>

                {/* Detail */}
                <div className="text-xs text-white/20 w-36 text-right">
                  {scaleEntry ? `${scaleEntry.size}px / ${scaleEntry.weight}` : ''}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
