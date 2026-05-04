import type { ApiItem, HttpMethod } from '@/types/api'

export interface RouteMapping {
  frontendPath: string
  apiItem: ApiItem
  method: HttpMethod
  originalPath: string
}

export class RouteMappingService {
  private static instance: RouteMappingService
  private mappings: Map<string, RouteMapping> = new Map()

  static getInstance(): RouteMappingService {
    if (!RouteMappingService.instance) {
      RouteMappingService.instance = new RouteMappingService()
    }
    return RouteMappingService.instance
  }

  buildMappings(apis: ApiItem[]): void {
    this.mappings.clear()
    
    apis.forEach(api => {
      const frontendPath = this.convertApiPathToFrontendPath(api.path, api.method)
      const mapping: RouteMapping = {
        frontendPath,
        apiItem: api,
        method: api.method,
        originalPath: api.path,
      }
      
      this.mappings.set(frontendPath, mapping)
    })
  }

  getMappingByFrontendPath(path: string): RouteMapping | undefined {
    return this.mappings.get(path)
  }

  getMappingByApiPath(apiPath: string, method?: HttpMethod): RouteMapping | undefined {
    for (const mapping of this.mappings.values()) {
      if (mapping.originalPath === apiPath) {
        if (!method || mapping.method === method) {
          return mapping
        }
      }
    }
    return undefined
  }

  getAllMappings(): RouteMapping[] {
    return Array.from(this.mappings.values())
  }

  private convertApiPathToFrontendPath(apiPath: string, method: HttpMethod): string {
    const normalizedPath = apiPath.startsWith('/') ? apiPath.slice(1) : apiPath
    const methodPrefix = method.toLowerCase()
    
    return `/api/${methodPrefix}/${normalizedPath}`
  }

  reset(): void {
    this.mappings.clear()
  }
}

export const routeMappingService = RouteMappingService.getInstance()
