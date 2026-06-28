import { useState } from 'react'

export function StepNameEditor({ value, onChange, size = 'md' }) {
  const [draft, setDraft] = useState(value)
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onChange(trimmed)
    else setDraft(value)
  }

  return (
    <input
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') { setDraft(value); e.currentTarget.blur() }
      }}
      size={Math.max(2, draft.length)}
      className={`${textSize} font-mono text-white/60 bg-white/[0.05] border border-white/[0.08] hover:border-white/20 hover:text-white focus:border-white/30 focus:text-white focus:bg-white/[0.08] rounded px-1.5 py-0.5 outline-none text-center transition-all leading-none`}
    />
  )
}
