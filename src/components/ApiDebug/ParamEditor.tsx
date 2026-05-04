import { useState } from 'react'
import { useDebugStore } from '@/stores/debugStore'
import type { Parameter } from '@/types/api'
import './ParamEditor.css'

interface ParamEditorProps {
  parameters: Parameter[]
}

export function ParamEditor({ parameters }: ParamEditorProps) {
  const { requestParams, setRequestParams } = useDebugStore()
  const [localParams, setLocalParams] = useState<Record<string, string>>(
    requestParams || {}
  )

  const handleChange = (name: string, value: string) => {
    const newParams = { ...localParams, [name]: value }
    setLocalParams(newParams)
    setRequestParams(newParams)
  }

  if (!parameters || parameters.length === 0) {
    return (
      <div className="param-editor-empty">
        <p>暂无参数</p>
      </div>
    )
  }

  return (
    <div className="param-editor">
      <table className="param-table">
        <thead>
          <tr>
            <th>参数名</th>
            <th>类型</th>
            <th>必填</th>
            <th>值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map(param => (
            <tr key={param.name}>
              <td className="param-name">{param.name}</td>
              <td>
                <span className={`param-type param-type-${param.in}`}>
                  {param.in}
                </span>
              </td>
              <td>{param.required ? '是' : '否'}</td>
              <td>
                <input
                  type="text"
                  className="param-input"
                  value={localParams[param.name] || ''}
                  onChange={(e) => handleChange(param.name, e.target.value)}
                  placeholder={param.example || ''}
                />
              </td>
              <td className="param-description">{param.description || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
