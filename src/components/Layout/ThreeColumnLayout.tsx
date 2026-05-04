import { useState, useEffect } from 'react'
import { useApiStore } from '@/stores/apiStore'
import { GroupSidebar } from '../ApiExplorer/GroupSidebar'
import { ApiListColumn } from '../ApiExplorer/ApiListColumn'
import { ApiDetailPanel } from '../ApiExplorer/ApiDetailPanel'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './ThreeColumnLayout.css'

export function ThreeColumnLayout() {
  const { apiList, currentApi, initializeData } = useApiStore()
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [middleCollapsed, setMiddleCollapsed] = useState(false)

  useEffect(() => {
    initializeData()
  }, [])

  return (
    <div className="three-column-layout">
      <div className={`left-sidebar ${leftCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!leftCollapsed && <h3>分组</h3>}
          <button
            className="collapse-btn"
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            title={leftCollapsed ? '展开' : '收起'}
          >
            {leftCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <div className="sidebar-content">
          {!leftCollapsed && <GroupSidebar />}
        </div>
      </div>

      <div className={`middle-sidebar ${middleCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!middleCollapsed && <h3>API 列表</h3>}
          <button
            className="collapse-btn"
            onClick={() => setMiddleCollapsed(!middleCollapsed)}
            title={middleCollapsed ? '展开' : '收起'}
          >
            {middleCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <div className="sidebar-content">
          {!middleCollapsed && <ApiListColumn />}
        </div>
      </div>

      <div className="main-content">
        {apiList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>暂无 API 数据</h3>
            <p>正在从后端加载 Swagger 文档...</p>
          </div>
        ) : currentApi ? (
          <ApiDetailPanel />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👈</div>
            <h3>选择一个 API 接口</h3>
            <p>点击左侧或中间的 API 列表查看接口详情和调试</p>
          </div>
        )}
      </div>
    </div>
  )
}
