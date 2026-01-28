import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireHost?: boolean
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireHost = false
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAdmin, isHost } = useAuth()
  const location = useLocation()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/home" replace />
  }

  // Check host requirement (admin also has host access)
  if (requireHost && !isHost && !isAdmin) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}
