import { resolveSemanticColor, SCALE_STEPS } from '../lib/colorUtils'

export default function PreviewSection({ store }) {
  const { colorPalettes, semanticColorTokens, typography, spacing, shapes } = store

  function color(tokenId) {
    const token = semanticColorTokens.find(t => t.id === tokenId)
    if (!token) return '#cccccc'
    return resolveSemanticColor(token, colorPalettes)
  }

  const bg = color('background.default')
  const surface = color('surface.default')
  const borderCol = color('border.default')
  const textPrimary = color('text.primary')
  const textSecondary = color('text.secondary')
  const brandDefault = color('brand.default')
  const brandSubtle = color('brand.subtle')

  const sans = typography.fontFamily.sans
  const mono = typography.fontFamily.mono

  const cardStyle = {
    background: surface,
    border: `1px solid ${borderCol}`,
    borderRadius: '16px',
    overflow: 'hidden',
  }

  const labelStyle = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: textSecondary,
    fontFamily: sans,
    opacity: 0.6,
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Preview</h1>
        <p className="text-sm text-white/40 mt-1">Your design system foundations at a glance.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto auto auto', gap: 12 }}>

        {/* Color palettes — spans 2 cols */}
        <div style={{ ...cardStyle, gridColumn: '1 / 3', padding: 24 }}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>Color Palettes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {colorPalettes.map(palette => (
              <div key={palette.id} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <div style={{ width: 60, fontSize: 11, fontFamily: sans, color: textSecondary, opacity: 0.7, flexShrink: 0 }}>
                  {palette.name}
                </div>
                <div style={{ display: 'flex', flex: 1, gap: 2 }}>
                  {SCALE_STEPS.map(step => (
                    <div
                      key={step}
                      style={{ flex: 1, height: 28, borderRadius: 4, background: palette.scale[step] }}
                      title={`${palette.id}.${step}: ${palette.scale[step]}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Semantic color tokens — spans 1 col */}
        <div style={{ ...cardStyle, padding: 24, gridColumn: '3 / 4', gridRow: '1 / 2' }}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>Semantic Colors</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'background.default', 'surface.default', 'border.default',
              'text.primary', 'text.secondary',
              'brand.default', 'brand.subtle',
              'success.default', 'warning.default', 'danger.default',
            ].map(tokenId => {
              const val = color(tokenId)
              const label = tokenId.split('.').join(' · ')
              return (
                <div key={tokenId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: val, border: `1px solid ${borderCol}`, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontFamily: mono, color: textSecondary, opacity: 0.8 }}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Typography — spans 2 cols */}
        <div style={{ ...cardStyle, gridColumn: '1 / 3', padding: 24 }}>
          <div style={{ ...labelStyle, marginBottom: 20 }}>Type Scale — {typography.fontFamily.sans.split(',')[0]}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...typography.scale].reverse().map(entry => (
              <div key={entry.step} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: Math.min(entry.size, 40),
                    fontWeight: entry.weight,
                    lineHeight: 1,
                    color: textPrimary,
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Aa
                </div>
                <span style={{ fontSize: 11, fontFamily: mono, color: textSecondary, opacity: 0.5, flexShrink: 0, width: 60, textAlign: 'right' }}>
                  {entry.step}
                </span>
                <span style={{ fontSize: 11, fontFamily: mono, color: textSecondary, opacity: 0.4, flexShrink: 0, width: 48, textAlign: 'right' }}>
                  {entry.size}px
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shapes */}
        <div style={{ ...cardStyle, padding: 24 }}>
          <div style={{ ...labelStyle, marginBottom: 20 }}>Border Radius</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
            {shapes.scale.filter(s => s.step !== 'none').map(entry => {
              const r = entry.value === 9999 ? 9999 : entry.value
              const size = 32 + shapes.scale.indexOf(entry) * 4
              return (
                <div key={entry.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: Math.min(size, 52),
                      height: Math.min(size, 52),
                      borderRadius: `${Math.min(r, Math.min(size, 52) / 2)}px`,
                      background: brandSubtle,
                      border: `1.5px solid ${brandDefault}`,
                      opacity: 0.85,
                    }}
                  />
                  <span style={{ fontSize: 10, fontFamily: mono, color: textSecondary, opacity: 0.6 }}>{entry.step}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Spacing */}
        <div style={{ ...cardStyle, gridColumn: '1 / 3', padding: 24 }}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>Spacing Scale — base {spacing.baseUnit}px</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            {spacing.scale.filter(m => m > 0).map(m => {
              const px = m * spacing.baseUnit
              const maxPx = Math.max(...spacing.scale) * spacing.baseUnit
              const barH = Math.max(4, (px / maxPx) * 72)
              return (
                <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                  <div style={{ width: '100%', height: barH, borderRadius: '3px 3px 0 0', background: brandDefault, opacity: 0.5 }} />
                  <span style={{ fontSize: 9, fontFamily: mono, color: textSecondary, opacity: 0.5 }}>{px}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Grid */}
        <div style={{ ...cardStyle, padding: 24 }}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>Grid</div>
          <div
            style={{
              position: 'relative',
              background: color('background.subtle'),
              borderRadius: 8,
              height: 80,
              overflow: 'hidden',
              padding: `0 ${Math.min(spacing.grid.margin * 0.5, 20)}px`,
            }}
          >
            <div style={{ display: 'flex', height: '100%', gap: Math.min(spacing.grid.gutter * 0.4, 8) }}>
              {Array.from({ length: Math.min(spacing.grid.columns, 12) }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: '100%', background: brandDefault, opacity: 0.12, borderRadius: 2 }} />
              ))}
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, fontFamily: mono, color: textSecondary, opacity: 0.5 }}>
            {spacing.grid.columns} cols · {spacing.grid.gutter}px gutter · {spacing.grid.margin}px margin
          </div>
        </div>

      </div>
    </div>
  )
}
