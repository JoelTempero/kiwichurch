import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  sendEmailVerification as firebaseSendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  type User as FirebaseUser,
  type Unsubscribe
} from 'firebase/auth'
import { auth } from './config'
import { dbService } from './db'
import type { User, UserRole } from '@/types'

// Error message mapping
const errorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already registered',
  'auth/invalid-email': 'Please enter a valid email address',
  'auth/operation-not-allowed': 'Email/password accounts are not enabled',
  'auth/weak-password': 'Password should be at least 6 characters',
  'auth/user-disabled': 'This account has been disabled',
  'auth/user-not-found': 'No account found with this email',
  'auth/wrong-password': 'Incorrect password',
  'auth/invalid-credential': 'Invalid email or password',
  'auth/too-many-requests': 'Too many attempts. Please try again later',
  'auth/network-request-failed': 'Network error. Please check your connection'
}

function formatError(error: unknown): Error {
  if (error instanceof Error && 'code' in error) {
    const code = (error as { code: string }).code
    return new Error(errorMessages[code] || error.message)
  }
  return error instanceof Error ? error : new Error('An unexpected error occurred')
}

export interface SignUpData {
  displayName?: string
  username?: string
  photoURL?: string
}

export const authService = {
  /**
   * Sign in with email or username
   */
  async signIn(identifier: string, password: string): Promise<FirebaseUser> {
    let email = identifier

    // Check if identifier is a username (no @ symbol)
    if (!identifier.includes('@')) {
      const user = await dbService.getUserByUsername(identifier)
      if (!user) {
        throw new Error('Username not found')
      }
      email = user.email
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error) {
      console.error('[Auth] Sign in error:', error)
      throw formatError(error)
    }
  },

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, userData: SignUpData = {}): Promise<FirebaseUser> {
    // Validate username if provided
    if (userData.username) {
      const isAvailable = await dbService.checkUsernameAvailable(userData.username)
      if (!isAvailable) {
        throw new Error('Username is already taken')
      }
    }

    try {
      // Create Firebase auth user
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user

      // Update display name in Firebase Auth
      if (userData.displayName) {
        await firebaseUpdateProfile(user, {
          displayName: userData.displayName
        })
      }

      // Create user document in Firestore
      await dbService.createUser(user.uid, {
        email: email,
        displayName: userData.displayName || email.split('@')[0],
        username: userData.username,
        photoURL: userData.photoURL,
        role: 'member',
        preferences: {
          emailNotifications: true
        }
      })

      return user
    } catch (error) {
      console.error('[Auth] Sign up error:', error)
      throw formatError(error)
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('[Auth] Sign out error:', error)
      throw formatError(error)
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await firebaseSendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('[Auth] Password reset error:', error)
      throw formatError(error)
    }
  },

  /**
   * Confirm password reset with code
   */
  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      await firebaseConfirmPasswordReset(auth, code, newPassword)
    } catch (error) {
      console.error('[Auth] Confirm password reset error:', error)
      throw formatError(error)
    }
  },

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('No user signed in')
    }

    try {
      await firebaseSendEmailVerification(user)
    } catch (error) {
      console.error('[Auth] Email verification error:', error)
      throw formatError(error)
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<Pick<User, 'displayName' | 'photoURL' | 'phone' | 'bio'>>): Promise<User | null> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('No user signed in')
    }

    try {
      // Update Firebase Auth profile
      const authUpdates: { displayName?: string; photoURL?: string } = {}
      if (updates.displayName) authUpdates.displayName = updates.displayName
      if (updates.photoURL) authUpdates.photoURL = updates.photoURL

      if (Object.keys(authUpdates).length > 0) {
        await firebaseUpdateProfile(user, authUpdates)
      }

      // Update Firestore user document
      await dbService.updateUser(user.uid, updates)

      // Return updated user data
      return await dbService.getUser(user.uid)
    } catch (error) {
      console.error('[Auth] Profile update error:', error)
      throw formatError(error)
    }
  },

  /**
   * Update email (requires reauthentication)
   */
  async updateEmail(newEmail: string, password: string): Promise<boolean> {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error('No user signed in')
    }

    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)

      // Update email
      await firebaseUpdateEmail(user, newEmail)

      // Update in Firestore
      await dbService.updateUser(user.uid, { email: newEmail })

      return true
    } catch (error) {
      console.error('[Auth] Email update error:', error)
      throw formatError(error)
    }
  },

  /**
   * Update password (requires reauthentication)
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error('No user signed in')
    }

    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await firebaseUpdatePassword(user, newPassword)

      return true
    } catch (error) {
      console.error('[Auth] Password update error:', error)
      throw formatError(error)
    }
  },

  /**
   * Set or update username
   */
  async setUsername(username: string, currentUsername?: string): Promise<boolean> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('No user signed in')
    }

    // Check availability
    const isAvailable = await dbService.checkUsernameAvailable(username)
    if (!isAvailable) {
      throw new Error('Username is already taken')
    }

    // Remove old username if exists
    if (currentUsername) {
      await dbService.deleteUsername(currentUsername)
    }

    // Set new username
    await dbService.createUsername(username, user.uid)

    // Update user document
    await dbService.updateUser(user.uid, { username })

    return true
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, callback)
  },

  /**
   * Get current Firebase user
   */
  get currentUser(): FirebaseUser | null {
    return auth.currentUser
  },

  /**
   * Check if user is signed in
   */
  get isSignedIn(): boolean {
    return !!auth.currentUser
  },

  /**
   * Check if user has a specific role
   */
  hasRole(userData: User | null, role: UserRole): boolean {
    return userData?.role === role
  },

  /**
   * Check if user is admin
   */
  isAdmin(userData: User | null): boolean {
    return userData?.role === 'admin'
  },

  /**
   * Check if user is host
   */
  isHost(userData: User | null): boolean {
    return userData?.role === 'host'
  },

  /**
   * Check if user is admin or host
   */
  isAdminOrHost(userData: User | null): boolean {
    return userData?.role === 'admin' || userData?.role === 'host'
  }
}
