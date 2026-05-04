import { useState } from 'react'
import { useDebugStore } from '@/stores/debugStore'
import './HeaderEditor.css'

export function HeaderEditor() {
  const { requestHeaders, setRequestHeaders } = useDebugStore()
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>(
    Object.entries(requestHeaders || {}).map(([key, value]) => ({ key, value }))
  )

  const handleAdd = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const handleRemove = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index)
    setHeaders(newHeaders)
  }

  const handleChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
    
    // 更新到 store
    const headersMap = newHeaders.reduce((acc, h) => {
      if (h.key) acc[h.key] = h.value
      return acc
    }, {} as Record<string, string>)
    setRequestHeaders(headersMap)
  }

  return (
    <div className="header-editor">
      <div className="header-editor-header">
        <h4>请求头</h4>
        <button className="btn-add" onClick={handleAdd}>
          + 添加
        </button>
      </div>
      
      <div className="header-list">
        {headers.map((header, index) => (
          <div key={index} className="header-item">
            <input
              type="text"
              className="header-key"
              placeholder="Header 名"
              value={header.key}
              onChange={(e) => handleChange(index, 'key', e.target.value)}
            />
            <input
              type="text"
              className="header-value"
              placeholder="Header 值"
              value={header.value}
              onChange={(e) => handleChange(index, 'value', e.target.value)}
            />
            <button
              className="btn-remove"
              onClick={() => handleRemove(index)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
