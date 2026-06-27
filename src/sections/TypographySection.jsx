import clsx from 'clsx'
import { Plus, X } from 'lucide-react'
import { StepNameEditor } from '../components/StepNameEditor'
import { computeClamp } from '../lib/typographyUtils'

const SAMPLE = 'The quick brown fox'
const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900]

const dropdownCls = 'bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-white/30 font-mono cursor-pointer'
const inputCls    = 'bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center outline-none focus:border-white/30'

// ── Size scale row ────────────────────────────────────────────────────────────

function SizeRow({ entry, baseSize, fontFamily, onChange, onRename, onRemove }) {
  const previewPx = Math.min(entry.max * baseSize, 32)
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-3">
        <div style={{ fontFamily, fontSize: previewPx, fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1, width: 40 }}>
          Aa
        </div>
        <StepNameEditor value={entry.step} onChange={n => onRename(entry.step, n)} />
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <input type="number" value={entry.min} min={0.5} max={8} step={0.0625}
            onChange={e => onChange({ ...entry, min: Number(e.target.value) })}
            className={`w-16 ${inputCls}`} />
          <span className="text-[10px] text-white/20">rem</span>
          <span className="text-[10px] font-mono text-white/15 w-10">{Math.round(entry.min * baseSize)}px</span>
        </div>
        <div className="flex items-center gap-1.5">
          <input type="number" value={entry.max} min={0.5} max={8} step={0.0625}
            onChange={e => onChange({ ...entry, max: Number(e.target.value) })}
            className={`w-16 ${inputCls}`} />
          <span className="text-[10px] text-white/20">rem</span>
          <span className="text-[10px] font-mono text-white/15 w-10">{Math.round(entry.max * baseSize)}px</span>
        </div>
        <button onClick={onRemove} className="text-white/20 hover:text-red-400 transition-colors">
          <X size={12} />
        </button>
      </div>
    </div>
  )
}

// ── Semantic token row ────────────────────────────────────────────────────────

function SemanticRow({ token, sizeSteps, fontFamily, baseSize, onChange, index, total }) {
  const sizeEntry = sizeSteps.find(s => s.step === token.size)
  const resolvedFamily = fontFamily[token.family] ?? fontFamily.sans

  return (
    <div className={clsx('flex items-center gap-3 px-5 py-2.5', index < total - 1 && 'border-b border-white/[0.04]')}>
      {/* Live preview */}
      <div className="w-36 flex-shrink-0 overflow-hidden whitespace-nowrap" style={{
        fontFamily: resolvedFamily,
        fontSize: Math.min((sizeEntry?.max ?? 1) * baseSize, 26),
        fontWeight: token.weight ?? 400,
        lineHeight: token.leading ?? 1.5,
        letterSpacing: `${token.tracking ?? 0}em`,
        color: 'rgba(255,255,255,0.85)',
        textOverflow: 'ellipsis',
      }}>
        {SAMPLE}
      </div>

      {/* Token id + description */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-mono text-white/80">{token.id}</div>
        <div className="text-[11px] text-white/30">{token.description}</div>
      </div>

      {/* Size */}
      <select value={token.size} onChange={e => onChange('size', e.target.value)} className={dropdownCls}>
        {sizeSteps.map(s => <option key={s.step} value={s.step} style={{ background: '#111' }}>{s.step}</option>)}
      </select>

      {/* Family */}
      <select value={token.family ?? 'sans'} onChange={e => onChange('family', e.target.value)} className={dropdownCls}>
        {Object.keys(fontFamily).map(k => <option key={k} value={k} style={{ background: '#111' }}>{k}</option>)}
      </select>

      {/* Weight */}
      <select value={token.weight ?? 400} onChange={e => onChange('weight', Number(e.target.value))} className={dropdownCls}>
        {WEIGHTS.map(w => <option key={w} value={w} style={{ background: '#111' }}>{w}</option>)}
      </select>

      {/* Leading */}
      <div className="flex items-center gap-1">
        <input type="number" value={token.leading ?? 1.5} min={0.8} max={3} step={0.05}
          onChange={e => onChange('leading', Number(e.target.value))}
          className={`w-14 ${inputCls}`} />
        <span className="text-[10px] text-white/20">lh</span>
      </div>

      {/* Tracking */}
      <div className="flex items-center gap-1">
        <input type="number" value={token.tracking ?? 0} min={-0.1} max={0.25} step={0.005}
          onChange={e => onChange('tracking', Number(e.target.value))}
          className={`w-14 ${inputCls}`} />
        <span className="text-[10px] text-white/20">em</span>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function TypographySection({ store }) {
  const { typography, setTypography, updateTypographyStepName } = store
  const { fontFamily, baseSize = 16, viewport = { min: 320, max: 1440 } } = typography

  function set(patch) { setTypography(prev => ({ ...prev, ...patch })) }

  function updateSizeStep(step, updated) {
    setTypography(prev => ({ ...prev, size: prev.size.map(s => s.step === step ? updated : s) }))
  }

  function addSizeStep() {
    setTypography(prev => ({ ...prev, size: [...prev.size, { step: 'new', min: 1, max: 1.25 }] }))
  }

  function removeSizeStep(step) {
    setTypography(prev => ({ ...prev, size: prev.size.filter(s => s.step !== step) }))
  }

  function updateSemantic(id, field, value) {
    setTypography(prev => ({ ...prev, semantic: prev.semantic.map(s => s.id === id ? { ...s, [field]: value } : s) }))
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Typography</h1>
        <p className="text-sm text-white/40 mt-1">Define font families, size scale, and semantic text roles.</p>
      </div>

      {/* Font Families */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Font Families</h2>
        <div className="grid grid-cols-2 gap-4">
          {[{ key: 'sans', label: 'Sans / UI' }, { key: 'mono', label: 'Monospace' }].map(({ key, label }) => (
            <div key={key} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="text-xs text-white/40 mb-3">{label}</div>
              <input value={fontFamily[key]} onChange={e => set({ fontFamily: { ...fontFamily, [key]: e.target.value } })}
                className="w-full bg-transparent text-sm text-white outline-none border-b border-white/10 focus:border-white/30 pb-1 transition-colors" />
              <div className="mt-4 text-2xl text-white/70" style={{ fontFamily: fontFamily[key] }}>{SAMPLE}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Size Scale */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase">Size Scale</h2>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span className="flex items-center gap-1.5">
              1rem =
              <input type="number" value={baseSize} min={10} max={24} step={1}
                onChange={e => set({ baseSize: Number(e.target.value) })}
                className={`w-12 ${inputCls}`} />
              px
            </span>
            <span className="flex items-center gap-1.5">
              Viewport
              <input type="number" value={viewport.min} min={240} max={640} step={1}
                onChange={e => set({ viewport: { ...viewport, min: Number(e.target.value) } })}
                className={`w-16 ${inputCls}`} />
              →
              <input type="number" value={viewport.max} min={768} max={2560} step={1}
                onChange={e => set({ viewport: { ...viewport, max: Number(e.target.value) } })}
                className={`w-16 ${inputCls}`} />
              px
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5">
          <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
            <div className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">Preview</div>
            <div className="flex items-center gap-5 pr-[22px]">
              <div className="flex items-center gap-1.5">
                <div className="w-16 text-[10px] font-semibold text-white/20 uppercase tracking-wider text-center">Min</div>
                <span className="w-[58px]" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-16 text-[10px] font-semibold text-white/20 uppercase tracking-wider text-center">Max</div>
                <span className="w-[58px]" />
              </div>
            </div>
          </div>
          {[...typography.size].reverse().map(entry => (
            <SizeRow key={entry.step} entry={entry} baseSize={baseSize}
              fontFamily={fontFamily.sans}
              onChange={updated => updateSizeStep(entry.step, updated)}
              onRename={updateTypographyStepName}
              onRemove={() => removeSizeStep(entry.step)} />
          ))}
          <div className="py-2">
            <button onClick={addSizeStep} className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 transition-colors">
              <Plus size={10} /> Add size step
            </button>
          </div>
        </div>
      </section>

      {/* Semantic tokens */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase">Semantic Tokens</h2>
          <div className="flex items-center gap-3 text-[10px] font-semibold text-white/20 uppercase tracking-wider pr-1">
            <span className="w-[60px] text-center">Size</span>
            <span className="w-[60px] text-center">Family</span>
            <span className="w-[60px] text-center">Weight</span>
            <span className="w-[74px] text-center">Leading</span>
            <span className="w-[74px] text-center">Tracking</span>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03]">
          {typography.semantic.map((token, i) => (
            <SemanticRow
              key={token.id}
              token={token}
              index={i}
              total={typography.semantic.length}
              sizeSteps={typography.size}
              fontFamily={fontFamily}
              baseSize={baseSize}
              onChange={(field, val) => updateSemantic(token.id, field, val)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
