import { useState } from 'react'
import './JsonViewer.css'

interface JsonViewerProps {
  data: any
}

export function JsonViewer({ data }: JsonViewerProps) {
  const [expanded, setExpanded] = useState(true)

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  const jsonString = JSON.stringify(data, null, 2)

  return (
    <div className="json-viewer">
      <div className="json-viewer-header">
        <button className="toggle-btn" onClick={toggleExpanded}>
          {expanded ? '▼' : '▶'}
        </button>
        <span className="json-size">
          {jsonString.length} bytes
        </span>
        <button
          className="copy-btn"
          onClick={() => navigator.clipboard.writeText(jsonString)}
        >
          📋 复制
        </button>
      </div>
      
      {expanded && (
        <pre className="json-content">
          <code>{jsonString}</code>
        </pre>
      )}
    </div>
  )
}
