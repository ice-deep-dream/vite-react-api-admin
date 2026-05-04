import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useApiStore } from '@/stores/apiStore'
import { getMethodColor, getMethodBgColor, generateApiSlug } from '@/utils/methodColors'
import './SearchModal.css'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { apiList, setCurrentApi } = useApiStore()
  const navigate = useNavigate()

  const handleSelect = (api: any) => {
    setCurrentApi(api)
    navigate(generateApiSlug(api), { replace: true })
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setQuery('')
        setResults([])
        setSelectedIndex(0)
      })
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) {
      requestAnimationFrame(() => {
        setResults(apiList.slice(0, 10))
        setSelectedIndex(0)
      })
      return
    }

    const lower = query.toLowerCase()
    const terms = lower.split(/\s+/).filter(Boolean)

    const filtered = apiList.filter(api => {
      const searchStr = `${api.method} ${api.path} ${api.summary || ''} ${(api.tags || []).join(' ')}`.toLowerCase()
      return terms.every(term => searchStr.includes(term))
    })

    const scored = filtered.map(api => {
      const searchStr = `${api.method} ${api.path} ${api.summary || ''} ${(api.tags || []).join(' ')}`.toLowerCase()
      let score = 0
      if (api.summary?.toLowerCase().includes(lower)) score += 10
      if (api.path.toLowerCase().includes(lower)) score += 5
      if (api.tags?.some(t => t.toLowerCase().includes(lower))) score += 3
      if (api.method.toLowerCase() === lower) score += 2
      terms.forEach(term => {
        if (searchStr.includes(term)) score += 1
      })
      return { ...api, score }
    })

    scored.sort((a, b) => b.score - a.score)
    requestAnimationFrame(() => {
      setResults(scored.slice(0, 20))
      setSelectedIndex(0)
    })
  }, [query, apiList])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        handleSelect(results[selectedIndex])
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose, handleSelect])

  if (!isOpen) return null

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal-input-wrapper">
          <Search size={18} className="search-modal-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="搜索 API 名称、路径、标签..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="search-modal-clear" onClick={() => setQuery('')}>
              <X size={14} />
            </button>
          )}
          <kbd className="search-modal-kbd">ESC</kbd>
        </div>
        <div className="search-modal-results">
          {results.length === 0 ? (
            <div className="search-modal-empty">
              <p>未找到匹配的 API</p>
            </div>
          ) : (
            results.map((api, index) => (
              <div
                key={api.id}
                className={`search-modal-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(api)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span
                  className="search-modal-method"
                  style={{
                    color: getMethodColor(api.method),
                    background: getMethodBgColor(api.method)
                  }}
                >
                  {api.method}
                </span>
                <span className="search-modal-summary">{api.summary || api.path}</span>
                <span className="search-modal-path">{api.path}</span>
              </div>
            ))
          )}
        </div>
        <div className="search-modal-footer">
          <span><kbd>↑↓</kbd> 导航</span>
          <span><kbd>Enter</kbd> 打开</span>
          <span><kbd>Esc</kbd> 关闭</span>
        </div>
      </div>
    </div>
  )
}
