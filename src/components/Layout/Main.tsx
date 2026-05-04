import { useMemo } from 'react'
import { useApiStore } from '@/stores/apiStore'
import { useProjectConfigStore, parseSwaggerUrl } from '@/stores/projectConfigStore'
import { ApiDetailPanel } from '../ApiExplorer/ApiDetailPanel'
import { Globe, Layers, Tag, Server, Clock, FileText } from 'lucide-react'
import { marked } from 'marked'
import './Main.css'

export function Main() {
  const { apiList, categories, swaggerData, isOnHomePage } = useApiStore()
  const { getActiveProject } = useProjectConfigStore()
  const activeProject = getActiveProject()

  const serviceUrl = activeProject?.swaggerJsonUrl ? parseSwaggerUrl(activeProject.swaggerJsonUrl).baseUrl : ''
  const info = swaggerData?.info

  const descriptionHtml = useMemo(() => {
    if (!info?.description) return ''
    return marked.parse(info.description, { async: false }) as string
  }, [info])

  return (
    <main className="main">
      <div className="main-content">
        {apiList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>暂无 API 数据</h3>
            <p>请在设置中配置 API 地址并加载 Swagger 文档</p>
          </div>
        ) : isOnHomePage ? (
          <div className="overview-page">
            <div className="overview-header">
              <div className="overview-logo">
                <Globe size={28} />
              </div>
              <div className="overview-title-area">
                <h1 className="overview-title">{info?.title || activeProject?.name || 'API 文档'}</h1>
                {info?.description && <div className="overview-desc" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />}
                <div className="overview-meta">
                  {info?.version && <span className="meta-tag"><FileText size={12} /> v{info.version}</span>}
                  {serviceUrl && <span className="meta-tag"><Server size={12} /> {serviceUrl}</span>}
                  {info?.contact?.email && <span className="meta-tag"><Clock size={12} /> {info.contact.email}</span>}
                </div>
              </div>
            </div>

            {swaggerData?.servers && swaggerData.servers.length > 0 && (
              <div className="overview-section">
                <h2 className="section-title"><Server size={16} /> 服务地址</h2>
                <div className="server-list">
                  {swaggerData.servers.map((server: any, idx: number) => (
                    <div key={idx} className="server-item">
                      <code className="server-url">{server.url}</code>
                      {server.description && <span className="server-desc">{server.description}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="overview-section">
              <h2 className="section-title"><Layers size={16} /> 接口分类</h2>
              <div className="category-grid">
                {categories.map((cat) => (
                  <div key={cat.id} className="category-card">
                    <div className="category-card-header">
                      <Tag size={13} className="category-icon" />
                      <span className="category-name">{cat.name}</span>
                    </div>
                    <div className="category-count">{cat.count} 个接口</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ApiDetailPanel />
        )}
      </div>
    </main>
  )
}
