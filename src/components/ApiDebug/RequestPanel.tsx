import { useState } from 'react'
import { useDebugStore } from '@/stores/debugStore'
import type { ApiItem } from '@/types/api'
import { ParamEditor } from './ParamEditor'
import { HeaderEditor } from './HeaderEditor'
import { BodyEditor } from './BodyEditor'
import './RequestPanel.css'

interface RequestPanelProps {
  api: ApiItem
}

export function RequestPanel({ api }: RequestPanelProps) {
  const {
    requestMethod,
    requestUrl,
    setRequestMethod,
    setRequestUrl,
    sendRequest,
    isLoading,
  } = useDebugStore()

  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params')

  const handleSend = async () => {
    await sendRequest()
  }

  return (
    <div className="request-panel">
      <div className="request-url-bar">
        <select
          value={requestMethod}
          onChange={(e) => setRequestMethod(e.target.value as any)}
          className="method-select"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
        
        <input
          type="text"
          className="url-input"
          value={requestUrl || api.path}
          onChange={(e) => setRequestUrl(e.target.value)}
          placeholder="请输入请求 URL"
        />
        
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>

      <div className="request-tabs">
        <button
          className={`tab ${activeTab === 'params' ? 'active' : ''}`}
          onClick={() => setActiveTab('params')}
        >
          参数
        </button>
        <button
          className={`tab ${activeTab === 'headers' ? 'active' : ''}`}
          onClick={() => setActiveTab('headers')}
        >
          Headers
        </button>
        <button
          className={`tab ${activeTab === 'body' ? 'active' : ''}`}
          onClick={() => setActiveTab('body')}
          disabled={!api.requestBody}
        >
          Body
        </button>
      </div>

      <div className="request-content">
        {activeTab === 'params' && <ParamEditor parameters={api.parameters} />}
        {activeTab === 'headers' && <HeaderEditor />}
        {activeTab === 'body' && api.requestBody && <BodyEditor schema={api.requestBody} />}
      </div>
    </div>
  )
}
