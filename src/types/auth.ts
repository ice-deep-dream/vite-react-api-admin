/**
 * 认证相关类型
 */

export interface AuthSettings {
  token?: string
  tokenType?: 'none' | 'bearer' | 'basic' | 'apikey'
  username?: string
  password?: string
  apiKey?: string
  apiKeyIn?: 'header' | 'query'
}

export interface TokenInfo {
  token: string
  tokenType: string
  expiresIn?: number
  scope?: string
}
