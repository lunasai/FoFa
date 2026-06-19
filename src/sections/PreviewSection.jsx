import { resolveSemanticColor, SCALE_STEPS, getContrastColor } from '../lib/colorUtils'

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
    const entry = typography.scale.find(s => s.step === token?.step)
    if (!entry) return {}
    return { fontSize: `${entry.size}px`, fontWeight: entry.weight, lineHeight: entry.lineHeight }
  }

  const brandPalette = colorPalettes[0]
  const sans = typography.fontFamily.sans
  const mono = typography.fontFamily.mono

  const bg     = color('color.background.default')
  const surf   = color('color.surface.default')
  const border = color('color.border.default')
  const tp     = color('color.text.primary')
  const ts     = color('color.text.secondary')
  const td     = color('color.text.disabled')
  const brand  = color('color.brand.default')
  const brandH = color('color.brand.default.hover')
  const brandS = color('color.brand.subtle')
  const brandT = color('color.brand.text')

  const successC  = color('color.success.default')
  const successBg = color('color.success.subtle')
  const warningC  = color('color.warning.default')
  const warningBg = color('color.warning.subtle')
  const dangerC   = color('color.danger.default')
  const dangerBg  = color('color.danger.subtle')

  const cardR  = radius('card')
  const badgeR = radius('badge')
  const btnR   = radius('button')

  const onBrand = getContrastColor(brand)

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
            <div style={{ color: onBrand, fontFamily: sans, ...typeStyle('heading.xl'), lineHeight: 1, marginBottom: 8 }}>
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
            {[...typography.scale].reverse().map(e => (
              <div key={e.step} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <div style={{ color: tp, fontSize: Math.min(e.size, 42), fontWeight: e.weight, lineHeight: 1.1, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  The quick brown fox
                </div>
                <span style={{ color: td, fontSize: 10, fontFamily: mono, flexShrink: 0 }}>{e.size}px</span>
              </div>
            ))}
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
            { label: 'color.background.default', bg: bg, border: border },
            { label: 'color.surface.default',    bg: surf, border: border },
            { label: 'color.background.subtle',  bg: color('color.background.subtle'), border: border },
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
            Spacing · base {spacing.baseUnit}px
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {spacing.scale.filter(m => m > 0 && m <= 16).map(m => {
              const px = m * spacing.baseUnit
              const maxPx = 16 * spacing.baseUnit
              return (
                <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: (px / maxPx) * 140, height: 6, borderRadius: '3px', background: brand, opacity: 0.6, flexShrink: 0 }} />
                  <span style={{ color: td, fontSize: 9 }}>{px}px</span>
                </div>
              )
            })}
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
    </div>
  )
}
