import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false
      }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
    }),
    {
      name: 'kiwichurch-auth',
      partialize: (state) => ({
        // Only persist user data, not loading state
        user: state.user
      })
    }
  )
)

// Selector helpers
export const selectUser = (state: AuthState) => state.user
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated
export const selectIsLoading = (state: AuthState) => state.isLoading
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin'
export const selectIsHost = (state: AuthState) => state.user?.role === 'host'
export const selectIsAdminOrHost = (state: AuthState) =>
  state.user?.role === 'admin' || state.user?.role === 'host'
