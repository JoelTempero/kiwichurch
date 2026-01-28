import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'admin' | 'host' | 'member'

export interface User {
  id: string
  email: string
  displayName: string
  username?: string
  photoURL?: string
  phone?: string
  bio?: string
  role: UserRole
  preferences?: UserPreferences
  dependants?: Dependant[]
  assignedGatherings?: string[]
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface UserPreferences {
  emailNotifications?: boolean
  pushNotifications?: boolean
  darkMode?: boolean
}

export interface Dependant {
  id: string
  name: string
  relationship?: string
}

export interface UserProfile {
  id: string
  displayName: string
  photoURL?: string
  createdAt: Timestamp | Date
}

export interface UsernameMapping {
  uid: string
  createdAt: Timestamp | Date
}
