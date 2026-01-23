// Kiwi Church - Firestore Database Service
// Provides methods for reading/writing to Firestore

const DB = {
    // ============================================
    // USERS
    // ============================================

    async getAllUsers() {
        const snapshot = await db.collection('users').orderBy('displayName').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getUser(userId) {
        const doc = await db.collection('users').doc(userId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    async getUserByEmail(email) {
        const snapshot = await db.collection('users')
            .where('email', '==', email.toLowerCase())
            .limit(1)
            .get();
        return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },

    async getUserByUsername(username) {
        const usernameDoc = await db.collection('usernames').doc(username.toLowerCase()).get();
        if (!usernameDoc.exists) return null;
        return this.getUser(usernameDoc.data().uid);
    },

    async createUser(userId, userData) {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const user = {
            ...userData,
            email: userData.email.toLowerCase(),
            role: userData.role || 'member',
            createdAt: timestamp,
            updatedAt: timestamp
        };
        await db.collection('users').doc(userId).set(user);

        // Create username mapping if provided
        if (userData.username) {
            await db.collection('usernames').doc(userData.username.toLowerCase()).set({
                uid: userId,
                createdAt: timestamp
            });
        }

        // Create public profile
        await db.collection('userProfiles').doc(userId).set({
            displayName: userData.displayName,
            photoURL: userData.photoURL || null,
            createdAt: timestamp
        });

        return { id: userId, ...user };
    },

    async updateUser(userId, updates) {
        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('users').doc(userId).update(updates);
    },

    async checkUsernameAvailable(username) {
        const doc = await db.collection('usernames').doc(username.toLowerCase()).get();
        return !doc.exists;
    },

    // ============================================
    // GATHERINGS
    // ============================================

    async getGatherings() {
        const snapshot = await db.collection('gatherings')
            .orderBy('name')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getGathering(gatheringId) {
        const doc = await db.collection('gatherings').doc(gatheringId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    async getGatheringMembers(gatheringId) {
        const snapshot = await db.collection('gatherings')
            .doc(gatheringId)
            .collection('members')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getUserGatherings(userId) {
        // Get all gatherings where user is a member
        const gatherings = await this.getGatherings();
        const userGatherings = [];

        for (const gathering of gatherings) {
            const memberDoc = await db.collection('gatherings')
                .doc(gathering.id)
                .collection('members')
                .doc(userId)
                .get();
            if (memberDoc.exists) {
                userGatherings.push(gathering);
            }
        }
        return userGatherings;
    },

    async joinGathering(gatheringId, userId) {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('gatherings')
            .doc(gatheringId)
            .collection('members')
            .doc(userId)
            .set({ joinedAt: timestamp });
    },

    async leaveGathering(gatheringId, userId) {
        await db.collection('gatherings')
            .doc(gatheringId)
            .collection('members')
            .doc(userId)
            .delete();
    },

    // ============================================
    // EVENTS
    // ============================================

    async getEvents(options = {}) {
        let query = db.collection('events');

        if (options.startDate) {
            query = query.where('date', '>=', options.startDate);
        }
        if (options.endDate) {
            query = query.where('date', '<=', options.endDate);
        }
        if (options.gatheringId) {
            query = query.where('gatheringId', '==', options.gatheringId);
        }

        query = query.orderBy('date', 'asc');

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getEvent(eventId) {
        const doc = await db.collection('events').doc(eventId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    async createEvent(eventData) {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const docRef = await db.collection('events').add({
            ...eventData,
            createdAt: timestamp,
            updatedAt: timestamp
        });
        return { id: docRef.id, ...eventData };
    },

    async updateEvent(eventId, updates) {
        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('events').doc(eventId).update(updates);
    },

    async deleteEvent(eventId) {
        await db.collection('events').doc(eventId).delete();
    },

    // ============================================
    // RSVPS
    // ============================================

    async getRSVPs(eventId) {
        const snapshot = await db.collection('events')
            .doc(eventId)
            .collection('rsvps')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getUserRSVP(eventId, userId) {
        const doc = await db.collection('events')
            .doc(eventId)
            .collection('rsvps')
            .doc(userId)
            .get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    async setRSVP(eventId, userId, status, note = '') {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('events')
            .doc(eventId)
            .collection('rsvps')
            .doc(userId)
            .set({
                status,
                note,
                updatedAt: timestamp
            });
    },

    async removeRSVP(eventId, userId) {
        await db.collection('events')
            .doc(eventId)
            .collection('rsvps')
            .doc(userId)
            .delete();
    },

    // ============================================
    // KETE (BLOG)
    // ============================================

    async getKetePosts(options = {}) {
        let query = db.collection('kete');

        if (options.published !== undefined) {
            query = query.where('published', '==', options.published);
        }

        query = query.orderBy('publishedAt', 'desc');

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getKetePost(postId) {
        const doc = await db.collection('kete').doc(postId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    async createKetePost(postData) {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const docRef = await db.collection('kete').add({
            ...postData,
            published: postData.published || false,
            publishedAt: postData.published ? timestamp : null,
            createdAt: timestamp,
            updatedAt: timestamp
        });
        return { id: docRef.id, ...postData };
    },

    async updateKetePost(postId, updates) {
        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        if (updates.published && !updates.publishedAt) {
            updates.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
        }
        await db.collection('kete').doc(postId).update(updates);
    },

    async deleteKetePost(postId) {
        await db.collection('kete').doc(postId).delete();
    },

    // Kete comments
    async getKeteComments(postId) {
        const snapshot = await db.collection('kete')
            .doc(postId)
            .collection('comments')
            .orderBy('createdAt', 'asc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addKeteComment(postId, commentData) {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const docRef = await db.collection('kete')
            .doc(postId)
            .collection('comments')
            .add({
                ...commentData,
                createdAt: timestamp
            });
        return { id: docRef.id, ...commentData };
    },

    async deleteKeteComment(postId, commentId) {
        await db.collection('kete')
            .doc(postId)
            .collection('comments')
            .doc(commentId)
            .delete();
        return true;
    },

    // ============================================
    // MESSAGE BOARDS
    // ============================================

    async getMessageBoard(gatheringId) {
        const doc = await db.collection('messageBoards').doc(gatheringId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    async getBoardPosts(gatheringId, options = {}) {
        let query = db.collection('messageBoards')
            .doc(gatheringId)
            .collection('posts')
            .orderBy('createdAt', 'desc');

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async createBoardPost(gatheringId, postData) {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const docRef = await db.collection('messageBoards')
            .doc(gatheringId)
            .collection('posts')
            .add({
                ...postData,
                createdAt: timestamp,
                updatedAt: timestamp
            });
        return { id: docRef.id, ...postData };
    },

    async updateBoardPost(gatheringId, postId, updates) {
        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('messageBoards')
            .doc(gatheringId)
            .collection('posts')
            .doc(postId)
            .update(updates);
    },

    async deleteBoardPost(gatheringId, postId) {
        await db.collection('messageBoards')
            .doc(gatheringId)
            .collection('posts')
            .doc(postId)
            .delete();
    },

    // Board post comments
    async getPostComments(gatheringId, postId) {
        const snapshot = await db.collection('messageBoards')
            .doc(gatheringId)
            .collection('posts')
            .doc(postId)
            .collection('comments')
            .orderBy('createdAt', 'asc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addPostComment(gatheringId, postId, commentData) {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const docRef = await db.collection('messageBoards')
            .doc(gatheringId)
            .collection('posts')
            .doc(postId)
            .collection('comments')
            .add({
                ...commentData,
                createdAt: timestamp
            });
        return { id: docRef.id, ...commentData };
    },

    async deletePostComment(gatheringId, postId, commentId) {
        await db.collection('messageBoards')
            .doc(gatheringId)
            .collection('posts')
            .doc(postId)
            .collection('comments')
            .doc(commentId)
            .delete();
    },

    // ============================================
    // NOTIFICATIONS
    // ============================================

    async getUserNotifications(userId, options = {}) {
        let query = db.collection('notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc');

        if (options.unreadOnly) {
            query = query.where('read', '==', false);
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async markNotificationRead(notificationId) {
        await db.collection('notifications').doc(notificationId).update({
            read: true,
            readAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    async markAllNotificationsRead(userId) {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .where('read', '==', false)
            .get();

        const batch = db.batch();
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();

        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { read: true, readAt: timestamp });
        });

        await batch.commit();
    },

    // ============================================
    // REAL-TIME LISTENERS
    // ============================================

    subscribeToEvents(callback, options = {}) {
        let query = db.collection('events');

        if (options.startDate) {
            query = query.where('date', '>=', options.startDate);
        }

        query = query.orderBy('date', 'asc');

        return query.onSnapshot(snapshot => {
            const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(events);
        });
    },

    subscribeToBoardPosts(gatheringId, callback) {
        return db.collection('messageBoards')
            .doc(gatheringId)
            .collection('posts')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(posts);
            });
    },

    subscribeToNotifications(userId, callback) {
        return db.collection('notifications')
            .where('userId', '==', userId)
            .where('read', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .onSnapshot(snapshot => {
                const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(notifications);
            });
    },

    // ============================================
    // MIGRATIONS
    // ============================================

    // Ensure all events have isPublic field set based on their gathering
    async migrateEventsIsPublic() {
        try {
            // Get all events
            const eventsSnapshot = await db.collection('events').get();
            const gatheringsSnapshot = await db.collection('gatherings').get();

            // Create a map of gathering IDs to their isPublic setting
            const gatheringPublicMap = {};
            gatheringsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                gatheringPublicMap[doc.id] = data.isPublic !== false; // Default to true if not set
            });

            const batch = db.batch();
            let updateCount = 0;

            eventsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                // Only update if isPublic is undefined
                if (data.isPublic === undefined) {
                    const isPublic = gatheringPublicMap[data.gatheringId] !== false;
                    batch.update(doc.ref, { isPublic: isPublic });
                    updateCount++;
                }
            });

            if (updateCount > 0) {
                await batch.commit();
                console.log(`[DB Migration] Set isPublic field on ${updateCount} events`);
            } else {
                console.log('[DB Migration] All events already have isPublic field');
            }

            return updateCount;
        } catch (error) {
            console.error('[DB Migration] Error migrating events isPublic:', error);
            throw error;
        }
    }
};

// Make available globally
window.DB = DB;
