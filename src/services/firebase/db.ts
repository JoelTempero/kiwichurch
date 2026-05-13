import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  writeBatch,
  type Unsubscribe,
  type DocumentData,
} from 'firebase/firestore'
import { auth, db } from './config'
import type {
  User,
  UserPreferences,
  UserProfile,
  PrivacySettings,
  Event,
  EventQueryOptions,
  RSVP,
  RSVPAttendee,
  Gathering,
  GatheringMember,
  BoardPost,
  BoardComment,
  KetePost,
  KeteComment,
  KeteQueryOptions,
  Notification,
  Conversation,
  ConversationParticipant,
  DirectMessage,
  Report,
  ReportStatus,
  FamilyLink,
} from '@/types'
import { DEFAULT_PRIVACY, familyLinkId } from '@/types'
import { GroupResource } from '../../types/groupResource'
import { COMMUNITY_GATHERING_ID, COMMUNITY_GATHERING_NAME, isCommunityGathering } from '@/utils/community'

// Helper to convert Firestore doc to typed object
function docToObject<T>(doc: DocumentData): T {
  return { id: doc.id, ...doc.data() } as T
}

export const dbService = {
  // ============================================
  // USERS
  // ============================================

  // Admin/host-only — reads /users which is gated to self + admin/host.
  // For everywhere else (directory, DM picker, search), use
  // `getAllPublicProfiles` which reads the privacy-filtered mirror.
  async getAllUsers(): Promise<User[]> {
    const q = query(collection(db, 'users'), orderBy('displayName'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => docToObject<User>(doc))
  },

  // Public-readable mirror — driven by users' privacy toggles.
  async getAllPublicProfiles(): Promise<UserProfile[]> {
    const q = query(collection(db, 'userProfiles'), orderBy('displayName'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => docToObject<UserProfile>(doc))
  },

  async getPublicProfile(userId: string): Promise<UserProfile | null> {
    const docSnap = await getDoc(doc(db, 'userProfiles', userId))
    return docSnap.exists() ? docToObject<UserProfile>(docSnap) : null
  },

  async getUser(userId: string): Promise<User | null> {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docToObject<User>(docSnap) : null
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const q = query(
      collection(db, 'users'),
      where('email', '==', email.toLowerCase()),
      limit(1)
    )
    const snapshot = await getDocs(q)
    return snapshot.empty ? null : docToObject<User>(snapshot.docs[0])
  },

  async getUserByUsername(username: string): Promise<User | null> {
    const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()))
    if (!usernameDoc.exists()) return null
    const data = usernameDoc.data()
    return this.getUser(data.uid)
  },

  async createUser(userId: string, userData: {
    email: string
    displayName: string
    username?: string
    photoURL?: string
    role?: 'admin' | 'host' | 'member'
    status?: 'pending' | 'active' | 'deactivated'
    preferences?: UserPreferences
  }): Promise<User> {
    const timestamp = serverTimestamp()
    const user = {
      ...userData,
      email: userData.email.toLowerCase(),
      role: userData.role || 'member',
      status: userData.status || 'active',
      createdAt: timestamp,
      updatedAt: timestamp
    }
    await setDoc(doc(db, 'users', userId), user)

    // Create username mapping if provided
    if (userData.username) {
      await setDoc(doc(db, 'usernames', userData.username.toLowerCase()), {
        uid: userId,
        createdAt: timestamp
      })
    }

    // Initial public profile mirror — uses DEFAULT_PRIVACY (email visible,
    // phone visible, family hidden) since the new user has no privacy map yet.
    await this.writeUserProfileMirror({ id: userId, ...user } as User)

    return { id: userId, ...user } as User
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', userId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    // Re-mirror the public profile if any mirrored field changed.
    // Fire-and-forget: the caller (e.g. a privacy toggle) doesn't need to
    // block on the mirror write. If the read-then-write races with a
    // second toggle, the later write wins via serverTimestamp ordering.
    const mirrorKeys: Array<keyof User> = [
      'displayName', 'photoURL', 'role', 'bio', 'phone', 'email',
      'interests', 'gallery', 'dependants', 'privacy',
    ]
    if (mirrorKeys.some((k) => k in updates)) {
      this.getUser(userId)
        .then((fresh) => fresh ? this.writeUserProfileMirror(fresh) : undefined)
        .catch((err) => console.error('[db] mirror write failed', err))
    }
  },

  // Build and write the privacy-filtered public profile from a user record.
  // Called on user create, on update, and on first login as a migration step
  // for users that pre-date this mirror.
  async writeUserProfileMirror(user: User): Promise<void> {
    const privacy: PrivacySettings = { ...DEFAULT_PRIVACY, ...(user.privacy || {}) }
    const profile: Record<string, unknown> = {
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: user.role,
      updatedAt: serverTimestamp(),
    }
    if (privacy.showBio !== false && user.bio) profile.bio = user.bio
    if (privacy.showInterests !== false && user.interests && user.interests.length > 0) profile.interests = user.interests
    if (privacy.showGallery !== false && user.gallery && user.gallery.length > 0) profile.gallery = user.gallery
    if (privacy.showPhone !== false && user.phone) profile.publicPhone = user.phone
    if (privacy.showEmail !== false && user.email) profile.publicEmail = user.email
    if (privacy.showFamily === true) {
      const familyEntries: Array<{ name: string; isChild?: boolean }> = []
      // Non-account dependants — first name + isChild flag.
      if (user.dependants && user.dependants.length > 0) {
        for (const d of user.dependants) {
          const firstName = (d.name || '').trim().split(/\s+/)[0]
          if (firstName) familyEntries.push({ name: firstName, isChild: !!d.isChild })
        }
      }
      // Accepted linked accounts — first name of the other side. Best-effort;
      // if the read fails we just skip the linked half, dependants still show.
      try {
        const links = await this.getFamilyLinks(user.id)
        for (const link of links) {
          if (link.status !== 'accepted') continue
          const otherName = link.senderId === user.id ? link.recipientName : link.senderName
          if (!otherName) continue
          const firstName = otherName.trim().split(/\s+/)[0]
          if (firstName) familyEntries.push({ name: firstName })
        }
      } catch (err) {
        console.error('[db] mirror: family-links read failed', err)
      }
      if (familyEntries.length > 0) profile.publicFamily = familyEntries
    }
    await setDoc(doc(db, 'userProfiles', user.id), profile, { merge: false })
  },

  // Re-runs the profile mirror for the given user. Used after family-link
  // mutations so the linked-family half stays in sync without waiting for
  // the next user-doc write to trigger the mirror.
  async refreshProfileMirror(userId: string): Promise<void> {
    const fresh = await this.getUser(userId)
    if (fresh) await this.writeUserProfileMirror(fresh)
  },

  async checkUsernameAvailable(username: string): Promise<boolean> {
    const docSnap = await getDoc(doc(db, 'usernames', username.toLowerCase()))
    return !docSnap.exists()
  },

  async createUsername(username: string, userId: string): Promise<void> {
    await setDoc(doc(db, 'usernames', username.toLowerCase()), {
      uid: userId,
      createdAt: serverTimestamp()
    })
  },

  async deleteUsername(username: string): Promise<void> {
    await deleteDoc(doc(db, 'usernames', username.toLowerCase()))
  },

  // ============================================
  // FAMILY LINKS
  // ============================================

  async sendFamilyLink(
    senderId: string,
    senderName: string,
    recipientId: string,
    recipientName: string,
    senderLabel = '',
    recipientLabel = '',
  ): Promise<string> {
    if (senderId === recipientId) throw new Error('Cannot link to yourself')
    const id = familyLinkId(senderId, recipientId)
    const participants = [senderId, recipientId].sort() as [string, string]
    await setDoc(doc(db, 'familyLinks', id), {
      participants,
      senderId,
      recipientId,
      senderName,
      recipientName,
      senderLabel,
      recipientLabel,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
    // Notify the recipient. Non-blocking from the caller's view — if it
    // fails (rate limit, rule shift) the link itself still exists.
    addDoc(collection(db, 'notifications'), {
      userId: recipientId,
      type: 'family_link' as const,
      title: `${senderName} wants to link as family`,
      message: 'Accept on your Profile to RSVP for each other.',
      link: '/profile',
      read: false,
      createdAt: serverTimestamp(),
    }).catch((err) => console.error('[db] family-link notify failed', err))
    return id
  },

  async acceptFamilyLink(linkId: string, recipientLabel?: string): Promise<void> {
    if (recipientLabel !== undefined) {
      await updateDoc(doc(db, 'familyLinks', linkId), {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
        recipientLabel,
      })
    } else {
      await updateDoc(doc(db, 'familyLinks', linkId), {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
      })
    }
  },

  // Update only the side the current user is on. The caller computes
  // which side they are; rules enforce sender-edits-senderLabel and
  // recipient-edits-recipientLabel separately.
  async updateMyFamilyLinkLabel(
    linkId: string,
    side: 'sender' | 'recipient',
    label: string,
  ): Promise<void> {
    const field = side === 'sender' ? 'senderLabel' : 'recipientLabel'
    await updateDoc(doc(db, 'familyLinks', linkId), { [field]: label })
  },

  async deleteFamilyLink(linkId: string): Promise<void> {
    await deleteDoc(doc(db, 'familyLinks', linkId))
  },

  // All links (pending + accepted) where this user is a participant.
  // The component layer splits them into incoming/outgoing/accepted.
  async getFamilyLinks(userId: string): Promise<FamilyLink[]> {
    const q = query(
      collection(db, 'familyLinks'),
      where('participants', 'array-contains', userId),
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => docToObject<FamilyLink>(d))
  },

  async updateUserRole(userId: string, role: User['role']): Promise<void> {
    const docRef = doc(db, 'users', userId)
    await updateDoc(docRef, {
      role,
      updatedAt: serverTimestamp()
    })
  },

  // ============================================
  // GATHERINGS
  // ============================================

  async getGatherings(): Promise<Gathering[]> {
    const q = query(collection(db, 'gatherings'), orderBy('name'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => docToObject<Gathering>(doc))
  },

  async getGathering(gatheringId: string): Promise<Gathering | null> {
    const docSnap = await getDoc(doc(db, 'gatherings', gatheringId))
    return docSnap.exists() ? docToObject<Gathering>(docSnap) : null
  },

  async getGatheringMemberCounts(gatheringIds: string[]): Promise<Record<string, number>> {
    if (gatheringIds.length === 0) return {}
    const counts = await Promise.all(
      gatheringIds.map(id => getDocs(collection(db, 'gatherings', id, 'members')))
    )
    return Object.fromEntries(gatheringIds.map((id, i) => [id, counts[i].size]))
  },

  async getGatheringMembers(gatheringId: string): Promise<GatheringMember[]> {
    const membersRef = collection(db, 'gatherings', gatheringId, 'members')
    const snapshot = await getDocs(membersRef)
    return snapshot.docs.map(doc => docToObject<GatheringMember>(doc))
  },

  // Read names + photos from the public-readable mirror, not /users.
  // /users is locked to self + admin/host, so reading it for the whole
  // members list silently failed for regular members and displayed the
  // raw uid as the name. Mirror reads work for everyone.
  async getGatheringMembersWithProfiles(gatheringId: string): Promise<Array<{ id: string; displayName: string; photoURL?: string }>> {
    const members = await this.getGatheringMembers(gatheringId)
    const profiles = await Promise.all(
      members.map(async (member) => {
        const profileDoc = await getDoc(doc(db, 'userProfiles', member.id))
        if (profileDoc.exists()) {
          const data = profileDoc.data()
          return { id: member.id, displayName: data.displayName || member.id, photoURL: data.photoURL }
        }
        return { id: member.id, displayName: member.id }
      })
    )
    return profiles
  },

  async getUserGatheringIds(userId: string, gatheringIds: string[]): Promise<Set<string>> {
    if (gatheringIds.length === 0) return new Set()
    const memberChecks = await Promise.all(
      gatheringIds.map(id =>
        getDoc(doc(db, 'gatherings', id, 'members', userId))
      )
    )
    return new Set(gatheringIds.filter((_, i) => memberChecks[i].exists()))
  },

  async joinGathering(gatheringId: string, userId: string): Promise<void> {
    await setDoc(
      doc(db, 'gatherings', gatheringId, 'members', userId),
      { joinedAt: serverTimestamp() }
    )
  },

  // Make sure the user is a member of every gathering in `gatheringIds`.
  // Idempotent — re-running is fine. Used after admin assigns a host
  // their gatherings so the host shows up under "My Groups" too.
  // Emits a `group_invite` notification for each genuinely new membership
  // (i.e. the member doc didn't exist before), skipping the community gathering.
  async ensureMembershipsForUser(userId: string, gatheringIds: string[]): Promise<void> {
    if (gatheringIds.length === 0) return

    // Check which memberships are new before writing
    const memberRefs = gatheringIds.map(gid =>
      doc(db, 'gatherings', gid, 'members', userId)
    )
    const existingSnaps = await Promise.all(memberRefs.map(ref => getDoc(ref)))
    const newGatheringIds = gatheringIds.filter((_, i) => !existingSnaps[i].exists())

    // Batch-write all memberships (merge so existing joinedAt is preserved)
    const batch = writeBatch(db)
    for (const gid of gatheringIds) {
      batch.set(
        doc(db, 'gatherings', gid, 'members', userId),
        { joinedAt: serverTimestamp() },
        { merge: true },
      )
    }
    await batch.commit()

    // Notify for each truly new membership (skip the community gathering — it auto-joins everyone).
    // Parallelize getDoc calls via Promise.all
    const notifyTargets = newGatheringIds.filter(gid => gid !== COMMUNITY_GATHERING_ID)
    await Promise.all(notifyTargets.map(async gid => {
      const gSnap = await getDoc(doc(db, 'gatherings', gid))
      return addDoc(collection(db, 'notifications'), {
        userId,
        type: 'group_invite' as const,
        title: `You were added to ${gSnap.data()?.name || 'a group'}`,
        message: '',
        link: `/groups/${gid}`,
        read: false,
        createdAt: serverTimestamp(),
      }).catch(err => console.error('[db] group-add notify failed', err))
    }))
  },

  async leaveGathering(gatheringId: string, userId: string): Promise<void> {
    await deleteDoc(doc(db, 'gatherings', gatheringId, 'members', userId))
  },

  // Admin or host-of-this-gathering adds many members at once. Chunked at
  // 225 user ids per batch (2 ops/user — member doc + notification = 450
  // ops/batch). Skips users who are already members (silent dedupe).
  async bulkAddGatheringMembers(
    gatheringId: string,
    gatheringName: string,
    userIds: string[]
  ): Promise<{ added: number; skipped: number }> {
    if (userIds.length === 0) return { added: 0, skipped: 0 }

    const memberRefs = userIds.map(uid => doc(db, 'gatherings', gatheringId, 'members', uid))
    const existingSnaps = await Promise.all(memberRefs.map(ref => getDoc(ref)))
    const newUserIds = userIds.filter((_, i) => !existingSnaps[i].exists())
    const skipped = userIds.length - newUserIds.length

    if (newUserIds.length === 0) return { added: 0, skipped }

    for (let i = 0; i < newUserIds.length; i += 225) {
      const chunk = newUserIds.slice(i, i + 225)
      const batch = writeBatch(db)
      const now = serverTimestamp()
      for (const uid of chunk) {
        batch.set(
          doc(db, 'gatherings', gatheringId, 'members', uid),
          { joinedAt: now },
        )
        batch.set(
          doc(collection(db, 'notifications')),
          {
            userId: uid,
            type: 'group_invite' as const,
            title: `You were added to ${gatheringName}`,
            message: '',
            link: `/groups/${gatheringId}`,
            read: false,
            createdAt: now,
          },
        )
      }
      await batch.commit()
    }
    return { added: newUserIds.length, skipped }
  },

  async createGathering(gatheringData: Omit<Gathering, 'id' | 'createdAt' | 'updatedAt'>): Promise<Gathering> {
    const timestamp = serverTimestamp()
    const docRef = await addDoc(collection(db, 'gatherings'), {
      ...gatheringData,
      createdAt: timestamp,
      updatedAt: timestamp
    })
    return { id: docRef.id, ...gatheringData } as Gathering
  },

  async updateGathering(gatheringId: string, updates: Partial<Gathering>): Promise<void> {
    await updateDoc(doc(db, 'gatherings', gatheringId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
  },

  async deleteGathering(gatheringId: string): Promise<void> {
    await deleteDoc(doc(db, 'gatherings', gatheringId))
  },

  async ensureCommunityGathering(): Promise<void> {
    const docRef = doc(db, 'gatherings', COMMUNITY_GATHERING_ID)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        name: COMMUNITY_GATHERING_NAME,
        description: 'The main community board for all Kiwi Church members',
        isPublic: true,
        featured: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  },

  async ensureCommunityMembership(userId: string): Promise<void> {
    const memberRef = doc(db, 'gatherings', COMMUNITY_GATHERING_ID, 'members', userId)
    const memberSnap = await getDoc(memberRef)
    if (!memberSnap.exists()) {
      await setDoc(memberRef, { joinedAt: serverTimestamp() })
    }
  },

  // ============================================
  // EVENTS
  // ============================================

  async getEvents(options: EventQueryOptions = {}): Promise<Event[]> {
    let q = query(collection(db, 'events'))

    const constraints = []
    if (options.startDate) {
      constraints.push(where('date', '>=', options.startDate))
    }
    if (options.endDate) {
      constraints.push(where('date', '<=', options.endDate))
    }
    if (options.gatheringId) {
      constraints.push(where('gatheringId', '==', options.gatheringId))
    }
    constraints.push(orderBy('date', 'asc'))
    if (options.limit) {
      constraints.push(limit(options.limit))
    }

    q = query(collection(db, 'events'), ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => docToObject<Event>(doc))
  },

  async getEvent(eventId: string): Promise<Event | null> {
    const docSnap = await getDoc(doc(db, 'events', eventId))
    return docSnap.exists() ? docToObject<Event>(docSnap) : null
  },

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const timestamp = serverTimestamp()
    const docRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      createdAt: timestamp,
      updatedAt: timestamp
    })
    return { id: docRef.id, ...eventData } as Event
  },

  // Bulk-create siblings of a recurring series. Each sibling shares `seriesId`
  // and carries its own date + recurrenceIndex; recurrence/recurrenceCount are
  // stamped on every occurrence so the UI can render "1 of 6" etc.
  async createEventSeries(
    baseData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'date' | 'recurrenceIndex'>,
    dates: string[],
  ): Promise<Event[]> {
    const timestamp = serverTimestamp()
    const batch = writeBatch(db)
    const created: Event[] = []
    for (let i = 0; i < dates.length; i++) {
      const ref = doc(collection(db, 'events'))
      const data = {
        ...baseData,
        date: dates[i],
        recurrenceIndex: i,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      batch.set(ref, data)
      created.push({ id: ref.id, ...data } as unknown as Event)
    }
    await batch.commit()
    return created
  },

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    const eventRef = doc(db, 'events', eventId)
    const before = (await getDoc(eventRef)).data() as Event | undefined
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    if (before && (
      (updates.time !== undefined && updates.time !== before.time) ||
      (updates.endTime !== undefined && updates.endTime !== before.endTime) ||
      (updates.location !== undefined && updates.location !== before.location)
    )) {
      const after = { ...before, ...updates } as Event
      this.notifyEventAttendees(eventId, after, 'updated').catch(
        (err) => console.error('[db] event update notify failed', err)
      )
    }
  },

  // Update every event in a series whose date is >= the pivot event's date.
  // Title/description/time/location are propagated; date/recurrenceIndex
  // stay intact, and gatheringId is stripped — changing the group of a
  // whole series with attached RSVPs needs to be an explicit choice on the
  // single event, not a silent bulk side-effect.
  async updateEventSeries(
    seriesId: string,
    fromDate: string,
    updates: Partial<Event>,
  ): Promise<number> {
    const q = query(
      collection(db, 'events'),
      where('seriesId', '==', seriesId),
      where('date', '>=', fromDate),
    )
    const snapshot = await getDocs(q)
    const batch = writeBatch(db)
    const {
      date: _date,
      recurrenceIndex: _idx,
      gatheringId: _gid,
      gatheringName: _gname,
      rsvpYesCount: _rc,
      ...safe
    } = updates
    void _date; void _idx; void _gid; void _gname; void _rc
    snapshot.docs.forEach((d) => {
      batch.update(d.ref, { ...safe, updatedAt: serverTimestamp() })
    })
    await batch.commit()

    // Fan-out notifications per event that actually changed
    if (safe.time !== undefined || safe.endTime !== undefined || safe.location !== undefined) {
      for (const d of snapshot.docs) {
        const before = d.data() as Event
        if (
          safe.time === before.time &&
          safe.endTime === before.endTime &&
          safe.location === before.location
        ) continue
        const after = { ...before, ...safe, id: d.id } as Event
        this.notifyEventAttendees(d.id, after, 'updated').catch(
          (err) => console.error('[db] series event notify failed', err)
        )
      }
    }

    return snapshot.size
  },

  async notifyEventAttendees(eventId: string, event: Event, kind: 'updated' | 'cancelled'): Promise<void> {
    const rsvps = await getDocs(query(
      collection(db, 'events', eventId, 'rsvps'),
      where('status', 'in', ['yes', 'maybe'])
    ))
    const me = auth.currentUser?.uid
    const targets = rsvps.docs.map(d => d.id).filter(uid => uid !== me)
    if (targets.length === 0) return
    const title = kind === 'cancelled' ? `${event.title} was cancelled` : `${event.title} was updated`
    const now = serverTimestamp()
    for (let i = 0; i < targets.length; i += 450) {
      const batch = writeBatch(db)
      targets.slice(i, i + 450).forEach(uid => {
        batch.set(doc(collection(db, 'notifications')), {
          userId: uid, type: 'event_update' as const,
          title, message: '', link: `/events/${eventId}`,
          read: false, createdAt: now,
        })
      })
      await batch.commit()
    }
  },

  async deleteEvent(eventId: string): Promise<void> {
    await deleteDoc(doc(db, 'events', eventId))
  },

  async deleteEventSeries(seriesId: string, fromDate?: string): Promise<number> {
    const constraints: ReturnType<typeof where>[] = [where('seriesId', '==', seriesId)]
    if (fromDate) constraints.push(where('date', '>=', fromDate))
    const q = query(collection(db, 'events'), ...constraints)
    const snapshot = await getDocs(q)
    const batch = writeBatch(db)
    snapshot.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
    return snapshot.size
  },

  // ============================================
  // RSVPS
  // ============================================

  async getRSVPs(eventId: string): Promise<RSVP[]> {
    const rsvpsRef = collection(db, 'events', eventId, 'rsvps')
    const snapshot = await getDocs(rsvpsRef)
    return snapshot.docs.map(doc => docToObject<RSVP>(doc))
  },

  async getUserRSVP(eventId: string, userId: string): Promise<RSVP | null> {
    const docSnap = await getDoc(doc(db, 'events', eventId, 'rsvps', userId))
    return docSnap.exists() ? docToObject<RSVP>(docSnap) : null
  },

  async setRSVP(
    eventId: string,
    userId: string,
    status: 'yes' | 'no' | 'maybe',
    notes = '',
    attendees: RSVPAttendee[] = [],
    guestCount = 0,
    selfAttending = true,
    userName = '',
    userPhotoURL = '',
  ): Promise<void> {
    const eventRef = doc(db, 'events', eventId)
    const rsvpRef = doc(db, 'events', eventId, 'rsvps', userId)
    let prevStatus: string | undefined
    await runTransaction(db, async (txn) => {
      const existing = await txn.get(rsvpRef)
      prevStatus = existing.exists() ? (existing.data().status as string | undefined) : undefined
      txn.set(rsvpRef, {
        userId,
        userName,
        userPhotoURL,
        status,
        notes,
        attendees,
        guestCount,
        selfAttending,
        updatedAt: serverTimestamp(),
      })
      const wasYes = prevStatus === 'yes'
      const isYes = status === 'yes'
      if (wasYes !== isYes) {
        txn.update(eventRef, {
          rsvpYesCount: increment(isYes ? 1 : -1),
        })
      }
    })
    // Notify event host when someone transitions TO yes/maybe (best-effort, non-blocking)
    const wasGoing = prevStatus === 'yes' || prevStatus === 'maybe'
    const isGoing = status === 'yes' || status === 'maybe'
    if (isGoing && !wasGoing) {
      getDoc(eventRef).then((eventSnap) => {
        const event = eventSnap.data() as Event | undefined
        if (event?.createdBy && event.createdBy !== userId) {
          addDoc(collection(db, 'notifications'), {
            userId: event.createdBy,
            type: 'event_update' as const,
            title: `${userName} RSVP'd to ${event.title}`,
            message: '',
            link: `/events/${eventId}`,
            read: false,
            createdAt: serverTimestamp(),
          }).catch((err) => console.error('[db] rsvp notify failed', err))
        }
      }).catch((err) => console.error('[db] rsvp notify event fetch failed', err))
    }
  },

  async removeRSVP(eventId: string, userId: string): Promise<void> {
    const eventRef = doc(db, 'events', eventId)
    const rsvpRef = doc(db, 'events', eventId, 'rsvps', userId)
    await runTransaction(db, async (txn) => {
      const existing = await txn.get(rsvpRef)
      const wasYes = existing.exists() && existing.data().status === 'yes'
      txn.delete(rsvpRef)
      if (wasYes) {
        txn.update(eventRef, {
          rsvpYesCount: increment(-1),
        })
      }
    })
  },

  // Legacy aggregate fallback for events that pre-date the denormalised
  // rsvpYesCount field. The Hosting page hydrates these on demand.
  async getEventGoingCount(eventId: string): Promise<number> {
    const q = query(collection(db, 'events', eventId, 'rsvps'), where('status', '==', 'yes'))
    const snap = await getCountFromServer(q)
    return snap.data().count
  },

  async getEventGoingCounts(eventIds: string[]): Promise<Record<string, number>> {
    const results = await Promise.all(
      eventIds.map(async (id) => [id, await this.getEventGoingCount(id)] as const),
    )
    return Object.fromEntries(results)
  },

  // ============================================
  // KETE (BLOG)
  // ============================================

  async getKetePosts(options: KeteQueryOptions = {}): Promise<KetePost[]> {
    const constraints = []
    if (options.published !== undefined) {
      constraints.push(where('published', '==', options.published))
    }
    constraints.push(orderBy('publishedAt', 'desc'))
    if (options.limit) {
      constraints.push(limit(options.limit))
    }

    const q = query(collection(db, 'kete'), ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => docToObject<KetePost>(doc))
  },

  async getKetePost(postId: string): Promise<KetePost | null> {
    const docSnap = await getDoc(doc(db, 'kete', postId))
    return docSnap.exists() ? docToObject<KetePost>(docSnap) : null
  },

  async getMyKeteDrafts(userId: string): Promise<KetePost[]> {
    const q = query(
      collection(db, 'kete'),
      where('authorId', '==', userId),
      where('published', '==', false),
      orderBy('updatedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => docToObject<KetePost>(doc))
  },

  allocateKetePostRef(): { id: string } {
    const ref = doc(collection(db, 'kete'))
    return { id: ref.id }
  },

  async createKetePost(postData: Omit<KetePost, 'id' | 'createdAt' | 'updatedAt'>): Promise<KetePost> {
    const timestamp = serverTimestamp()
    const docRef = await addDoc(collection(db, 'kete'), {
      ...postData,
      published: postData.published || false,
      publishedAt: postData.published ? timestamp : null,
      createdAt: timestamp,
      updatedAt: timestamp
    })
    return { id: docRef.id, ...postData } as KetePost
  },

  async createKetePostWithId(
    postId: string,
    postData: Omit<KetePost, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<KetePost> {
    const timestamp = serverTimestamp()
    await setDoc(doc(db, 'kete', postId), {
      ...postData,
      published: postData.published || false,
      publishedAt: postData.published ? timestamp : null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    return { id: postId, ...postData } as KetePost
  },

  async updateKetePost(postId: string, updates: Partial<KetePost>): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    }
    if (updates.published && !updates.publishedAt) {
      updateData.publishedAt = serverTimestamp()
    }
    await updateDoc(doc(db, 'kete', postId), updateData)
  },

  async deleteKetePost(postId: string): Promise<void> {
    await deleteDoc(doc(db, 'kete', postId))
  },

  async getKeteComments(postId: string): Promise<KeteComment[]> {
    const q = query(
      collection(db, 'kete', postId, 'comments'),
      orderBy('createdAt', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => docToObject<KeteComment>(doc))
  },

  async addKeteComment(postId: string, commentData: Omit<KeteComment, 'id' | 'createdAt'>): Promise<KeteComment> {
    const docRef = await addDoc(collection(db, 'kete', postId, 'comments'), {
      ...commentData,
      createdAt: serverTimestamp()
    })
    return { id: docRef.id, ...commentData } as KeteComment
  },

  async deleteKeteComment(postId: string, commentId: string): Promise<void> {
    await deleteDoc(doc(db, 'kete', postId, 'comments', commentId))
  },

  // ============================================
  // MESSAGE BOARDS
  // ============================================

  async getBoardPosts(gatheringId: string, options: { limit?: number } = {}): Promise<BoardPost[]> {
    let q = query(
      collection(db, 'messageBoards', gatheringId, 'posts'),
      orderBy('createdAt', 'desc')
    )
    if (options.limit) {
      q = query(q, limit(options.limit))
    }
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => docToObject<BoardPost>(doc))
  },

  async createBoardPost(gatheringId: string, postData: Omit<BoardPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BoardPost> {
    const timestamp = serverTimestamp()
    const docRef = await addDoc(collection(db, 'messageBoards', gatheringId, 'posts'), {
      ...postData,
      createdAt: timestamp,
      updatedAt: timestamp
    })
    return { id: docRef.id, ...postData } as BoardPost
  },

  async updateBoardPost(gatheringId: string, postId: string, updates: Partial<BoardPost>): Promise<void> {
    await updateDoc(doc(db, 'messageBoards', gatheringId, 'posts', postId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
  },

  async deleteBoardPost(gatheringId: string, postId: string): Promise<void> {
    await deleteDoc(doc(db, 'messageBoards', gatheringId, 'posts', postId))
  },

  async pinPost(gatheringId: string, postId: string, userId: string): Promise<void> {
    const ref = doc(db, 'messageBoards', gatheringId, 'posts', postId)
    const snap = await getDoc(ref)
    if (!snap.exists() || snap.data().pinned === true) return
    const isCommunity = gatheringId === COMMUNITY_GATHERING_ID
    await updateDoc(ref, {
      pinned: true,
      pinnedAt: serverTimestamp(),
      pinnedBy: userId,
      ...(isCommunity ? { announcementBroadcastStatus: 'pending' } : {}),
    })
    if (isCommunity) {
      const postData = { ...snap.data(), pinnedBy: userId } as BoardPost
      this.runAnnouncementBroadcast(postId, postData)
        .catch(err => console.error('[db] announcement broadcast failed', err))
    }
  },

  async runAnnouncementBroadcast(postId: string, post: BoardPost): Promise<void> {
    const postRef = doc(db, 'messageBoards', COMMUNITY_GATHERING_ID, 'posts', postId)
    const members = await this.getGatheringMembers(COMMUNITY_GATHERING_ID)
    const targets = members.map(m => m.id).filter(uid => uid !== post.pinnedBy)
    if (targets.length === 0) {
      await updateDoc(postRef, {
        announcementBroadcastStatus: 'sent',
        broadcastCompletedAt: serverTimestamp(),
      })
      return
    }
    const title = `New announcement: ${(post.content || '').replace(/<[^>]+>/g, '').slice(0, 60)}`
    const now = serverTimestamp()

    for (let i = 0; i < targets.length; i += 450) {
      const batch = writeBatch(db)
      targets.slice(i, i + 450).forEach(uid => {
        batch.set(doc(db, 'notifications', `announce_${postId}_${uid}`), {
          userId: uid,
          type: 'announcement' as const,
          title,
          message: '',
          link: '/home',
          read: false,
          createdAt: now,
        })
      })
      await batch.commit()
    }

    await updateDoc(postRef, {
      announcementBroadcastStatus: 'sent',
      broadcastCompletedAt: serverTimestamp(),
    })
  },

  async resumePendingAnnouncements(): Promise<void> {
    const pending = await getDocs(query(
      collection(db, 'messageBoards', COMMUNITY_GATHERING_ID, 'posts'),
      where('pinned', '==', true),
      where('announcementBroadcastStatus', '==', 'pending')
    ))
    for (const s of pending.docs) {
      await this.runAnnouncementBroadcast(s.id, s.data() as BoardPost)
        .catch(err => console.error('[db] resume broadcast failed', s.id, err))
    }
  },

  async unpinPost(gatheringId: string, postId: string): Promise<void> {
    const ref = doc(db, 'messageBoards', gatheringId, 'posts', postId)
    await updateDoc(ref, { pinned: false, pinnedAt: null, pinnedBy: null })
  },

  async getPostComments(gatheringId: string, postId: string): Promise<BoardComment[]> {
    const q = query(
      collection(db, 'messageBoards', gatheringId, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => docToObject<BoardComment>(doc))
  },

  async addPostComment(gatheringId: string, postId: string, commentData: Omit<BoardComment, 'id' | 'createdAt'>): Promise<BoardComment> {
    const docRef = await addDoc(
      collection(db, 'messageBoards', gatheringId, 'posts', postId, 'comments'),
      {
        ...commentData,
        createdAt: serverTimestamp()
      }
    )
    return { id: docRef.id, ...commentData } as BoardComment
  },

  async deletePostComment(gatheringId: string, postId: string, commentId: string): Promise<void> {
    await deleteDoc(doc(db, 'messageBoards', gatheringId, 'posts', postId, 'comments', commentId))
  },

  async votePoll(gatheringId: string, postId: string, userId: string, optionIndex: number): Promise<void> {
    const postRef = doc(db, 'messageBoards', gatheringId, 'posts', postId)
    await updateDoc(postRef, {
      [`poll.votes.${userId}`]: optionIndex,
      updatedAt: serverTimestamp(),
    })
  },

  async addReaction(gatheringId: string, postId: string, emoji: string, userId: string): Promise<void> {
    const postRef = doc(db, 'messageBoards', gatheringId, 'posts', postId)
    const postSnap = await getDoc(postRef)
    if (!postSnap.exists()) return
    const data = postSnap.data()
    const reactions = data.reactions || {}
    const users: string[] = reactions[emoji] || []
    if (users.includes(userId)) {
      reactions[emoji] = users.filter((id: string) => id !== userId)
      if (reactions[emoji].length === 0) delete reactions[emoji]
    } else {
      reactions[emoji] = [...users, userId]
    }
    await updateDoc(postRef, { reactions, updatedAt: serverTimestamp() })
  },

  // ============================================
  // GROUP RESOURCES
  // ============================================

  async getGroupResources(gatheringId: string): Promise<GroupResource[]> {
    const resourcesRef = collection(db, 'gatherings', gatheringId, 'resources')
    const q = query(resourcesRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => docToObject<GroupResource>(doc))
  },

  async addGroupResource(
    gatheringId: string,
    data: Omit<GroupResource, 'id' | 'createdAt'>
  ): Promise<GroupResource> {
    const resourcesRef = collection(db, 'gatherings', gatheringId, 'resources')
    const docRef = await addDoc(resourcesRef, {
      ...data,
      createdAt: serverTimestamp(),
    })
    return { ...data, id: docRef.id, createdAt: new Date() } as GroupResource
  },

  async updateGroupResource(
    gatheringId: string,
    resourceId: string,
    updates: Partial<Pick<GroupResource, 'title' | 'description' | 'tags'>>
  ): Promise<void> {
    const docRef = doc(db, 'gatherings', gatheringId, 'resources', resourceId)
    await updateDoc(docRef, updates)
  },

  async deleteGroupResource(gatheringId: string, resourceId: string): Promise<void> {
    const docRef = doc(db, 'gatherings', gatheringId, 'resources', resourceId)
    await deleteDoc(docRef)
  },

  subscribeToGroupResources(
    gatheringId: string,
    callback: (resources: GroupResource[]) => void
  ): Unsubscribe {
    const resourcesRef = collection(db, 'gatherings', gatheringId, 'resources')
    const q = query(resourcesRef, orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snapshot) => {
      const resources = snapshot.docs.map(doc => docToObject<GroupResource>(doc))
      callback(resources)
    })
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================

  async getUserNotifications(userId: string, options: { unreadOnly?: boolean; limit?: number } = {}): Promise<Notification[]> {
    let q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    if (options.unreadOnly) {
      q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      )
    }

    if (options.limit) {
      q = query(q, limit(options.limit))
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => docToObject<Notification>(doc))
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: serverTimestamp()
    })
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    )
    const snapshot = await getDocs(q)

    const batch = writeBatch(db)
    const timestamp = serverTimestamp()

    snapshot.docs.forEach(docSnap => {
      batch.update(docSnap.ref, { read: true, readAt: timestamp })
    })

    await batch.commit()
  },

  async createMentionNotifications(
    mentionedUserIds: string[],
    context: {
      authorId: string
      authorName: string
      gatheringId: string
      gatheringName: string
      postId: string
      commentId?: string
      snippet: string
    }
  ): Promise<void> {
    const batch = writeBatch(db)
    const timestamp = serverTimestamp()

    for (const userId of mentionedUserIds.slice(0, 50)) {
      if (userId === context.authorId) continue
      const notifRef = doc(collection(db, 'notifications'))
      batch.set(notifRef, {
        userId,
        type: 'mention' as const,
        title: `${context.authorName} mentioned you`,
        message: context.snippet.length > 80
          ? context.snippet.slice(0, 80) + '...'
          : context.snippet,
        link: `/groups/${context.gatheringId}`,
        read: false,
        createdAt: timestamp,
      })
    }

    await batch.commit()
  },

  async createGroupMentionNotifications(
    gatheringIds: string[],
    context: {
      authorId: string
      authorName: string
      sourceGatheringId: string
      sourceGatheringName: string
      postId: string
      commentId?: string
      snippet: string
    }
  ): Promise<void> {
    const allMemberIds = new Set<string>()
    for (const gId of gatheringIds.slice(0, 10)) {
      const members = await this.getGatheringMembers(gId)
      for (const m of members) {
        if (m.id !== context.authorId) allMemberIds.add(m.id)
      }
    }

    if (allMemberIds.size === 0) return

    const batch = writeBatch(db)
    const timestamp = serverTimestamp()
    let count = 0

    for (const userId of allMemberIds) {
      if (count >= 500) break
      const notifRef = doc(collection(db, 'notifications'))
      batch.set(notifRef, {
        userId,
        type: 'mention' as const,
        title: `${context.authorName} mentioned a group you're in`,
        message: context.snippet.length > 80
          ? context.snippet.slice(0, 80) + '...'
          : context.snippet,
        link: isCommunityGathering(context.sourceGatheringId)
          ? '/home'
          : `/groups/${context.sourceGatheringId}`,
        read: false,
        createdAt: timestamp,
      })
      count++
    }

    await batch.commit()
  },

  createCommentNotification(context: {
    recipientId: string
    authorId: string
    authorName: string
    gatheringId: string
    isReply: boolean
    snippet: string
  }): void {
    if (context.recipientId === context.authorId) return
    const verb = context.isReply ? 'replied to your comment' : 'commented on your post'
    addDoc(collection(db, 'notifications'), {
      userId: context.recipientId,
      type: 'new_comment' as const,
      title: `${context.authorName} ${verb}`,
      message: context.snippet.length > 80
        ? context.snippet.slice(0, 80) + '...'
        : context.snippet,
      link: isCommunityGathering(context.gatheringId) ? '/home' : `/groups/${context.gatheringId}`,
      read: false,
      createdAt: serverTimestamp(),
    }).catch((err) => console.error('[db] comment notify failed', err))
  },

  // ============================================
  // REPORTS (Content Moderation)
  // ============================================

  async createReport(reportData: Omit<Report, 'id' | 'createdAt'>): Promise<Report> {
    const docRef = await addDoc(collection(db, 'reports'), {
      ...reportData,
      createdAt: serverTimestamp(),
    })
    return { id: docRef.id, ...reportData, createdAt: new Date() } as Report
  },

  async getReports(options?: { status?: ReportStatus }): Promise<Report[]> {
    const constraints: Parameters<typeof query>[1][] = [orderBy('createdAt', 'desc')]
    if (options?.status) {
      constraints.push(where('status', '==', options.status))
    }
    const q = query(collection(db, 'reports'), ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => docToObject<Report>(d))
  },

  async updateReportStatus(reportId: string, status: ReportStatus, reviewerId: string): Promise<void> {
    await updateDoc(doc(db, 'reports', reportId), {
      status,
      reviewedBy: reviewerId,
      reviewedAt: serverTimestamp(),
    })
  },

  // ============================================
  // REAL-TIME LISTENERS
  // ============================================

  subscribeToEvents(callback: (events: Event[]) => void, options: EventQueryOptions = {}): Unsubscribe {
    const constraints = []
    if (options.startDate) {
      constraints.push(where('date', '>=', options.startDate))
    }
    constraints.push(orderBy('date', 'asc'))

    const q = query(collection(db, 'events'), ...constraints)
    return onSnapshot(q, snapshot => {
      const events = snapshot.docs.map(doc => docToObject<Event>(doc))
      callback(events)
    })
  },

  subscribeToBoardPosts(gatheringId: string, callback: (posts: BoardPost[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'messageBoards', gatheringId, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )
    return onSnapshot(q, snapshot => {
      const posts = snapshot.docs.map(doc => docToObject<BoardPost>(doc))
      callback(posts)
    })
  },

  subscribeToPostComments(
    gatheringId: string,
    postId: string,
    callback: (comments: BoardComment[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'messageBoards', gatheringId, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    )
    return onSnapshot(q, snapshot => {
      const comments = snapshot.docs.map(doc => docToObject<BoardComment>(doc))
      callback(comments)
    })
  },

  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(20)
    )
    return onSnapshot(q, snapshot => {
      const notifications = snapshot.docs.map(doc => docToObject<Notification>(doc))
      callback(notifications)
    })
  },

  // ============================================
  // DIRECT MESSAGES
  // ============================================

  getConversationId(userIdA: string, userIdB: string): string {
    return [userIdA, userIdB].sort().join('_')
  },

  async getOrCreateConversation(
    currentUserId: string,
    currentUser: ConversationParticipant,
    otherUserId: string,
    otherUser: ConversationParticipant
  ): Promise<Conversation> {
    const conversationId = this.getConversationId(currentUserId, otherUserId)
    const docRef = doc(db, 'conversations', conversationId)

    // getDoc throws permission error on non-existent docs because the read
    // rule references resource.data which is null. Catch and treat as "create".
    try {
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return docToObject<Conversation>(docSnap)
      }
    } catch {
      // Permission denied = document doesn't exist yet, proceed to create
    }

    const timestamp = serverTimestamp()
    const conversationData = {
      participantIds: [currentUserId, otherUserId].sort(),
      participants: {
        [currentUserId]: currentUser,
        [otherUserId]: otherUser,
      },
      lastReadAt: {
        [currentUserId]: timestamp,
        [otherUserId]: timestamp,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    await setDoc(docRef, conversationData)
    return { id: conversationId, ...conversationData } as unknown as Conversation
  },

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const docSnap = await getDoc(doc(db, 'conversations', conversationId))
    return docSnap.exists() ? docToObject<Conversation>(docSnap) : null
  },

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => docToObject<Conversation>(d))
  },

  async getMessages(conversationId: string, messageLimit = 50): Promise<DirectMessage[]> {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(messageLimit)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => docToObject<DirectMessage>(d))
  },

  async sendMessage(
    conversationId: string,
    messageData: Omit<DirectMessage, 'id' | 'conversationId' | 'createdAt'>
  ): Promise<DirectMessage> {
    const timestamp = serverTimestamp()
    const batch = writeBatch(db)

    const msgRef = doc(collection(db, 'conversations', conversationId, 'messages'))
    batch.set(msgRef, {
      ...messageData,
      conversationId,
      createdAt: timestamp,
    })

    const convRef = doc(db, 'conversations', conversationId)
    batch.update(convRef, {
      lastMessage: {
        content: messageData.content,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        createdAt: timestamp,
      },
      updatedAt: timestamp,
    })

    await batch.commit()
    return { id: msgRef.id, ...messageData, conversationId } as DirectMessage
  },

  async markConversationRead(conversationId: string, userId: string): Promise<void> {
    await updateDoc(doc(db, 'conversations', conversationId), {
      [`lastReadAt.${userId}`]: serverTimestamp(),
    })
  },

  subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    )
    return onSnapshot(q, snapshot => {
      const conversations = snapshot.docs.map(d => docToObject<Conversation>(d))
      callback(conversations)
    }, (error) => {
      console.error('Conversations subscription error:', error)
    })
  },

  subscribeToMessages(conversationId: string, callback: (messages: DirectMessage[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    )
    return onSnapshot(q, snapshot => {
      const messages = snapshot.docs.map(d => docToObject<DirectMessage>(d))
      callback(messages)
    }, (error) => {
      console.error('Messages subscription error:', error)
    })
  },

  async createDmNotification(
    recipientId: string,
    senderName: string,
    conversationId: string,
    snippet: string
  ): Promise<void> {
    await addDoc(collection(db, 'notifications'), {
      userId: recipientId,
      type: 'direct_message' as const,
      title: `${senderName} sent you a message`,
      message: snippet.length > 80 ? snippet.slice(0, 80) + '...' : snippet,
      link: `/messages/${conversationId}`,
      read: false,
      createdAt: serverTimestamp(),
    })
  }
}
