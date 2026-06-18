import { useState, useRef } from 'react'
import { X, ChevronRight, Plus, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { parseDTCGFile, resolveRef } from '../lib/importUtils'
import { SCALE_STEPS } from '../lib/colorUtils'

function PaletteStrip({ scale }) {
  return (
    <div className="flex h-5 rounded overflow-hidden flex-1">
      {SCALE_STEPS.map(step => (
        <div key={step} style={{ background: scale[step], flex: 1 }} />
      ))}
    </div>
  )
}

function PaletteMapping({ imported, existingPalettes, mapping, onChange }) {
  return (
    <div className="space-y-3">
      {imported.map(palette => (
        <div key={palette.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          {/* Imported palette */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-4 h-4 rounded flex-shrink-0" style={{ background: palette.baseColor }} />
              <span className="text-sm font-mono text-white/80">{palette.id}</span>
            </div>
            <PaletteStrip scale={palette.scale} />
          </div>

          <ArrowRight size={14} className="text-white/20 flex-shrink-0" />

          {/* Mapping selector */}
          <div className="flex-1">
            <select
              value={mapping[palette.id] || '__new__'}
              onChange={e => onChange(palette.id, e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/30 cursor-pointer"
            >
              <option value="__new__" style={{ background: '#1a1a1a' }}>
                ＋ Add as new palette
              </option>
              <optgroup label="Replace existing" style={{ background: '#1a1a1a' }}>
                {existingPalettes.map(p => (
                  <option key={p.id} value={p.id} style={{ background: '#1a1a1a' }}>
                    Replace "{p.name}"
                  </option>
                ))}
              </optgroup>
            </select>
            {mapping[palette.id] && mapping[palette.id] !== '__new__' && (
              <div className="mt-1.5">
                <PaletteStrip scale={existingPalettes.find(p => p.id === mapping[palette.id])?.scale || {}} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function SemanticPreview({ tokens, existingTokenIds }) {
  const known = tokens.filter(t => existingTokenIds.includes(t.id))
  const custom = tokens.filter(t => !existingTokenIds.includes(t.id))

  return (
    <div className="space-y-3">
      {known.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold tracking-widest text-white/20 uppercase mb-2">
            Updating {known.length} existing token{known.length !== 1 ? 's' : ''}
          </div>
          <div className="space-y-1">
            {known.map(t => (
              <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03]">
                <div className="w-2 h-2 rounded-full bg-blue-400/60 flex-shrink-0" />
                <span className="text-xs font-mono text-white/60">{t.id}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {custom.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold tracking-widest text-white/20 uppercase mb-2">
            Adding {custom.length} new custom token{custom.length !== 1 ? 's' : ''}
          </div>
          <div className="space-y-1">
            {custom.map(t => (
              <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03]">
                <div className="w-2 h-2 rounded-full bg-green-400/60 flex-shrink-0" />
                <span className="text-xs font-mono text-white/60">{t.id}</span>
                {t.rawValue && (
                  <span className="text-xs font-mono text-white/25 ml-auto">{t.rawValue}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {known.length === 0 && custom.length === 0 && (
        <div className="text-xs text-white/30 px-3">No semantic color tokens found.</div>
      )}
    </div>
  )
}

export default function ImportWizard({ existingPalettes, existingSemanticTokens, onApply, onClose }) {
  const [step, setStep] = useState('idle') // idle | mapping | confirm | done
  const [parsed, setParsed] = useState(null)
  const [paletteMapping, setPaletteMapping] = useState({})
  const [error, setError] = useState(null)
  const fileRef = useRef()

  function handleFilePick(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result)
        const result = parseDTCGFile(json)

        if (result.colorPalettes.length === 0 && result.semanticColorTokens.length === 0) {
          setError('No recognisable tokens found. Make sure this is a DTCG-format tokens.json exported from FoundationFactory.')
          return
        }

        // Default mapping: try to auto-match by id, otherwise add as new
        const defaultMapping = {}
        result.colorPalettes.forEach(p => {
          const match = existingPalettes.find(ep => ep.id === p.id)
          defaultMapping[p.id] = match ? match.id : '__new__'
        })

        setParsed(result)
        setPaletteMapping(defaultMapping)
        setError(null)
        setStep('mapping')
      } catch {
        setError('Could not parse file — make sure it is valid JSON.')
      }
    }
    reader.readAsText(file)
  }

  function handleApply() {
    const newPalettes = [...existingPalettes]

    parsed.colorPalettes.forEach(imported => {
      const target = paletteMapping[imported.id]
      if (target === '__new__') {
        // Check if id already taken, suffix if needed
        const baseId = imported.id
        let id = baseId
        let n = 2
        while (newPalettes.find(p => p.id === id)) { id = `${baseId}-${n++}` }
        newPalettes.push({ ...imported, id, name: imported.name })
      } else {
        const idx = newPalettes.findIndex(p => p.id === target)
        if (idx !== -1) {
          newPalettes[idx] = { ...newPalettes[idx], scale: imported.scale, baseColor: imported.baseColor }
        }
      }
    })

    // Build new semantic tokens — update known, append custom
    const existingIds = existingSemanticTokens.map(t => t.id)
    const newSemanticTokens = [...existingSemanticTokens]

    parsed.semanticColorTokens.forEach(imported => {
      const ref = resolveRef(imported.ref)
      // Remap paletteId according to palette mapping
      let paletteId = ref?.paletteId
      if (paletteId) {
        // If the original palette was replaced, keep the target id
        const mappedTarget = paletteMapping[paletteId]
        if (mappedTarget && mappedTarget !== '__new__') paletteId = mappedTarget
        // If added as new, keep original id
      }

      const existing = newSemanticTokens.find(t => t.id === imported.id)
      if (existing) {
        // Update mapping
        if (ref) {
          existing.paletteId = paletteId || existing.paletteId
          existing.step = ref.step
        }
        if (imported.description) existing.description = imported.description
      } else {
        // Add as custom token (no concept metadata)
        newSemanticTokens.push({
          id: imported.id,
          paletteId: paletteId || (newPalettes[0]?.id || 'neutral'),
          step: ref?.step || 500,
          description: imported.description || '',
          isCustom: true,
          concept: { category: imported.id.split('.')[0], variant: imported.id.split('.')[1] || 'default' },
        })
      }
    })

    onApply({ palettes: newPalettes, semanticTokens: newSemanticTokens })
    setStep('done')
  }

  const existingSemanticIds = existingSemanticTokens.map(t => t.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#111111' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
          <div>
            <div className="text-sm font-semibold text-white">Import tokens.json</div>
            <div className="text-xs text-white/40 mt-0.5">DTCG format (FoundationFactory export)</div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">

          {step === 'idle' && (
            <div className="text-center py-8">
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex flex-col items-center gap-3 px-8 py-6 rounded-xl border border-dashed border-white/20 hover:border-white/40 hover:bg-white/[0.03] transition-all text-white/50 hover:text-white/80 cursor-pointer"
              >
                <Plus size={24} />
                <span className="text-sm font-medium">Choose tokens.json file</span>
                <span className="text-xs text-white/30">DTCG format exported from FoundationFactory</span>
              </button>
              <input ref={fileRef} type="file" accept=".json" onChange={handleFilePick} className="hidden" />
              {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
            </div>
          )}

          {step === 'mapping' && parsed && (
            <div className="space-y-6">
              {parsed.colorPalettes.length > 0 && (
                <div>
                  <div className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">
                    Color Palettes — map or add
                  </div>
                  <PaletteMapping
                    imported={parsed.colorPalettes}
                    existingPalettes={existingPalettes}
                    mapping={paletteMapping}
                    onChange={(id, target) => setPaletteMapping(prev => ({ ...prev, [id]: target }))}
                  />
                </div>
              )}

              {parsed.semanticColorTokens.length > 0 && (
                <div>
                  <div className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">
                    Semantic Color Tokens
                  </div>
                  <SemanticPreview
                    tokens={parsed.semanticColorTokens}
                    existingTokenIds={existingSemanticIds}
                  />
                </div>
              )}

              {(parsed.typography || parsed.spacing || parsed.shapes) && (
                <div className="rounded-xl border border-white/[0.06] px-4 py-3 text-xs text-white/40">
                  Typography, spacing, and shape data detected — will be applied directly.
                </div>
              )}
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-8">
              <div className="text-2xl mb-3">✓</div>
              <div className="text-sm font-medium text-white">Import applied</div>
              <div className="text-xs text-white/40 mt-1">Your tokens are now in the editor.</div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(step === 'mapping' || step === 'idle') && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08]">
            <button
              onClick={step === 'idle' ? onClose : () => setStep('idle')}
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              {step === 'idle' ? 'Cancel' : '← Back'}
            </button>
            {step === 'mapping' && (
              <button
                onClick={handleApply}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium text-white transition-all"
              >
                Apply import <ChevronRight size={14} />
              </button>
            )}
            {step === 'idle' && (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium text-white transition-all"
              >
                Choose file <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
        {step === 'done' && (
          <div className="flex justify-end px-6 py-4 border-t border-white/[0.08]">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium text-white transition-all"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
