import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/common/Toast'
import { Button } from '@/components/common'
import { CheckCircle } from 'lucide-react'
import { loginSchema, registerSchema, forgotPasswordSchema } from '@/utils/schemas'
import type { LoginInput, RegisterInput, ForgotPasswordInput } from '@/utils/schemas'
import { cn } from '@/utils/cn'

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-sent'

const inputBase = 'w-full px-3 py-3 border border-sage-light rounded-md font-body text-base transition-colors focus:outline-none focus:border-forest'
const inputError = 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600/20'

export function LoginPage() {
  const [view, setView] = useState<AuthView>('login')
  const [error, setError] = useState('')
  const [resetEmail, setResetEmail] = useState('')

  const { signIn, signUp, sendPasswordReset, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  })

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', username: '', password: '' },
  })

  const forgotForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home'
    navigate(from, { replace: true })
    return null
  }

  const handleLogin = loginForm.handleSubmit(async (data) => {
    setError('')
    try {
      await signIn(data.identifier, data.password)
      showToast('Welcome back!', 'success')
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home'
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    }
  })

  const handleRegister = registerForm.handleSubmit(async (data) => {
    setError('')
    try {
      await signUp(data.email, data.password, data.displayName, data.username || undefined)
      showToast('Account created successfully!', 'success')
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    }
  })

  const handleForgotPassword = forgotForm.handleSubmit(async (data) => {
    setError('')
    try {
      await sendPasswordReset(data.email)
      setResetEmail(data.email)
      setView('reset-sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    }
  })

  return (
    <div className="min-h-screen bg-forest flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <a href="/homepage.html" className="inline-block mb-4">
          <img src="/Images/KiwiChurch_Old_White_Shadow.png" alt="Kiwi Church" className="h-16 w-auto" />
        </a>
        <h1 className="text-2xl font-display text-white mb-1">Member Portal</h1>
        <p className="text-sage-light text-sm">Welcome to the table</p>
      </div>

      {view === 'login' && (
        <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-display text-forest mb-4 text-center">Sign In</h2>

          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-sm text-sm mb-4">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-identifier" className="block font-medium mb-2">
                Email or Username
              </label>
              <input
                id="login-identifier"
                type="text"
                className={cn(inputBase, loginForm.formState.errors.identifier && inputError)}
                placeholder="Enter your email or username"
                disabled={loginForm.formState.isSubmitting}
                {...loginForm.register('identifier')}
              />
              {loginForm.formState.errors.identifier && (
                <span className="text-sm text-red-600 mt-1 block" role="alert">{loginForm.formState.errors.identifier.message}</span>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block font-medium mb-2">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className={cn(inputBase, loginForm.formState.errors.password && inputError)}
                placeholder="Enter your password"
                disabled={loginForm.formState.isSubmitting}
                {...loginForm.register('password')}
              />
              {loginForm.formState.errors.password && (
                <span className="text-sm text-red-600 mt-1 block" role="alert">{loginForm.formState.errors.password.message}</span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginForm.formState.isSubmitting}
            >
              {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
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
              Create an account
            </button>
          </div>
        </div>
      )}

      {view === 'register' && (
        <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-display text-forest mb-4 text-center">Create Account</h2>

          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-sm text-sm mb-4">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block font-medium mb-2">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                className={cn(inputBase, registerForm.formState.errors.displayName && inputError)}
                placeholder="Enter your full name"
                disabled={registerForm.formState.isSubmitting}
                {...registerForm.register('displayName')}
              />
              {registerForm.formState.errors.displayName && (
                <span className="text-sm text-red-600 mt-1 block" role="alert">{registerForm.formState.errors.displayName.message}</span>
              )}
            </div>

            <div>
              <label htmlFor="register-email" className="block font-medium mb-2">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                className={cn(inputBase, registerForm.formState.errors.email && inputError)}
                placeholder="Enter your email"
                disabled={registerForm.formState.isSubmitting}
                {...registerForm.register('email')}
              />
              {registerForm.formState.errors.email && (
                <span className="text-sm text-red-600 mt-1 block" role="alert">{registerForm.formState.errors.email.message}</span>
              )}
            </div>

            <div>
              <label htmlFor="register-username" className="block font-medium mb-2">
                Username (optional)
              </label>
              <input
                id="register-username"
                type="text"
                className={inputBase}
                placeholder="Choose a username"
                disabled={registerForm.formState.isSubmitting}
                {...registerForm.register('username')}
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block font-medium mb-2">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                className={cn(inputBase, registerForm.formState.errors.password && inputError)}
                placeholder="Choose a password (min 6 characters)"
                disabled={registerForm.formState.isSubmitting}
                {...registerForm.register('password')}
              />
              {registerForm.formState.errors.password && (
                <span className="text-sm text-red-600 mt-1 block" role="alert">{registerForm.formState.errors.password.message}</span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={registerForm.formState.isSubmitting}
            >
              {registerForm.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
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
            <div>
              <label htmlFor="reset-email" className="block font-medium mb-2">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                className={cn(inputBase, forgotForm.formState.errors.email && inputError)}
                placeholder="Enter your email"
                disabled={forgotForm.formState.isSubmitting}
                {...forgotForm.register('email')}
              />
              {forgotForm.formState.errors.email && (
                <span className="text-sm text-red-600 mt-1 block" role="alert">{forgotForm.formState.errors.email.message}</span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={forgotForm.formState.isSubmitting}
            >
              {forgotForm.formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
            We've sent a password reset link to <strong>{resetEmail}</strong>.
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

      <a
        href="/homepage.html"
        className="mt-6 text-sm text-sage-light hover:text-white transition-colors"
      >
        &larr; Back to website
      </a>
    </div>
  )
}
