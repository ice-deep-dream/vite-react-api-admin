import type { ApiItem } from './api'

/**
 * 项目接口
 */
export interface Project {
  id: string
  name: string
  description: string
  openApiUrl?: string
  openApiFile?: string
  apiCount: number
  createdAt: string
  updatedAt: string
  tags?: string[]
  avatar?: string
}

/**
 * 项目表单数据
 */
export interface ProjectFormData {
  name: string
  description: string
  openApiUrl?: string
  tags?: string[]
}

/**
 * 收藏夹接口
 */
export interface FavoriteFolder {
  id: string
  name: string
  icon?: string
  apiIds: string[]
  createdAt: string
  updatedAt: string
}

/**
 * 历史记录接口
 */
export interface HistoryItem {
  id: string
  projectId: string
  apiId: string
  apiPath: string
  method: string
  requestUrl: string
  requestMethod: string
  requestParams?: Record<string, any>
  requestHeaders?: Record<string, string>
  requestBody?: any
  responseStatus: number
  responseData?: any
  responseTime: number
  timestamp: string
}

/**
 * OpenAPI 规范类型
 */
export interface OpenAPISchema {
  openapi?: string
  swagger?: string
  info: {
    title: string
    version: string
    description?: string
  }
  servers?: Array<{
    url: string
    description?: string
  }>
  paths: Record<string, any>
  components?: {
    schemas?: Record<string, any>
    securitySchemes?: Record<string, any>
  }
  tags?: Array<{
    name: string
    description?: string
  }>
}

/**
 * 搜索结果接口
 */
export interface SearchResult {
  api: ApiItem
  matchedFields: string[]
  score: number
}
