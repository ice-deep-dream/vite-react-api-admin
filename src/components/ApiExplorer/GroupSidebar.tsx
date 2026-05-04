import { useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiStore } from '@/stores/apiStore'
import type { ApiItem } from '@/types/api'
import { FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'
import { generateApiSlug } from '@/utils/methodColors'
import './GroupSidebar.css'

export function GroupSidebar() {
  const { categories, apiList, setSelectedCategory, setCurrentApi } = useApiStore()
  const navigate = useNavigate()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['all']))

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const handleSelectCategory = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
  }

  const handleSelectApi = (api: ApiItem, categoryId: string | null) => {
    handleSelectCategory(categoryId)
    setCurrentApi(api)
    navigate(generateApiSlug(api), { replace: true })
  }

  return (
    <Fragment>
      <div className="group-list">
        {/* 全部分组 */}
        <div
          className="group-item"
          onClick={() => handleSelectCategory(null)}
        >
          <div className="group-icon">
            <FolderOpen size={16} />
          </div>
          <div className="group-info">
            <span className="group-name">全部 API</span>
            <span className="group-count">{apiList.length}</span>
          </div>
        </div>

        {/* 各个分类 */}
        {categories.map((category) => (
          <div key={category.id}>
            <div
              className="group-item group-header"
              onClick={() => toggleGroup(category.id)}
            >
              <div className="group-icon">
                {expandedGroups.has(category.id) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </div>
              <div className="group-info">
                <span className="group-name">{category.name}</span>
                <span className="group-count">{category.count}</span>
              </div>
            </div>

            {expandedGroups.has(category.id) && (
              <div className="group-apis">
                {category.apis.map((api) => (
                  <div
                    key={api.id}
                    className="group-api-item"
                    onClick={() => handleSelectApi(api, category.id)}
                  >
                    <span className={`api-method method-${api.method.toLowerCase()}`}>
                      {api.method}
                    </span>
                    <span className="api-summary">{api.summary}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Fragment>
  )
}
