import { useState, useEffect } from 'react'
import Layout from './components/Layout.jsx'
import ColorSection from './sections/ColorSection.jsx'
import TypographySection from './sections/TypographySection.jsx'
import SpacingSection from './sections/SpacingSection.jsx'
import ShapesSection from './sections/ShapesSection.jsx'
import PreviewSection from './sections/PreviewSection.jsx'
import SemanticsSection from './sections/SemanticsSection.jsx'
import { useStore } from './store/useStore.js'

export default function App() {
  const [section, setSection] = useState('color')
  const store = useStore()

  // Ensure a <link> stylesheet exists for every selected web font so it
  // renders across the editor and live preview. Links are de-duped by URL.
  const fontMeta = store.typography.fontMeta
  useEffect(() => {
    Object.values(fontMeta || {}).forEach(meta => {
      if (!meta?.url) return
      if (document.querySelector(`link[data-font-url="${meta.url}"]`)) return
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = meta.url
      link.setAttribute('data-font-url', meta.url)
      document.head.appendChild(link)
    })
  }, [fontMeta])

  const sections = {
    color: <ColorSection store={store} />,
    typography: <TypographySection store={store} />,
    spacing: <SpacingSection store={store} />,
    shapes:     <ShapesSection store={store} />,
    semantics:  <SemanticsSection store={store} />,
    preview:    <PreviewSection store={store} />,
  }

  return (
    <Layout section={section} onSectionChange={setSection} store={store}>
      {sections[section]}
    </Layout>
  )
}
