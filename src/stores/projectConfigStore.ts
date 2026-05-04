import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setApiBaseUrl, setSwaggerJsonPath } from '@/config/runtime'

export interface ApiProject {
  id: string
  name: string
  swaggerJsonUrl: string
  createdAt: string
  updatedAt: string
}

function parseSwaggerUrl(url: string): { baseUrl: string; path: string } {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const u = new URL(url)
      return { baseUrl: u.origin, path: u.pathname }
    }
    return { baseUrl: '', path: url }
  } catch {
    return { baseUrl: '', path: url }
  }
}

interface ProjectConfigState {
  projects: ApiProject[]
  activeProjectId: string | null
}

interface ProjectConfigActions {
  addProject: (project: Omit<ApiProject, 'id' | 'createdAt' | 'updatedAt'>) => ApiProject
  updateProject: (id: string, data: Partial<Omit<ApiProject, 'id' | 'createdAt'>>) => void
  removeProject: (id: string) => void
  setActiveProject: (id: string) => void
  getActiveProject: () => ApiProject | undefined
}

type ProjectConfigStore = ProjectConfigState & ProjectConfigActions

export const useProjectConfigStore = create<ProjectConfigStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,

      addProject: (projectData) => {
        const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        const now = new Date().toISOString()
        const project: ApiProject = {
          ...projectData,
          id,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ projects: [...state.projects, project] }))
        return project
      },

      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      removeProject: (id) => {
        set((state) => {
          const newProjects = state.projects.filter((p) => p.id !== id)
          const newActiveId = state.activeProjectId === id
            ? (newProjects[0]?.id ?? null)
            : state.activeProjectId
          return { projects: newProjects, activeProjectId: newActiveId }
        })
      },

      setActiveProject: (id) => {
        const project = get().projects.find((p) => p.id === id)
        if (project) {
          set({ activeProjectId: id })
          const { baseUrl, path } = parseSwaggerUrl(project.swaggerJsonUrl)
          const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
          setApiBaseUrl(isLocalhost ? '' : baseUrl)
          setSwaggerJsonPath(path)
        }
      },

      getActiveProject: () => {
        const { projects, activeProjectId } = get()
        return projects.find((p) => p.id === activeProjectId)
      },
    }),
    {
      name: 'project-config-storage',
    }
  )
)

export { parseSwaggerUrl }
