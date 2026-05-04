import { useState, useEffect } from 'react'
import { useApiStore } from '@/stores/apiStore'
import { useAuthStore } from '@/stores/authStore'
import { Play, Clock, Server } from 'lucide-react'
import { getMethodGradient } from '@/utils/methodColors'
import { buildApiUrl } from '@/config/runtime'
import type { HttpMethod } from '@/types/api'
import './ApiDetailPanel.css'

export function ApiDetailPanel() {
  const { currentApi } = useApiStore()
  const { setGlobalToken, setTokenType } = useAuthStore()
  const [method, setMethod] = useState<HttpMethod>(currentApi?.method || 'GET')
  const [url, setUrl] = useState(currentApi?.path || '')
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [responseTime, setResponseTime] = useState(0)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [paramValues, setParamValues] = useState<Record<string, string>>({})
  const [headerValues, setHeaderValues] = useState<Record<string, string>>({})
  const [bodyValue, setBodyValue] = useState<string>('{}')
  const [newHeaderKey, setNewHeaderKey] = useState('')
  const [newHeaderValue, setNewHeaderValue] = useState('')
  const [customHeaders, setCustomHeaders] = useState<Array<{ key: string; value: string }>>([])
  const [bodyMode, setBodyMode] = useState<'json' | 'form'>('json')

  // 添加自定义 Header
  const handleAddHeader = () => {
    if (newHeaderKey && newHeaderValue) {
      setCustomHeaders([...customHeaders, { key: newHeaderKey, value: newHeaderValue }])
      setNewHeaderKey('')
      setNewHeaderValue('')
    }
  }

  // 删除自定义 Header
  const handleRemoveHeader = (index: number) => {
    const updated = customHeaders.filter((_, i) => i !== index)
    setCustomHeaders(updated)
  }
  
  // 自动生成 JSON Body
  const handleGenerateJsonBody = () => {
    console.log('当前 API:', currentApi)
    console.log('Request Body:', currentApi?.requestBody)
    
    if (!currentApi?.requestBody) {
      console.warn('当前 API 没有定义 requestBody')
      alert('当前 API 没有定义 Body 参数')
      return
    }
    
    // 尝试从不同位置获取 schema
    const schema = currentApi.requestBody.content?.['application/json']?.schema
    
    console.log('使用的 Schema:', schema)
    
    if (schema) {
      // 从 apiStore 中获取完整的 Swagger 数据（包含 components）
      const { swaggerData } = useApiStore.getState()
      const exampleJson = parseSchemaToExample(schema, new Set(), 0, swaggerData)
      console.log('生成的 JSON:', exampleJson)
      setBodyValue(JSON.stringify(exampleJson, null, 2))
      setBodyMode('json')
    } else {
      console.warn('没有找到 schema')
      alert('无法找到 Schema，无法自动生成 JSON')
    }
  }
  
  /**
   * 生成空 JSON（只保留属性名，值为空或默认值）
   */
  const generateEmptyJson = (schema: any, swaggerData?: any, visited = new Set<string>()): any => {
    if (!schema) return null

    // 处理 $ref
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop() || ''
      if (visited.has(refName)) {
        return '[Circular Reference]'
      }
      visited.add(refName)
      
      // 尝试从 swaggerData 的 components 中解析
      if (swaggerData?.components?.schemas) {
        const refSchema = swaggerData.components.schemas[refName]
        if (refSchema) {
          return generateEmptyJson(refSchema, swaggerData, visited)
        }
      }
      
      // 找不到 schema，返回空对象
      return {}
    }

    // 处理 allOf
    if (schema.allOf && Array.isArray(schema.allOf)) {
      const merged: any = {}
      for (const subSchema of schema.allOf) {
        const resolved = generateEmptyJson(subSchema, swaggerData, visited)
        Object.assign(merged, resolved)
      }
      return merged
    }

    // 根据类型生成空值
    switch (schema.type) {
      case 'object':
        if (schema.properties) {
          const obj: any = {}
          Object.entries(schema.properties).forEach(([key, value]: [string, any]) => {
            obj[key] = generateEmptyJson(value, swaggerData, visited)
          })
          return obj
        }
        return {}
      
      case 'array':
        if (schema.items) {
          return [generateEmptyJson(schema.items, swaggerData, visited)]
        }
        return []
      
      case 'string':
        return schema.example || ''
      
      case 'number':
      case 'integer':
        return schema.example || 0
      
      case 'boolean':
        return schema.example || false
      
      default:
        return null
    }
  }
  
  /**
   * 获取参数的类型标签
   */
  const getTypeLabel = (param: any): string => {
    if (!param) return 'any'
    
    // 从 schema 中获取类型
    if (param.schema) {
      return param.schema.type || 'any'
    }
    
    // 从 example 推断类型
    if (param.example !== undefined) {
      return typeof param.example
    }
    
    return 'string'
  }
 
  // 当 API 切换时，重置参数值
  useEffect(() => {
    if (currentApi) {
      // 使用 requestAnimationFrame 延迟状态更新，避免级联渲染
      requestAnimationFrame(() => {
        setMethod(currentApi.method)
        setUrl(currentApi.path)
        setActiveTab('params')
        setResponse(null)
        setStatusCode(null)
        setResponseTime(0)
        setCustomHeaders([])
        setHeaderValues({})
        setNewHeaderKey('')
        setNewHeaderValue('')
        
        const initialValues: Record<string, string> = {}
        currentApi.parameters?.forEach(param => {
          if (param.example) {
            initialValues[param.name] = String(param.example)
          }
        })
        setParamValues(initialValues)
        
        if (currentApi.requestBody) {
          const schema = currentApi.requestBody.content?.['application/json']?.schema
          
          if (schema) {
            const { swaggerData } = useApiStore.getState()
            const emptyJson = generateEmptyJson(schema, swaggerData)
            setBodyValue(JSON.stringify(emptyJson, null, 2))
            setBodyMode('json')
          } else {
            setBodyValue('{}')
          }
        } else {
          setBodyValue('')
          setBodyMode('json')
        }
      })
    }
  }, [currentApi])

  if (!currentApi) {
    return null
  }

  const handleSendRequest = async () => {
    setIsLoading(true)
    setResponse(null)
    setStatusCode(null)
    
    const startTime = Date.now()
    
    try {
      // 构建完整 URL
      let fullUrl = url
      
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = buildApiUrl(url.startsWith('/api') ? url : `/api${url}`)
      }
      
      // 添加 query 参数
      const queryParams = new URLSearchParams()
      currentApi.parameters?.forEach(param => {
        if (param.in === 'query' && paramValues[param.name]) {
          queryParams.append(param.name, paramValues[param.name])
        }
      })
      
      if (queryParams.toString()) {
        const separator = fullUrl.includes('?') ? '&' : '?'
        fullUrl += `${separator}${queryParams.toString()}`
      }
      
      // 准备请求配置
      const config: RequestInit = {
        method,
        headers: {} as Record<string, string>,
      }
      
      const headers = config.headers as Record<string, string>
      headers['Content-Type'] = 'application/json'
      
      currentApi.parameters?.forEach(param => {
        if (param.in === 'header' && paramValues[param.name]) {
          headers[param.name] = paramValues[param.name]
        }
      })
      
      // 添加用户自定义 Headers
      Object.entries(headerValues).forEach(([key, value]) => {
        if (value) {
          headers[key] = value
        }
      })
      
      customHeaders.forEach(({ key, value }) => {
        if (value) {
          headers[key] = value
        }
      })
      
      const { globalToken, tokenType } = useAuthStore.getState()
      if (globalToken && tokenType === 'bearer') {
        headers['Authorization'] = `Bearer ${globalToken}`
        console.log('自动添加 Authorization Header:', `Bearer ${globalToken.substring(0, 20)}...`)
      }
      
      // 对于非 GET/HEAD 请求，添加请求体
      if (!['GET', 'HEAD'].includes(method)) {
        // 根据 Body 模式构建请求体
        if (bodyMode === 'form') {
          // 表单模式：从 paramValues 构建
          const bodyParams = currentApi.parameters?.filter(p => p.in === 'body')
          if (bodyParams && bodyParams.length > 0) {
            const bodyObj: any = {}
            bodyParams.forEach(param => {
              if (paramValues[param.name]) {
                bodyObj[param.name] = paramValues[param.name]
              }
            })
            config.body = JSON.stringify(bodyObj)
          } else {
            // 如果没有定义 body 参数，使用空对象
            config.body = JSON.stringify({})
          }
        } else {
          // JSON 模式：使用 textarea 中的 JSON，验证格式
          try {
            // 验证 JSON 格式
            JSON.parse(bodyValue)
            config.body = bodyValue
          } catch (e) {
            console.error('Body JSON 格式错误:', e)
            setResponse({
              error: 'Body JSON 格式错误：' + (e as Error).message,
            })
            setStatusCode(0)
            setIsLoading(false)
            return
          }
        }
      }
      
      console.log('发送请求:', {
        url: fullUrl,
        method,
        headers: config.headers,
        body: config.body,
      })
      
      // 发送真实请求
      const res = await fetch(fullUrl, config)
      const endTime = Date.now()
      
      // 解析响应
      const responseData = await res.json().catch(() => null)
      
      setResponse(responseData)
      setStatusCode(res.status)
      setResponseTime(endTime - startTime)
      setIsLoading(false)
      
      // 检查是否是登录接口，如果是且登录成功，自动保存 Token
      if (isLoginApi(currentApi) && res.status === 200 && responseData) {
        const token = extractTokenFromResponse(responseData)
        if (token) {
          setGlobalToken(token)
          setTokenType('bearer')
          console.log('登录成功，Token 已自动保存')
        }
      }
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

  /**
   * 解析 schema 生成示例数据
   * @param schema - 要解析的 schema
   * @param visited - 已访问的引用集合，防止循环引用
   * @param depth - 递归深度
   * @param swaggerData - 完整的 Swagger 数据（用于解析 $ref）
   */
  const parseSchemaToExample = (
    schema: any, 
    visited = new Set<string>(), 
    depth = 0,
    swaggerData?: any
  ): any => {
    if (!schema) {
      console.log('[parseSchemaToExample] schema 为空')
      return null
    }

    // 防止递归过深
    if (depth > 10) {
      console.log('[parseSchemaToExample] 递归过深，返回空对象')
      return {}
    }

    console.log(`[parseSchemaToExample] depth=${depth}, type=${schema.type}, ref=${schema.$ref}`)

    // 处理 $ref
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop() || ''
      console.log('[parseSchemaToExample] 处理 $ref:', refName)
      
      if (visited.has(refName)) {
        console.log('[parseSchemaToExample] 循环引用:', refName)
        return '[Circular Reference]'
      }
      visited.add(refName)
      
      // 尝试从 swaggerData 的 components 中解析
      if (swaggerData?.components?.schemas) {
        const refSchema = swaggerData.components.schemas[refName]
        console.log('[parseSchemaToExample] 从 components 中找到 schema:', refName, refSchema)
        if (refSchema) {
          // 递归解析引用的 schema
          return parseSchemaToExample(refSchema, visited, depth + 1, swaggerData)
        }
      }
      
      // 如果没有 swaggerData 或者找不到，使用预定义的类型
      // 从常见类型返回
      if (refName.includes('LoginToken')) {
        return {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expiresIn: 7200,
        }
      }
      if (refName.includes('AccountInfo')) {
        return {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          avatar: 'https://example.com/avatar.png',
          roles: ['admin'],
          permissions: ['*'],
        }
      }
      if (refName.includes('LoginDto')) {
        return {
          username: 'admin',
          password: '******',
        }
      }
      if (refName.includes('RegisterDto')) {
        return {
          username: 'newuser',
          password: '******',
          email: 'user@example.com',
        }
      }
      if (refName.includes('AccountUpdateDto')) {
        return {
          email: 'newemail@example.com',
          avatar: 'https://example.com/new-avatar.png',
        }
      }
      if (refName.includes('PasswordUpdateDto')) {
        return {
          oldPassword: '******',
          newPassword: '******',
        }
      }
      if (refName.includes('SendEmailCodeDto')) {
        return {
          email: 'user@example.com',
          scene: 'login',
        }
      }
      if (refName.includes('ImageCaptcha')) {
        return {
          captchaId: 'uuid-string',
          imageData: 'data:image/png;base64,iVBORw0KG...',
        }
      }
      if (refName.includes('ResOp')) {
        return {
          code: 200,
          message: 'success',
        }
      }
      
      // 未知类型，返回空对象
      console.log('[parseSchemaToExample] 未知的 $ref 类型:', refName)
      return {}
    }

    // 处理 allOf
    if (schema.allOf && Array.isArray(schema.allOf)) {
      console.log('[parseSchemaToExample] 处理 allOf')
      const merged: any = {}
      for (const subSchema of schema.allOf) {
        const resolved = parseSchemaToExample(subSchema, visited, depth + 1, swaggerData)
        Object.assign(merged, resolved)
      }
      return merged
    }

    // 根据类型生成示例
    switch (schema.type) {
      case 'object':
        if (schema.properties) {
          console.log('[parseSchemaToExample] 处理 object，properties:', Object.keys(schema.properties))
          const obj: any = {}
          Object.entries(schema.properties).forEach(([key, value]) => {
            obj[key] = parseSchemaToExample(value as any, visited, depth + 1, swaggerData)
          })
          return obj
        }
        console.log('[parseSchemaToExample] object 没有 properties')
        return {}
      
      case 'array':
        if (schema.items) {
          console.log('[parseSchemaToExample] 处理 array')
          return [parseSchemaToExample(schema.items, visited, depth + 1, swaggerData)]
        }
        console.log('[parseSchemaToExample] array 没有 items')
        return []
      
      case 'string':
        return schema.example || 'string'
      
      case 'number':
      case 'integer':
        return schema.example || 0
      
      case 'boolean':
        return schema.example || true
      
      default:
        console.log('[parseSchemaToExample] 未知类型:', schema.type)
        return null
    }
  }

  return (
    <div className="api-detail-panel">
      <div className="api-detail-header">
        <div className="api-method-title">
          <span
            className="method-badge method-large"
            style={{ 
              background: getMethodGradient(currentApi.method),
              color: 'white'
            }}
          >
            {currentApi.method}
          </span>
          <h2>{currentApi.summary}</h2>
        </div>
      </div>

      {/* 请求区域 */}
      <div className="request-section">
        <div className="request-bar">
          <select
            className="method-select"
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
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
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="输入请求 URL"
          />
          
          <button
            className="send-btn"
            onClick={handleSendRequest}
            disabled={isLoading}
          >
            <Play size={16} />
            {isLoading ? '发送中...' : '发送'}
          </button>
        </div>
      </div>

      {/* 主体内容区域 - 左右分栏 */}
      <div className="main-content-split">
        {/* 左侧：参数编辑 */}
        <div className="left-panel">
          <div className="params-tabs">
            <div className="tabs">
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
              >
                Body
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'params' && (
                <div className="params-editor">
                  {currentApi.parameters && currentApi.parameters.length > 0 ? (
                    currentApi.parameters
                      .filter(p => ['query', 'path'].includes(p.in))
                      .map((param) => (
                        <div key={param.name} className="param-row">
                          <div className="param-info">
                            <span className="param-name">{param.name}</span>
                            {param.required && <span className="required">*</span>}
                            <span className="type-badge">{getTypeLabel(param)}</span>
                          </div>
                          <input
                            type="text"
                            className="param-value"
                            placeholder={param.description || '参数值'}
                            value={paramValues[param.name] || ''}
                            onChange={(e) => setParamValues({
                              ...paramValues,
                              [param.name]: e.target.value
                            })}
                          />
                        </div>
                      ))
                  ) : (
                    <div className="empty-params">暂无参数</div>
                  )}
                </div>
              )}

              {activeTab === 'headers' && (
                <div className="headers-editor">
                  {/* 全局 Header 参数 */}
                  <div className="header-section">
                    <div className="header-section-title">全局 Header</div>
                    {(() => {
                      // 从 zustand store 中获取最新的全局 Token
                      const { globalToken, tokenType } = useAuthStore.getState()
                      const globalHeaders: Array<{ name: string; value: string; readonly: boolean }> = []
                      
                      // 添加 Content-Type
                      globalHeaders.push({ name: 'Content-Type', value: 'application/json', readonly: false })
                      
                      // 添加 Token（如果存在）
                      if (globalToken && tokenType === 'bearer') {
                        globalHeaders.push({ 
                          name: 'Authorization', 
                          value: `Bearer ${globalToken}`, 
                          readonly: true 
                        })
                      }
                      
                      return globalHeaders.length > 0 ? (
                        globalHeaders.map((header, index) => (
                          <div key={index} className="param-row">
                            <div className="param-info">
                              <span className="param-name">{header.name}</span>
                              {header.readonly && <span className="readonly-badge">全局</span>}
                            </div>
                            <input
                              type="text"
                              className="param-value"
                              value={header.value}
                              readOnly={header.readonly}
                              onChange={(e) => {
                                if (!header.readonly) {
                                  setHeaderValues({
                                    ...headerValues,
                                    [header.name]: e.target.value
                                  })
                                }
                              }}
                            />
                          </div>
                        ))
                      ) : null
                    })()}
                  </div>
                  
                  {/* API 自定义 Header 参数 */}
                  {currentApi.parameters && currentApi.parameters.filter(p => p.in === 'header').length > 0 && (
                    <div className="header-section">
                      <div className="header-section-title">API Header</div>
                      {currentApi.parameters
                        .filter(p => p.in === 'header')
                        .map((param) => (
                          <div key={param.name} className="param-row">
                            <div className="param-info">
                              <span className="param-name">{param.name}</span>
                              {param.required && <span className="required">*</span>}
                            </div>
                            <input
                              type="text"
                              className="param-value"
                              placeholder={param.description || 'Header 值'}
                              value={paramValues[param.name] || ''}
                              onChange={(e) => setParamValues({
                                ...paramValues,
                                [param.name]: e.target.value
                              })}
                            />
                          </div>
                        ))}
                    </div>
                  )}
                  
                  {/* 自定义 Header 区域 */}
                  <div className="header-section">
                    <div className="header-section-title">自定义 Header</div>
                    <div className="param-row">
                      <div className="param-info">
                        <input
                          type="text"
                          className="param-name-input"
                          placeholder="Header 名称"
                          value={newHeaderKey}
                          onChange={(e) => setNewHeaderKey(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="param-value"
                        placeholder="Header 值"
                        value={newHeaderValue}
                        onChange={(e) => setNewHeaderValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newHeaderKey && newHeaderValue) {
                            handleAddHeader()
                          }
                        }}
                      />
                      <button
                        className="add-header-btn"
                        onClick={handleAddHeader}
                        disabled={!newHeaderKey || !newHeaderValue}
                      >
                        添加
                      </button>
                    </div>
                    {customHeaders.length > 0 && (
                      <div className="custom-headers-list">
                        {customHeaders.map((header, index) => (
                          <div key={index} className="param-row">
                            <div className="param-info">
                              <span className="param-name">{header.key}</span>
                            </div>
                            <input
                              type="text"
                              className="param-value"
                              value={header.value}
                              onChange={(e) => {
                                const updated = [...customHeaders]
                                updated[index] = { ...header, value: e.target.value }
                                setCustomHeaders(updated)
                              }}
                            />
                            <button
                              className="remove-header-btn"
                              onClick={() => handleRemoveHeader(index)}
                            >
                              删除
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'body' && (
                <div className="body-editor">
                  {currentApi.requestBody ? (
                    <>
                      <div className="body-mode-switcher">
                        <div className="mode-tabs">
                          <button
                            className={`mode-tab ${bodyMode === 'json' ? 'active' : ''}`}
                            onClick={() => setBodyMode('json')}
                          >
                            JSON
                          </button>
                          <button
                            className={`mode-tab ${bodyMode === 'form' ? 'active' : ''}`}
                            onClick={() => setBodyMode('form')}
                          >
                            表单
                          </button>
                        </div>
                        
                        {bodyMode === 'json' && (
                          <button
                            className="generate-json-btn"
                            onClick={handleGenerateJsonBody}
                            title="根据 Schema 自动生成 JSON"
                          >
                            自动生成
                          </button>
                        )}
                      </div>
                      
                      {bodyMode === 'json' && (
                        <div className="body-textarea-container">
                          <textarea
                            className="body-textarea"
                            placeholder='{"key": "value"}'
                            rows={10}
                            value={bodyValue}
                            onChange={(e) => setBodyValue(e.target.value)}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="empty-params">
                      {['GET', 'HEAD', 'OPTIONS'].includes(currentApi.method) 
                        ? `${currentApi.method} 请求不支持 Body 参数` 
                        : '该接口没有定义 Body 参数'}
                    </div>
                  )}
                  
                  {/* 表单模式 */}
                  {bodyMode === 'form' && (
                    <div className="body-form">
                      {currentApi.parameters && currentApi.parameters.filter(p => p.in === 'body').length > 0 ? (
                        <div className="body-params">
                          {currentApi.parameters
                            .filter(p => p.in === 'body')
                            .map((param) => (
                              <div key={param.name} className="param-row">
                                <div className="param-info">
                                  <span className="param-name">{param.name}</span>
                                  {param.required && <span className="required">*</span>}
                                  <span className="type-badge">{getTypeLabel(param)}</span>
                                </div>
                                <input
                                  type="text"
                                  className="param-value"
                                  placeholder={param.description || '参数值'}
                                  value={paramValues[param.name] || ''}
                                  onChange={(e) => setParamValues({
                                    ...paramValues,
                                    [param.name]: e.target.value
                                  })}
                                />
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="empty-params">
                          暂无 Body 参数，请切换到 JSON 模式手动输入
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：响应结果 */}
        <div className="right-panel">
          {response ? (
            <div className="response-section">
              <div className="response-header">
                <h3>响应结果</h3>
                <div className="response-meta">
                  <span className={`status-code status-${Math.floor(statusCode! / 100)}`}>
                    <Server size={14} />
                    {statusCode}
                  </span>
                  <span className="response-time">
                    <Clock size={14} />
                    {responseTime}ms
                  </span>
                </div>
              </div>
              <div className="response-body-wrapper">
                <pre className="response-body">
                  <code>{JSON.stringify(response, null, 2)}</code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="empty-response">
              <div className="empty-response-icon">
                <Server size={48} />
              </div>
              <h4>暂无响应数据</h4>
              <p>点击"发送"按钮发送请求，查看 API 响应结果</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 判断是否是登录接口
 * 通过 API 路径和摘要模糊匹配
 */
function isLoginApi(api: any): boolean {
  if (!api) return false
  
  const path = api.path?.toLowerCase() || ''
  const summary = api.summary?.toLowerCase() || ''
  const description = api.description?.toLowerCase() || ''
  
  // 匹配登录相关的关键字
  const loginKeywords = ['login', '登录', 'signin', 'sign-in', 'auth', 'authenticate']
  
  return loginKeywords.some(keyword => 
    path.includes(keyword) || 
    summary.includes(keyword) || 
    description.includes(keyword)
  )
}

/**
 * 从响应中提取 Token
 * 支持多种常见的 Token 返回格式
 */
function extractTokenFromResponse(responseData: any): string | null {
  if (!responseData) return null
  
  // 格式 1: { token: "xxx" }
  if (responseData.token) {
    return responseData.token
  }
  
  // 格式 2: { access_token: "xxx" }
  if (responseData.access_token) {
    return responseData.access_token
  }
  
  // 格式 3: { data: { token: "xxx" } }
  if (responseData.data?.token) {
    return responseData.data.token
  }
  
  // 格式 4: { data: { access_token: "xxx" } }
  if (responseData.data?.access_token) {
    return responseData.data.access_token
  }
  
  // 格式 5: { code: 200, data: { token: "xxx" } } (标准响应格式)
  if (responseData.code === 200 && responseData.data?.token) {
    return responseData.data.token
  }
  
  return null
}
