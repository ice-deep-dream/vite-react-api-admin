import { useState } from 'react'
import { useDebugStore } from '@/stores/debugStore'
import { JsonViewer } from '../ui/JsonViewer'
import './ResponsePanel.css'

export function ResponsePanel() {
  const {
    responseData,
    responseStatus,
    responseTime,
    responseHeaders,
  } = useDebugStore()

  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body')

  const getStatusClass = (status: number) => {
    if (status >= 200 && status < 300) return 'status-success'
    if (status >= 300 && status < 400) return 'status-redirect'
    if (status >= 400 && status < 500) return 'status-client-error'
    if (status >= 500) return 'status-server-error'
    return ''
  }

  if (!responseData && responseStatus === 0) {
    return (
      <div className="response-panel empty">
        <div className="empty-state">
          <div className="empty-icon">📡</div>
          <p>发送请求后查看响应</p>
        </div>
      </div>
    )
  }

  return (
    <div className="response-panel">
      <div className="response-status-bar">
        <span className={`status-code ${getStatusClass(responseStatus)}`}>
          {responseStatus || '-'}
        </span>
        <span className="response-time">{responseTime}ms</span>
      </div>

      <div className="response-tabs">
        <button
          className={`tab ${activeTab === 'body' ? 'active' : ''}`}
          onClick={() => setActiveTab('body')}
        >
          Response
        </button>
        <button
          className={`tab ${activeTab === 'headers' ? 'active' : ''}`}
          onClick={() => setActiveTab('headers')}
        >
          Headers
        </button>
      </div>

      <div className="response-content">
        {activeTab === 'body' ? (
          responseData ? (
            <JsonViewer data={responseData} />
          ) : (
            <div className="empty-response">无响应数据</div>
          )
        ) : (
          <div className="headers-viewer">
            {responseHeaders && Object.keys(responseHeaders).length > 0 ? (
              Object.entries(responseHeaders).map(([key, value]) => (
                <div key={key} className="header-item">
                  <span className="header-key">{key}:</span>
                  <span className="header-value">{value}</span>
                </div>
              ))
            ) : (
              <div className="empty-response">无响应头</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
