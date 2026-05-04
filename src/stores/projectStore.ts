import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project } from '@/types/project'

interface ProjectStore {
  // 状态
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null

  // 动作
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  deleteProject: (projectId: string) => void
  fetchProjects: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // 工具方法
  getProjectById: (projectId: string) => Project | undefined
  getProjectCount: () => number
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      // 设置项目列表
      setProjects: (projects) => {
        set({ projects })
      },

      // 设置当前项目
      setCurrentProject: (project) => {
        set({ currentProject: project })
      },

      // 添加项目
      addProject: (project) => {
        const projects = get().projects
        set({ projects: [...projects, project] })
      },

      // 更新项目
      updateProject: (project) => {
        const projects = get().projects.map((p) =>
          p.id === project.id ? project : p
        )
        set({ projects })

        // 如果更新的是当前项目，同步更新
        const currentProject = get().currentProject
        if (currentProject && currentProject.id === project.id) {
          set({ currentProject: project })
        }
      },

      // 删除项目
      deleteProject: (projectId) => {
        const projects = get().projects.filter((p) => p.id !== projectId)
        set({ projects })

        // 如果删除的是当前项目，清空当前项目
        const currentProject = get().currentProject
        if (currentProject && currentProject.id === projectId) {
          set({ currentProject: null })
        }
      },

      // 获取项目列表（模拟）
      fetchProjects: async () => {
        set({ isLoading: true, error: null })
        try {
          // TODO: 实际应该从 API 获取
          // 这里使用模拟数据
          await new Promise((resolve) => setTimeout(resolve, 500))
          
          const mockProjects: Project[] = [
            {
              id: '1',
              name: '后端管理系统 API',
              description: 'NestJS 后端管理系统接口文档',
              apiCount: 45,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              tags: ['NestJS', 'Admin', 'RBAC'],
            },
            {
              id: '2',
              name: '用户服务 API',
              description: '用户相关接口',
              apiCount: 12,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              tags: ['User', 'Auth'],
            },
          ]

          set({ projects: mockProjects, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '获取项目失败',
            isLoading: false,
          })
        }
      },

      // 设置加载状态
      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      // 设置错误
      setError: (error) => {
        set({ error })
      },

      // 根据 ID 获取项目
      getProjectById: (projectId) => {
        return get().projects.find((p) => p.id === projectId)
      },

      // 获取项目数量
      getProjectCount: () => {
        return get().projects.length
      },
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
      }),
    }
  )
)
