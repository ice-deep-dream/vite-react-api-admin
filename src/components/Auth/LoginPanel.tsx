import { useState, useCallback, useEffect } from 'react'
import { LogIn, Key, Eye, EyeOff, ShieldCheck, AlertCircle, Settings } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { buildApiUrl, getApiBaseUrl } from '@/config/runtime'
import './LoginPanel.css'

export function LoginPanel() {
  const { globalToken, setGlobalToken, setTokenType, clearAuth } = useAuthStore()
  
  const [credential, setCredential] = useState('admin')
  const [password, setPassword] = useState('a123456')
  const [captchaId, setCaptchaId] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [captchaImg, setCaptchaImg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fetchCaptchaData = useCallback(async () => {
    try {
      const baseUrl = getApiBaseUrl()
      if (!baseUrl) {
        return { error: '请先在设置中配置 API 服务地址' }
      }
      const res = await fetch(buildApiUrl('/api/auth/captcha/img'))
      
      if (!res.ok) {
        throw new Error(`HTTP 错误：${res.status}`)
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('json')) {
        throw new Error('返回的不是 JSON 数据，请检查 API 服务地址是否正确')
      }

      const data = await res.json()
      
      if (data.code === 200 && data.data) {
        return { id: data.data.id, img: data.data.img }
      } else {
        return { error: '验证码数据格式错误' }
      }
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('is not valid JSON') || msg.includes('Unexpected token')) {
        return { error: 'API 地址无效，返回了 HTML 而非 JSON。请在设置中配置正确的 API 服务地址' }
      } else {
        return { error: '获取验证码失败：' + msg }
      }
    }
  }, [])

  useEffect(() => {
    fetchCaptchaData().then(result => {
      if ('error' in result) {
        setError(result.error!)
      } else {
        setCaptchaId(result.id!)
        setCaptchaImg(result.img!)
        setError('')
      }
    })
  }, [fetchCaptchaData])

  const fetchCaptcha = useCallback(() => {
    fetchCaptchaData().then(result => {
      if ('error' in result) {
        setError(result.error!)
      } else {
        setCaptchaId(result.id!)
        setCaptchaImg(result.img!)
        setError('')
      }
    })
  }, [fetchCaptchaData])

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const requestBody: any = {
        username: credential,
        password,
        captchaId,
        verifyCode,
      }

      const res = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const responseData = await res.json()
      console.log('登录响应:', responseData)
      console.log('HTTP 状态码:', res.status)
      console.log('业务状态码:', responseData.code)

      // HTTP 状态码 200 或 201 都表示成功，业务状态码 200 表示成功
      if ((res.status === 200 || res.status === 201) && responseData.code === 200) {
        // 提取 Token
        const token = extractToken(responseData)
        console.log('提取的 Token:', token)
        console.log('当前 globalToken:', globalToken)
        
        if (token) {
          setGlobalToken(token)
          setTokenType('bearer')
          setSuccess(true)
          console.log('登录成功，Token 已自动保存')
          console.log('新的 globalToken:', token)
          
          // 延迟关闭登录面板，让用户看到成功提示
          setTimeout(() => {
            // 通过自定义事件通知 Header 组件关闭登录面板
            window.dispatchEvent(new CustomEvent('login-success'))
          }, 800)
        } else {
          setError('未找到 Token 字段')
        }
      } else {
        setError(responseData.message || '登录失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 提取 Token 的辅助函数
  const extractToken = (data: any): string | null => {
    console.log('开始提取 Token...')
    console.log('  data.token:', data.token)
    console.log('  data.access_token:', data.access_token)
    console.log('  data.data?.token:', data.data?.token)
    console.log('  data.data?.access_token:', data.data?.access_token)
    
    if (data.token) {
      console.log('找到 token:', data.token)
      return data.token
    }
    if (data.access_token) {
      console.log('找到 access_token:', data.access_token)
      return data.access_token
    }
    if (data.data?.token) {
      console.log('找到 data.token:', data.data.token)
      return data.data.token
    }
    if (data.data?.access_token) {
      console.log('找到 data.access_token:', data.data.access_token)
      return data.data.access_token
    }
    console.log('未找到 Token')
    return null
  }

  // 处理退出登录
  const handleLogout = () => {
    clearAuth()
    setSuccess(false)
    setCredential('')
    setPassword('')
    setVerifyCode('')
  }

  return (
    <div className="login-panel">
      <div className="login-header">
        <div className="login-icon">
          <ShieldCheck size={32} />
        </div>
        <h2>API 登录</h2>
        <p>登录成功后将自动保存 Token</p>
      </div>

      {globalToken ? (
        <div className="login-status-panel">
          <div className="status-success">
            <ShieldCheck size={48} className="status-icon" />
            <h3>已登录</h3>
            <p className="status-token">
              Token: {globalToken.substring(0, 20)}...
            </p>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogIn size={16} />
            退出登录
          </button>
        </div>
      ) : (
        <form className="login-form" onSubmit={handleLogin}>
          {!getApiBaseUrl() && (
            <div className="api-url-warning">
              <Settings size={14} />
              <span>未配置 API 服务地址，请先在设置中配置</span>
            </div>
          )}
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message">
              <ShieldCheck size={16} />
              <span>登录成功！Token 已保存</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="credential">
              <Key size={14} />
              用户名
            </label>
            <input
              id="credential"
              type="text"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              placeholder="请输入用户名"
              required
              minLength={4}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Key size={14} />
              密码
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                minLength={6}
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="captcha">
              <Key size={14} />
              验证码
            </label>
            <div className="captcha-wrapper">
              <input
                id="captcha"
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="请输入验证码"
                required
                maxLength={4}
                className="form-input"
              />
              {captchaImg ? (
                <img
                  src={captchaImg}
                  alt="验证码"
                  className="captcha-img"
                  onClick={fetchCaptcha}
                  title="点击刷新验证码"
                />
              ) : (
                <button type="button" className="btn-captcha" onClick={fetchCaptcha}>
                  获取验证码
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : (
              <>
                <LogIn size={16} />
                登录
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
