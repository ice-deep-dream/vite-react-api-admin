import type { OpenAPISchema, Project, ApiItem, HttpMethod, ResponseSchema, RequestBody } from '@/types'

/**
   * OpenAPI 解析器
   */
  export class OpenAPIParser {
    private schema: OpenAPISchema

    constructor(schema: OpenAPISchema) {
      this.schema = schema
    }

    /**
     * 解析 $ref 引用
     */
    private resolveRef(ref: string): any {
      if (!ref || !ref.startsWith('#/')) {
        return null
      }

      const parts = ref.replace('#/', '').split('/')
      let current: any = this.schema

      for (const part of parts) {
        if (current && typeof current === 'object') {
          current = current[part]
        } else {
          return null
        }
      }

      return current
    }

    /**
     * 递归解析 schema，处理 $ref
     */
    private resolveSchema(schema: any, visited = new Set<string>()): any {
      if (!schema) return null

      // 处理 $ref
      if (schema.$ref) {
        const refId = schema.$ref
        if (visited.has(refId)) {
          // 循环引用，返回基本类型
          return { type: 'object' }
        }

        visited.add(refId)
        const resolved = this.resolveRef(schema.$ref)
        if (resolved) {
          return this.resolveSchema(resolved, visited)
        }
        return null
      }

      // 处理 allOf
      if (schema.allOf && Array.isArray(schema.allOf)) {
        const merged: any = {}
        for (const subSchema of schema.allOf) {
          const resolved = this.resolveSchema(subSchema, visited)
          if (resolved) {
            Object.assign(merged, resolved)
            if (resolved.properties) {
              merged.properties = { ...merged.properties, ...resolved.properties }
            }
            if (resolved.required) {
              merged.required = [...(merged.required || []), ...(resolved.required || [])]
            }
          }
        }
        return merged
      }

      // 处理 oneOf / anyOf (取第一个)
      if (schema.oneOf && Array.isArray(schema.oneOf)) {
        return this.resolveSchema(schema.oneOf[0], visited)
      }
      if (schema.anyOf && Array.isArray(schema.anyOf)) {
        return this.resolveSchema(schema.anyOf[0], visited)
      }

      return schema
    }

  /**
   * 解析 OpenAPI 文档
   */
  static parse(schema: OpenAPISchema): { project: Partial<Project>; apis: ApiItem[] } {
    const parser = new OpenAPIParser(schema)
    return {
      project: parser.parseProjectInfo(),
      apis: parser.parseApis(),
    }
  }

  /**
   * 解析项目信息
   */
  private parseProjectInfo(): Partial<Project> {
    const { info } = this.schema

    return {
      name: info.title,
      description: info.description || '',
      tags: this.schema.tags?.map(tag => tag.name),
    }
  }

  /**
   * 解析 API 列表
   */
  private parseApis(): ApiItem[] {
    const apis: ApiItem[] = []

    Object.entries(this.schema.paths).forEach(([path, pathItem]) => {
      // 遍历 HTTP 方法
      Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          const api = this.parseApi(path, method, operation)
          apis.push(api)
        }
      })
    })

    return apis
  }

  /**
   * 解析单个 API
   */
  private parseApi(path: string, method: string, operation: any): ApiItem {
    const requestBody = this.parseRequestBody(operation.requestBody)

    return {
      id: `${method.toUpperCase()}-${path}`,
      path,
      method: method.toUpperCase() as HttpMethod,
      summary: operation.summary || operation.operationId || '',
      description: operation.description || operation.summary || '',
      tags: operation.tags || [],
      parameters: this.parseParameters(operation.parameters, operation.requestBody),
      requestBody: requestBody,
      responses: this.parseResponses(operation.responses),
      deprecated: operation.deprecated || false,
    }
  }

  /**
   * 解析参数
   */
  private parseParameters(parameters?: any[], requestBody?: any) {
    const result: any[] = []

    // 解析普通参数（query, path, header）
    if (parameters) {
      parameters.forEach((param) => {
        result.push({
          name: param.name,
          in: param.in,
          description: param.description || '',
          required: param.required || false,
          schema: param.schema,
          example: param.example || param.schema?.example,
        })
      })
    }

    // 解析 Body 参数
    if (requestBody) {
      const content = requestBody.content
      if (content) {
        const jsonContent = content['application/json'] || content['*/*']
        if (jsonContent && jsonContent.schema) {
          const bodyParams = this.extractBodyParams(jsonContent.schema)
          result.push(...bodyParams)
        }
      }
    }

    return result
  }

  /**
     * 从 Body schema 中提取参数
     */
    private extractBodyParams(schema: any, parentName: string = ''): any[] {
      const params: any[] = []

      if (!schema) return params

      // 解析 schema，处理 $ref、allOf 等
      const resolvedSchema = this.resolveSchema(schema)
      if (!resolvedSchema) return params

      // 处理 object 类型
      if (resolvedSchema.type === 'object' && resolvedSchema.properties) {
        Object.entries(resolvedSchema.properties).forEach(([key, value]: [string, any]) => {
          const paramName = parentName ? `${parentName}.${key}` : key
          const required = resolvedSchema.required?.includes(key) || false

          // 递归解析嵌套的 schema
          const resolvedValue = this.resolveSchema(value)

          if (resolvedValue?.type === 'object' && resolvedValue.properties) {
            // 递归处理嵌套对象
            params.push(...this.extractBodyParams(resolvedValue, paramName))
          } else {
            // 基本类型
            params.push({
              name: paramName,
              in: 'body',
              description: resolvedValue?.description || value.description || '',
              required,
              schema: { type: resolvedValue?.type || value.type || 'string' },
              example: resolvedValue?.example || value.example,
            })
          }
        })
      }

      // 处理 array 类型
      if (resolvedSchema.type === 'array' && resolvedSchema.items) {
        params.push({
          name: parentName || 'data',
          in: 'body',
          description: resolvedSchema.description || '',
          required: true,
          schema: { type: 'array', items: resolvedSchema.items },
          example: resolvedSchema.example,
        })
      }

      return params
    }

  /**
   * 解析请求体
   */
  private parseRequestBody(requestBody?: any): RequestBody | undefined {
    if (!requestBody) return undefined

    const content = requestBody.content
    if (!content) return undefined

    const jsonContent = content['application/json'] || content['*/*']
    if (!jsonContent) return undefined

    return {
      description: requestBody.description,
      required: requestBody.required || false,
      content: {
        'application/json': {
          schema: jsonContent.schema,
        },
      },
    }
  }

  /**
   * 解析响应
   */
  private parseResponses(responses?: any): Record<string, ResponseSchema> {
    if (!responses) return {}

    const result: Record<string, ResponseSchema> = {}
    Object.entries(responses).forEach(([status, response]: [string, any]) => {
      result[status] = {
        description: response.description || '',
        content: response.content,
      }
    })
    return result
  }

  /**
   * 从 URL 加载 OpenAPI 文档
   */
  static async loadFromUrl(url: string): Promise<OpenAPISchema> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 从文件加载 OpenAPI 文档
   */
  static loadFromFile(file: File): Promise<OpenAPISchema> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          const schema = JSON.parse(content)
          resolve(schema)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }
}
