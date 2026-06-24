import { useState } from 'react'

export function StepNameEditor({ value, onChange, size = 'md' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => {
          const trimmed = draft.trim()
          if (trimmed && trimmed !== value) onChange(trimmed)
          setEditing(false)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        }}
        className={`${textSize} font-mono text-white bg-white/[0.08] border border-white/25 rounded px-1.5 py-0.5 outline-none w-full text-center`}
        style={{ minWidth: '3ch', maxWidth: '8ch' }}
      />
    )
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true) }}
      title="Click to rename"
      className={`${textSize} font-mono text-white/50 hover:text-white hover:bg-white/[0.06] rounded px-1.5 py-0.5 transition-all group leading-none`}
    >
      {value}
      <span className="opacity-0 group-hover:opacity-40 ml-0.5 text-[8px]">✎</span>
    </button>
  )
}
