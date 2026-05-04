import { useEffect } from 'react'
import { useApiStore } from '@/stores/apiStore'
import { ApiInfo } from '@/components/ApiExplorer/ApiInfo'
import { RequestPanel } from '@/components/ApiDebug/RequestPanel'
import { ResponsePanel } from '@/components/ApiDebug/ResponsePanel'
import './ApiDetail.css'

export function ApiDetail() {
  const { currentApi } = useApiStore()

  useEffect(() => {
    // 这里可以从 URL 参数获取 API ID
    // const apiId = useParams().apiId
    // if (apiId) fetchApiDetail(apiId)
  }, [])

  if (!currentApi) {
    return (
      <div className="api-detail-empty">
        <div className="empty-state">
          <h2>选择一个 API 接口</h2>
          <p>从左侧列表选择要查看和调试的 API 接口</p>
        </div>
      </div>
    )
  }

  return (
    <div className="api-detail">
      <div className="api-detail-header">
        <ApiInfo api={currentApi} />
      </div>
      
      <div className="api-detail-body">
        <div className="api-detail-left">
          <RequestPanel api={currentApi} />
        </div>
        
        <div className="api-detail-right">
          <ResponsePanel />
        </div>
      </div>
    </div>
  )
}
