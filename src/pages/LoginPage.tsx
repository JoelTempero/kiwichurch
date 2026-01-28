import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/common/Toast'

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-sent'

export function LoginPage() {
  const [view, setView] = useState<AuthView>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Form fields
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')

  const { signIn, signUp, sendPasswordReset, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home'
    navigate(from, { replace: true })
    return null
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signIn(identifier, password)
      showToast('Welcome back!', 'success')
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home'
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signUp(email, password, displayName, username || undefined)
      showToast('Account created successfully!', 'success')
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await sendPasswordReset(email)
      setView('reset-sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <Link to="/" className="auth-logo">
          <img src="/Images/KiwiChurch_Old_White_Shadow.png" alt="Kiwi Church" />
        </Link>
        <h1 className="auth-title">Member Portal</h1>
        <p className="auth-subtitle">Welcome to the table</p>
      </div>

      {view === 'login' && (
        <div className="auth-card">
          <h2 className="auth-card-title">Sign In</h2>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-identifier" className="form-label">
                Email or Username
              </label>
              <input
                id="login-identifier"
                type="text"
                className="form-input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or username"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-links">
            <button
              type="button"
              className="auth-link"
              onClick={() => setView('forgot-password')}
            >
              Forgot password?
            </button>
            <button
              type="button"
              className="auth-link"
              onClick={() => setView('register')}
            >
              Request an account
            </button>
          </div>
        </div>
      )}

      {view === 'register' && (
        <div className="auth-card">
          <h2 className="auth-card-title">Request Account</h2>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="register-name" className="form-label">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email" className="form-label">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-username" className="form-label">
                Username (optional)
              </label>
              <input
                id="register-username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password" className="form-label">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password (min 6 characters)"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-links">
            <button
              type="button"
              className="auth-link"
              onClick={() => setView('login')}
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      )}

      {view === 'forgot-password' && (
        <div className="auth-card">
          <h2 className="auth-card-title">Reset Password</h2>
          <p className="auth-card-description">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleForgotPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="reset-email" className="form-label">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="auth-links">
            <button
              type="button"
              className="auth-link"
              onClick={() => setView('login')}
            >
              Back to sign in
            </button>
          </div>
        </div>
      )}

      {view === 'reset-sent' && (
        <div className="auth-card">
          <div className="auth-success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="auth-card-title">Check Your Email</h2>
          <p className="auth-card-description">
            We've sent a password reset link to <strong>{email}</strong>.
            Please check your inbox and follow the instructions.
          </p>

          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => setView('login')}
          >
            Back to Sign In
          </button>
        </div>
      )}
    </div>
  )
}
