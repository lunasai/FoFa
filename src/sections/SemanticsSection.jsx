import clsx from 'clsx'
import { COLOR_SCALE_OPTIONS, formatColorStep } from '../lib/vocabularyUtils'
import { resolveSemanticColor } from '../lib/colorUtils'
import { StepNameEditor } from '../components/StepNameEditor'

function RadioCard({ value, option, onChange }) {
  const selected = value === option.value
  return (
    <button
      onClick={() => onChange(option.value)}
      className={clsx(
        'flex-1 text-left px-4 py-3 rounded-xl border transition-all',
        selected
          ? 'bg-white/[0.08] border-white/25 text-white'
          : 'bg-transparent border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/15'
      )}
    >
      <div className="text-sm font-medium mb-0.5">{option.label}</div>
      <div className="text-[11px] font-mono opacity-50">{option.example}</div>
    </button>
  )
}

export default function SemanticsSection({ store }) {
  const {
    vocabulary, updateVocabulary, colorPalettes, semanticColorTokens,
    typography, spacing, shapes,
    updateTypographyStepName, updateShapeStepName, updateSpacingStepName,
  } = store
  const colorScale = vocabulary?.scales?.color || 'numeric-100'

  const brandPalette = colorPalettes[0]
  const sampleSteps = [50, 200, 500, 800, 950]

  function resolvedHex(tokenId) {
    const t = semanticColorTokens.find(x => x.id === tokenId)
    if (!t) return '#555'
    return resolveSemanticColor(t, colorPalettes)
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

        {/* Color primitive scale format */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-1">
            Primitive Scale — Color
          </h2>
          <p className="text-xs text-white/30 mb-5">Choose how step numbers appear in your exported token names.</p>

          <div className="flex gap-3 mb-5">
            {COLOR_SCALE_OPTIONS.map(opt => (
              <RadioCard
                key={opt.value}
                value={colorScale}
                option={opt}
                onChange={v => updateVocabulary('scales.color', v)}
              />
            ))}
          </div>

          {brandPalette && (
            <div className="rounded-lg bg-black/20 border border-white/[0.06] p-4">
              <div className="text-[10px] font-semibold tracking-widest text-white/20 uppercase mb-3">
                Live preview — {brandPalette.name}
              </div>
              <div className="space-y-2">
                {sampleSteps.map(step => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded flex-shrink-0" style={{ background: brandPalette.scale[step] }} />
                    <code className="text-xs text-white/70 font-mono">
                      color.{brandPalette.id}.{formatColorStep(step, colorScale)}
                    </code>
                    <span className="text-[10px] font-mono text-white/20 ml-auto">{brandPalette.scale[step]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scale step names — editable */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-1">Scale Step Names</h2>
          <p className="text-xs text-white/30 mb-5">Click any step to rename it. Changes cascade to all token references.</p>

          <div className="space-y-5">
            {/* Typography */}
            <div>
              <div className="text-[10px] font-semibold tracking-widest text-white/25 uppercase mb-2">Typography</div>
              <div className="flex flex-wrap gap-1.5">
                {typography.scale.map(s => (
                  <StepNameEditor
                    key={s.step}
                    value={s.step}
                    onChange={newName => updateTypographyStepName(s.step, newName)}
                    size="sm"
                  />
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div>
              <div className="text-[10px] font-semibold tracking-widest text-white/25 uppercase mb-2">Spacing</div>
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
            </div>

            {/* Radius */}
            <div>
              <div className="text-[10px] font-semibold tracking-widest text-white/25 uppercase mb-2">Radius</div>
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
            </div>
          </div>
        </div>

        {/* Semantic structure */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-1">Semantic Token Structure</h2>
          <p className="text-xs text-white/30 mb-5">Semantic tokens always follow this fixed pattern.</p>

          <div className="rounded-lg bg-black/20 border border-white/[0.06] px-5 py-4 mb-5">
            <code className="text-sm font-mono">
              <span className="text-white/50">color.</span>
              <span className="text-blue-400/80">{'{category}'}</span>
              <span className="text-white/50">.</span>
              <span className="text-emerald-400/80">{'{role}'}</span>
              <span className="text-white/30">[.{'{state}'}]</span>
            </code>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {semanticColorTokens.slice(0, 10).map(token => (
              <div key={token.id} className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg hover:bg-white/[0.03]">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10"
                  style={{ background: resolvedHex(token.id) }}
                />
                <code className="text-[11px] font-mono text-white/60 truncate">{token.id}</code>
                {token.concept.state && (
                  <span className="text-[9px] font-mono text-white/25 bg-white/[0.05] rounded px-1.5 py-0.5 flex-shrink-0">
                    {token.concept.state}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
