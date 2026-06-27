import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

// Shared scale-table primitives so Typography (size scale) and Layout (spacing
// scale) stay visually identical. Pass `columns` to render the header; lay out
// each row's cells with the matching width classes so they align under it.

export function ScaleTable({ columns, children }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5">
      <div className="flex items-center gap-4 py-2 border-b border-white/[0.06]">
        {columns.map((c, i) => (
          <div
            key={i}
            className={clsx(
              'text-[10px] font-semibold text-white/20 uppercase tracking-wider',
              c.grow ? 'flex-1' : clsx(c.width, 'flex-shrink-0'),
              c.align === 'right' && 'text-right',
              c.align === 'center' && 'text-center',
            )}
          >
            {c.label}
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}

export function ScaleRow({ children }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
      {children}
    </div>
  )
}

// Low-affordance, click-to-edit token name. Commits on blur/Enter, cancels on
// Escape, and auto-focuses when `autoFocus` is set (e.g. just-added rows).
export function InlineNameEdit({ value, onRename, autoFocus, onConsumedAutoFocus }) {
  const [editing, setEditing] = useState(Boolean(autoFocus))
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => { if (autoFocus) onConsumedAutoFocus?.() }, [])
  useEffect(() => {
    if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select() }
  }, [editing])

  function commit() {
    const t = draft.trim()
    if (t && t !== value) onRename(value, t)
    else setDraft(value)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() }
          else if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        }}
        placeholder="name"
        spellCheck={false}
        className="bg-transparent border-b border-white/40 outline-none text-sm font-mono text-white/90 px-0 max-w-full placeholder:text-white/25"
        style={{ width: `${Math.max(draft.length, 3)}ch` }}
      />
    )
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true) }}
      title="Click to rename"
      className="block max-w-full truncate text-left text-sm font-mono text-white/80 cursor-text rounded px-1.5 -mx-1.5 py-0.5 hover:bg-white/[0.05] hover:text-white transition-colors"
    >
      {value}
    </button>
  )
}
