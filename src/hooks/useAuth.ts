import { useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authService, dbService } from '@/services/firebase'
import type { User } from '@/types'

let announcementsResumedThisSession = false
let keteVisibilityMigratedThisSession = false

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

        // Race with authService.signUp: createUserWithEmailAndPassword
        // fires onAuthStateChanged immediately, and signUp's own createUser
        // is still in flight. Poll briefly before falling back to a
        // self-write so we don't race into a permission-denied conflict.
        if (!userData) {
          for (let i = 0; i < 5 && !userData; i++) {
            await new Promise((resolve) => setTimeout(resolve, 250))
            userData = await dbService.getUser(firebaseUser.uid)
          }
        }

        // Fallback recovery for orphaned Auth users with no Firestore doc.
        // Lands as 'pending' to match the self-signup approval gate; if a
        // sibling write got there first, getUser picks that up instead.
        if (!userData) {
          try {
            userData = await dbService.createUser(firebaseUser.uid, {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
              role: 'member',
              status: 'pending',
              preferences: { emailNotifications: true },
            })
          } catch {
            // Most likely the parallel signUp write won — refetch.
            userData = await dbService.getUser(firebaseUser.uid)
          }
        }

        if (userData) {
          setUser(userData)
          dbService.ensureCommunityGathering().catch(() => {})
          dbService.ensureCommunityMembership(firebaseUser.uid).catch(() => {})
          // One-time migration for pre-existing users that have no public
          // profile mirror yet. Cheap idempotent write — re-runs are fine.
          dbService.writeUserProfileMirror(userData).catch(() => {})
          // Resume any announcement broadcasts that were interrupted (admin only).
          if (userData.role === 'admin' && !announcementsResumedThisSession) {
            announcementsResumedThisSession = true
            dbService.resumePendingAnnouncements()
              .catch(err => console.error('[auth] resume announcements failed', err))
          }
          // Backfill kete `visibility` field on legacy posts (admin/host only).
          // Idempotent — re-runs find nothing to do.
          if (
            (userData.role === 'admin' || userData.role === 'host') &&
            !keteVisibilityMigratedThisSession
          ) {
            keteVisibilityMigratedThisSession = true
            dbService.migrateKeteVisibility()
              .catch(err => console.error('[auth] kete visibility migration failed', err))
          }
        } else {
          // Genuinely stuck — at least surface it to the user.
          console.error('[Auth] Could not load or create user doc for', firebaseUser.uid)
          setUser(null)
        }
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
  const updateProfile = useCallback(async (updates: Partial<Pick<User, 'displayName' | 'photoURL' | 'phone' | 'bio' | 'privacy' | 'interests' | 'gallery' | 'dependants' | 'mutedNotificationCategories'>>) => {
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
  const canPostKete = isAdminOrHost || user?.canPostKete === true

  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isHost,
    isAdminOrHost,
    canPostKete,

    // Actions
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updateProfile,
    updatePassword
  }
}
