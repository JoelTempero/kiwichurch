import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/common/Toast'
import { Button } from '@/components/common'
import { CheckCircle } from 'lucide-react'

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
    <div className="min-h-screen bg-forest flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <Link to="/" className="inline-block mb-4">
          <img src="/Images/KiwiChurch_Old_White_Shadow.png" alt="Kiwi Church" className="h-16 w-auto" />
        </Link>
        <h1 className="text-2xl font-display text-white mb-1">Member Portal</h1>
        <p className="text-sage-light text-sm">Welcome to the table</p>
      </div>

      {view === 'login' && (
        <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-display text-forest mb-4 text-center">Sign In</h2>

          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-sm text-sm mb-4">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-2 mt-4">
            <button
              type="button"
              className="text-sm text-terracotta hover:text-terracotta-dark bg-transparent border-none cursor-pointer transition-colors"
              onClick={() => setView('forgot-password')}
            >
              Forgot password?
            </button>
            <button
              type="button"
              className="text-sm text-terracotta hover:text-terracotta-dark bg-transparent border-none cursor-pointer transition-colors"
              onClick={() => setView('register')}
            >
              Request an account
            </button>
          </div>
        </div>
      )}

      {view === 'register' && (
        <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-display text-forest mb-4 text-center">Request Account</h2>

          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-sm text-sm mb-4">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-2 mt-4">
            <button
              type="button"
              className="text-sm text-terracotta hover:text-terracotta-dark bg-transparent border-none cursor-pointer transition-colors"
              onClick={() => setView('login')}
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      )}

      {view === 'forgot-password' && (
        <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-display text-forest mb-4 text-center">Reset Password</h2>
          <p className="text-text-light text-sm text-center mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-sm text-sm mb-4">{error}</div>}

          <form onSubmit={handleForgotPassword} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-2 mt-4">
            <button
              type="button"
              className="text-sm text-terracotta hover:text-terracotta-dark bg-transparent border-none cursor-pointer transition-colors"
              onClick={() => setView('login')}
            >
              Back to sign in
            </button>
          </div>
        </div>
      )}

      {view === 'reset-sent' && (
        <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
          <div className="flex justify-center text-forest mb-4">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-xl font-display text-forest mb-4 text-center">Check Your Email</h2>
          <p className="text-text-light text-sm text-center mb-4">
            We've sent a password reset link to <strong>{email}</strong>.
            Please check your inbox and follow the instructions.
          </p>

          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setView('login')}
          >
            Back to Sign In
          </Button>
        </div>
      )}
    </div>
  )
}
