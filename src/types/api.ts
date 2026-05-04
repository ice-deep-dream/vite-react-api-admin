// API 相关类型定义

export interface Project {
  id: string
  name: string
  description: string
  apiDocUrl: string
  createdAt: string
  updatedAt: string
}

export interface ApiItem {
  id: string
  path: string
  method: HttpMethod
  summary: string
  description: string
  tags: string[]
  parameters: Parameter[]
  requestBody?: RequestBody
  responses: Record<string, ResponseSchema>
  deprecated?: boolean
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export interface Parameter {
  name: string
  in: 'query' | 'header' | 'path' | 'cookie' | 'body'
  required: boolean
  schema: Schema
  description?: string
  example?: any
}

export interface RequestBody {
  required: boolean
  content: {
    [mediaType: string]: MediaType
  }
  description?: string
}

export interface MediaType {
  schema: Schema
  example?: any
  examples?: Record<string, Example>
}

export interface Schema {
  type: string
  format?: string
  description?: string
  required?: string[]
  properties?: Record<string, Schema>
  items?: Schema
  enum?: any[]
  default?: any
  $ref?: string
}

export interface Example {
  summary?: string
  description?: string
  value: any
}

export interface ResponseSchema {
  description: string
  content?: {
    [mediaType: string]: MediaType
  }
  headers?: Record<string, Schema>
}

export interface Category {
  id: string
  name: string
  description?: string
  count?: number
  apis: ApiItem[]
  children?: Category[]
}

// 请求配置
export interface RequestConfig {
  method: HttpMethod
  url: string
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
}

// 响应结果
export interface ResponseResult {
  status: number
  headers: Record<string, string>
  data: any
  time: number
}
