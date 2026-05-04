import { useEffect, useState } from 'react'
import { Plus, Search, Grid, List, ExternalLink, Trash2, Edit } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import type { Project } from '@/types/project'
import { ProjectModal } from '@/components/Project/ProjectModal'
import './Projects.css'

export function Projects() {
  const { projects, currentProject, fetchProjects, setCurrentProject, deleteProject } = useProjectStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project)
    // TODO: 跳转到 API 列表页面
  }

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId)
    setShowDeleteConfirm(null)
  }

  const handleAddProject = () => {
    setEditingProject(null)
    setShowProjectModal(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowProjectModal(true)
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div className="projects-header-left">
          <h1 className="projects-title">项目管理</h1>
          <span className="projects-count">共 {projects.length} 个项目</span>
        </div>

        <div className="projects-header-right">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="搜索项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="网格视图"
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="列表视图"
            >
              <List size={18} />
            </button>
          </div>

          <button className="btn-primary add-project-btn" onClick={handleAddProject}>
            <Plus size={18} />
            新建项目
          </button>
        </div>
      </div>

      <div className="projects-content">
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>暂无项目</h3>
            <p>创建一个新项目开始管理你的 API</p>
            <button className="btn-primary" onClick={handleAddProject}>
              <Plus size={18} />
              新建项目
            </button>
          </div>
        ) : (
          <div className={`projects-list view-mode-${viewMode}`}>
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`project-card ${currentProject?.id === project.id ? 'active' : ''}`}
                onClick={() => handleSelectProject(project)}
              >
                <div className="project-card-header">
                  <div className="project-avatar">
                    {project.avatar || project.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="project-info">
                    <h3 className="project-name">{project.name}</h3>
                    <p className="project-description">{project.description}</p>
                  </div>
                </div>

                <div className="project-card-body">
                  <div className="project-meta">
                    <span className="project-api-count">
                      <ExternalLink size={14} />
                      {project.apiCount} 个 API
                    </span>
                    <span className="project-date">
                      更新于 {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>

                  {project.tags && project.tags.length > 0 && (
                    <div className="project-tags">
                      {project.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="project-card-actions">
                  <button
                    className="action-btn edit"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditProject(project)
                    }}
                    title="编辑"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDeleteConfirm(project.id)
                    }}
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* 删除确认对话框 */}
                {showDeleteConfirm === project.id && (
                  <div className="delete-confirm-overlay">
                    <div className="delete-confirm" onClick={(e) => e.stopPropagation()}>
                      <h4>确认删除</h4>
                      <p>确定要删除项目"{project.name}"吗？此操作不可恢复。</p>
                      <div className="delete-confirm-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          取消
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新建/编辑项目模态框 */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false)
          setEditingProject(null)
        }}
        project={editingProject}
      />
    </div>
  )
}
