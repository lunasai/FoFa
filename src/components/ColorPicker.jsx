import { useState, useRef, useEffect, useCallback } from 'react'
import chroma from 'chroma-js'

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function hexToHsv(hex) {
  try {
    const [r, g, b] = chroma(hex).rgb()
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const d = max - min
    let h = 0, s = max === 0 ? 0 : d / max, v = max / 255
    if (max !== min) {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    return { h: h * 360, s, v }
  } catch { return { h: 0, s: 1, v: 1 } }
}

function hsvToHex(h, s, v) {
  try {
    return chroma.hsv(h, s, v).hex()
  } catch { return '#000000' }
}

function usePointerDrag(ref, onDrag) {
  const dragging = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function getPos(e) {
      const rect = el.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      return {
        x: clamp((clientX - rect.left) / rect.width, 0, 1),
        y: clamp((clientY - rect.top) / rect.height, 0, 1),
      }
    }

    function onDown(e) {
      e.preventDefault()
      dragging.current = true
      onDrag(getPos(e))
    }
    function onMove(e) {
      if (!dragging.current) return
      e.preventDefault()
      onDrag(getPos(e))
    }
    function onUp() { dragging.current = false }

    el.addEventListener('mousedown', onDown)
    el.addEventListener('touchstart', onDown, { passive: false })
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)
    return () => {
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('touchstart', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
    }
  }, [ref, onDrag])
}

export function ColorPicker({ value, onChange }) {
  const { h: initH, s: initS, v: initV } = hexToHsv(value)
  const [hsv, setHsv] = useState({ h: initH, s: initS, v: initV })
  const [hexInput, setHexInput] = useState(value)
  const [hexFocused, setHexFocused] = useState(false)

  const svRef = useRef(null)
  const hueRef = useRef(null)

  useEffect(() => {
    const { h, s, v } = hexToHsv(value)
    setHsv({ h, s, v })
    if (!hexFocused) setHexInput(value)
  }, [value, hexFocused])

  const handleSVDrag = useCallback(({ x, y }) => {
    const next = { ...hsv, s: x, v: 1 - y }
    setHsv(next)
    const hex = hsvToHex(next.h, next.s, next.v)
    setHexInput(hex)
    onChange(hex)
  }, [hsv, onChange])

  const handleHueDrag = useCallback(({ x }) => {
    const next = { ...hsv, h: x * 360 }
    setHsv(next)
    const hex = hsvToHex(next.h, next.s, next.v)
    setHexInput(hex)
    onChange(hex)
  }, [hsv, onChange])

  usePointerDrag(svRef, handleSVDrag)
  usePointerDrag(hueRef, handleHueDrag)

  function handleHexChange(e) {
    const raw = e.target.value
    setHexInput(raw)
    const normalized = raw.startsWith('#') ? raw : `#${raw}`
    if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
      onChange(normalized)
    }
  }

  const hueColor = hsvToHex(hsv.h, 1, 1)
  const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v)

  return (
    <div className="w-56 select-none" onMouseDown={e => e.stopPropagation()}>
      {/* SV field */}
      <div
        ref={svRef}
        className="relative w-full h-36 rounded-t-xl overflow-hidden cursor-crosshair"
        style={{
          background: `linear-gradient(to bottom, transparent, #000),
                       linear-gradient(to right, #fff, ${hueColor})`,
        }}
      >
        {/* Cursor */}
        <div
          className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      {/* Hue slider */}
      <div className="px-3 pt-3 pb-2">
        <div
          ref={hueRef}
          className="relative h-3 rounded-full cursor-pointer"
          style={{
            background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
          }}
        >
          <div
            className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${(hsv.h / 360) * 100}%`,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      </div>

      {/* Hex input + swatch */}
      <div className="px-3 pb-3 flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex-shrink-0 border border-white/20"
          style={{ background: currentHex }}
        />
        <input
          value={hexFocused ? hexInput : currentHex}
          onChange={handleHexChange}
          onFocus={() => { setHexFocused(true); setHexInput(currentHex) }}
          onBlur={() => setHexFocused(false)}
          className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-white text-center outline-none focus:border-white/30"
          spellCheck={false}
        />
      </div>
    </div>
  )
}

export function ColorPickerPopover({ value, onChange, children }) {
  const [open, setOpen] = useState(false)
  const popoverRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (!popoverRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div className="relative inline-block">
      <div ref={triggerRef} onClick={() => setOpen(v => !v)}>
        {children}
      </div>
      {open && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-2 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
          style={{ background: '#1a1a1a', top: '100%', left: 0 }}
        >
          <ColorPicker value={value} onChange={onChange} />
        </div>
      )}
    </div>
  )
}
