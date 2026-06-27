import { resolveSemanticColor, SCALE_STEPS, getContrastColor, contrastRatio, wcagLevel } from '../lib/colorUtils'

function PairingRow({ fgHex, bgHex, fgLabel, bgLabel, sans, mono }) {
  const ratio = contrastRatio(fgHex, bgHex)
  const level = wcagLevel(ratio)
  const lvlColor = level === 'AAA' ? '#4ade80' : level === 'AA' ? '#86efac' : level === 'AA Large' ? '#fbbf24' : '#f87171'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ background: bgHex, borderRadius: 6, padding: '5px 12px', flexShrink: 0, width: 52, textAlign: 'center', boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }}>
        <span style={{ color: fgHex, fontFamily: sans, fontSize: 14, fontWeight: 700, lineHeight: 1 }}>Aa</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontFamily: mono, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fgLabel}</div>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontFamily: mono, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bgLabel}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: mono, fontSize: 11 }}>{ratio.toFixed(2)}:1</span>
        <span style={{ color: lvlColor, fontFamily: mono, fontSize: 10, fontWeight: 600, background: `${lvlColor}22`, borderRadius: 4, padding: '2px 6px', border: `1px solid ${lvlColor}44` }}>{level}</span>
      </div>
    </div>
  )
}

function PairingGroup({ title, pairs, sans, mono, border }) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${border}`, padding: '16px 20px', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontFamily: mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      {pairs.map((p, i) => <PairingRow key={i} {...p} sans={sans} mono={mono} />)}
    </div>
  )
}

export default function PreviewSection({ store }) {
  const { colorPalettes, semanticColorTokens, typography, spacing, shapes } = store

  function color(tokenId) {
    const token = semanticColorTokens.find(t => t.id === tokenId)
    if (!token) return '#cccccc'
    return resolveSemanticColor(token, colorPalettes)
  }

  function radius(tokenId) {
    const token = shapes.semantic.find(t => t.id === tokenId)
    const step = token?.step || 'md'
    const entry = shapes.scale.find(s => s.step === step)
    return entry ? (entry.value === 9999 ? '9999px' : `${entry.value}px`) : '8px'
  }

  function typeStyle(tokenId) {
    const token = typography.semantic.find(t => t.id === tokenId)
    if (!token) return {}
    const sizeEntry = typography.size?.find(s => s.step === token.size)
    const baseSize  = typography.baseSize ?? 16
    return {
      fontSize:      sizeEntry ? Math.min(sizeEntry.max * baseSize, 64) : 16,
      fontFamily:    typography.fontFamily?.[token.family ?? 'sans'] ?? typography.fontFamily?.sans,
      fontWeight:    token.weight  ?? 400,
      lineHeight:    token.leading ?? 1.5,
      letterSpacing: `${token.tracking ?? 0}em`,
    }
  }

  const brandPalette = colorPalettes[0]
  const sans = typography.fontFamily.sans
  const mono = typography.fontFamily.mono

  const bg     = color('color.bg.default')
  const surf   = color('color.surface.default')
  const border = color('color.border.default')
  const tp     = color('color.text.primary')
  const ts     = color('color.text.secondary')
  const td     = color('color.text.disabled')
  const brand  = color('color.bg.brand.solid')
  const brandH = color('color.bg.brand.solid.hover')
  const brandS = color('color.bg.brand.subtle')
  const brandT = color('color.text.brand')

  const successC  = color('color.bg.success.solid')
  const successBg = color('color.bg.success.subtle')
  const warningC  = color('color.bg.warning.solid')
  const warningBg = color('color.bg.warning.subtle')
  const dangerC   = color('color.bg.danger.solid')
  const dangerBg  = color('color.bg.danger.subtle')

  const cardR  = radius('radius.card')
  const badgeR = radius('radius.badge')
  const btnR   = radius('radius.button')

  const onBrand   = color('color.on.brand')
  const onWarning = color('color.on.warning')

  const gap = 10

  const tile = (extra = {}) => ({
    borderRadius: cardR,
    overflow: 'hidden',
    ...extra,
  })

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Preview</h1>
        <p className="text-sm text-white/40 mt-1">Your system, expressed.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap }}>

        {/* HERO — brand color, big type */}
        <div style={{ ...tile({ background: brand, padding: 32, gridColumn: '1', gridRow: '1 / 3' }), display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 260 }}>
          <div style={{ color: onBrand, opacity: 0.5, fontSize: 11, fontFamily: mono, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {brandPalette?.name}
          </div>
          <div>
            <div style={{ color: onBrand, fontFamily: sans, ...typeStyle('type.heading.xl'), lineHeight: 1, marginBottom: 8 }}>
              Aa
            </div>
            <div style={{ color: onBrand, opacity: 0.6, fontFamily: mono, fontSize: 12 }}>
              {brand}
            </div>
          </div>
        </div>

        {/* Brand scale — vertical stack */}
        <div style={{ ...tile({ overflow: 'hidden', gridColumn: '2', gridRow: '1 / 3' }), display: 'flex', flexDirection: 'column' }}>
          {brandPalette && SCALE_STEPS.map(step => (
            <div
              key={step}
              style={{ flex: 1, background: brandPalette.scale[step], display: 'flex', alignItems: 'center', paddingLeft: 12 }}
            >
              <span style={{ fontSize: 9, fontFamily: mono, color: getContrastColor(brandPalette.scale[step]), opacity: 0.5 }}>{step}</span>
            </div>
          ))}
        </div>

        {/* Neutral scale */}
        <div style={{ ...tile({ overflow: 'hidden', gridColumn: '3', gridRow: '1 / 3' }), display: 'flex', flexDirection: 'column' }}>
          {colorPalettes[1] && SCALE_STEPS.map(step => (
            <div
              key={step}
              style={{ flex: 1, background: colorPalettes[1].scale[step], display: 'flex', alignItems: 'center', paddingLeft: 12 }}
            >
              <span style={{ fontSize: 9, fontFamily: mono, color: getContrastColor(colorPalettes[1].scale[step]), opacity: 0.5 }}>{step}</span>
            </div>
          ))}
        </div>

        {/* Typography showcase */}
        <div style={{ ...tile({ background: bg, border: `1px solid ${border}`, padding: 28, gridColumn: '1 / 3' }), fontFamily: sans }}>
          <div style={{ color: td, fontSize: 10, fontFamily: mono, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
            {sans.split(',')[0]}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...(typography.size ?? [])].reverse().map(e => {
              const baseSize = typography.baseSize ?? 16
              return (
                <div key={e.step} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                  <div style={{ color: tp, fontSize: Math.min(e.max * baseSize, 42), fontWeight: 600, lineHeight: 1.1, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    The quick brown fox
                  </div>
                  <span style={{ color: td, fontSize: 10, fontFamily: mono, flexShrink: 0 }}>{e.max}rem</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Semantic status swatches */}
        <div style={{ ...tile({ background: surf, border: `1px solid ${border}`, padding: 20 }), display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Success', bg: successBg, text: successC },
            { label: 'Warning', bg: warningBg, text: warningC },
            { label: 'Danger',  bg: dangerBg,  text: dangerC },
            { label: 'Brand',   bg: brandS,    text: brandT },
          ].map(({ label, bg: b, text: t }) => (
            <div key={label} style={{ background: b, borderRadius: btnR, padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: t, fontFamily: sans, fontSize: 12, fontWeight: 600 }}>{label}</span>
              <span style={{ color: t, fontFamily: mono, fontSize: 10, opacity: 0.7 }}>{b}</span>
            </div>
          ))}
        </div>

        {/* Surface + text hierarchy */}
        <div style={{ ...tile({ border: `1px solid ${border}`, padding: 24, background: bg }), fontFamily: sans }}>
          <div style={{ color: td, fontSize: 10, fontFamily: mono, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Surfaces</div>
          {[
            { label: 'color.bg.default',    bg: bg, border: border },
            { label: 'color.surface.default', bg: surf, border: border },
            { label: 'color.bg.subtle',     bg: color('color.bg.subtle'), border: border },
          ].map(({ label, bg: b, border: bo }) => (
            <div key={label} style={{ background: b, border: `1px solid ${bo}`, borderRadius: 8, padding: '10px 14px', marginBottom: 6 }}>
              <div style={{ color: tp, fontSize: 13, fontWeight: 500 }}>Surface text</div>
              <div style={{ color: ts, fontSize: 11 }}>Secondary text</div>
              <div style={{ color: td, fontSize: 10 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Shapes */}
        <div style={{ ...tile({ background: brandS, border: `1px solid ${brandT}22`, padding: 24 }), display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', justifyContent: 'center' }}>
          {shapes.scale.filter(s => s.value > 0).map(entry => {
            const r = Math.min(entry.value, 9999)
            const size = 28 + (shapes.scale.indexOf(entry)) * 5
            return (
              <div key={entry.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: Math.min(size, 56), height: Math.min(size, 56),
                  borderRadius: entry.value === 9999 ? '9999px' : `${Math.min(r, Math.min(size, 56) / 2)}px`,
                  background: brand,
                  opacity: 0.85,
                }} />
                <span style={{ color: brandT, fontSize: 9, fontFamily: mono, opacity: 0.7 }}>{entry.step}</span>
              </div>
            )
          })}
        </div>

        {/* Spacing ramp */}
        <div style={{ ...tile({ background: surf, border: `1px solid ${border}`, padding: 20 }), fontFamily: mono }}>
          <div style={{ color: td, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
            Spacing
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {(() => {
              const steps = spacing.scale.filter(s => s.value > 0)
              const maxPx = Math.max(...steps.map(s => s.value), 1)
              return steps.map(s => (
                <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: (s.value / maxPx) * 140, height: 6, borderRadius: '3px', background: brand, opacity: 0.6, flexShrink: 0 }} />
                  <span style={{ color: td, fontSize: 9 }}>{s.value}px</span>
                </div>
              ))
            })()}
          </div>
        </div>

        {/* All palettes strip */}
        <div style={{ ...tile({ overflow: 'hidden', gridColumn: '1 / 4' }), display: 'flex', height: 36 }}>
          {colorPalettes.map(palette =>
            SCALE_STEPS.map(step => (
              <div key={`${palette.id}-${step}`} style={{ flex: 1, background: palette.scale[step] }} />
            ))
          )}
        </div>

      </div>

      {/* Accessibility — contrast pairings */}
      <div className="mt-10">
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase">Accessibility</h2>
          <span className="text-[10px] text-white/20 font-mono">WCAG 2.1 contrast</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap }}>
          <PairingGroup title="Core text" border={border} sans={sans} mono={mono} pairs={[
            { fgHex: tp, bgHex: bg,   fgLabel: 'color.text.primary',   bgLabel: 'color.bg.default' },
            { fgHex: tp, bgHex: surf, fgLabel: 'color.text.primary',   bgLabel: 'color.surface.default' },
            { fgHex: ts, bgHex: bg,   fgLabel: 'color.text.secondary', bgLabel: 'color.bg.default' },
            { fgHex: ts, bgHex: surf, fgLabel: 'color.text.secondary', bgLabel: 'color.surface.default' },
            { fgHex: td, bgHex: bg,   fgLabel: 'color.text.disabled',  bgLabel: 'color.bg.default' },
          ]} />
          <PairingGroup title="Brand" border={border} sans={sans} mono={mono} pairs={[
            { fgHex: onBrand, bgHex: brand,  fgLabel: 'color.on.brand',   bgLabel: 'color.bg.brand.solid' },
            { fgHex: onBrand, bgHex: brandH, fgLabel: 'color.on.brand',   bgLabel: 'color.bg.brand.solid.hover' },
            { fgHex: brandT,  bgHex: bg,     fgLabel: 'color.text.brand', bgLabel: 'color.bg.default' },
            { fgHex: brandT,  bgHex: brandS, fgLabel: 'color.text.brand', bgLabel: 'color.bg.brand.subtle' },
          ]} />
          <PairingGroup title="Status — solid" border={border} sans={sans} mono={mono} pairs={[
            { fgHex: color('color.on.success'), bgHex: successC, fgLabel: 'color.on.success', bgLabel: 'color.bg.success.solid' },
            { fgHex: color('color.on.warning'), bgHex: warningC, fgLabel: 'color.on.warning', bgLabel: 'color.bg.warning.solid' },
            { fgHex: color('color.on.danger'),  bgHex: dangerC,  fgLabel: 'color.on.danger',  bgLabel: 'color.bg.danger.solid' },
          ]} />
          <PairingGroup title="Status — subtle" border={border} sans={sans} mono={mono} pairs={[
            { fgHex: color('color.text.success'), bgHex: successBg, fgLabel: 'color.text.success', bgLabel: 'color.bg.success.subtle' },
            { fgHex: color('color.text.warning'), bgHex: warningBg, fgLabel: 'color.text.warning', bgLabel: 'color.bg.warning.subtle' },
            { fgHex: color('color.text.danger'),  bgHex: dangerBg,  fgLabel: 'color.text.danger',  bgLabel: 'color.bg.danger.subtle' },
          ]} />
        </div>
      </div>

      {/* Color rationale doc */}
      <div className="mt-16 border-t border-white/[0.06] pt-12">
        <div className="max-w-2xl">
          <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-6">Color Rationale</h2>

          <div className="space-y-8 text-[13px] leading-relaxed text-white/50">

            <div>
              <div className="text-white/80 font-medium mb-1">Token structure</div>
              <p>Every color token follows the pattern <code className="text-[11px] font-mono text-white/40 bg-white/[0.05] px-1.5 py-0.5 rounded">color.{'{role}'}.{'{variant}'}[.emphasis][.state]</code>. The role describes <em>what the color does</em> — not what it looks like. This means tokens stay stable even when the underlying palette changes.</p>
            </div>

            <div>
              <div className="text-white/80 font-medium mb-2">Roles</div>
              <div className="space-y-2">
                {[
                  { role: 'bg', desc: 'Page and section backgrounds. Neutral by default; tinted variants signal brand or status context.' },
                  { role: 'surface', desc: 'Elevated layers — cards, panels, modals. Sits above bg, typically white or near-white.' },
                  { role: 'border', desc: 'Dividers and outlines. Subtle for structure, stronger for emphasis, colored for status.' },
                  { role: 'text', desc: 'All readable content. Hierarchy through opacity steps: primary → secondary → disabled.' },
                  { role: 'on', desc: 'Text and icons placed directly on a solid fill. Auto-paired to guarantee contrast.' },
                ].map(({ role, desc }) => (
                  <div key={role} className="flex gap-3">
                    <code className="text-[11px] font-mono text-white/40 bg-white/[0.05] px-1.5 py-0.5 rounded h-fit flex-shrink-0 mt-0.5">{role}</code>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-white/80 font-medium mb-1">The subtle / solid split</div>
              <p>Each palette variant ships two background strengths. <strong className="text-white/70">Subtle</strong> (step 100) is a light tint — used for hover states, callout backgrounds, and status banners. <strong className="text-white/70">Solid</strong> (step 500) is the full-chroma fill — used for buttons, badges, and interactive elements. Hover and active states shift one step darker (600, 700).</p>
            </div>

            <div>
              <div className="text-white/80 font-medium mb-1">Guaranteed contrast</div>
              <p>The <code className="text-[11px] font-mono text-white/40 bg-white/[0.05] px-1.5 py-0.5 rounded">on.*</code> tokens are automatically assigned the lightest or darkest step of their palette — whichever achieves higher contrast against the solid fill. This means changing a palette hue never silently breaks foreground legibility.</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
