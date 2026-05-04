import { useState } from 'react'
import { X, Upload, Link } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import './ProjectModal.css'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project?: any // 如果是编辑模式，传入项目数据
}

export function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const { addProject, updateProject } = useProjectStore()
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    openApiUrl: project?.openApiUrl || '',
    tags: project?.tags?.join(', ') || '',
  })
  const [importMode, setImportMode] = useState<'manual' | 'url' | 'file'>('manual')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const newProject = {
        id: project?.id || Date.now().toString(),
        name: formData.name,
        description: formData.description,
        openApiUrl: formData.openApiUrl,
        apiCount: project?.apiCount || 0,
        tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        createdAt: project?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (project) {
        updateProject(newProject)
      } else {
        addProject(newProject)
      }

      onClose()
    } catch (error) {
      console.error('保存项目失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: 解析 OpenAPI 文件
      console.log('上传文件:', file.name)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal-header">
          <h3>
            <Upload size={20} />
            {project ? '编辑项目' : '新建项目'}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="project-modal-body">
            {/* 导入方式选择 */}
            <div className="import-mode-selector">
              <button
                type="button"
                className={`mode-btn ${importMode === 'manual' ? 'active' : ''}`}
                onClick={() => setImportMode('manual')}
              >
                手动创建
              </button>
              <button
                type="button"
                className={`mode-btn ${importMode === 'url' ? 'active' : ''}`}
                onClick={() => setImportMode('url')}
              >
                <Link size={16} />
                URL 导入
              </button>
              <button
                type="button"
                className={`mode-btn ${importMode === 'file' ? 'active' : ''}`}
                onClick={() => setImportMode('file')}
              >
                <Upload size={16} />
                文件上传
              </button>
            </div>

            {/* 基本信息 */}
            <div className="form-group">
              <label className="form-label">项目名称 *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：后端管理系统 API"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">项目描述</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="简要描述这个项目..."
                rows={3}
              />
            </div>

            {/* URL 导入 */}
            {importMode === 'url' && (
              <div className="form-group">
                <label className="form-label">OpenAPI/Swagger URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.openApiUrl}
                  onChange={(e) => setFormData({ ...formData, openApiUrl: e.target.value })}
                  placeholder="https://api.example.com/openapi.json"
                />
              </div>
            )}

            {/* 文件上传 */}
            {importMode === 'file' && (
              <div className="form-group">
                <label className="form-label">上传 OpenAPI/Swagger 文件</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".json,.yaml,.yml"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <Upload size={32} />
                    <span>点击或拖拽文件到此处</span>
                    <span className="file-hint">支持 JSON、YAML 格式</span>
                  </label>
                </div>
              </div>
            )}

            {/* 标签 */}
            <div className="form-group">
              <label className="form-label">标签</label>
              <input
                type="text"
                className="form-input"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="用逗号分隔，例如：NestJS, Admin, RBAC"
              />
            </div>
          </div>

          <div className="project-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : project ? '保存修改' : '创建项目'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
