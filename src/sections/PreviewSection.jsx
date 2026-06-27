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
    if (!token) return {}
    const sizeEntry = typography.size?.find(s => s.step === token.size)
    const baseSize  = typography.baseSize ?? 16
    return {
      fontSize:      sizeEntry ? Math.min(sizeEntry.max * baseSize, 64) : 16,
      fontFamily:    typography.fontFamily?.[token.family ?? 'sans'] ?? Object.values(typography.fontFamily ?? {})[0],
      fontWeight:    token.weight  ?? 400,
      lineHeight:    token.leading ?? 1.5,
      letterSpacing: `${token.tracking ?? 0}em`,
    }
  }

  const brandPalette = colorPalettes[0]
  const familyKeys = Object.keys(typography.fontFamily ?? {})
  const sans = typography.fontFamily?.sans ?? typography.fontFamily?.[familyKeys[0]] ?? 'system-ui, sans-serif'
  const mono = typography.fontFamily?.mono
    ?? typography.fontFamily?.[familyKeys.find(k => /mono/i.test(k))]
    ?? 'ui-monospace, monospace'

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
      {/* Type poster — full-width hero */}
      <div style={{
        borderRadius: cardR,
        background: brand,
        padding: '40px 48px',
        marginBottom: gap,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 220,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Top label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ color: onBrand, opacity: 0.5, fontFamily: mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {brandPalette?.name}
          </span>
          <span style={{ color: onBrand, opacity: 0.35, fontFamily: mono, fontSize: 10 }}>
            Foundation Factory
          </span>
        </div>

        {/* Big type specimen */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          <div
            style={{
              color: onBrand,
              fontFamily: sans,
              fontSize: 'clamp(64px, 8vw, 120px)',
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: '-0.03em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }}
          >
            {sans.split(',')[0].replace(/['"]/g, '').trim()}
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ color: onBrand, opacity: 0.45, fontFamily: mono, fontSize: 11, marginBottom: 2 }}>{brand}</div>
            <div style={{ color: onBrand, opacity: 0.3, fontFamily: mono, fontSize: 10 }}>brand · 500</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>

        {/* Brand palette — large color blocks, col 1 */}
        {brandPalette && (() => {
          const keySteps = [50, 300, 500, 800]
          return (
            <div style={{ ...tile({ overflow: 'hidden', gridColumn: '1', gridRow: '1 / 3' }), display: 'flex', flexDirection: 'column', minHeight: 300 }}>
              {keySteps.map((step, i) => {
                const hex = brandPalette.scale[step]
                const fg = getContrastColor(hex)
                return (
                  <div key={step} style={{ flex: i === 2 ? 2 : 1, background: hex, display: 'flex', alignItems: 'flex-end', padding: '10px 14px' }}>
                    <span style={{ fontSize: 10, fontFamily: mono, color: fg, opacity: 0.55 }}>{hex}</span>
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* Neutral palette — large color blocks, col 2 */}
        {colorPalettes[1] && (() => {
          const keySteps = [50, 300, 500, 800]
          const pal = colorPalettes[1]
          return (
            <div style={{ ...tile({ overflow: 'hidden', gridColumn: '2', gridRow: '1 / 3' }), display: 'flex', flexDirection: 'column', minHeight: 300 }}>
              {keySteps.map((step, i) => {
                const hex = pal.scale[step]
                const fg = getContrastColor(hex)
                return (
                  <div key={step} style={{ flex: i === 2 ? 2 : 1, background: hex, display: 'flex', alignItems: 'flex-end', padding: '10px 14px' }}>
                    <span style={{ fontSize: 10, fontFamily: mono, color: fg, opacity: 0.55 }}>{hex}</span>
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* Status swatches — col 3, row 1 */}
        <div style={{ ...tile({ background: surf, border: `1px solid ${border}`, padding: 20, gridColumn: '3', gridRow: '1' }), display: 'flex', flexDirection: 'column', gap: 8 }}>
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

        {/* Surface hierarchy — col 3, row 2 */}
        <div style={{ ...tile({ border: `1px solid ${border}`, padding: 20, background: bg, gridColumn: '3', gridRow: '2' }), fontFamily: sans }}>
          <div style={{ color: td, fontSize: 10, fontFamily: mono, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Surfaces</div>
          {[
            { label: 'bg.default',  bg: bg,   border: border },
            { label: 'surface',     bg: surf, border: border },
            { label: 'bg.subtle',   bg: color('color.bg.subtle'), border: border },
          ].map(({ label, bg: b, border: bo }) => (
            <div key={label} style={{ background: b, border: `1px solid ${bo}`, borderRadius: 8, padding: '8px 12px', marginBottom: 6 }}>
              <div style={{ color: tp, fontSize: 12, fontWeight: 500 }}>Surface text</div>
              <div style={{ color: ts, fontSize: 11 }}>Secondary</div>
            </div>
          ))}
        </div>

        {/* Typography showcase — full width, row 3 */}
        <div style={{ ...tile({ background: bg, border: `1px solid ${border}`, padding: 28, gridColumn: '1 / 4' }), fontFamily: sans }}>
          <div style={{ color: td, fontSize: 10, fontFamily: mono, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
            {sans.split(',')[0].replace(/['"]/g, '').trim()}
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

        {/* UI card — elevated, floating on brand glow, col 1-2 */}
        <div style={{
          borderRadius: cardR,
          overflow: 'hidden',
          gridColumn: '1 / 3',
          background: bg,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 28px',
        }}>
          {/* Ambient brand glow */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 65% 85% at 50% 50%, ${brand} 0%, transparent 70%)`,
            opacity: 0.13,
            pointerEvents: 'none',
          }} />

          {/* Floating product card */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            background: surf,
            border: `1px solid ${border}`,
            borderRadius: cardR,
            overflow: 'hidden',
            width: '100%',
            maxWidth: 340,
            boxShadow: `0 28px 64px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)`,
          }}>
            <div style={{ background: brand, padding: '18px 22px 20px' }}>
              <div style={{ color: onBrand, opacity: 0.45, fontFamily: mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                {brandPalette?.name ?? 'Brand'}
              </div>
              <div style={{ color: onBrand, fontFamily: sans, fontSize: 21, fontWeight: 700, lineHeight: 1.1 }}>
                Design system ready.
              </div>
            </div>
            <div style={{ padding: '18px 22px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ color: ts, fontFamily: sans, fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                Color, type, spacing and shapes — all exported and ready to ship.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ background: brand, color: onBrand, fontFamily: sans, fontSize: 12, fontWeight: 600, padding: '7px 16px', borderRadius: btnR, display: 'inline-flex', alignItems: 'center' }}>
                  Export tokens
                </div>
                <div style={{ color: ts, fontFamily: sans, fontSize: 12, padding: '7px 14px', borderRadius: btnR, border: `1px solid ${border}`, display: 'inline-flex', alignItems: 'center' }}>
                  Preview
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shapes — bold flat graphic composition, col 3 */}
        {(() => {
          const scale = shapes.scale
          const fullEntry = [...scale].reverse().find(e => e.value === 9999) ?? scale[scale.length - 1]
          const midEntry  = scale[Math.floor(scale.length * 0.45)] ?? scale[Math.floor(scale.length / 2)]
          const toR = (e) => !e ? '0px' : e.value === 9999 ? '9999px' : `${e.value}px`

          const colSolid = brandPalette?.scale[500] ?? brand
          const colDark  = brandPalette?.scale[800] ?? '#111111'
          const colLight = brandPalette?.scale[200] ?? '#cccccc'
          const colSub   = brandPalette?.scale[100] ?? '#eeeeee'

          return (
            <div style={{
              borderRadius: cardR,
              overflow: 'hidden',
              gridColumn: '3',
              background: colSolid,
              position: 'relative',
            }}>
              {/* Dark rounded square — top-left bleed */}
              <div style={{
                position: 'absolute',
                top: -32,
                left: -32,
                width: 130,
                height: 130,
                borderRadius: toR(midEntry),
                background: colDark,
              }} />

              {/* Large circle — bottom-right bleed */}
              <div style={{
                position: 'absolute',
                bottom: -60,
                right: -60,
                width: 190,
                height: 190,
                borderRadius: toR(fullEntry),
                background: colLight,
              }} />

              {/* Small accent circle — upper right */}
              <div style={{
                position: 'absolute',
                top: 24,
                right: 24,
                width: 36,
                height: 36,
                borderRadius: toR(fullEntry),
                background: colSub,
                opacity: 0.7,
              }} />
            </div>
          )
        })()}

        {/* Spacing ramp — col 1–3 */}
        <div style={{ ...tile({ background: surf, border: `1px solid ${border}`, padding: 24, gridColumn: '1 / 4' }), fontFamily: mono }}>
          <div style={{ color: td, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Spacing</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(() => {
              const steps = spacing.scale.filter(s => s.value > 0)
              const maxPx = Math.max(...steps.map(s => s.value), 1)
              return steps.map(s => (
                <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: (s.value / maxPx) * 200, height: 6, borderRadius: '3px', background: brand, opacity: 0.6, flexShrink: 0 }} />
                  <span style={{ color: td, fontSize: 9 }}>{s.value}px</span>
                </div>
              ))
            })()}
          </div>
        </div>

        {/* All palettes strip — full width, row 5 */}
        <div style={{ ...tile({ overflow: 'hidden', gridColumn: '1 / 4' }), display: 'flex', height: 40 }}>
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
