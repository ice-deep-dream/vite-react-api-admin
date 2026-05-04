import { create } from 'zustand'
import type { HttpMethod, RequestConfig } from '@/types/api'
import { useAuthStore } from './authStore'
import { buildApiUrl } from '@/config/runtime'

interface DebugState {
  requestMethod: HttpMethod
  requestUrl: string
  requestParams: Record<string, string>
  requestHeaders: Record<string, string>
  requestBody: string
  isLoading: boolean
  responseData: any
  responseStatus: number
  responseTime: number
  responseHeaders: Record<string, string>
  error: string | null
}

interface DebugActions {
  setRequestMethod: (method: HttpMethod) => void
  setRequestUrl: (url: string) => void
  setRequestParams: (params: Record<string, string>) => void
  setRequestHeaders: (headers: Record<string, string>) => void
  setRequestBody: (body: string) => void
  sendRequest: () => Promise<void>
  clearResponse: () => void
  clearError: () => void
}

type DebugStore = DebugState & DebugActions

export const useDebugStore = create<DebugStore>((set, get) => ({
  requestMethod: 'GET',
  requestUrl: '',
  requestParams: {},
  requestHeaders: {},
  requestBody: '',
  isLoading: false,
  responseData: null,
  responseStatus: 0,
  responseTime: 0,
  responseHeaders: {},
  error: null,

  setRequestMethod: (method) => set({ requestMethod: method }),
  
  setRequestUrl: (url) => set({ requestUrl: url }),
  
  setRequestParams: (params) => set({ requestParams: params }),
  
  setRequestHeaders: (headers) => set({ requestHeaders: headers }),
  
  setRequestBody: (body) => set({ requestBody: body }),
  
  clearResponse: () => set({
    responseData: null,
    responseStatus: 0,
    responseTime: 0,
    responseHeaders: {},
  }),
  
  clearError: () => set({ error: null }),
  
  sendRequest: async () => {
    const {
      requestMethod,
      requestUrl,
      requestParams,
      requestHeaders,
      requestBody,
    } = get()
    
    set({ isLoading: true, error: null })
    const startTime = Date.now()
    
    try {
      // 获取全局认证信息
      const authHeaders = useAuthStore.getState().getAuthHeaders()
      
      let resolvedUrl = requestUrl
      if (!requestUrl.startsWith('http://') && !requestUrl.startsWith('https://')) {
        resolvedUrl = buildApiUrl(requestUrl.startsWith('/api') ? requestUrl : `/api${requestUrl}`)
      }

      const config: RequestConfig = {
        method: requestMethod,
        url: resolvedUrl,
        headers: {
          ...authHeaders,
          ...requestHeaders,
          'Content-Type': 'application/json',
        },
        params: requestParams,
        data: requestBody ? JSON.parse(requestBody) : undefined,
      }
      
      const response = await fetch(resolvedUrl, {
        method: requestMethod,
        headers: config.headers,
        body: requestBody ? JSON.stringify(config.data) : undefined,
      })
      
      const endTime = Date.now()
      const responseData = await response.json().catch(() => null)
      
      set({
        responseData,
        responseStatus: response.status,
        responseTime: endTime - startTime,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '请求失败',
        isLoading: false,
        responseStatus: 0,
        responseTime: Date.now() - startTime,
      })
    }
  },
}))
