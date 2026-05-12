import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'admin' | 'host' | 'member'

// Account lifecycle:
//   pending     — self-registered, waiting for admin to approve
//   active      — full access (default for accounts predating this field)
//   deactivated — blocked from writing; still readable for moderation
export type UserStatus = 'pending' | 'active' | 'deactivated'

export interface User {
  id: string
  email: string
  displayName: string
  username?: string
  photoURL?: string
  phone?: string
  bio?: string
  role: UserRole
  status?: UserStatus
  preferences?: UserPreferences
  privacy?: PrivacySettings
  interests?: string[]
  gallery?: GalleryImage[]
  dependants?: Dependant[]
  assignedGatherings?: string[]
  // Hosts can only edit events / view Hosting for groups admin has
  // assigned to them. Admin always has access to everything; member
  // role ignores this field. Empty array = host with no assignments
  // yet (admin needs to pick groups for them).
  hostedGatherings?: string[]
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

// Public-readable mirror of a User. Mirror is written by the user's own
// updateProfile / authService.adminCreateUser, gated by their privacy
// toggles, so anything that appears here has been explicitly opted in.
//
// Read this from the directory, DM picker, search panel — never read /users
// for non-self/non-admin paths.
export interface UserProfile {
  id: string
  displayName: string
  photoURL?: string
  role?: UserRole
  bio?: string
  interests?: string[]
  gallery?: GalleryImage[]
  publicPhone?: string
  publicEmail?: string
  // First names + isChild flag only — no relationship, no last names.
  publicFamily?: Array<{ name: string; isChild?: boolean }>
  createdAt: Timestamp | Date
  updatedAt?: Timestamp | Date
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
