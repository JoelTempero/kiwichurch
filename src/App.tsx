import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth'
import { ToastProvider, ScrollToTop } from '@/components/common'

// Eager load critical pages
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'

// Lazy load other pages
const EventsPage = lazy(() => import('@/pages/EventsPage').then(m => ({ default: m.EventsPage })))
const GroupsPage = lazy(() => import('@/pages/GroupsPage').then(m => ({ default: m.GroupsPage })))
const GroupDetailPage = lazy(() => import('@/pages/GroupDetailPage').then(m => ({ default: m.GroupDetailPage })))
const KetePage = lazy(() => import('@/pages/KetePage').then(m => ({ default: m.KetePage })))
const KetePostPage = lazy(() => import('@/pages/KetePostPage').then(m => ({ default: m.KetePostPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const GivingPage = lazy(() => import('@/pages/GivingPage').then(m => ({ default: m.GivingPage })))
const HostingPage = lazy(() => import('@/pages/HostingPage').then(m => ({ default: m.HostingPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const UsersPage = lazy(() => import('@/pages/UsersPage').then(m => ({ default: m.UsersPage })))
const DirectoryPage = lazy(() => import('@/pages/DirectoryPage').then(m => ({ default: m.DirectoryPage })))

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="loading-spinner" />
    </div>
  )
}

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <ToastProvider>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected portal routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:groupId" element={<GroupDetailPage />} />
            <Route path="/kete" element={<KetePage />} />
            <Route path="/kete/:postId" element={<KetePostPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/giving" element={<GivingPage />} />
            <Route path="/hosting" element={<HostingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/directory" element={<DirectoryPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  )
}

export default App
