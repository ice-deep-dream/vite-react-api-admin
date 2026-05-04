import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApiStore } from '@/stores/apiStore'
import { routeMappingService } from '@/services/routeMappingService'
import { ArrowLeft, Play, Clock } from 'lucide-react'
import { getMethodGradient } from '@/utils/methodColors'
import { buildApiUrl } from '@/config/runtime'
import type { HttpMethod } from '@/types/api'
import './ApiRoutePage.css'

export function ApiRoutePage() {
  const { method, path } = useParams<{ method: string; path: string }>()
  const navigate = useNavigate()
  const { setCurrentApi, clearCurrentApi } = useApiStore()
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [responseTime, setResponseTime] = useState(0)
  const [paramValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!method || !path) {
      return
    }

    const apiPath = '/' + decodeURIComponent(path)
    const apiMethod = method.toUpperCase() as HttpMethod
    
    const mapping = routeMappingService.getMappingByApiPath(apiPath, apiMethod)
    
    if (mapping) {
      setCurrentApi(mapping.apiItem)
    } else {
      console.warn('未找到匹配的 API 路由:', apiMethod, apiPath)
    }

    return () => {
      clearCurrentApi()
    }
  }, [method, path, setCurrentApi, clearCurrentApi])

  const handleSendRequest = async () => {
    if (!method || !path) return

    setIsLoading(true)
    setResponse(null)
    setStatusCode(null)
    
    const startTime = Date.now()
    
    try {
      const apiPath = '/' + decodeURIComponent(path)
      let fullUrl = buildApiUrl(apiPath.startsWith('/api') ? apiPath : `/api${apiPath}`)
      
      const queryParams = new URLSearchParams()
      Object.entries(paramValues).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value)
        }
      })
      
      if (queryParams.toString()) {
        fullUrl += `?${queryParams.toString()}`
      }
      
      const config: RequestInit = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
        },
      }
      
      const res = await fetch(fullUrl, config)
      const endTime = Date.now()
      
      const responseData = await res.json().catch(() => null)
      
      setResponse(responseData)
      setStatusCode(res.status)
      setResponseTime(endTime - startTime)
      setIsLoading(false)
    } catch (error) {
      console.error('请求失败:', error)
      setResponse({
        error: error instanceof Error ? error.message : '请求失败',
      })
      setStatusCode(0)
      setResponseTime(Date.now() - startTime)
      setIsLoading(false)
    }
  }

  if (!method || !path) {
    return (
      <div className="api-route-page">
        <div className="empty-state">
          <h3>无效的 API 路由</h3>
          <p>请检查 URL 格式</p>
        </div>
      </div>
    )
  }

  const apiPath = '/' + decodeURIComponent(path)
  const apiMethod = method.toUpperCase() as HttpMethod

  return (
    <div className="api-route-page">
      <div className="route-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          返回
        </button>
        <div className="route-info">
          <span
            className="method-badge"
            style={{ 
              background: getMethodGradient(apiMethod),
              color: 'white'
            }}
          >
            {apiMethod}
          </span>
          <span className="route-path">{apiPath}</span>
        </div>
      </div>

      <div className="route-content">
        <div className="request-section">
          <button
            className="send-btn"
            onClick={handleSendRequest}
            disabled={isLoading}
          >
            <Play size={16} />
            {isLoading ? '发送中...' : '发送请求'}
          </button>
        </div>

        {response && (
          <div className="response-section">
            <div className="response-header">
              <div className="response-meta">
                {statusCode && (
                  <span className={`status-badge status-${statusCode >= 200 && statusCode < 300 ? 'success' : 'error'}`}>
                    {statusCode}
                  </span>
                )}
                <span className="response-time">
                  <Clock size={14} />
                  {responseTime}ms
                </span>
              </div>
            </div>
            <div className="response-body">
              <pre>{JSON.stringify(response, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
