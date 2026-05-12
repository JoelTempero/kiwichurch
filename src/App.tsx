import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth'
import { ToastProvider, ScrollToTop, RouteErrorBoundary } from '@/components/common'
import { lazyWithRetry } from '@/utils/lazyWithRetry'

// Eager load critical pages
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'

// Lazy load other pages — wrapped so a failed chunk load (the post-deploy
// stale-SW scenario) auto-reloads once instead of white-screening.
const EventsPage = lazyWithRetry(() => import('@/pages/EventsPage').then(m => ({ default: m.EventsPage })))
const GroupsPage = lazyWithRetry(() => import('@/pages/GroupsPage').then(m => ({ default: m.GroupsPage })))
const GroupDetailPage = lazyWithRetry(() => import('@/pages/GroupDetailPage').then(m => ({ default: m.GroupDetailPage })))
const KetePage = lazyWithRetry(() => import('@/pages/KetePage').then(m => ({ default: m.KetePage })))
const KetePostPage = lazyWithRetry(() => import('@/pages/KetePostPage').then(m => ({ default: m.KetePostPage })))
const KetePostEditor = lazyWithRetry(() => import('@/pages/KetePostEditor').then(m => ({ default: m.KetePostEditor })))
const ProfilePage = lazyWithRetry(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const GivingPage = lazyWithRetry(() => import('@/pages/GivingPage').then(m => ({ default: m.GivingPage })))
const HostingPage = lazyWithRetry(() => import('@/pages/HostingPage').then(m => ({ default: m.HostingPage })))
const SettingsPage = lazyWithRetry(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const DirectoryPage = lazyWithRetry(() => import('@/pages/DirectoryPage').then(m => ({ default: m.DirectoryPage })))
const DirectMessagesPage = lazyWithRetry(() => import('@/pages/DirectMessagesPage').then(m => ({ default: m.DirectMessagesPage })))
const ConversationPage = lazyWithRetry(() => import('@/pages/ConversationPage').then(m => ({ default: m.ConversationPage })))
const ModerationPage = lazyWithRetry(() => import('@/pages/ModerationPage').then(m => ({ default: m.ModerationPage })))

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
      <RouteErrorBoundary>
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
            <Route path="/kete/new" element={<KetePostEditor />} />
            <Route path="/kete/:postId" element={<KetePostPage />} />
            <Route path="/kete/:postId/edit" element={<KetePostEditor />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/giving" element={<GivingPage />} />
            <Route path="/hosting" element={<HostingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/users" element={<Navigate to="/settings" replace />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/messages" element={<DirectMessagesPage />} />
            <Route path="/messages/:conversationId" element={<ConversationPage />} />
            <Route path="/moderation" element={<ModerationPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </ToastProvider>
  )
}

export default App
