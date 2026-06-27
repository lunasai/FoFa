import { useState } from 'react'
import clsx from 'clsx'
import { Plus, X, ChevronDown, ChevronUp, Search, Check, Link2, SlidersHorizontal, Info, CornerDownLeft } from 'lucide-react'
import { computeClamp } from '../lib/typographyUtils'
import { GOOGLE_FONTS, buildStack, buildGoogleFontUrl, parseGoogleFontsUrl } from '../lib/googleFonts'
import { InlineNameEdit } from '../components/ScaleTable'
import { SectionHeading } from '../components/SectionHeading'

const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900]

// Role-aware preview copy. Keyword match first, size-based inference as fallback
// so custom tokens (any role) still get friendly, realistic sample text.
// Andy Warhol-inspired sample copy, per role.
const ROLE_SAMPLES = {
  heading: 'I want to be a machine',
  body: 'In the future, everyone will be world-famous for fifteen minutes.',
  label: 'Tomato Soup',
  caption: 'Silkscreen on canvas, 1962',
}

const ROLE_KEYWORDS = [
  { bucket: 'heading', re: /(^|[^a-z])(head|display|title|hero|headline|h[1-6])/ },
  { bucket: 'label',   re: /(^|[^a-z])(label|button|btn|tag|badge|nav|link|eyebrow|overline|kicker|chip|menu)/ },
  { bucket: 'caption', re: /(^|[^a-z])(caption|hint|helper|meta|footnote|disclaimer|legal|fine|note)/ },
  { bucket: 'body',    re: /(^|[^a-z])(body|paragraph|text|prose|copy|lead|subtitle|subhead|quote)/ },
]

function roleBucket(token, sizeSteps) {
  const key = `${token.concept?.role ?? ''} ${token.id ?? ''}`.toLowerCase()
  for (const { bucket, re } of ROLE_KEYWORDS) if (re.test(key)) return bucket

  // Fallback: infer from where this token's size sits in the scale.
  const maxes = (sizeSteps ?? []).map(s => s.max).filter(Number.isFinite)
  if (maxes.length === 0) return 'body'
  const hi = Math.max(...maxes), lo = Math.min(...maxes)
  const v = sizeSteps.find(s => s.step === token.size)?.max ?? lo
  if (hi === lo) return 'body'
  const t = (v - lo) / (hi - lo)
  if (t >= 0.62) return 'heading'
  if (t <= 0.18) return 'caption'
  return 'body'
}

function sampleForToken(token, sizeSteps) {
  return ROLE_SAMPLES[roleBucket(token, sizeSteps)]
}

const SPECIMEN_LINES = [
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789',
  '!@#$%^&*()-_=+[]{};:\'",.<>/?',
]

const dropdownCls = 'bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-white/30 font-mono cursor-pointer'
const inputCls    = 'bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center outline-none focus:border-white/30'

const slugFamily = raw => String(raw).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// ── Font picker (Google Fonts dropdown + paste URL) ───────────────────────────

function FontPicker({ onSelect, currentFamily }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [active, setActive] = useState(0)
  const [err, setErr] = useState('')

  const trimmed = value.trim()
  const isUrl = /^https?:\/\//i.test(trimmed) || /fonts\.googleapis\.com/i.test(trimmed)
  const parsed = isUrl ? parseGoogleFontsUrl(trimmed) : null
  const q = trimmed.toLowerCase()
  const fontResults = isUrl
    ? []
    : (q ? GOOGLE_FONTS.filter(f => f.family.toLowerCase().includes(q)) : GOOGLE_FONTS).slice(0, 50)

  const count = isUrl ? 1 : fontResults.length
  const activeIdx = Math.min(active, Math.max(0, count - 1))

  function reset() { setValue(''); setOpen(false); setErr(''); setActive(0) }

  function pickGoogle(f) {
    onSelect({
      family: f.family,
      stack: buildStack(f.family, f.category),
      url: buildGoogleFontUrl(f.family, f.weights),
      category: f.category,
      source: 'google',
    })
    reset()
  }

  function applyUrl() {
    if (!parsed) { setErr('That doesn’t look like a Google Fonts URL.'); return }
    onSelect({
      family: parsed.family,
      stack: buildStack(parsed.family, parsed.category),
      url: parsed.url,
      category: parsed.category,
      source: 'custom-url',
    })
    reset()
  }

  function commit() {
    if (isUrl) applyUrl()
    else if (fontResults[activeIdx]) pickGoogle(fontResults[activeIdx])
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(a => Math.min(a + 1, count - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); commit() }
    else if (e.key === 'Escape') { setOpen(false) }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2.5 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2.5 focus-within:border-white/30 transition-colors">
        {isUrl
          ? <Link2 size={14} className="text-white/30 flex-shrink-0" />
          : <Search size={14} className="text-white/30 flex-shrink-0" />}
        <input
          value={value}
          onChange={e => { setValue(e.target.value); setOpen(true); setErr(''); setActive(0) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          placeholder="Search Google Fonts or paste a URL…"
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
          spellCheck={false}
        />
        {value && (
          <button onMouseDown={e => e.preventDefault()} onClick={reset} className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0">
            <X size={13} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-20 py-1 max-h-72 overflow-y-auto">
          {isUrl ? (
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={applyUrl}
              className={clsx('w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors', parsed ? 'hover:bg-white/[0.07] bg-white/[0.04]' : 'opacity-60 cursor-default')}
            >
              <Link2 size={14} className="text-white/40 flex-shrink-0" />
              {parsed ? (
                <span className="flex-1 min-w-0">
                  <span className="text-sm text-white/85">Use “{parsed.family}”</span>
                  <span className="block text-[10px] text-white/30 truncate">{parsed.category} · from URL</span>
                </span>
              ) : (
                <span className="flex-1 text-sm text-white/40">Waiting for a valid fonts.googleapis.com URL…</span>
              )}
              {parsed && <CornerDownLeft size={13} className="text-white/25 flex-shrink-0" />}
            </button>
          ) : fontResults.length === 0 ? (
            <div className="px-3 py-2 text-xs text-white/30">Nothing matches “{value}”. Try another.</div>
          ) : (
            fontResults.map((f, i) => (
              <button
                key={f.family}
                onMouseDown={e => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => pickGoogle(f)}
                className={clsx('w-full flex items-center justify-between gap-3 px-3 py-1.5 text-left transition-colors', i === activeIdx ? 'bg-white/[0.07]' : 'hover:bg-white/5')}
              >
                <span className="flex items-center gap-2 min-w-0">
                  {currentFamily === f.family
                    ? <Check size={12} className="text-emerald-400/70 flex-shrink-0" />
                    : <span className="w-3 flex-shrink-0" />}
                  <span className="text-sm text-white/85 truncate">{f.family}</span>
                </span>
                <span className="text-[10px] text-white/25 flex-shrink-0">{f.category}</span>
              </button>
            ))
          )}
        </div>
      )}

      {err && <div className="text-[11px] text-red-400/80 mt-1.5">{err}</div>}
    </div>
  )
}

// ── Font family row ─────────────────────────────────────────────────────────

function FontFamilyRow({ name, stack, meta, onRename, onSelectFont, onRemove, canRemove }) {
  const [expanded, setExpanded] = useState(false)
  const [nameDraft, setNameDraft] = useState(name)
  const typeface = meta?.family
  const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Untitled'

  function commitName() {
    const t = nameDraft.trim()
    if (t && t !== name) onRename(t)
    else setNameDraft(name)
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      {/* Header — token name rendered in its own typeface */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex-1 min-w-0">
          <div className="text-3xl text-white/90 truncate leading-tight" style={{ fontFamily: stack }}>
            {displayName}
          </div>
          <div className="mt-1.5 text-xs text-white/45 truncate" style={{ fontFamily: stack }}>
            {typeface || 'No font selected'}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-white/30 hover:text-white/70 transition-colors p-1"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded: token name editor + font picker + specimen */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/[0.06]">
          <div className="pt-4 space-y-4">
            {/* Token name */}
            <div>
              <div className="text-[10px] font-semibold text-white/20 uppercase tracking-wider mb-1.5">Alias</div>
              <input
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() } }}
                placeholder="sans"
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                spellCheck={false}
              />
              <div className="mt-1.5 text-[11px] font-mono text-white/25">
                typography.fontFamily.<span className="text-white/55">{slugFamily(nameDraft) || '…'}</span>
              </div>
            </div>

            {/* Typeface picker */}
            <div>
              <div className="text-[10px] font-semibold text-white/20 uppercase tracking-wider mb-1.5">Typeface</div>
              <FontPicker onSelect={onSelectFont} currentFamily={typeface} />
              {typeface && (
                <div className="flex items-center gap-1.5 text-[11px] text-white/40 mt-2">
                  <Check size={12} className="text-emerald-400/70" />
                  <span className="font-mono">{stack}</span>
                </div>
              )}
            </div>

            {/* Specimen */}
            <div>
              <div className="text-[10px] font-semibold text-white/20 uppercase tracking-wider mb-2">Specimen</div>
              <div
                className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-4 space-y-1"
                style={{ fontFamily: stack, color: 'rgba(255,255,255,0.85)' }}
              >
                {SPECIMEN_LINES.map((line, i) => (
                  <div key={i} style={{ fontSize: 22, lineHeight: 1.4, wordBreak: 'break-all' }}>{line}</div>
                ))}
              </div>
            </div>

            {/* Delete */}
            {canRemove && (
              <div className="pt-1 flex justify-end">
                <button
                  onClick={onRemove}
                  className="flex items-center gap-1.5 text-[11px] text-white/20 hover:text-red-400 transition-colors"
                >
                  <X size={12} /> Remove typeface
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Type ramp (replaces flat table) ──────────────────────────────────────────

function TypeRamp({ steps, viewport, baseSize, fontFamily, onUpdate, onRename, onRemove, autoEditStep, onConsumedAutoFocus }) {
  const [vt, setVt] = useState(0.5)
  const [expanded, setExpanded] = useState(null)

  const sorted = [...steps].sort((a, b) => b.max - a.max)
  const currentVw = Math.round(viewport.min + (viewport.max - viewport.min) * vt)
  const DISPLAY_CAP = 72

  function lerpPx(entry) {
    return (entry.min + (entry.max - entry.min) * vt) * baseSize
  }

  return (
    <div>
      {/* Viewport scrubber */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[10px] font-mono text-white/20 w-16 text-right flex-shrink-0 tabular-nums">{viewport.min}px</span>
        <input
          type="range" min={0} max={1} step={0.001} value={vt}
          onChange={e => setVt(Number(e.target.value))}
          className="flex-1 cursor-pointer h-px"
          style={{ accentColor: 'rgba(255,255,255,0.5)' }}
        />
        <span className="text-[10px] font-mono text-white/20 w-16 flex-shrink-0 tabular-nums">{viewport.max}px</span>
        <span className="text-[10px] font-mono text-white/50 bg-white/[0.06] border border-white/[0.08] rounded-md px-2 py-0.5 w-16 text-center flex-shrink-0 tabular-nums">
          {currentVw}px
        </span>
      </div>

      {/* Ramp */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
        {sorted.map((entry, i) => {
          const isLast = i === sorted.length - 1
          const isExpanded = expanded === entry.step
          const rawPx = lerpPx(entry)
          const displayPx = Math.min(rawPx, DISPLAY_CAP)
          const minPx = Math.round(entry.min * baseSize)
          const maxPx = Math.round(entry.max * baseSize)
          const isFluid = Math.abs(entry.max - entry.min) > 0.001
          const minRem = parseFloat(entry.min.toFixed(4))
          const maxRem = parseFloat(entry.max.toFixed(4))

          return (
            <div key={entry.step} className={clsx(!isLast && 'border-b border-white/[0.04]')}>
              <div
                className={clsx(
                  'flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors',
                  isExpanded ? 'bg-white/[0.025]' : 'hover:bg-white/[0.015]'
                )}
                onClick={() => setExpanded(s => s === entry.step ? null : entry.step)}
              >
                {/* Step name */}
                <div className="w-10 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <InlineNameEdit
                    value={entry.step}
                    onRename={onRename}
                    autoFocus={autoEditStep === entry.step}
                    onConsumedAutoFocus={onConsumedAutoFocus}
                  />
                </div>

                {/* Live text preview */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <span style={{
                    fontFamily,
                    fontSize: displayPx,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}>
                    The quick brown fox
                  </span>
                </div>

                {/* Size + remove */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[10px] font-mono text-white/25 tabular-nums">{Math.round(rawPx)}px</span>
                  <button
                    onClick={e => { e.stopPropagation(); onRemove(entry.step) }}
                    className="text-white/15 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Expanded: min/max edit panel */}
              {isExpanded && (
                <div
                  className="flex items-center gap-5 px-5 py-3 border-t border-white/[0.04] bg-white/[0.015]"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/25 w-6">min</span>
                    <input type="number" value={minPx} min={1} max={200} step={1}
                      onChange={e => onUpdate({ ...entry, min: Number(e.target.value) / baseSize })}
                      className={`w-14 ${inputCls}`}
                    />
                    <span className="text-[10px] text-white/20">px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/25 w-6">max</span>
                    <input type="number" value={maxPx} min={1} max={200} step={1}
                      onChange={e => onUpdate({ ...entry, max: Number(e.target.value) / baseSize })}
                      className={`w-14 ${inputCls}`}
                    />
                    <span className="text-[10px] text-white/20">px</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/15 ml-auto">
                    {isFluid ? `${minRem} → ${maxRem}rem` : `${minRem}rem`}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Semantic token row ────────────────────────────────────────────────────────

function SemanticRow({ token, sizeSteps, fontFamily, baseSize, onChange, onRemove, index, total }) {
  const sizeEntry = sizeSteps.find(s => s.step === token.size)
  const resolvedFamily = fontFamily[token.family] ?? Object.values(fontFamily)[0]
  const previewSize = Math.min((sizeEntry?.max ?? 1) * baseSize, 72)

  return (
    <div className={clsx('flex items-stretch', index < total - 1 && 'border-b border-white/[0.04]')}>

      {/* Left — live text preview, dominant ~60% */}
      <div className="flex-1 min-w-0 flex items-center px-6 py-5">
        <span style={{
          fontFamily: resolvedFamily,
          fontSize: previewSize,
          fontWeight: token.weight ?? 400,
          lineHeight: token.leading ?? 1.15,
          letterSpacing: `${token.tracking ?? 0}em`,
          color: 'rgba(255,255,255,0.88)',
          display: 'block',
        }}>
          {sampleForToken(token, sizeSteps)}
        </span>
      </div>

      {/* Column divider */}
      <div className="w-px bg-white/[0.04] flex-shrink-0 my-3" />

      {/* Right — token id, description, controls ~40% */}
      <div className="flex-1 flex flex-col justify-between gap-3 px-4 py-4 min-w-0">

        {/* Identity row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-white/60 truncate">{token.id}</div>
            <div className="text-[10px] text-white/30 truncate mt-0.5">{token.description}</div>
          </div>
          <button onClick={onRemove} title="Remove token"
            className="text-white/15 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
            <X size={12} />
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-1.5">
          {/* Size · family · weight */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/25">size</span>
              <select value={token.size} onChange={e => onChange('size', e.target.value)} className={dropdownCls}>
                {sizeSteps.map(s => <option key={s.step} value={s.step} style={{ background: '#111' }}>{s.step}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/25">family</span>
              <select value={token.family ?? 'sans'} onChange={e => onChange('family', e.target.value)} className={dropdownCls}>
                {Object.keys(fontFamily).map(k => <option key={k} value={k} style={{ background: '#111' }}>{k}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/25">weight</span>
              <select value={token.weight ?? 400} onChange={e => onChange('weight', Number(e.target.value))} className={dropdownCls}>
                {WEIGHTS.map(w => <option key={w} value={w} style={{ background: '#111' }}>{w}</option>)}
              </select>
            </div>
          </div>
          {/* Leading · tracking */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/25">lh</span>
              <input type="number" value={token.leading ?? 1.5} min={0.8} max={3} step={0.05}
                onChange={e => onChange('leading', Number(e.target.value))}
                className={`w-14 ${inputCls}`} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/25">ls</span>
              <input type="number" value={token.tracking ?? 0} min={-0.1} max={0.25} step={0.005}
                onChange={e => onChange('tracking', Number(e.target.value))}
                className={`w-14 ${inputCls}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Add text style modal (custom only — typography has no rule-based presets) ──

const modalFieldCls = 'w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none appearance-none cursor-pointer'

function TypographyTokenModal({ sizeSteps, fontFamily, baseSize, existingIds, onAdd, onClose }) {
  const [suffix, setSuffix] = useState('')
  const [size, setSize] = useState(sizeSteps.find(s => s.step === 'md')?.step ?? sizeSteps[0]?.step ?? 'md')
  const [family, setFamily] = useState(Object.keys(fontFamily)[0] ?? 'sans')
  const [weight, setWeight] = useState(400)
  const [leading, setLeading] = useState(1.5)
  const [tracking, setTracking] = useState(0)
  const [desc, setDesc] = useState('')

  const trimmed = suffix.trim()
  const id = `type.${trimmed}`
  const exists = trimmed ? existingIds.has(id) : false
  const canAdd = !!trimmed && !exists

  const sizeEntry = sizeSteps.find(s => s.step === size)
  const previewSize = Math.min((sizeEntry?.max ?? 1) * baseSize, 44)
  const resolvedFamily = fontFamily[family] ?? Object.values(fontFamily)[0]

  function handleAdd() {
    if (!canAdd) return
    onAdd({
      id,
      size, family, weight, leading, tracking,
      description: desc.trim() || id,
      concept: { role: trimmed, scaleRank: null, tshirtStep: null },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-[520px] max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Add text style</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors"><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {/* Live preview */}
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] px-4 py-3 overflow-hidden whitespace-nowrap" style={{
            fontFamily: resolvedFamily,
            fontSize: previewSize,
            fontWeight: weight,
            lineHeight: leading,
            letterSpacing: `${tracking}em`,
            color: 'rgba(255,255,255,0.9)',
            textOverflow: 'ellipsis',
          }}>
            {sampleForToken({ id, size, concept: { role: trimmed } }, sizeSteps)}
          </div>

          {/* Name */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 w-14 flex-shrink-0">Name</span>
            <div className="flex items-center gap-1.5 flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2">
              <span className="text-xs font-mono text-white/25">type.</span>
              <input
                autoFocus
                value={suffix}
                onChange={e => setSuffix(e.target.value)}
                placeholder="display.hero"
                className="flex-1 bg-transparent text-xs font-mono text-white outline-none placeholder-white/15"
              />
            </div>
          </div>

          {/* Size */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 w-14 flex-shrink-0">Font size</span>
            <div className="relative flex-1">
              <select value={size} onChange={e => setSize(e.target.value)} className={modalFieldCls}>
                {sizeSteps.map(s => <option key={s.step} value={s.step} style={{ background: '#111' }}>{s.step}</option>)}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">▾</div>
            </div>
          </div>

          {/* Family */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 w-14 flex-shrink-0">Typeface</span>
            <div className="relative flex-1">
              <select value={family} onChange={e => setFamily(e.target.value)} className={modalFieldCls}>
                {Object.keys(fontFamily).map(k => <option key={k} value={k} style={{ background: '#111' }}>{k}</option>)}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">▾</div>
            </div>
          </div>

          {/* Weight */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 w-14 flex-shrink-0">Weight</span>
            <div className="relative flex-1">
              <select value={weight} onChange={e => setWeight(Number(e.target.value))} className={modalFieldCls}>
                {WEIGHTS.map(w => <option key={w} value={w} style={{ background: '#111' }}>{w}</option>)}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">▾</div>
            </div>
          </div>

          {/* Leading + Tracking */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 w-14 flex-shrink-0">Metrics</span>
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-1.5">
                <input type="number" value={leading} min={0.8} max={3} step={0.05}
                  onChange={e => setLeading(Number(e.target.value))} className={`w-16 ${inputCls}`} />
                <span className="text-[10px] text-white/30">leading</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input type="number" value={tracking} min={-0.1} max={0.25} step={0.005}
                  onChange={e => setTracking(Number(e.target.value))} className={`w-16 ${inputCls}`} />
                <span className="text-[10px] text-white/30">tracking</span>
              </div>
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
              <span className="text-[10px] text-white/30 font-mono">type.</span>
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

export default function TypographySection({ store }) {
  const {
    typography, setTypography, updateTypographyStepName,
    addFontFamily, selectFontFamily, renameFontFamily, removeFontFamily,
    addTypographySemantic, removeTypographySemantic,
  } = store
  const { fontFamily, fontMeta = {}, baseSize = 16, viewport = { min: 320, max: 1440 }, viewportAnchors = {} } = typography
  const fallbackFamily = Object.values(fontFamily)[0]
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [showSizeAdvanced, setShowSizeAdvanced] = useState(false)
  const [autoEditStep, setAutoEditStep] = useState(null)

  // Fluid range references the smallest / largest breakpoint tokens (defined in Layout).
  const sortedBps = [...(store.spacing?.breakpoints ?? [])].sort((a, b) => a.width - b.width)
  const minBp = sortedBps[0]
  const maxBp = sortedBps[sortedBps.length - 1]

  function set(patch) { setTypography(prev => ({ ...prev, ...patch })) }

  function updateSizeStep(step, updated) {
    setTypography(prev => ({ ...prev, size: prev.size.map(s => s.step === step ? updated : s) }))
  }

  function addSizeStep() {
    const names = new Set(typography.size.map(s => s.step))
    let name = 'new', i = 2
    while (names.has(name)) { name = `new-${i}`; i++ }
    setTypography(prev => ({ ...prev, size: [...prev.size, { step: name, min: 1, max: 1.25 }] }))
    setAutoEditStep(name)
  }

  function removeSizeStep(step) {
    setTypography(prev => ({ ...prev, size: prev.size.filter(s => s.step !== step) }))
  }

  function updateSemantic(id, field, value) {
    setTypography(prev => ({ ...prev, semantic: prev.semantic.map(s => s.id === id ? { ...s, [field]: value } : s) }))
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight">Typography</h1>
        <p className="text-sm text-white/40 mt-1">Pick your typefaces and font sizes, then define the text styles you'll reuse everywhere.</p>
      </div>

      {/* Font Families */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <SectionHeading
            label="Typefaces"
            techAlias="font-family tokens"
            tooltip="Font family definitions exported as CSS custom properties (e.g. var(--font-sans)). Text styles reference these slots by name, so swapping a typeface here updates every style that uses it."
          />
          <button
            onClick={addFontFamily}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
          >
            <Plus size={12} /> Add typeface
          </button>
        </div>
        <div className="space-y-4">
          {Object.entries(fontFamily).map(([key, stack]) => (
            <FontFamilyRow
              key={key}
              name={key}
              stack={stack}
              meta={fontMeta[key]}
              canRemove={Object.keys(fontFamily).length > 1}
              onRename={newName => renameFontFamily(key, newName)}
              onSelectFont={payload => selectFontFamily(key, payload)}
              onRemove={() => removeFontFamily(key)}
            />
          ))}
        </div>
      </section>

      {/* Size Scale */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <SectionHeading
            label="Font Sizes"
            techAlias="type scale · primitive tokens"
            tooltip="Raw size values that form your fluid type scale. Each step outputs a CSS clamp() that scales between its min and max values across the defined viewport range. Text styles reference these steps by name."
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSizeAdvanced(v => !v)}
              className={clsx(
                'flex items-center gap-1.5 text-xs transition-colors border rounded-lg px-3 py-1.5',
                showSizeAdvanced
                  ? 'text-white/70 border-white/20 bg-white/[0.04]'
                  : 'text-white/40 hover:text-white/70 border-white/10 hover:border-white/20'
              )}
            >
              <SlidersHorizontal size={12} /> Advanced
              {showSizeAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <button
              onClick={addSizeStep}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
            >
              <Plus size={12} /> Add font size
            </button>
          </div>
        </div>

        {showSizeAdvanced && (
          <div className="mb-5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <span className="text-white/30 mr-1">Base size</span>
                1rem =
                <input type="number" value={baseSize} min={10} max={24} step={1}
                  onChange={e => set({ baseSize: Number(e.target.value) })}
                  className={`w-12 ${inputCls}`} />
                px
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-white/30">Min at</span>
                <select
                  value={viewportAnchors.min ?? minBp?.id ?? ''}
                  onChange={e => set({ viewportAnchors: { ...viewportAnchors, min: e.target.value } })}
                  className={dropdownCls}
                >
                  {sortedBps.map(bp => (
                    <option key={bp.id} value={bp.id} style={{ background: '#111' }}>{bp.id} · {bp.width}px</option>
                  ))}
                </select>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-white/30">Max at</span>
                <select
                  value={viewportAnchors.max ?? maxBp?.id ?? ''}
                  onChange={e => set({ viewportAnchors: { ...viewportAnchors, max: e.target.value } })}
                  className={dropdownCls}
                >
                  {sortedBps.map(bp => (
                    <option key={bp.id} value={bp.id} style={{ background: '#111' }}>{bp.id} · {bp.width}px</option>
                  ))}
                </select>
              </span>
              <span className="relative group ml-auto flex items-center">
                <Info size={13} className="text-white/25 hover:text-white/50 transition-colors cursor-help" />
                <span className="pointer-events-none absolute right-0 top-full mt-2 w-64 rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2 text-[11px] text-white/50 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-20">
                  The <span className="text-white/70">Min</span> and <span className="text-white/70">Max</span> columns below are the sizes at these two breakpoints; everything in between scales fluidly. Manage breakpoints in the <span className="text-white/70">Layout</span> tab.
                </span>
              </span>
            </div>
          </div>
        )}

        <TypeRamp
          steps={typography.size}
          viewport={viewport}
          baseSize={baseSize}
          fontFamily={fallbackFamily}
          onUpdate={updated => updateSizeStep(updated.step, updated)}
          onRename={updateTypographyStepName}
          onRemove={removeSizeStep}
          autoEditStep={autoEditStep}
          onConsumedAutoFocus={() => setAutoEditStep(null)}
        />
      </section>

      {/* Semantic tokens */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <SectionHeading
            label="Text Styles"
            techAlias="semantic tokens"
            tooltip="Composite typography tokens — size step + family + weight + leading + tracking — bound to a UI role. Each token exports a set of CSS custom properties or a utility class you can apply to any text element."
          />
          <button
            onClick={() => setShowTokenModal(true)}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
          >
            <Plus size={12} /> Add text style
          </button>
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
              onRemove={() => removeTypographySemantic(token.id)}
            />
          ))}
        </div>
      </section>

      {showTokenModal && (
        <TypographyTokenModal
          sizeSteps={typography.size}
          fontFamily={fontFamily}
          baseSize={baseSize}
          existingIds={new Set(typography.semantic.map(t => t.id))}
          onAdd={addTypographySemantic}
          onClose={() => setShowTokenModal(false)}
        />
      )}
    </div>
  )
}
