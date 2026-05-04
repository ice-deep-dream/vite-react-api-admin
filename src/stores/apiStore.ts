import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, ApiItem, Category } from '@/types/api'
import { routeMappingService } from '@/services/routeMappingService'

interface ApiState {
  currentProject: Project | null
  apiList: ApiItem[]
  currentApi: ApiItem | null
  categories: Category[]
  selectedCategory: string | null
  isLoading: boolean
  error: string | null
  swaggerData: any | null
  isOnHomePage: boolean
}

interface ApiActions {
  setCurrentProject: (project: Project) => void
  setApiList: (apis: ApiItem[]) => void
  setCurrentApi: (api: ApiItem) => void
  setCategories: (categories: Category[]) => void
  setSelectedCategory: (categoryId: string | null) => void
  fetchApiList: (projectId: string) => Promise<void>
  fetchApiDetail: (apiId: string) => Promise<void>
  searchApi: (keyword: string) => ApiItem[]
  clearCurrentApi: () => void
  initializeData: () => void
  setSwaggerData: (data: any) => void
  buildRouteMappings: () => void
  getRouteMappingByPath: (path: string) => any | undefined
  goHomePage: () => void
}

type ApiStore = ApiState & ApiActions

const mockApis: ApiItem[] = [
  {
    id: '1',
    path: '/api/users',
    method: 'GET',
    summary: '获取用户列表',
    description: '获取系统中所有用户的列表信息',
    tags: ['用户管理'],
    parameters: [
      {
        name: 'page',
        in: 'query',
        required: false,
        schema: { type: 'integer', default: 1 },
        description: '页码',
        example: 1,
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'integer', default: 10 },
        description: '每页数量',
        example: 10,
      },
    ],
    responses: {
      '200': {
        description: '成功',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: { type: 'array' },
                total: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  },
  {
    id: '2',
    path: '/api/users',
    method: 'POST',
    summary: '创建用户',
    description: '创建新的用户账户',
    tags: ['用户管理'],
    parameters: [],
    responses: {
      '201': {
        description: '创建成功',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  {
    id: '3',
    path: '/api/auth/login',
    method: 'POST',
    summary: '用户登录',
    description: '用户登录获取 token',
    tags: ['认证授权'],
    parameters: [],
    responses: {
      '200': {
        description: '登录成功',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: { type: 'object' },
              },
            },
          },
        },
      },
    },
  },
  {
    id: '4',
    path: '/api/system/depts',
    method: 'GET',
    summary: '获取部门列表',
    description: '获取系统中的部门信息',
    tags: ['系统管理'],
    parameters: [],
    responses: {
      '200': {
        description: '成功',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
]

const mockCategories: Category[] = [
  { id: 'user', name: '用户管理', count: 2, apis: mockApis.filter(api => api.tags?.includes('用户管理')) },
  { id: 'auth', name: '认证授权', count: 1, apis: mockApis.filter(api => api.tags?.includes('认证授权')) },
  { id: 'system', name: '系统管理', count: 1, apis: mockApis.filter(api => api.tags?.includes('系统管理')) },
]

export const useApiStore = create<ApiStore>()(
  persist(
    (set, get) => ({
      currentProject: null,
      apiList: [],
      currentApi: null,
      categories: [],
      selectedCategory: null,
      isLoading: false,
      error: null,
      swaggerData: null,
      isOnHomePage: true,

      initializeData: () => {
        set({
          apiList: mockApis,
          categories: mockCategories,
        })
      },

      setCurrentProject: (project) => set({ currentProject: project }),
      
      setApiList: (apis) => {
        set({ apiList: apis })
        routeMappingService.buildMappings(apis)
        console.log('API 列表已更新，路由映射已自动构建:', apis.length, '条')
      },
      
      setCurrentApi: (api) => set({ currentApi: api, isOnHomePage: false }),
      
      setCategories: (categories) => set({ categories }),
      
      setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
      
      clearCurrentApi: () => set({ currentApi: null, isOnHomePage: true }),

      goHomePage: () => set({ currentApi: null, isOnHomePage: true }),
      
      setSwaggerData: (data) => set({ swaggerData: data }),
      
      buildRouteMappings: () => {
        const { apiList } = get()
        routeMappingService.buildMappings(apiList)
        console.log('路由映射已构建:', routeMappingService.getAllMappings().length, '条')
      },
      
      getRouteMappingByPath: (path: string) => {
        return routeMappingService.getMappingByFrontendPath(path)
      },
      
      fetchApiList: async () => {
        set({ isLoading: true, error: null })
        try {
          await new Promise(resolve => setTimeout(resolve, 300))
          
          set({ 
            apiList: mockApis,
            categories: mockCategories,
            isLoading: false
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false })
        }
      },
      
      fetchApiDetail: async (apiId) => {
        const { apiList } = get()
        const api = apiList.find(item => item.id === apiId)
        if (api) {
          set({ currentApi: api })
        }
      },
      
      searchApi: (keyword) => {
        const { apiList } = get()
        return apiList.filter(api =>
          api.summary.toLowerCase().includes(keyword.toLowerCase()) ||
          api.path.includes(keyword) ||
          api.tags?.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
        )
      },
    }),
    {
      name: 'api-storage',
      partialize: (state) => ({
        apiList: state.apiList,
        categories: state.categories,
      }),
    }
  )
)
