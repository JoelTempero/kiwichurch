import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { dbService } from '@/services/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useGatherings, useUserGatheringIds } from '@/hooks/useGatherings'
import { visibleEvents } from '@/utils/eventVisibility'
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

/**
 * Events the signed-in user is allowed to see.
 *
 * Two layers, both load-bearing:
 *
 *   1. `dbService.getEvents` is given a `viewer` (the ids of the caller's PRIVATE
 *      groups) and issues two separately-constrained queries — one for
 *      `openToAllMembers` events, one for the viewer's own private groups — so
 *      the fetch itself never asks Firestore for a document the strict
 *      member-read rule can't prove is readable.
 *   2. `visibleEvents` is applied to the result anyway, as defence-in-depth. If
 *      the query and the rule ever drift out of sync, this is the layer that
 *      still stops a private-group event (its title, location, description and
 *      RSVP list) from rendering to a non-member.
 *
 * An event is visible when:
 *   - it belongs to no group (a whole-community event), or
 *   - its group is public, or
 *   - the user is a member of its group.
 *
 * No admin bypass, deliberately — the same call the directory makes. Private
 * means private, or the word is worthless. Admins reach these events through the
 * groups they are actually in.
 */
export function useEvents(options: EventQueryOptions = {}) {
  const { user } = useAuth()
  const { data: gatherings = [] } = useGatherings()

  const gatheringIds = useMemo(() => gatherings.map((g) => g.id), [gatherings])
  // useUserGatheringIds hands back a Set; visibleEvents wants a plain list.
  const { data: myGatheringIdSet } = useUserGatheringIds(user?.id ?? null, gatheringIds)
  const myGatheringIds = useMemo(() => Array.from(myGatheringIdSet ?? []), [myGatheringIdSet])

  // Only the viewer's PRIVATE groups matter to getEvents' Query M — public
  // groups are already covered by Query P (openToAllMembers). Deliberately []
  // until gatherings have actually loaded, rather than guessing.
  const myPrivateGroupIds = useMemo(() => {
    if (gatherings.length === 0) return []
    const privateGatheringIds = new Set(
      gatherings.filter((g) => g.isPublic === false).map((g) => g.id)
    )
    return myGatheringIds.filter((id) => privateGatheringIds.has(id))
  }, [gatherings, myGatheringIds])

  const viewer = useMemo(
    () => (user ? { myPrivateGroupIds } : undefined),
    [user, myPrivateGroupIds]
  )

  // Wait for gatherings + membership to load before firing the query at all.
  // myPrivateGroupIds feeds the queryKey below (not just the queryFn), so an
  // early fetch with a not-yet-real [] wouldn't just be wrong once — it'd sit
  // in the cache as its own stale entry once the real value arrived, since
  // that's a different key. Anonymous callers have no membership to wait for.
  const ready = !user || (gatherings.length > 0 && myGatheringIdSet !== undefined)

  const query = useQuery({
    queryKey: [...eventKeys.list(options), myPrivateGroupIds],
    queryFn: () => dbService.getEvents(options, viewer),
    enabled: ready,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const visible = useMemo(() => {
    if (!query.data) return query.data
    // Until the gatherings load we cannot prove an event is safe to show, so we
    // show nothing rather than risk leaking one for a frame.
    if (gatherings.length === 0) return []

    return visibleEvents(query.data, gatherings, myGatheringIds)
  }, [query.data, gatherings, myGatheringIds])

  return { ...query, data: visible }
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
      selfAttending = true,
      userName = '',
      userPhotoURL = '',
    }: {
      eventId: string
      userId: string
      status: 'yes' | 'no' | 'maybe'
      notes?: string
      attendees?: RSVPAttendee[]
      guestCount?: number
      selfAttending?: boolean
      userName?: string
      userPhotoURL?: string
    }) => dbService.setRSVP(eventId, userId, status, notes, attendees, guestCount, selfAttending, userName, userPhotoURL),
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
