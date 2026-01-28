import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { dbService } from '@/services/firebase'
import type { Event, EventQueryOptions, RSVPAttendee } from '@/types'

// Query keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (options: EventQueryOptions) => [...eventKeys.lists(), options] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  rsvps: (eventId: string) => [...eventKeys.all, 'rsvps', eventId] as const,
  userRsvp: (eventId: string, userId: string) => [...eventKeys.rsvps(eventId), userId] as const
}

// Get events list
export function useEvents(options: EventQueryOptions = {}) {
  return useQuery({
    queryKey: eventKeys.list(options),
    queryFn: () => dbService.getEvents(options),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Get upcoming events (next 21 days)
export function useUpcomingEvents(limit?: number) {
  const today = new Date().toISOString().split('T')[0]
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + 21)
  const endDate = futureDate.toISOString().split('T')[0]

  return useEvents({
    startDate: today,
    endDate,
    limit
  })
}

// Get single event
export function useEvent(eventId: string | null) {
  return useQuery({
    queryKey: eventKeys.detail(eventId || ''),
    queryFn: () => dbService.getEvent(eventId!),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000
  })
}

// Get event RSVPs
export function useEventRSVPs(eventId: string | null) {
  return useQuery({
    queryKey: eventKeys.rsvps(eventId || ''),
    queryFn: () => dbService.getRSVPs(eventId!),
    enabled: !!eventId
  })
}

// Get user's RSVP for an event
export function useUserRSVP(eventId: string | null, userId: string | null) {
  return useQuery({
    queryKey: eventKeys.userRsvp(eventId || '', userId || ''),
    queryFn: () => dbService.getUserRSVP(eventId!, userId!),
    enabled: !!eventId && !!userId
  })
}

// Subscribe to real-time events
export function useEventsSubscription(options: EventQueryOptions = {}) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = dbService.subscribeToEvents((events) => {
      queryClient.setQueryData(eventKeys.list(options), events)
    }, options)

    return unsubscribe
  }, [queryClient, options.startDate, options.endDate, options.gatheringId])
}

// Create event mutation
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) =>
      dbService.createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    }
  })
}

// Update event mutation
export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, updates }: { eventId: string; updates: Partial<Event> }) =>
      dbService.updateEvent(eventId, updates),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
    }
  })
}

// Delete event mutation
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => dbService.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    }
  })
}

// RSVP mutation
export function useRSVP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      userId,
      status,
      notes = '',
      attendees = [],
      guestCount = 0,
      selfAttending = true
    }: {
      eventId: string
      userId: string
      status: 'yes' | 'no' | 'maybe'
      notes?: string
      attendees?: RSVPAttendee[]
      guestCount?: number
      selfAttending?: boolean
    }) => dbService.setRSVP(eventId, userId, status, notes, attendees, guestCount, selfAttending),
    onSuccess: (_, { eventId, userId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.rsvps(eventId) })
      queryClient.invalidateQueries({ queryKey: eventKeys.userRsvp(eventId, userId) })
    }
  })
}

// Cancel RSVP mutation
export function useCancelRSVP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      dbService.removeRSVP(eventId, userId),
    onSuccess: (_, { eventId, userId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.rsvps(eventId) })
      queryClient.invalidateQueries({ queryKey: eventKeys.userRsvp(eventId, userId) })
    }
  })
}
