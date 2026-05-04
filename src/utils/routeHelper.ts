import type { HttpMethod } from '@/types/api'

export function apiPathToFrontendRoute(apiPath: string, method: HttpMethod): string {
  const normalizedPath = apiPath.startsWith('/') ? apiPath.slice(1) : apiPath
  const methodPrefix = method.toLowerCase()
  
  return `/api/${methodPrefix}/${normalizedPath}`
}
