import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  type Unsubscribe,
  type DocumentData
} from 'firebase/firestore'
import { db } from './config'
import type {
  User,
  UserPreferences,
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
  ReportStatus
} from '@/types'
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

  async getAllUsers(): Promise<User[]> {
    const q = query(collection(db, 'users'), orderBy('displayName'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => docToObject<User>(doc))
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
    preferences?: UserPreferences
  }): Promise<User> {
    const timestamp = serverTimestamp()
    const user = {
      ...userData,
      email: userData.email.toLowerCase(),
      role: userData.role || 'member',
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

    // Create public profile
    await setDoc(doc(db, 'userProfiles', userId), {
      displayName: userData.displayName,
      photoURL: userData.photoURL || null,
      createdAt: timestamp
    })

    return { id: userId, ...user } as User
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', userId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
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

  async getGatheringMembersWithProfiles(gatheringId: string): Promise<Array<{ id: string; displayName: string; photoURL?: string }>> {
    const members = await this.getGatheringMembers(gatheringId)
    const profiles = await Promise.all(
      members.map(async (member) => {
        const userDoc = await getDoc(doc(db, 'users', member.id))
        if (userDoc.exists()) {
          const data = userDoc.data()
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

  async leaveGathering(gatheringId: string, userId: string): Promise<void> {
    await deleteDoc(doc(db, 'gatherings', gatheringId, 'members', userId))
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

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    await updateDoc(doc(db, 'events', eventId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
  },

  async deleteEvent(eventId: string): Promise<void> {
    await deleteDoc(doc(db, 'events', eventId))
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
    selfAttending = true
  ): Promise<void> {
    await setDoc(doc(db, 'events', eventId, 'rsvps', userId), {
      userId,
      status,
      notes,
      attendees,
      guestCount,
      selfAttending,
      updatedAt: serverTimestamp()
    })
  },

  async removeRSVP(eventId: string, userId: string): Promise<void> {
    await deleteDoc(doc(db, 'events', eventId, 'rsvps', userId))
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
