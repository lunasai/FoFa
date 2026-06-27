export function SectionHeading({ label, techAlias, tooltip }) {
  return (
    <div className="flex items-center gap-2.5">
      <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase">{label}</h2>
      {techAlias && (
        <div className="relative group flex items-center gap-1.5">
          <span className="text-white/15 text-[10px]">·</span>
          <span className="text-[10px] font-mono text-white/20 cursor-default select-none">{techAlias}</span>
          {tooltip && (
            <div className="pointer-events-none absolute left-0 top-full mt-2 w-64 rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2.5 text-[11px] text-white/50 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-20">
              {tooltip}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
