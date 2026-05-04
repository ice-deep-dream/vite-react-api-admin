import { useState, useEffect, useRef } from 'react'
import { Menu, Search, Settings, LogOut, Key, LogIn, ChevronDown, Star } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import { useProjectConfigStore } from '@/stores/projectConfigStore'
import { useApiStore } from '@/stores/apiStore'
import { OpenAPIParser } from '@/services/openapiParser'
import { extractCategories } from '@/services/initBackendProject'
import { LoginPanel } from '../Auth/LoginPanel'
import { SearchModal } from '../Search/SearchModal'
import './Header.css'

interface HeaderProps {
  onToggleSidebar: () => void
  onOpenSettings: () => void
}

export function Header({ onToggleSidebar, onOpenSettings }: HeaderProps) {
  const { globalToken } = useAuthStore()
  const { projects, activeProjectId, setActiveProject } = useProjectConfigStore()
  const isLoggedIn = !!globalToken
  const [showLoginPanel, setShowLoginPanel] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeProject = projects.find((p) => p.id === activeProjectId)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const handleLoginSuccess = () => {
      setShowLoginPanel(false)
    }
    window.addEventListener('login-success', handleLoginSuccess)
    return () => window.removeEventListener('login-success', handleLoginSuccess)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProjectDropdown(false)
      }
    }
    if (showProjectDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProjectDropdown])

  const handleSwitchProject = async (id: string) => {
    const p = projects.find((proj) => proj.id === id)
    if (!p) return
    setActiveProject(id)
    setShowProjectDropdown(false)

    try {
      const res = await fetch(p.swaggerJsonUrl, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const swaggerJson = await res.json()

      const { project: projectInfo, apis } = OpenAPIParser.parse(swaggerJson)
      const projectStore = useProjectStore.getState()
      const currentProject = projectStore.currentProject
      if (currentProject && currentProject.id === 'nest-admin-backend') {
        projectStore.updateProject({
          ...currentProject,
          name: projectInfo.name || currentProject.name,
          description: projectInfo.description || currentProject.description,
          tags: projectInfo.tags || currentProject.tags,
          apiCount: apis.length,
          openApiUrl: p.swaggerJsonUrl,
        })
      }

      const apiStore = useApiStore.getState()
      apiStore.setApiList(apis)
      apiStore.setSwaggerData(swaggerJson)
      const categories = extractCategories(apis)
      apiStore.setCategories(categories)
    } catch (err) {
      console.error('切换项目加载失败:', err)
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={onToggleSidebar} title="切换侧边栏">
            <Menu size={18} />
          </button>
          <div className="project-switcher" ref={dropdownRef}>
            <button
              className={`project-switcher-btn ${showProjectDropdown ? 'active' : ''}`}
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            >
              <span className="project-switcher-logo">❄️</span>
              <span className="project-switcher-name">
                {activeProject?.name || 'ICE API 文档'}
              </span>
              {projects.length > 1 && <ChevronDown size={12} className="project-switcher-arrow" />}
            </button>

            {showProjectDropdown && projects.length > 1 && (
              <div className="project-dropdown">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    className={`project-dropdown-item ${p.id === activeProjectId ? 'active' : ''}`}
                    onClick={() => handleSwitchProject(p.id)}
                  >
                    <span className="project-dropdown-name">
                      {p.id === activeProjectId && <Star size={10} className="active-star" />}
                      {p.name}
                    </span>
                    <span className="project-dropdown-url">{p.swaggerJsonUrl}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="header-center">
          <button className="search-trigger" onClick={() => setShowSearch(true)}>
            <Search size={14} />
            <span>搜索 API...</span>
            <kbd>Ctrl+K</kbd>
          </button>
        </div>

        <div className="header-right">
          {isLoggedIn ? (
            <button
              className="auth-btn auth-btn-logged"
              onClick={() => setShowLoginPanel(true)}
              title="管理 Token"
            >
              <Key size={14} />
              <span>Token</span>
            </button>
          ) : (
            <button
              className="auth-btn auth-btn-login"
              onClick={() => setShowLoginPanel(true)}
              title="登录"
            >
              <LogIn size={14} />
              <span>登录</span>
            </button>
          )}
          <button className="settings-btn" title="设置" onClick={onOpenSettings}>
            <Settings size={16} />
          </button>
        </div>

        {showLoginPanel && (
          <div className="login-panel-overlay" onClick={() => setShowLoginPanel(false)}>
            <div className="login-panel-container" onClick={(e) => e.stopPropagation()}>
              <button className="panel-close" onClick={() => setShowLoginPanel(false)}>
                <LogOut size={18} />
              </button>
              <LoginPanel />
            </div>
          </div>
        )}
      </header>

      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  )
}
