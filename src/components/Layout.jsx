import clsx from 'clsx'
import { Palette, Type, Ruler, Square, Download, Upload, FileJson, FileText } from 'lucide-react'
import { buildTokensJson, buildDesignMd, downloadFile } from '../lib/exportUtils'

const NAV_ITEMS = [
  { id: 'color', label: 'Color', icon: Palette },
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'spacing', label: 'Spacing', icon: Ruler },
  { id: 'shapes', label: 'Shapes', icon: Square },
]

export default function Layout({ section, onSectionChange, store, children }) {
  function handleExportJson() {
    const tokens = buildTokensJson(store)
    downloadFile(JSON.stringify(tokens, null, 2), 'tokens.json', 'application/json')
  }

  function handleExportMd() {
    const md = buildDesignMd(store)
    downloadFile(md, 'design-system.md', 'text/markdown')
  }

  function handleExportProject() {
    const data = store.exportProject()
    downloadFile(JSON.stringify(data, null, 2), 'foundation-factory-project.json', 'application/json')
  }

  function handleImportProject() {
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/[0.08] bg-[#111111]">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.08]">
          <div className="text-xs font-semibold tracking-widest text-white/30 uppercase">Foundation</div>
          <div className="text-lg font-bold text-white tracking-tight leading-tight">Factory</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onSectionChange(id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                section === id
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Export actions */}
        <div className="px-3 pb-4 border-t border-white/[0.08] pt-4 space-y-1">
          <div className="px-3 pb-1 text-[10px] font-semibold tracking-widest text-white/20 uppercase">Export</div>
          <button
            onClick={handleExportMd}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <FileText size={16} className="flex-shrink-0" />
            design-system.md
          </button>
          <button
            onClick={handleExportJson}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <FileJson size={16} className="flex-shrink-0" />
            tokens.json
          </button>
          <div className="px-3 pb-1 pt-2 text-[10px] font-semibold tracking-widest text-white/20 uppercase">Project</div>
          <button
            onClick={handleExportProject}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <Download size={16} className="flex-shrink-0" />
            Save project
          </button>
          <button
            onClick={handleImportProject}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <Upload size={16} className="flex-shrink-0" />
            Load project
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
