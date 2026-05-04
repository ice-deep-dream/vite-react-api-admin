import { useProjectStore } from '@/stores/projectStore'
import { useApiStore } from '@/stores/apiStore'
import { getSwaggerJsonPath, getDocTitle } from '@/config/runtime'
import { OpenAPIParser } from '@/services/openapiParser'
import type { ApiItem, Category } from '@/types/api'

export async function initBackendProject() {
  const projectStore = useProjectStore.getState()
  const swaggerUrl = getSwaggerJsonPath()
  const docTitle = getDocTitle()
  
  const existingProject = projectStore.projects.find(
    p => p.id === 'nest-admin-backend'
  )

  if (existingProject) {
    projectStore.setCurrentProject(existingProject)
    
    if (existingProject.openApiUrl) {
      try {
        await loadSwaggerDocs(existingProject.openApiUrl)
      } catch (error) {
        console.error('加载 Swagger 文档失败:', error)
      }
    }
    
    return existingProject
  }

  const backendProject = {
    id: 'nest-admin-backend',
    name: docTitle,
    description: 'API 接口文档',
    openApiUrl: swaggerUrl,
    apiCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['API'],
    avatar: 'I',
  }

  projectStore.addProject(backendProject)
  projectStore.setCurrentProject(backendProject)
  
  try {
    await loadSwaggerDocs(swaggerUrl)
  } catch (error) {
    console.error('加载 Swagger 文档失败:', error)
  }

  return backendProject
}

/**
 * 加载 Swagger 文档
 */
async function loadSwaggerDocs(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const swaggerJson = await response.json()
    
    // 使用 OpenAPI 解析器解析文档
    const { project: projectInfo, apis } = OpenAPIParser.parse(swaggerJson)

    console.log('Swagger 文档解析成功')
    console.log('API 数量:', apis.length)
    console.log('项目信息:', projectInfo)

    // 更新项目信息
    const projectStore = useProjectStore.getState()
    const currentProject = projectStore.currentProject
    
    if (currentProject && currentProject.id === 'nest-admin-backend') {
      projectStore.updateProject({
        ...currentProject,
        name: projectInfo.name || currentProject.name,
        description: projectInfo.description || currentProject.description,
        tags: projectInfo.tags || currentProject.tags,
        apiCount: apis.length,
      })
    }

    // 将 APIs 保存到 apiStore（会自动构建路由映射）
    const apiStore = useApiStore.getState()
    apiStore.setApiList(apis)
    
    console.log('路由映射已自动构建')
    
    // 保存完整的 Swagger 数据（包含 components）
    apiStore.setSwaggerData(swaggerJson)
    
    // 设置分类
    const categories = extractCategories(apis)
    apiStore.setCategories(categories)
    
    console.log('API 列表已保存到 store:', apis.length)
    console.log('分类数量:', categories.length)
    console.log('Swagger Data 已保存，components:', swaggerJson?.components ? '有' : '无')

    return { projectInfo, apis }
  } catch (error) {
    console.error('加载 Swagger 文档失败:', error)
    throw error
  }
}

/**
 * 手动刷新 Swagger 文档
 */
export async function refreshSwaggerDocs() {
  const projectStore = useProjectStore.getState()
  const project = projectStore.currentProject

  if (!project || !project.openApiUrl) {
    throw new Error('当前没有选中项目或项目没有配置 Swagger URL')
  }

  return await loadSwaggerDocs(project.openApiUrl)
}

/**
 * 提取 API 分类
 */
export function extractCategories(apis: ApiItem[]): Category[] {
  const categoryMap = new Map<string, Category>()
  
  apis.forEach(api => {
    if (api.tags && api.tags.length > 0) {
      api.tags.forEach(tag => {
        if (!categoryMap.has(tag)) {
          categoryMap.set(tag, {
            id: tag,
            name: tag,
            count: 0,
            apis: []
          })
        }
        const category = categoryMap.get(tag)!
        category.count = (category.count || 0) + 1
        category.apis.push(api)
      })
    } else {
      const defaultTag = '其他'
      if (!categoryMap.has(defaultTag)) {
        categoryMap.set(defaultTag, {
          id: defaultTag,
          name: defaultTag,
          count: 0,
          apis: []
        })
      }
      const category = categoryMap.get(defaultTag)!
      category.count = (category.count || 0) + 1
      category.apis.push(api)
    }
  })
  
  return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}
