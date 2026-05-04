import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  globalToken: string
  tokenType: 'bearer' | 'basic' | 'apikey' | 'none'
  authSettings: {
    username?: string
    password?: string
    apiKey?: string
    apiKeyIn?: 'header' | 'query'
  }
}

interface AuthActions {
  setGlobalToken: (token: string) => void
  setTokenType: (type: 'bearer' | 'basic' | 'apikey' | 'none') => void
  setAuthSettings: (settings: AuthState['authSettings']) => void
  clearAuth: () => void
  getAuthHeaders: () => Record<string, string>
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      globalToken: '',
      tokenType: 'none',
      authSettings: {},

      setGlobalToken: (token) => set({ globalToken: token }),
      
      setTokenType: (type) => set({ tokenType: type }),
      
      setAuthSettings: (settings) => set({ authSettings: settings }),
      
      clearAuth: () => set({
        globalToken: '',
        tokenType: 'none',
        authSettings: {},
      }),
      
      getAuthHeaders: () => {
        const { globalToken, tokenType, authSettings } = get()
        const headers: Record<string, string> = {}
        
        if (tokenType === 'bearer' && globalToken) {
          headers['Authorization'] = `Bearer ${globalToken}`
        } else if (tokenType === 'basic' && authSettings.username && authSettings.password) {
          headers['Authorization'] = `Basic ${btoa(`${authSettings.username}:${authSettings.password}`)}`
        } else if (tokenType === 'apikey' && globalToken) {
          if (authSettings.apiKeyIn === 'query') {
            // API Key 在查询参数中，不在 header 中
          } else {
            headers['X-API-Key'] = globalToken
          }
        }
        
        return headers
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
