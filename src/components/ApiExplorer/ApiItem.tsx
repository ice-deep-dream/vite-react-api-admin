import { useNavigate } from 'react-router-dom'
import { ArrowRight, Trash2, Edit, Plus, Eye, Link } from 'lucide-react'
import type { ApiItem as ApiItemType } from '@/types/api'
import { apiPathToFrontendRoute } from '@/utils/routeHelper'
import './ApiItem.css'

interface ApiItemProps {
  api: ApiItemType
}

export function ApiItem({ api }: ApiItemProps) {
  const navigate = useNavigate()

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

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'GET': return <Eye size={12} />
      case 'POST': return <Plus size={12} />
      case 'PUT': return <Edit size={12} />
      case 'DELETE': return <Trash2 size={12} />
      case 'PATCH': return <Edit size={12} />
      default: return <ArrowRight size={12} />
    }
  }

  const handleClick = () => {
    navigate(`/api/${api.id}`)
  }

  const handleRouteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const frontendRoute = apiPathToFrontendRoute(api.path, api.method as any)
    navigate(frontendRoute)
  }

  return (
    <div className="api-item" onClick={handleClick}>
      <div className="api-item-header">
        <span className={`method-badge ${getMethodColor(api.method)}`}>
          {getMethodIcon(api.method)}
          {api.method}
        </span>
        <span className="api-path">{api.path}</span>
        <button className="route-link-btn" onClick={handleRouteClick} title="打开前端路由">
          <Link size={12} />
        </button>
        <ArrowRight size={14} className="item-arrow" />
      </div>
      <div className="api-item-summary">{api.summary}</div>
      {api.deprecated && (
        <span className="deprecated-badge">已废弃</span>
      )}
    </div>
  )
}
