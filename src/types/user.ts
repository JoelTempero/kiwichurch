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
  privacy?: PrivacySettings
  interests?: string[]
  gallery?: GalleryImage[]
  dependants?: Dependant[]
  assignedGatherings?: string[]
  canPostKete?: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface UserPreferences {
  emailNotifications?: boolean
  pushNotifications?: boolean
  darkMode?: boolean
}

export interface PrivacySettings {
  showPhone?: boolean
  showEmail?: boolean
  showGroups?: boolean
  showBio?: boolean
  showInterests?: boolean
  showFamily?: boolean
  showGallery?: boolean
}

export interface Dependant {
  id: string
  name: string
  relationship?: string
  isChild?: boolean
}

export interface GalleryImage {
  url: string
  fileName: string
  caption?: string
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

export const DEFAULT_PRIVACY: Required<PrivacySettings> = {
  showPhone: true,
  showEmail: true,
  showGroups: true,
  showBio: true,
  showInterests: true,
  showFamily: false,
  showGallery: true,
}
