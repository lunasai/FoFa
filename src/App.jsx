import { useState } from 'react'
import Layout from './components/Layout.jsx'
import ColorSection from './sections/ColorSection.jsx'
import TypographySection from './sections/TypographySection.jsx'
import SpacingSection from './sections/SpacingSection.jsx'
import ShapesSection from './sections/ShapesSection.jsx'
import PreviewSection from './sections/PreviewSection.jsx'
import { useStore } from './store/useStore.js'

export default function App() {
  const [section, setSection] = useState('color')
  const store = useStore()

  const sections = {
    color: <ColorSection store={store} />,
    typography: <TypographySection store={store} />,
    spacing: <SpacingSection store={store} />,
    shapes: <ShapesSection store={store} />,
    preview: <PreviewSection store={store} />,
  }

  return (
    <Layout section={section} onSectionChange={setSection} store={store}>
      {sections[section]}
    </Layout>
  )
}
