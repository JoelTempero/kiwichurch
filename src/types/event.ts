import type { Timestamp } from 'firebase/firestore'

export type EventRecurrence = 'none' | 'weekly' | 'fortnightly' | 'monthly'

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
  // Denormalised count of RSVPs with status === 'yes'. Maintained by
  // setRSVP/removeRSVP via Firestore increment(). Lets the Hosting list
  // render headcounts without N+1 aggregate reads.
  rsvpYesCount?: number
  // Recurrence: when an event is part of a series, all siblings share `seriesId`.
  // The original (first) event also stores the recurrence rule.
  seriesId?: string
  recurrence?: EventRecurrence
  recurrenceCount?: number // total occurrences in the series (incl. this one)
  recurrenceIndex?: number // 0-based index within the series
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface RSVP {
  id: string // Same as userId
  userId: string
  // Denormalised for display so the attendee list doesn't need to fetch
  // every user doc to show real names.
  userName?: string
  userPhotoURL?: string
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
  // When the attendee is a saved dependant (non-account family), this
  // is the dependant id so we can pre-check the right rows on edit.
  dependantId?: string
  // When the attendee is a linked account-holding family member, this
  // is their user id. Lets the RSVP modal show "Already RSVP'd by X"
  // when that user opens the event independently.
  linkedUserId?: string
}

export interface EventQueryOptions {
  startDate?: string
  endDate?: string
  gatheringId?: string
  limit?: number
}
