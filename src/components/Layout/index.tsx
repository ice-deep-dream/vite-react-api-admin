import { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Main } from './Main'
import { ApiTabs } from '../ApiExplorer/ApiTabs'
import { SettingsPanel } from '../Settings/SettingsPanel'
import './index.css'

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="layout">
      <Header
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenSettings={() => setShowSettings(true)}
      />
      <div className="api-tabs-bar">
        <ApiTabs />
      </div>
      <div className="layout-body">
        <Sidebar collapsed={sidebarCollapsed} />
        <Main />
      </div>
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}
