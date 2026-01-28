import type { Timestamp } from 'firebase/firestore'

export interface Event {
  id: string
  title: string
  description?: string
  date: string // YYYY-MM-DD format
  time: string
  endTime?: string
  location: string
  gatheringId?: string
  gatheringName?: string
  isPublic: boolean
  imageURL?: string
  createdBy?: string
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface RSVP {
  id: string // Same as userId
  userId: string
  status: 'yes' | 'no' | 'maybe'
  notes?: string
  guestCount?: number
  selfAttending?: boolean
  attendees?: RSVPAttendee[]
  checkedIn?: boolean
  checkedInAt?: Timestamp | Date
  createdAt: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface RSVPAttendee {
  name: string
  isChild?: boolean
}

export interface EventQueryOptions {
  startDate?: string
  endDate?: string
  gatheringId?: string
  limit?: number
}
