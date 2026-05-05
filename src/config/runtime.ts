interface IceApiDocConfig {
  apiBaseUrl: string | null
  swaggerJsonPath: string
  docTitle: string
}

declare global {
  interface Window {
    __ICE_API_DOC_CONFIG__?: Partial<IceApiDocConfig>
  }
}

const STORAGE_KEY_API_BASE = 'ice-api-base-url'
const STORAGE_KEY_SWAGGER_PATH = 'ice-swagger-json-path'
const STORAGE_KEY_CONFIGURED = 'ice-api-configured'

function getStoredApiBaseUrl(): string | null {
  const isConfigured = localStorage.getItem(STORAGE_KEY_CONFIGURED)
  if (isConfigured) {
    const stored = localStorage.getItem(STORAGE_KEY_API_BASE)
    return stored !== null ? stored : ''
  }
  const configVal = window.__ICE_API_DOC_CONFIG__?.apiBaseUrl
  if (configVal && configVal !== '__API_BASE_URL__') return configVal as string
  return null
}

function getStoredSwaggerJsonPath(): string {
  const stored = localStorage.getItem(STORAGE_KEY_SWAGGER_PATH)
  if (stored) return stored
  return window.__ICE_API_DOC_CONFIG__?.swaggerJsonPath || '/api-docs/json'
}

const config: IceApiDocConfig = {
  apiBaseUrl: getStoredApiBaseUrl(),
  swaggerJsonPath: getStoredSwaggerJsonPath(),
  docTitle: window.__ICE_API_DOC_CONFIG__?.docTitle || 'ICE API文档',
}

export function getApiBaseUrl(): string | null {
  return config.apiBaseUrl
}

export function setApiBaseUrl(url: string): void {
  config.apiBaseUrl = url
  localStorage.setItem(STORAGE_KEY_API_BASE, url)
  localStorage.setItem(STORAGE_KEY_CONFIGURED, 'true')
}

export function resetApiConfig(): void {
  config.apiBaseUrl = null
  localStorage.removeItem(STORAGE_KEY_API_BASE)
  localStorage.removeItem(STORAGE_KEY_CONFIGURED)
}

export function getSwaggerJsonPath(): string {
  const base = config.apiBaseUrl
  if (base === null) return config.swaggerJsonPath
  const path = config.swaggerJsonPath
  if (base) {
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`
  }
  return path
}

export function getSwaggerJsonPathRaw(): string {
  return config.swaggerJsonPath
}

export function setSwaggerJsonPath(path: string): void {
  config.swaggerJsonPath = path
  localStorage.setItem(STORAGE_KEY_SWAGGER_PATH, path)
}

export function getDocTitle(): string {
  return config.docTitle
}

export function buildApiUrl(apiPath: string): string {
  if (apiPath.startsWith('http://') || apiPath.startsWith('https://')) {
    return apiPath
  }
  const base = config.apiBaseUrl
  if (base) {
    const separator = apiPath.startsWith('/') ? '' : '/'
    return `${base}${separator}${apiPath}`
  }
  return apiPath.startsWith('/') ? apiPath : `/${apiPath}`
}
