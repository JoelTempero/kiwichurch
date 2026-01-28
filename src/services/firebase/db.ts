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
  Notification
} from '@/types'

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

  async getGatheringMembers(gatheringId: string): Promise<GatheringMember[]> {
    const membersRef = collection(db, 'gatherings', gatheringId, 'members')
    const snapshot = await getDocs(membersRef)
    return snapshot.docs.map(doc => docToObject<GatheringMember>(doc))
  },

  async getUserGatherings(userId: string): Promise<Gathering[]> {
    const gatherings = await this.getGatherings()
    const userGatherings: Gathering[] = []

    for (const gathering of gatherings) {
      const memberDoc = await getDoc(
        doc(db, 'gatherings', gathering.id, 'members', userId)
      )
      if (memberDoc.exists()) {
        userGatherings.push(gathering)
      }
    }
    return userGatherings
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
  }
}
