import { useState } from 'react'
import clsx from 'clsx'
import { Palette, Type, Ruler, Square, Eye, Tag, Download, Upload, FileJson, FileText, Plus, X } from 'lucide-react'
import { buildTokensJson, buildDesignMd, downloadFile } from '../lib/exportUtils'

const NAV_ITEMS = [
  { id: 'preview',    label: 'Preview',    icon: Eye },
  { id: 'color',      label: 'Color',      icon: Palette },
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'spacing',    label: 'Layout',     icon: Ruler },
  { id: 'shapes',     label: 'Shapes',     icon: Square },
  { id: 'semantics',  label: 'Naming',     icon: Tag },
]

const FAB_ACTIONS = [
  { id: 'export-md',      label: 'design-system.md', icon: FileText },
  { id: 'export-json',    label: 'tokens.json',       icon: FileJson },
  { id: 'export-project', label: 'Save project',      icon: Download },
  { id: 'import-project', label: 'Load project',      icon: Upload },
]

export default function Layout({ section, onSectionChange, store, children }) {
  const [fabOpen, setFabOpen] = useState(false)

  function handleFabAction(id) {
    setFabOpen(false)
    if (id === 'export-json') {
      const tokens = buildTokensJson(store)
      downloadFile(JSON.stringify(tokens, null, 2), 'tokens.json', 'application/json')
    } else if (id === 'export-md') {
      const md = buildDesignMd(store)
      downloadFile(md, 'design-system.md', 'text/markdown')
    } else if (id === 'export-project') {
      const data = store.exportProject()
      downloadFile(JSON.stringify(data, null, 2), 'foundation-factory-project.json', 'application/json')
    } else if (id === 'import-project') {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result)
            store.importProject(data)
          } catch {
            alert('Invalid project file.')
          }
        }
        reader.readAsText(file)
      }
      input.click()
    }
  }

  return (
    <div className="relative h-screen overflow-hidden bg-[#0a0a0a]">

      {/* Logo mark — top left */}
      <div className="fixed top-4 left-4 z-40 select-none pointer-events-none">
        <span className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">FF</span>
      </div>

      {/* Left column — tab bar + FAB grouped and vertically centered */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-start gap-4">

        {/* Floating tab bar */}
        <nav className="group/nav flex flex-col gap-1 rounded-2xl bg-[#111111]/90 backdrop-blur-md border border-white/[0.06] px-1.5 py-1.5 shadow-xl shadow-black/40">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = section === id
            return (
              <button
                key={id}
                onClick={() => onSectionChange(id)}
                className={clsx(
                  'flex items-center rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/35 hover:text-white/70 hover:bg-white/5'
                )}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span className="overflow-hidden max-w-0 opacity-0 group-hover/nav:max-w-[90px] group-hover/nav:opacity-100 transition-all duration-200 whitespace-nowrap">
                  <span className="pl-2.5">{label}</span>
                </span>
              </button>
            )
          })}
        </nav>

        {/* FAB */}
        <div className="relative">
          {/* Speed-dial — absolutely positioned above the FAB button */}
          {fabOpen && (
            <div className="absolute bottom-full mb-3 left-0 flex flex-col-reverse gap-2">
              {FAB_ACTIONS.map(({ id, label, icon: Icon }, i) => (
                <div
                  key={id}
                  className="flex items-center gap-2"
                  style={{ animation: `fabItem 150ms ease both`, animationDelay: `${i * 40}ms` }}
                >
                  <button
                    onClick={() => handleFabAction(id)}
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/10 transition-all shadow-lg shadow-black/30"
                  >
                    <Icon size={16} />
                  </button>
                  <span className="rounded-lg bg-[#111111]/90 backdrop-blur-md border border-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/60 shadow-lg shadow-black/30 whitespace-nowrap">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Main FAB button */}
          <button
            onClick={() => setFabOpen(o => !o)}
            className={clsx(
              'w-12 h-12 flex items-center justify-center rounded-full border transition-all duration-200 shadow-xl shadow-black/40',
              fabOpen
                ? 'bg-white/10 border-white/20 text-white rotate-45'
                : 'bg-[#111111] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/10'
            )}
          >
            {fabOpen ? <X size={18} /> : <Plus size={18} />}
          </button>
        </div>

      </div>

      {/* Main content — full width */}
      <main className="h-full overflow-y-auto">
        {children}
      </main>

      <style>{`
        @keyframes fabItem {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
