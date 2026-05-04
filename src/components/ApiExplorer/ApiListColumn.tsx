import { useState, useMemo, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiStore } from '@/stores/apiStore'
import { Search } from 'lucide-react'
import { getMethodColor, getMethodBgColor, generateApiSlug } from '@/utils/methodColors'
import './ApiListColumn.css'

export function ApiListColumn() {
  const { apiList, selectedCategory, setCurrentApi } = useApiStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredApis = useMemo(() => {
    return apiList.filter(api => {
      if (selectedCategory && !api.tags?.includes(selectedCategory)) {
        return false
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          api.summary.toLowerCase().includes(query) ||
          api.path.toLowerCase().includes(query) ||
          api.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }

      return true
    })
  }, [apiList, selectedCategory, searchQuery])

  const handleSelectApi = (api: any) => {
    setCurrentApi(api)
    navigate(generateApiSlug(api), { replace: true })
  }

  return (
    <Fragment>
      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="搜索 API..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="api-list">
        {filteredApis.length === 0 ? (
          <div className="empty-list">
            <p>暂无 API</p>
          </div>
        ) : (
          filteredApis.map((api) => (
            <div
              key={api.id}
              className="api-list-item"
              onClick={() => handleSelectApi(api)}
            >
              <div className="api-method-badge">
                <span
                  className={`method-badge method-${api.method.toLowerCase()}`}
                  style={{ color: getMethodColor(api.method), background: getMethodBgColor(api.method) }}
                >
                  {api.method}
                </span>
              </div>
              <div className="api-info">
                <div className="api-title">{api.summary}</div>
                <div className="api-path">{api.path}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </Fragment>
  )
}
