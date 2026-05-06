import { useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authService, dbService } from '@/services/firebase'
import type { User } from '@/types'

export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    setUser,
    setLoading,
    logout: storeLogout
  } = useAuthStore()

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        let userData = await dbService.getUser(firebaseUser.uid)
        if (!userData) {
          userData = await dbService.createUser(firebaseUser.uid, {
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
            role: 'member',
            preferences: { emailNotifications: true }
          })
        }
        setUser(userData)
        dbService.ensureCommunityGathering().catch(() => {})
        dbService.ensureCommunityMembership(firebaseUser.uid).catch(() => {})
      } else {
        setUser(null)
      }
    })

    return unsubscribe
  }, [setUser])

  // Sign in
  const signIn = useCallback(async (identifier: string, password: string) => {
    setLoading(true)
    try {
      await authService.signIn(identifier, password)
      // Auth state listener will update the store
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [setLoading])

  // Sign up
  const signUp = useCallback(async (
    email: string,
    password: string,
    displayName?: string,
    username?: string
  ) => {
    setLoading(true)
    try {
      await authService.signUp(email, password, { displayName, username })
      // Auth state listener will update the store
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [setLoading])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await authService.signOut()
      storeLogout()
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }, [storeLogout])

  // Password reset
  const sendPasswordReset = useCallback(async (email: string) => {
    await authService.sendPasswordResetEmail(email)
  }, [])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Pick<User, 'displayName' | 'photoURL' | 'phone' | 'bio'>>) => {
    const updatedUser = await authService.updateProfile(updates)
    if (updatedUser) {
      setUser(updatedUser)
    }
    return updatedUser
  }, [setUser])

  // Update password
  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    return authService.updatePassword(currentPassword, newPassword)
  }, [])

  // Role checks
  const isAdmin = user?.role === 'admin'
  const isHost = user?.role === 'host'
  const isAdminOrHost = isAdmin || isHost

  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isHost,
    isAdminOrHost,

    // Actions
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updateProfile,
    updatePassword
  }
}
