import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Settings } from './pages/Settings'
import { Projects } from './pages/Projects'
import { ApiRoutePage } from './pages/ApiRoutePage'
import { initBackendProject } from './services/initBackendProject'
import './index.css'

function getBasename(): string {
  const baseEl = document.querySelector('base[href]')
  if (baseEl) {
    const href = baseEl.getAttribute('href') || '/'
    const url = new URL(href, window.location.origin)
    return url.pathname
  }
  return '/'
}

function App() {
  useEffect(() => {
    initBackendProject().catch(console.error)
  }, [])

  return (
    <BrowserRouter basename={getBasename()}>
      <Routes>
        <Route path="/projects" element={<Projects />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/api/:method/*" element={<ApiRoutePage />} />
        <Route path="/explore/*" element={<Layout />} />
        <Route path="*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
