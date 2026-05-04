import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApiStore } from '@/stores/apiStore'
import { Plus, X, Home } from 'lucide-react'
import { getMethodGradient, generateApiSlug, parseApiSlug } from '@/utils/methodColors'
import './ApiTabs.css'

const HOME_TAB_ID = '__home__'

interface ApiTab {
  id: string
  apiId: string
  title: string
  method: string
  path: string
}

export function ApiTabs() {
  const { currentApi, apiList, setCurrentApi, goHomePage, isOnHomePage } = useApiStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [tabs, setTabs] = useState<ApiTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>(HOME_TAB_ID)

  const addApiTab = useCallback((api: any) => {
    if (!api) return

    setTabs(prevTabs => {
      const existingTab = prevTabs.find(t => t.apiId === api.id)
      if (existingTab) {
        setActiveTabId(existingTab.id)
        return prevTabs
      }

      const newTab: ApiTab = {
        id: `tab-${Date.now()}-${api.id}`,
        apiId: api.id,
        title: api.summary || api.path,
        method: api.method,
        path: api.path,
      }

      setActiveTabId(newTab.id)
      return [...prevTabs, newTab]
    })
  }, [])

  const closeApiTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tabId === HOME_TAB_ID) return

    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(t => t.id !== tabId)
      const closedIdx = prevTabs.findIndex(t => t.id === tabId)

      if (tabId === activeTabId) {
        if (closedIdx > 0 && prevTabs[closedIdx - 1]) {
          const prevTab = prevTabs[closedIdx - 1]
          setActiveTabId(prevTab.id)
          const api = apiList.find(a => a.id === prevTab.apiId)
          if (api) {
            setCurrentApi(api)
            navigate(generateApiSlug(api), { replace: true })
          }
        } else {
          setActiveTabId(HOME_TAB_ID)
          goHomePage()
          navigate('/', { replace: true })
        }
      }

      return newTabs
    })
  }

  const switchTab = (tabId: string) => {
    setActiveTabId(tabId)
    if (tabId === HOME_TAB_ID) {
      goHomePage()
      navigate('/', { replace: true })
      return
    }
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      const api = apiList.find(a => a.id === tab.apiId)
      if (api) {
        setCurrentApi(api)
        navigate(generateApiSlug(api), { replace: true })
      }
    }
  }

  useEffect(() => {
    if (currentApi) {
      requestAnimationFrame(() => {
        addApiTab(currentApi)
      })
    }
  }, [currentApi, addApiTab])

  useEffect(() => {
    if (isOnHomePage) {
      requestAnimationFrame(() => {
        setActiveTabId(HOME_TAB_ID)
      })
    }
  }, [isOnHomePage])

  useEffect(() => {
    if (apiList.length === 0) return

    const parsed = parseApiSlug(location.pathname)
    if (parsed) {
      const api = apiList.find(a =>
        a.method === parsed.method && a.path === parsed.path
      )
      if (api && !currentApi) {
        setCurrentApi(api)
      }
    }
  }, [location.pathname, apiList, currentApi, setCurrentApi])

  return (
    <div className="api-tabs-container">
      <div
        className={`api-tab home-tab ${activeTabId === HOME_TAB_ID ? 'active' : ''}`}
        onClick={() => switchTab(HOME_TAB_ID)}
      >
        <Home size={13} className="home-tab-icon" />
        <span className="api-tab-title">首页</span>
      </div>
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`api-tab ${activeTabId === tab.id ? 'active' : ''}`}
          onClick={() => switchTab(tab.id)}
        >
          <span
            className="api-tab-method"
            style={{ background: getMethodGradient(tab.method) }}
          >
            {tab.method}
          </span>
          <span className="api-tab-title" title={tab.title}>
            {tab.title}
          </span>
          <button
            className="api-tab-close"
            onClick={(e) => closeApiTab(tab.id, e)}
          >
            <X size={12} />
          </button>
        </div>
      ))}
      <button className="add-tab-btn" title="添加新标签">
        <Plus size={16} />
      </button>
    </div>
  )
}
