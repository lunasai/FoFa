import clsx from 'clsx'
import {
  CATEGORY_OPTIONS, VARIANT_OPTIONS, SCALE_OPTIONS, SCALE_LABELS,
  deriveColorTokenName, deriveTypographyTokenName,
} from '../lib/vocabularyUtils'
import { resolveSemanticColor } from '../lib/colorUtils'

function Select({ value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white font-mono outline-none focus:border-white/30 cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt} value={opt} style={{ background: '#1a1a1a' }}>{opt}</option>
      ))}
    </select>
  )
}

function ScaleRadio({ value, options, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
            value === opt
              ? 'bg-white/10 border-white/20 text-white'
              : 'bg-transparent border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/15'
          )}
        >
          {SCALE_LABELS[opt]}
        </button>
      ))}
    </div>
  )
}

function TokenPreviewRow({ label, before, after, changed }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: label }} />
      <code className={clsx('text-xs flex-1', changed ? 'text-white/40 line-through' : 'text-white/50')}>{before}</code>
      {changed && (
        <>
          <span className="text-white/20 text-xs">→</span>
          <code className="text-xs text-white font-medium">{after}</code>
        </>
      )}
    </div>
  )
}

export default function SemanticsSection({ store }) {
  const { vocabulary, updateVocabulary, semanticColorTokens, typography, colorPalettes } = store

  function colorOf(tokenId) {
    const t = semanticColorTokens.find(x => x.id === tokenId)
    if (!t) return '#888'
    return resolveSemanticColor(t, colorPalettes)
  }

  // Representative tokens for the live preview
  const previewColorTokens = [
    'background.default', 'background.subtle',
    'text.primary', 'text.secondary', 'text.disabled',
    'brand.default', 'brand.subtle',
    'border.default',
    'success.default', 'success.subtle',
    'danger.default',
  ]

  const previewTypoTokens = typography.semantic.filter(t => t.concept.tshirtStep)

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Semantics</h1>
        <p className="text-sm text-white/40 mt-1">
          Configure your token naming vocabulary. Changes cascade to the UI, JSON export, and markdown output.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Category aliases */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 col-span-2">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-5">Category Aliases</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {Object.entries(CATEGORY_OPTIONS).map(([canonical, opts]) => (
              <div key={canonical} className="flex items-center gap-4">
                <code className="text-xs text-white/30 w-24 flex-shrink-0">{canonical}</code>
                <span className="text-white/20 text-xs">→</span>
                <Select
                  value={vocabulary.categories[canonical] || canonical}
                  options={opts}
                  onChange={v => updateVocabulary(`categories.${canonical}`, v)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Variant names */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-5">Variant Names</h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-white/40 mb-2">Default / base state</div>
              <div className="flex items-center gap-4">
                <code className="text-xs text-white/30 w-20">default</code>
                <span className="text-white/20 text-xs">→</span>
                <Select
                  value={vocabulary.variants.default}
                  options={VARIANT_OPTIONS.default}
                  onChange={v => updateVocabulary('variants.default', v)}
                />
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40 mb-2">Subtle / muted variant</div>
              <div className="flex items-center gap-4">
                <code className="text-xs text-white/30 w-20">subtle</code>
                <span className="text-white/20 text-xs">→</span>
                <Select
                  value={vocabulary.variants.subtle}
                  options={VARIANT_OPTIONS.subtle}
                  onChange={v => updateVocabulary('variants.subtle', v)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scale style */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-5">Scale Style</h2>
          <div className="space-y-5">
            {Object.entries(SCALE_OPTIONS).map(([foundation, opts]) => (
              <div key={foundation}>
                <div className="text-xs text-white/40 mb-2 capitalize">{foundation}</div>
                <ScaleRadio
                  value={vocabulary.scales[foundation]}
                  options={opts}
                  onChange={v => updateVocabulary(`scales.${foundation}`, v)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live preview — color tokens */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Color Token Names</h2>
          <div>
            {previewColorTokens.map(id => {
              const token = semanticColorTokens.find(t => t.id === id)
              if (!token) return null
              const derived = deriveColorTokenName(token.concept, vocabulary)
              const changed = derived !== id
              return (
                <TokenPreviewRow
                  key={id}
                  label={colorOf(id)}
                  before={id}
                  after={derived}
                  changed={changed}
                />
              )
            })}
          </div>
        </div>

        {/* Live preview — typography tokens */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Typography Token Names</h2>
          <div>
            {previewTypoTokens.map(token => {
              const derived = deriveTypographyTokenName(token.concept, vocabulary)
              const changed = derived !== token.id
              return (
                <TokenPreviewRow
                  key={token.id}
                  label="#888"
                  before={token.id}
                  after={derived}
                  changed={changed}
                />
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
