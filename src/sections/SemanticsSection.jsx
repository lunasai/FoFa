import { useState } from 'react'
import clsx from 'clsx'
import {
  COLOR_SCALE_OPTIONS, TYPOGRAPHY_SCALE_OPTIONS, SPACING_SCALE_OPTIONS, RADIUS_SCALE_OPTIONS,
  formatColorStep,
} from '../lib/vocabularyUtils'
import { resolveSemanticColor, SCALE_STEPS } from '../lib/colorUtils'
import { StepNameEditor } from '../components/StepNameEditor'

function FormulaToken({ label, color, tip }) {
  return (
    <span className="relative group/tip cursor-default">
      <span className={color}>{label}</span>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 text-[11px] font-sans text-white/70 leading-snug shadow-xl opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 text-center">
        {tip}
      </span>
    </span>
  )
}

function ScaleSelect({ options, value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none hover:border-white/20 focus:border-white/30 cursor-pointer transition-colors appearance-none"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} style={{ background: '#111' }}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function PrimitiveCard({ title, options, value, onChange, children }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 flex flex-col gap-4">
      <div>
        <div className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-3">{title}</div>
        <div className="relative">
          <ScaleSelect options={options} value={value} onChange={onChange} />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">▾</div>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function SemanticsSection({ store }) {
  const {
    vocabulary, updateVocabulary, colorPalettes, semanticColorTokens,
    typography, spacing, shapes,
    updateTypographyStepName, updateShapeStepName, updateSpacingStepName,
    switchCategoryScale, restoreCategoryScale,
  } = store

  const [undo, setUndo] = useState(null)

  const colorScale = vocabulary?.scales?.color || 'numeric-100'

  function resolvedHex(tokenId) {
    const t = semanticColorTokens.find(x => x.id === tokenId)
    if (!t) return '#555'
    return resolveSemanticColor(t, colorPalettes)
  }

  function handleScaleSwitch(category, newScale) {
    // Snapshot before switch for undo
    let snapshot
    if (category === 'typography') {
      snapshot = { size: typography.size.map(s => ({ ...s })), semantic: typography.semantic.map(s => ({ ...s })), scaleValue: vocabulary.scales.typography }
    } else if (category === 'spacing') {
      snapshot = { scale: spacing.scale.map(s => ({ ...s })), scaleValue: vocabulary.scales.spacing }
    } else if (category === 'shapes') {
      snapshot = { scale: shapes.scale.map(s => ({ ...s })), semantic: shapes.semantic.map(s => ({ ...s })), scaleValue: vocabulary.scales.shapes }
    }

    switchCategoryScale(category, newScale)

    const label = { typography: 'Typography', spacing: 'Spacing', shapes: 'Radius' }[category]
    setUndo({ category, snapshot, label })
  }

  function handleUndo() {
    if (!undo) return
    restoreCategoryScale(undo.category, undo.snapshot)
    setUndo(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Naming</h1>
        <p className="text-sm text-white/40 mt-1">
          Configure how token names are structured. Changes cascade to JSON export and markdown output.
        </p>
      </div>

      <div className="space-y-6">

        {/* Primitives — unified 2×2 grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold tracking-widest text-white/30 uppercase">Primitives</div>
            {undo && (
              <div className="flex items-center gap-2 text-[11px] text-white/40">
                <span>Renamed {undo.label} steps</span>
                <button
                  onClick={handleUndo}
                  className="text-white/60 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Undo
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* Color */}
            <PrimitiveCard
              title="Color"
              options={COLOR_SCALE_OPTIONS}
              value={colorScale}
              onChange={v => { updateVocabulary('scales.color', v); setUndo(null) }}
            >
              <div className="flex flex-wrap gap-1.5">
                {SCALE_STEPS.map(step => (
                  <span key={step} className="text-[10px] font-mono text-white/30 px-1.5 py-0.5">
                    {formatColorStep(step, colorScale)}
                  </span>
                ))}
              </div>
            </PrimitiveCard>

            {/* Typography */}
            <PrimitiveCard
              title="Typography"
              options={TYPOGRAPHY_SCALE_OPTIONS}
              value={vocabulary?.scales?.typography || 'tshirt'}
              onChange={v => handleScaleSwitch('typography', v)}
            >
              <div className="flex flex-wrap gap-1.5">
                {(typography.size ?? []).map(s => (
                  <StepNameEditor
                    key={s.step}
                    value={s.step}
                    onChange={newName => updateTypographyStepName(s.step, newName)}
                    size="sm"
                  />
                ))}
              </div>
            </PrimitiveCard>

            {/* Spacing */}
            <PrimitiveCard
              title="Spacing"
              options={SPACING_SCALE_OPTIONS}
              value={vocabulary?.scales?.spacing || 'tshirt'}
              onChange={v => handleScaleSwitch('spacing', v)}
            >
              <div className="flex flex-wrap gap-1.5">
                {spacing.scale.map(s => (
                  <StepNameEditor
                    key={s.step}
                    value={s.step}
                    onChange={newName => updateSpacingStepName(s.step, newName)}
                    size="sm"
                  />
                ))}
              </div>
            </PrimitiveCard>

            {/* Radius */}
            <PrimitiveCard
              title="Radius"
              options={RADIUS_SCALE_OPTIONS}
              value={vocabulary?.scales?.shapes || 'tshirt'}
              onChange={v => handleScaleSwitch('shapes', v)}
            >
              <div className="flex flex-wrap gap-1.5">
                {shapes.scale.map(s => (
                  <StepNameEditor
                    key={s.step}
                    value={s.step}
                    onChange={newName => updateShapeStepName(s.step, newName)}
                    size="sm"
                  />
                ))}
              </div>
            </PrimitiveCard>

          </div>
        </div>

        {/* Semantic structure — one card per category */}
        <div>
          <div className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-3">Semantics</div>

          {/* Unified formula */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 mb-4">
            <code className="text-sm font-mono flex items-center gap-0">
              <FormulaToken label="{category}" color="text-white/40" tip="The token type — color, type, or radius" />
              <span className="text-white/20">.</span>
              <FormulaToken label="{role}" color="text-blue-400/80" tip="The usage context — bg, surface, text, border, or on (for text/icons on top of solid fills)" />
              <span className="text-white/20">.</span>
              <FormulaToken label="{variant}" color="text-emerald-400/80" tip="The palette personality or size step — brand, warning, primary, xl, md…" />
              <FormulaToken label="[.emphasis]" color="text-amber-400/60" tip="Intensity modifier for bg and border — subtle for light tints, solid for opaque interactive fills" />
              <FormulaToken label="[.state]" color="text-white/25" tip="Optional interaction state — hover, active, or disabled" />
            </code>
          </div>

          <div className="grid grid-cols-3 gap-4">

            {/* Color */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 flex flex-col gap-4">
              <div>
                <div className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">Color</div>
              </div>
              <div className="space-y-1">
                {semanticColorTokens.map(token => {
                  const scaleEntry = (() => {
                    const palette = colorPalettes.find(p => p.id === token.paletteId)
                    return palette ? formatColorStep(token.step, colorScale) : token.step
                  })()
                  return (
                    <div key={token.id} className="flex items-center gap-2 py-0.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/10" style={{ background: resolvedHex(token.id) }} />
                      <code className="text-[10px] font-mono text-white/50 flex-1 truncate">{token.id}</code>
                      <span className="text-[9px] font-mono text-white/20 flex-shrink-0">{token.paletteId}·{scaleEntry}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Typography */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 flex flex-col gap-4">
              <div className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">Typography</div>
              <div className="space-y-1">
                {typography.semantic.map(token => {
                  const sizeEntry = typography.size?.find(s => s.step === token.size)
                  return (
                    <div key={token.id} className="flex items-center gap-2 py-0.5">
                      <code className="text-[10px] font-mono text-white/50 flex-1 truncate">{token.id}</code>
                      <span className="text-[9px] font-mono text-white/20 flex-shrink-0">
                        {token.size}{sizeEntry ? ` · ${sizeEntry.max}rem` : ''} / {token.weight}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Shapes */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 flex flex-col gap-4">
              <div className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">Radius</div>
              <div className="space-y-1">
                {shapes.semantic.map(token => {
                  const entry = shapes.scale.find(s => s.step === token.step)
                  const px = entry ? (entry.value === 9999 ? '∞' : `${entry.value}px`) : ''
                  return (
                    <div key={token.id} className="flex items-center gap-2 py-0.5">
                      <code className="text-[10px] font-mono text-white/50 flex-1 truncate">{token.id}</code>
                      <span className="text-[9px] font-mono text-white/20 flex-shrink-0">
                        {token.step}{px ? ` · ${px}` : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
