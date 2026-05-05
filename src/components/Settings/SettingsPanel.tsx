import { useState, useEffect, useRef } from 'react'
import { X, Palette, Check, Globe, RefreshCw, AlertCircle, CheckCircle2, Plus, Trash2, Star } from 'lucide-react'
import { useThemeStore, themes } from '@/stores/themeStore'
import { useProjectConfigStore, type ApiProject, parseSwaggerUrl } from '@/stores/projectConfigStore'
import { useApiStore } from '@/stores/apiStore'
import { useProjectStore } from '@/stores/projectStore'
import { OpenAPIParser } from '@/services/openapiParser'
import { extractCategories } from '@/services/initBackendProject'
import { setApiBaseUrl, setSwaggerJsonPath } from '@/config/runtime'
import './SettingsPanel.css'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { currentThemeId, setTheme } = useThemeStore()
  const { projects, activeProjectId, addProject, updateProject, removeProject, setActiveProject } = useProjectConfigStore()

  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSwaggerUrl, setEditSwaggerUrl] = useState('')
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [toastStatus, setToastStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [toastMessage, setToastMessage] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setTestStatus('idle')
        setTestMessage('')
        setEditId(null)
        setShowAdd(false)
        setToastStatus('idle')
        setToastMessage('')
      })
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (!isOpen) return null

  const showToast = (status: 'success' | 'error', message: string) => {
    setToastStatus(status)
    setToastMessage(message)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setToastStatus('idle')
      setToastMessage('')
    }, 3000)
  }

  const startEdit = (p: ApiProject) => {
    setEditId(p.id)
    setEditName(p.name)
    setEditSwaggerUrl(p.swaggerJsonUrl)
    setTestStatus('idle')
    setTestMessage('')
  }

  const startAdd = () => {
    setShowAdd(true)
    const nextIndex = projects.length + 1
    setEditName(`未命名项目${nextIndex}`)
    setEditSwaggerUrl('http://localhost:7001/api-docs/json')
    setTestStatus('idle')
    setTestMessage('')
  }

  const cancelEdit = () => {
    setEditId(null)
    setShowAdd(false)
    setTestStatus('idle')
    setTestMessage('')
  }

  const handleSaveAndTest = async () => {
    const swaggerUrl = editSwaggerUrl.trim()
    const name = editName.trim() || '未命名项目'

    if (!swaggerUrl) {
      setTestStatus('error')
      setTestMessage('请输入 Swagger JSON 地址')
      return
    }

    setTestStatus('loading')
    setTestMessage('正在连接并加载...')

    try {
      const res = await fetch(swaggerUrl, { signal: AbortSignal.timeout(8000) })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      let swaggerJson: any
      try {
        swaggerJson = await res.json()
      } catch {
        throw new Error('返回的不是 JSON，请检查地址')
      }

      const { baseUrl } = parseSwaggerUrl(swaggerUrl)
      const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
      const runtimeBaseUrl = isLocalhost ? '' : baseUrl

      if (editId) {
        updateProject(editId, { name, swaggerJsonUrl: swaggerUrl })
      } else {
        const project = addProject({ name, swaggerJsonUrl: swaggerUrl })
        setActiveProject(project.id)
      }

      setApiBaseUrl(runtimeBaseUrl)
      setSwaggerJsonPath(swaggerUrl.startsWith('http') ? new URL(swaggerUrl).pathname : swaggerUrl)

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
          openApiUrl: swaggerUrl,
        })
      }

      const apiStore = useApiStore.getState()
      apiStore.setApiList(apis)
      apiStore.setSwaggerData(swaggerJson)
      const categories = extractCategories(apis)
      apiStore.setCategories(categories)

      setTestStatus('success')
      setTestMessage(`加载成功：${apis.length} 个 API，${categories.length} 个分类`)

      showToast('success', `✓ ${name} 保存成功，已加载 ${apis.length} 个 API`)

      setTimeout(() => {
        setEditId(null)
        setShowAdd(false)
        setTestStatus('idle')
        setTestMessage('')
      }, 1500)
    } catch (err) {
      setTestStatus('error')
      setTestMessage((err as Error).message)
      showToast('error', `✗ 保存失败：${(err as Error).message}`)
    }
  }

  const loadSwaggerData = async (swaggerUrl: string) => {
    const res = await fetch(swaggerUrl, { signal: AbortSignal.timeout(8000) })
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
        openApiUrl: swaggerUrl,
      })
    }

    const apiStore = useApiStore.getState()
    apiStore.setApiList(apis)
    apiStore.setSwaggerData(swaggerJson)
    const categories = extractCategories(apis)
    apiStore.setCategories(categories)

    return { apis, categories }
  }

  const handleSwitchProject = async (id: string) => {
    const p = projects.find((proj) => proj.id === id)
    if (!p) return
    setActiveProject(id)
    try {
      const result = await loadSwaggerData(p.swaggerJsonUrl)
      showToast('success', `✓ 已切换到 ${p.name}，${result.apis.length} 个 API`)
    } catch {
      showToast('error', `✗ 切换失败，无法连接 ${p.name}`)
    }
  }

  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) return
    removeProject(id)
    if (activeProjectId === id) {
      const remaining = projects.filter((p) => p.id !== id)
      if (remaining.length > 0) {
        handleSwitchProject(remaining[0].id)
      }
    }
  }

  const renderMsg = (status: typeof testStatus, message: string) => {
    if (status === 'idle' || !message) return null
    const icon = status === 'success' ? <CheckCircle2 size={14} />
      : status === 'error' ? <AlertCircle size={14} />
      : <RefreshCw size={14} className="spin" />
    return (
      <div className={`settings-msg settings-msg-${status === 'success' ? 'success' : status === 'error' ? 'error' : 'info'}`}>
        {icon}
        <span>{message}</span>
      </div>
    )
  }

  const renderEditForm = (isAdd: boolean) => (
    <div className="project-edit-form">
      <input
        type="text"
        className="settings-input settings-input-sm"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        placeholder="项目名称"
        autoFocus={isAdd}
      />
      <input
        type="text"
        className="settings-input settings-input-sm"
        value={editSwaggerUrl}
        onChange={(e) => setEditSwaggerUrl(e.target.value)}
        placeholder="请输入 API JSON 地址"
        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveAndTest() }}
      />
      {isAdd && (
        <div className="swagger-presets">
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>快捷：</span>
          <button className="preset-btn" onClick={() => setEditSwaggerUrl('http://localhost:7001/api-docs/json')}>NestJS</button>
          <button className="preset-btn" onClick={() => setEditSwaggerUrl('http://localhost:8080/v3/api-docs')}>SpringDoc</button>
          <button className="preset-btn" onClick={() => setEditSwaggerUrl('http://localhost:3000/swagger.json')}>swagger.json</button>
        </div>
      )}
      <div className="project-edit-actions">
        <button className="settings-btn-sm settings-btn-primary-sm" onClick={handleSaveAndTest} disabled={testStatus === 'loading'}>
          {testStatus === 'loading' ? <RefreshCw size={14} className="spin" /> : <CheckCircle2 size={14} />}
          保存并测试
        </button>
        <button className="settings-btn-sm settings-btn-ghost-sm" onClick={cancelEdit}>
          取消
        </button>
      </div>
      {renderMsg(testStatus, testMessage)}
    </div>
  )

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-title">
            <Palette size={18} />
            <h2>设置</h2>
          </div>
          <button className="settings-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="settings-body">
          <div className="settings-section">
            <div className="settings-section-header">
              <h3 className="settings-section-title">
                <Globe size={14} />
                API 项目
              </h3>
              <button className="settings-icon-btn" onClick={startAdd} title="添加项目">
                <Plus size={14} />
              </button>
            </div>

            <div className="project-list">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className={`project-item ${p.id === activeProjectId ? 'active' : ''} ${editId === p.id ? 'editing' : ''}`}
                >
                  {editId === p.id ? (
                    renderEditForm(false)
                  ) : (
                    <div className="project-item-row">
                      <div className="project-item-info" onClick={() => handleSwitchProject(p.id)}>
                        <span className="project-item-name">
                          {p.id === activeProjectId && <Star size={10} className="active-star" />}
                          {p.name}
                        </span>
                        <span className="project-item-url">{p.swaggerJsonUrl}</span>
                      </div>
                      <div className="project-item-actions">
                        <button className="settings-icon-btn-sm" onClick={() => startEdit(p)} title="编辑">
                          <Globe size={12} />
                        </button>
                        {projects.length > 1 && (
                          <button className="settings-icon-btn-sm settings-icon-btn-danger" onClick={() => handleDeleteProject(p.id)} title="删除">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {showAdd && (
                <div className="project-item editing">
                  {renderEditForm(true)}
                </div>
              )}

              {projects.length === 0 && !showAdd && (
                <div className="project-empty">
                  <p>暂无项目，点击 + 添加</p>
                </div>
              )}
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">主题配色</h3>
            <div className="theme-grid">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-card ${currentThemeId === theme.id ? 'active' : ''}`}
                  onClick={() => setTheme(theme.id)}
                >
                  <div className="theme-card-preview">
                    <div className="theme-card-primary" style={{ background: theme.gradient }} />
                    <div className="theme-card-swatches">
                      {theme.swatches.slice(0, 3).map((swatch, i) => (
                        <div key={i} className="theme-card-swatch" style={{ background: swatch }} />
                      ))}
                    </div>
                    {currentThemeId === theme.id && (
                      <div className="theme-card-check">
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                  <div className="theme-card-info">
                    <span className="theme-card-name">{theme.name}</span>
                    <span className="theme-card-name-en">{theme.nameEn}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {toastStatus !== 'idle' && (
          <div className={`settings-toast settings-toast-${toastStatus}`}>
            {toastStatus === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  )
}
