import { useState } from 'react'
import { useDebugStore } from '@/stores/debugStore'
import type { RequestBody } from '@/types/api'
import './BodyEditor.css'

interface BodyEditorProps {
  schema?: RequestBody
}

export function BodyEditor(_props: BodyEditorProps) {
  void _props
  const { requestBody, setRequestBody } = useDebugStore()
  const [bodyType, setBodyType] = useState<'json' | 'form' | 'raw'>('json')

  const handleBodyChange = (value: string) => {
    setRequestBody(value)
  }

  return (
    <div className="body-editor">
      <div className="body-editor-header">
        <div className="body-type-tabs">
          <button
            className={`tab ${bodyType === 'json' ? 'active' : ''}`}
            onClick={() => setBodyType('json')}
          >
            JSON
          </button>
          <button
            className={`tab ${bodyType === 'form' ? 'active' : ''}`}
            onClick={() => setBodyType('form')}
            disabled
          >
            Form
          </button>
          <button
            className={`tab ${bodyType === 'raw' ? 'active' : ''}`}
            onClick={() => setBodyType('raw')}
            disabled
          >
            Raw
          </button>
        </div>
      </div>

      {bodyType === 'json' && (
        <div className="json-editor">
          <textarea
            className="json-textarea"
            value={requestBody}
            onChange={(e) => handleBodyChange(e.target.value)}
            placeholder='请输入 JSON 格式的请求体，例如：
{
  "name": "example",
  "value": 123
}'
            rows={15}
          />
        </div>
      )}

      {bodyType === 'form' && (
        <div className="form-editor">
          <p>Form 格式编辑器开发中...</p>
        </div>
      )}

      {bodyType === 'raw' && (
        <div className="raw-editor">
          <p>Raw 格式编辑器开发中...</p>
        </div>
      )}
    </div>
  )
}
