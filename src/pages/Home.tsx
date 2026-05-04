import { useEffect, useState } from 'react'
import { useApiStore } from '@/stores/apiStore'
import { useProjectStore } from '@/stores/projectStore'
import { Search, Layers, ExternalLink } from 'lucide-react'
import './Home.css'

export function Home() {
  const { apiList, categories } = useApiStore()
  const { currentProject, projects } = useProjectStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadApiData = async () => {
    setIsLoading(true)
    try {
      const { initBackendProject } = await import('@/services/initBackendProject')
      await initBackendProject()
    } catch (error) {
      console.error('加载 API 数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('Home useEffect 触发')
    console.log('currentProject:', currentProject)
    console.log('projects:', projects)
    console.log('apiList.length:', apiList.length)
    
    // 如果没有 API 数据，尝试加载
    if (apiList.length === 0) {
      // 优先使用当前项目，如果没有则查找后端项目
      const projectToLoad = currentProject || projects.find(p => p.id === 'nest-admin-backend')
      
      console.log('projectToLoad:', projectToLoad)
      
      if (projectToLoad?.openApiUrl && !isLoading) {
        console.log('开始加载 API 数据...')
        requestAnimationFrame(() => {
          loadApiData()
        })
      }
    }
  }, [currentProject, projects, apiList.length, isLoading])

  const filteredApis = apiList.filter(api => {
    const matchesSearch = searchQuery === '' || 
      api.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = !selectedCategory || 
      api.tags?.includes(selectedCategory)
    
    return matchesSearch && matchesCategory
  })

  if (!currentProject) {
    return (
      <div className="home-page">
        <div className="welcome-empty">
          <h1>👋 欢迎使用 API Manager</h1>
          <p>请先在项目管理中创建一个项目</p>
        </div>
      </div>
    )
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="project-info">
          <h1>{currentProject.name}</h1>
          <p>{currentProject.description}</p>
          <div className="project-meta">
            <span className="meta-item">
              <Layers size={16} />
              {apiList.length} 个 API
            </span>
            <span className="meta-item">
              <ExternalLink size={16} />
              {categories.length} 个分类
            </span>
          </div>
        </div>

        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="搜索 API..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="home-content">
        {categories.length > 0 && (
          <div className="category-sidebar">
            <h3 className="sidebar-title">分类</h3>
            <div className="category-list">
              <button
                className={`category-item ${!selectedCategory ? 'active' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                全部
                <span className="count">{apiList.length}</span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                  <span className="count">{category.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="api-content">
          {filteredApis.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{isLoading ? '⏳' : '📭'}</div>
              <h3>{isLoading ? '正在加载 API...' : '暂无 API'}</h3>
              <p>
                {isLoading 
                  ? '正在从后端获取 Swagger 文档...'
                  : searchQuery || selectedCategory 
                    ? '没有找到匹配的 API' 
                    : '后端 API 文档加载失败，请检查后端服务是否正常运行'}
              </p>
              {!isLoading && filteredApis.length === 0 && apiList.length === 0 && (
                <button className="btn-primary" onClick={loadApiData} style={{marginTop: '16px'}}>
                  重新加载
                </button>
              )}
            </div>
          ) : (
            <div className="api-list">
              {filteredApis.map((api) => (
                <div key={api.id} className="api-item">
                  <span className={`method-badge method-${api.method.toLowerCase()}`}>{api.method}</span>
                  <span className="api-path">{api.path}</span>
                  <span className="api-summary">{api.summary}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
