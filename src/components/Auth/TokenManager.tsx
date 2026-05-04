import { useState } from 'react'
import { Key, X, Save, Trash2, Shield, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import './TokenManager.css'

interface TokenManagerProps {
  isLoggedIn?: boolean
}

export function TokenManager({ isLoggedIn = false }: TokenManagerProps) {
  const { globalToken, tokenType, setGlobalToken, setTokenType, clearAuth } = useAuthStore()
  const [isVisible, setIsVisible] = useState(false)

  const handleSave = () => {
    // Token 会自动保存到 localStorage
    setIsVisible(false)
  }

  const handleClear = () => {
    clearAuth()
    setIsVisible(false)
  }

  return (
    <div className="token-manager">
      <button
        className="token-btn"
        onClick={() => setIsVisible(!isVisible)}
        title={isLoggedIn ? '查看 Token' : '全局 Token 设置'}
      >
        <Key size={16} />
        {isLoggedIn ? '已登录' : '设置 Token'}
      </button>

      {isVisible && (
        <div className="token-modal-overlay" onClick={() => setIsVisible(false)}>
          <div className="token-modal" onClick={(e) => e.stopPropagation()}>
            <div className="token-modal-header">
              <h3>
                <Shield size={20} />
                全局 Token 设置
              </h3>
              <button 
                className="modal-close"
                onClick={() => setIsVisible(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="token-modal-body">
              <div className="form-group">
                <label htmlFor="token-type">认证类型</label>
                <select
                  id="token-type"
                  value={tokenType}
                  onChange={(e) => setTokenType(e.target.value as any)}
                  className="form-select"
                >
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                  <option value="apikey">API Key</option>
                  <option value="none">None</option>
                </select>
              </div>

              {tokenType === 'bearer' && (
                <div className="form-group">
                  <label htmlFor="token-value">Token</label>
                  <input
                    id="token-value"
                    type="text"
                    value={globalToken}
                    onChange={(e) => setGlobalToken(e.target.value)}
                    placeholder="请输入 Token"
                    className="form-input"
                  />
                </div>
              )}

              {tokenType === 'basic' && (
                <>
                  <div className="form-group">
                    <label htmlFor="username">用户名</label>
                    <input
                      id="username"
                      type="text"
                      placeholder="请输入用户名"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">密码</label>
                    <input
                      id="password"
                      type="password"
                      placeholder="请输入密码"
                      className="form-input"
                    />
                  </div>
                </>
              )}

              {tokenType === 'apikey' && (
                <div className="form-group">
                  <label htmlFor="api-key">API Key</label>
                  <input
                    id="api-key"
                    type="text"
                    value={globalToken}
                    onChange={(e) => setGlobalToken(e.target.value)}
                    placeholder="请输入 API Key"
                    className="form-input"
                  />
                </div>
              )}
            </div>

            <div className="token-modal-footer">
              {isLoggedIn && (
                <button className="btn btn-danger" onClick={handleClear}>
                  <LogOut size={16} />
                  退出登录
                </button>
              )}
              <button className="btn btn-primary" onClick={handleSave}>
                <Save size={16} />
                保存
              </button>
              <button className="btn btn-secondary" onClick={handleClear}>
                <Trash2 size={16} />
                清除
              </button>
              <button 
                className="btn btn-plain" 
                onClick={() => setIsVisible(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
