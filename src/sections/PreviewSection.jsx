import { useState, useRef, useEffect } from 'react'
import { resolveSemanticColor, SCALE_STEPS, getContrastColor } from '../lib/colorUtils'

export default function PreviewSection({ store }) {
  const { colorPalettes, semanticColorTokens, typography, spacing, shapes } = store
  const [btnState, setBtnState] = useState('default')
  const btnRef = useRef(null)
  const [btnClipPath, setBtnClipPath] = useState(null)

  const btnToken = shapes.semantic.find(t => t.id === 'radius.button')
  const isBtnSquircle = (btnToken?.type ?? 'rounded') === 'squircle'

  useEffect(() => {
    const el = btnRef.current
    if (!el || !isBtnSquircle || !btnToken) { setBtnClipPath(null); return }
    const w = el.offsetWidth, h = el.offsetHeight
    const scaleEntry = shapes.scale.find(s => s.step === btnToken.step)
    const maxR = Math.min(w, h) / 2
    const rVal = scaleEntry ? (scaleEntry.value === 9999 ? maxR : Math.min(scaleEntry.value, maxR)) : maxR
    const sm = btnToken.smoothing ?? 0.6
    // Same formula as ShapesSection: uniform control point = r * (1 - s*0.6)
    const c = rVal * (1 - sm * 0.6)
    setBtnClipPath(`path('M ${c} 0 Q 0 0 0 ${c} L 0 ${h - c} Q 0 ${h} ${c} ${h} L ${w - c} ${h} Q ${w} ${h} ${w} ${h - c} L ${w} ${c} Q ${w} 0 ${w - c} 0 Z')`)
  }, [shapes, isBtnSquircle])

  const [inspectMode, setInspectMode] = useState(false)
  const [tooltip, setTooltip] = useState(null)

  function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return null
    if (/rgba/.test(rgb) && rgb.endsWith(', 0)')) return null // transparent
    const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!m) return null
    return '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('')
  }

  function detectTokens(el) {
    const cs = window.getComputedStyle(el)
    const found = []

    // Reverse color map
    const colorMap = semanticColorTokens.map(t => ({ id: t.id, hex: resolveSemanticColor(t, colorPalettes).toLowerCase() }))
    for (const cssProp of ['backgroundColor', 'color']) {
      const hex = rgbToHex(cs[cssProp])
      if (!hex) continue
      const match = colorMap.find(c => c.hex === hex)
      if (match && !found.some(f => f.id === match.id)) found.push({ cat: 'color', id: match.id })
    }

    // Shape: borderRadius
    const br = cs.borderRadius
    if (br && br !== '0px') {
      for (const sem of shapes.semantic) {
        const r = radius(sem.id)
        if (r && br === r) { found.push({ cat: 'shape', id: sem.id }); break }
      }
    }

    // Typography: fontSize + fontWeight
    const fSize = Math.round(parseFloat(cs.fontSize))
    const fWeight = cs.fontWeight
    for (const sem of typography.semantic) {
      const ts = typeStyle(sem.id)
      if (!ts.fontSize) continue
      if (Math.round(ts.fontSize) === fSize && String(ts.fontWeight) === fWeight) {
        found.push({ cat: 'typography', id: sem.id }); break
      }
    }

    return found
  }

  function handleInspectMove(e) {
    if (!inspectMode) return
    const el = e.target
    if (!el || el.dataset?.inspect === 'ignore') { setTooltip(null); return }
    const tokens = detectTokens(el)
    setTooltip(tokens.length ? { x: e.clientX, y: e.clientY, tokens } : null)
  }

  function color(tokenId) {
    const token = semanticColorTokens.find(t => t.id === tokenId)
    if (!token) return '#cccccc'
    return resolveSemanticColor(token, colorPalettes)
  }

  function radius(tokenId) {
    const token = shapes.semantic.find(t => t.id === tokenId)
    if (!token) return '8px'
    const type = token.type ?? 'rounded'
    if (type === 'oval') return '50%'
    if (type === 'sharp') return '0px'
    const entry = shapes.scale.find(s => s.step === token.step)
    return entry ? (entry.value === 9999 ? '9999px' : `${entry.value}px`) : '8px'
  }

  function space(step) {
    const entry = spacing.scale.find(s => s.step === step)
    return entry ? entry.value : 0
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
  const brandA = color('color.bg.brand.solid.active')
  const brandS      = color('color.bg.brand.subtle')
  const brandStrong = color('color.bg.brand.strong')
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
  const inputR = radius('radius.input')

  const onBrand    = color('color.on.brand')
  const onWarning = color('color.on.warning')

  const capSz     = typeStyle('type.caption').fontSize
  const lblMd     = typeStyle('type.label.md')
  const bodySmSt  = typeStyle('type.body.sm')
  const bodyMdSt  = typeStyle('type.body.md')
  const hdgMd     = typeStyle('type.heading.md')

  const gap = space('md')

  const tile = (extra = {}) => ({
    borderRadius: cardR,
    overflow: 'hidden',
    ...extra,
  })

  return (
    <div
      className="max-w-5xl mx-auto px-8 py-10"
      style={{ position: 'relative', cursor: inspectMode ? 'crosshair' : undefined }}
      onMouseMove={handleInspectMove}
      onMouseLeave={() => setTooltip(null)}
    >
      {/* Inspect toggle */}
      <div data-inspect="ignore" style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', marginBottom: space('md'), pointerEvents: 'none' }}>
        <button
          data-inspect="ignore"
          onClick={() => { setInspectMode(m => !m); setTooltip(null) }}
          style={{
            pointerEvents: 'all',
            background: inspectMode ? brand : 'rgba(14,14,18,0.75)',
            color: inspectMode ? onBrand : 'rgba(255,255,255,0.7)',
            border: `1px solid ${inspectMode ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 6,
            padding: `${space('xs')}px ${space('sm')}px`,
            fontSize: 11,
            fontFamily: mono,
            fontWeight: 500,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          {inspectMode ? '✕  inspect' : '⌘  inspect'}
        </button>
      </div>
      {/* Type poster — full-width hero */}
      <div style={{
        borderRadius: cardR,
        background: brand,
        padding: `${space('2xl')}px ${space('2xl') + space('sm')}px`,
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
          <span style={{ color: onBrand, fontFamily: mono, fontSize: capSz, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {brandPalette?.name}
          </span>
          <span style={{ color: onBrand, fontFamily: mono, fontSize: capSz }}>
            Foundation Factory
          </span>
        </div>

        {/* Big type specimen */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: space('xl') }}>
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
            <div style={{ color: onBrand, fontFamily: mono, fontSize: capSz, marginBottom: space('xs') / 2 }}>{brand}</div>
            <div style={{ color: onBrand, fontFamily: mono, fontSize: capSz }}>brand · 500</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: space('md') }}>

        {/* Brand palette — large color blocks, col 1 */}
        {brandPalette && (() => {
          const keySteps = [50, 300, 500, 800]
          return (
            <div style={{ ...tile({ overflow: 'hidden', gridColumn: '1', gridRow: '1 / 3' }), display: 'flex', flexDirection: 'column', minHeight: 300 }}>
              {keySteps.map((step, i) => {
                const hex = brandPalette.scale[step]
                const fg = getContrastColor(hex)
                return (
                  <div key={step} style={{ flex: i === 2 ? 2 : 1, background: hex, display: 'flex', alignItems: 'flex-end', padding: `${space('sm')}px ${space('md')}px` }}>
                    <span style={{ fontSize: 10, fontFamily: mono, color: fg }}>{hex}</span>
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
                  <div key={step} style={{ flex: i === 2 ? 2 : 1, background: hex, display: 'flex', alignItems: 'flex-end', padding: `${space('sm')}px ${space('md')}px` }}>
                    <span style={{ fontSize: 10, fontFamily: mono, color: fg }}>{hex}</span>
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* Status swatches — col 3, row 1 */}
        <div style={{ ...tile({ background: surf, border: `1px solid ${border}`, padding: space('xl'), gridColumn: '3', gridRow: '1' }), display: 'flex', flexDirection: 'column', gap: space('sm') }}>
          {[
            { label: 'Brand',   bg: brandS,    text: brandT,   token: 'bg.brand.subtle'   },
            { label: 'Success', bg: successBg, text: successC, token: 'bg.success.subtle' },
            { label: 'Warning', bg: warningBg, text: warningC, token: 'bg.warning.subtle' },
            { label: 'Danger',  bg: dangerBg,  text: dangerC,  token: 'bg.danger.subtle'  },
          ].map(({ label, bg: b, text: t, token }) => (
            <div key={label} style={{ background: b, borderRadius: btnR, padding: `${space('sm')}px ${space('md')}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space('sm') }}>
              <span style={{ ...lblMd, color: t, flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: capSz, fontFamily: mono, color: ts, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{token}</span>
            </div>
          ))}
        </div>

        {/* Surface hierarchy — col 3, row 2 */}
        <div style={{ ...tile({ border: `1px solid ${border}`, padding: space('xl'), background: bg, gridColumn: '3', gridRow: '2' }), fontFamily: sans }}>
          <div style={{ color: td, fontSize: capSz, fontFamily: mono, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: space('md') }}>Surfaces</div>
          {[
            { label: 'bg.default',  bg: bg,   border: border },
            { label: 'surface',     bg: surf, border: border },
            { label: 'bg.subtle',   bg: color('color.bg.subtle'), border: border },
          ].map(({ label, bg: b, border: bo }) => (
            <div key={label} style={{ background: b, border: `1px solid ${bo}`, borderRadius: inputR, padding: `${space('sm')}px ${space('md')}px`, marginBottom: space('xs') }}>
              <div style={{ ...lblMd, color: tp }}>Surface text</div>
              <div style={{ ...bodySmSt, color: ts }}>Secondary</div>
            </div>
          ))}
        </div>

        {/* Semantic type specimen — full width */}
        <div style={{ ...tile({ background: bg, border: `1px solid ${border}`, gridColumn: '1 / 4', overflow: 'hidden', padding: 0 }) }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr' }}>

            {/* Left: Headings */}
            <div style={{ padding: `${space('xl')}px ${space('xl') + space('xs')}px` }}>
              <div style={{ color: td, fontFamily: mono, fontSize: capSz, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: space('lg') + space('xs') }}>Headings</div>
              {['type.heading.xl', 'type.heading.lg', 'type.heading.md', 'type.heading.sm'].map(id => {
                const s = typeStyle(id)
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: space('md'), marginBottom: space('sm') }}>
                    <span style={{ ...s, color: tp, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      Design system
                    </span>
                    <span style={{ color: td, fontFamily: mono, fontSize: 9, flexShrink: 0 }}>{id.replace('type.', '')}</span>
                  </div>
                )
              })}
            </div>

            {/* Divider */}
            <div style={{ background: border }} />

            {/* Right: Body + Labels */}
            <div style={{ padding: `${space('xl')}px ${space('xl') + space('xs')}px` }}>
              <div style={{ color: td, fontFamily: mono, fontSize: capSz, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: space('lg') + space('xs') }}>Body & Labels</div>

              {['type.body.lg', 'type.body.md', 'type.body.sm'].map(id => {
                const s = typeStyle(id)
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: space('md'), marginBottom: space('sm') }}>
                    <span style={{ ...s, color: tp, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      The quick brown fox jumps over the lazy dog
                    </span>
                    <span style={{ color: td, fontFamily: mono, fontSize: 9, flexShrink: 0 }}>{id.replace('type.', '')}</span>
                  </div>
                )
              })}

              <div style={{ height: 1, background: border, margin: `${space('lg')}px 0` }} />

              {['type.label.md', 'type.label.sm', 'type.caption'].map(id => {
                const s = typeStyle(id)
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: space('md'), marginBottom: space('xs') }}>
                    <span style={{ ...s, color: ts, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {id.includes('label') ? 'Form label · UI label' : 'Caption · helper text'}
                    </span>
                    <span style={{ color: td, fontFamily: mono, fontSize: 9, flexShrink: 0 }}>{id.replace('type.', '')}</span>
                  </div>
                )
              })}
            </div>

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
          padding: `${space('2xl')}px ${space('xl') + space('xs')}px`,
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
            <div style={{ background: brand, padding: `${space('lg')}px ${space('xl')}px ${space('lg') + space('xs')}px` }}>
              <div style={{ color: onBrand, fontFamily: mono, fontSize: capSz, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: space('sm') }}>
                {brandPalette?.name ?? 'Brand'}
              </div>
              <div style={{ ...hdgMd, color: onBrand }}>
                Design system ready.
              </div>
            </div>
            <div style={{ padding: `${space('lg')}px ${space('xl')}px ${space('xl')}px`, display: 'flex', flexDirection: 'column', gap: space('md') }}>
              <p style={{ ...bodyMdSt, color: ts, margin: 0 }}>
                Color, type, spacing and shapes — all exported and ready to ship.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: space('xs') }}>
                <div
                  ref={btnRef}
                  onMouseEnter={() => setBtnState('hover')}
                  onMouseLeave={() => setBtnState('default')}
                  onMouseDown={() => setBtnState('active')}
                  onMouseUp={() => setBtnState('hover')}
                  style={{
                    ...lblMd,
                    background: { default: brand, hover: brandH, active: brandA }[btnState],
                    color: onBrand,
                    padding: `${space('sm') + space('xs') / 2}px ${space('xl')}px`,
                    borderRadius: isBtnSquircle ? undefined : btnR,
                    clipPath: isBtnSquircle ? (btnClipPath ?? undefined) : undefined,
                    alignSelf: 'flex-start',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background 80ms ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Click me
                </div>
                <div style={{ color: td, fontFamily: mono, fontSize: 9, letterSpacing: '0.04em' }}>
                  {'color.' + { default: 'bg.brand.solid', hover: 'bg.brand.solid.hover', active: 'bg.brand.solid.active' }[btnState]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shapes — bold flat graphic composition, col 3 */}
        {(() => {
          const colSolid = brand
          const colDark  = brandStrong
          const colLight = brandS
          const colSub   = brandS

          return (
            <div style={{
              borderRadius: cardR,
              overflow: 'hidden',
              gridColumn: '3',
              background: colSolid,
              position: 'relative',
            }}>
              {/* Dark rounded square — uses radius.card semantic token */}
              <div style={{
                position: 'absolute',
                top: -32,
                left: -32,
                width: 130,
                height: 130,
                borderRadius: cardR,
                background: colDark,
              }} />

              {/* Large circle — uses radius.badge semantic token */}
              <div style={{
                position: 'absolute',
                bottom: -60,
                right: -60,
                width: 190,
                height: 190,
                borderRadius: badgeR,
                background: colLight,
              }} />

              {/* Small accent — uses radius.badge semantic token */}
              <div style={{
                position: 'absolute',
                top: 24,
                right: 24,
                width: 36,
                height: 36,
                borderRadius: badgeR,
                background: colSub,
                opacity: 0.7,
              }} />
            </div>
          )
        })()}

        {/* Spacing — bold stacked bands, full width */}
        {(() => {
          const steps = spacing.scale.filter(s => s.value > 0)
          const vals = steps.map(s => s.value)
          const minV = Math.min(...vals), maxV = Math.max(...vals)
          const toH = v => 20 + ((v - minV) / (maxV - minV || 1)) * 72
          const paletteKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

          return (
            <div style={{ borderRadius: cardR, overflow: 'hidden', gridColumn: '1 / 4' }}>
              {steps.map((s, i) => {
                const pKey = paletteKeys[Math.min(Math.floor((i / steps.length) * paletteKeys.length), paletteKeys.length - 1)]
                const bg = brandPalette?.scale[pKey] ?? brand
                const fg = getContrastColor(bg)
                return (
                  <div key={s.step} style={{
                    height: toH(s.value),
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `0 ${space('xl') + space('xs')}px`,
                  }}>
                    <span style={{ color: fg, fontFamily: mono, fontSize: capSz }}>{s.step}</span>
                    <span style={{ color: fg, fontFamily: mono, fontSize: capSz }}>{s.value}px</span>
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* Color roles — semantic pairing brandbook */}
        <div style={{ borderRadius: cardR, overflow: 'hidden', gridColumn: '1 / 4', display: 'flex', height: 220 }}>
          {[
            {
              solidBg: brand,   solidText: onBrand,                    solidBgToken: 'bg.brand.solid',   solidTextToken: 'on.brand',
              subtleBg: brandS, subtleText: brandT,                    subtleBgToken: 'bg.brand.subtle',  subtleTextToken: 'text.brand',
            },
            {
              solidBg: successC, solidText: getContrastColor(successC), solidBgToken: 'bg.success.solid', solidTextToken: 'on.success',
              subtleBg: successBg, subtleText: successC,               subtleBgToken: 'bg.success.subtle', subtleTextToken: 'text.success',
            },
            {
              solidBg: warningC, solidText: onWarning,                 solidBgToken: 'bg.warning.solid', solidTextToken: 'on.warning',
              subtleBg: warningBg, subtleText: warningC,               subtleBgToken: 'bg.warning.subtle', subtleTextToken: 'text.warning',
            },
            {
              solidBg: dangerC,  solidText: getContrastColor(dangerC),  solidBgToken: 'bg.danger.solid',  solidTextToken: 'on.danger',
              subtleBg: dangerBg, subtleText: dangerC,                  subtleBgToken: 'bg.danger.subtle', subtleTextToken: 'text.danger',
            },
            {
              solidBg: tp,  solidText: bg,                             solidBgToken: 'text.primary',     solidTextToken: 'bg.default',
              subtleBg: color('color.bg.subtle'), subtleText: ts,       subtleBgToken: 'bg.subtle',       subtleTextToken: 'text.secondary',
            },
          ].map((p, i, arr) => (
            <div key={i} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRight: i < arr.length - 1 ? `2px solid ${bg}` : 'none',
            }}>
              {/* Solid zone */}
              <div style={{ flex: 3, background: p.solidBg, display: 'flex', alignItems: 'flex-end', padding: `${space('sm')}px ${space('md')}px` }}>
                <div style={{ color: p.solidText, fontFamily: mono, fontSize: capSz, fontWeight: lblMd.fontWeight, lineHeight: 1.5, minWidth: 0 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.solidTextToken}</div>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.solidBgToken}</div>
                </div>
              </div>
              {/* Subtle zone */}
              <div style={{ flex: 2, background: p.subtleBg, display: 'flex', alignItems: 'flex-end', padding: `${space('sm')}px ${space('md')}px` }}>
                <div style={{ color: p.subtleText, fontFamily: mono, fontSize: capSz, fontWeight: lblMd.fontWeight, lineHeight: 1.5, minWidth: 0 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.subtleTextToken}</div>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.subtleBgToken}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Token inspect tooltip */}
      {tooltip && (
        <div data-inspect="ignore" style={{
          position: 'fixed',
          left: tooltip.x + 16,
          top: tooltip.y + 16,
          zIndex: 9999,
          pointerEvents: 'none',
          background: 'rgba(10,10,14,0.9)',
          backdropFilter: 'blur(14px)',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.08)',
          padding: `${space('sm')}px ${space('md')}px`,
          minWidth: 160,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {['color', 'shape', 'typography'].map(cat => {
            const items = tooltip.tokens.filter(t => t.cat === cat)
            if (!items.length) return null
            return (
              <div key={cat} style={{ marginBottom: space('xs') }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontFamily: mono, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: space('xs') / 2 }}>{cat}</div>
                {items.map(t => (
                  <div key={t.id} style={{ color: '#fff', fontFamily: mono, fontSize: 11, lineHeight: 1.7 }}>{t.id}</div>
                ))}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
