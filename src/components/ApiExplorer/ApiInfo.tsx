import type { ApiItem } from '@/types/api'
import './ApiInfo.css'

interface ApiInfoProps {
  api: ApiItem
}

export function ApiInfo({ api }: ApiInfoProps) {
  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'method-get',
      POST: 'method-post',
      PUT: 'method-put',
      DELETE: 'method-delete',
      PATCH: 'method-patch',
    }
    return colors[method] || 'method-default'
  }

  return (
    <div className="api-info">
      <div className="api-info-header">
        <span className={`method-badge ${getMethodColor(api.method)}`}>
          {api.method}
        </span>
        <h1 className="api-title">{api.summary}</h1>
      </div>
      
      <div className="api-path">{api.path}</div>
      
      {api.description && (
        <div className="api-description">{api.description}</div>
      )}
      
      {api.tags && api.tags.length > 0 && (
        <div className="api-tags">
          {api.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
      
      {api.deprecated && (
        <div className="deprecated-warning">
          ⚠️ 此接口已废弃，不建议使用
        </div>
      )}
    </div>
  )
}
