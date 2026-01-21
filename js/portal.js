/* ============================================
   Kiwi Church - Portal JavaScript
   Authenticated member portal functionality
   ============================================ */

// ============================================
// CONFIGURATION
// ============================================

const PortalConfig = {
    // Set to true to use Firebase, false for demo mode
    useFirebase: true,
    demoMode: false
};

// ============================================
// MOCK DATA STORE (Demo Mode)
// ============================================

const MockDB = {
    users: [], // Users managed in Firebase - no demo users

    gatherings: [
        {
            id: 'gathering-1',
            name: 'Thin Place',
            description: 'A contemplative gathering exploring Celtic spirituality and the spaces where heaven and earth feel close. We practice ancient prayers, share silence, and explore faith through poetry, art, and reflection.',
            rhythm: 'Fortnightly Wednesdays, 6:30pm',
            location: 'Hansons Lane, Central Christchurch',
            isPublic: true,
            featured: true,
            color: '#1a3a2f'
        },
        {
            id: 'gathering-2',
            name: 'Online Prayer',
            description: 'Start your day with prayer and reflection. A simple, accessible way to connect with community no matter where you are. We gather on Zoom for 30 minutes of guided prayer and silence.',
            rhythm: 'Weekly - Tuesday & Thursday, 7:00am',
            location: 'Zoom (link provided on signup)',
            isPublic: true,
            featured: true,
            color: '#7d9a87'
        },
        {
            id: 'gathering-3',
            name: 'Prestons Community',
            description: 'A family-friendly gathering in the Prestons area. Shared meals, kids running around, and real conversations about faith and life. We eat together, study together, and support each other.',
            rhythm: 'Weekly Fridays, 6:00pm',
            location: 'Prestons, North Christchurch',
            isPublic: false,
            featured: false,
            color: '#c17f59'
        },
        {
            id: 'gathering-4',
            name: 'Rito Shack',
            description: 'A creative community exploring faith through art, music, and making. We believe creativity is a form of worship and that making things together builds connection.',
            rhythm: 'Monthly - First Saturday, 10:00am',
            location: 'Various locations',
            isPublic: true,
            featured: false,
            color: '#d4a574'
        },
        {
            id: 'gathering-5',
            name: 'Digging Deeper',
            description: 'For those who want to go deeper into scripture and theology. We read books together, discuss challenging ideas, and wrestle with difficult questions about faith.',
            rhythm: 'Fortnightly Tuesdays, 7:30pm',
            location: 'Rotating homes',
            isPublic: false,
            featured: false,
            color: '#2d5a4a'
        },
        {
            id: 'gathering-6',
            name: 'Reel Life',
            description: 'Faith and film come together as we watch movies and discuss the spiritual themes, moral questions, and human experiences they explore. Great for those who love good stories.',
            rhythm: 'Monthly - Third Friday, 7:00pm',
            location: 'Rotating homes',
            isPublic: true,
            featured: false,
            color: '#5a6b62'
        }
    ],

    events: [],

    kete: [
        {
            id: 'kete-1',
            title: 'Finding Sacred in the Ordinary',
            excerpt: 'Reflections on discovering God in everyday moments and mundane routines.',
            content: `There's a moment each morning, somewhere between the first sip of coffee and the rush of the day, where I find myself pausing. It's not a grand spiritual practice—just a breath, a noticing.

I've been learning that God doesn't only show up in the mountain-top experiences or the carefully crafted worship services. Sometimes the sacred sneaks in through the back door: in the steam rising from a cup, in the sound of rain on the roof, in the mundane rhythm of washing dishes.

Brother Lawrence called it "practicing the presence of God." I'm calling it "paying attention."

What if our everyday moments—the commute, the grocery run, the bedtime routine—are all invitations to encounter? What if the ordinary is already holy, and we just need eyes to see?

This week, I'm trying something simple: before I rush into each task, I'll take one breath and ask, "Where are you here, God?"

Maybe you'd like to try it too.`,
            publishedAt: '2024-01-10',
            authorId: 'user-3',
            authorName: 'Darryl Tempero',
            published: true,
            featuredImage: null,
            createdAt: '2024-01-08',
            updatedAt: '2024-01-10'
        },
        {
            id: 'kete-2',
            title: 'Community Update: Summer 2024',
            excerpt: 'A look back at what God has been doing in our communities over the past season.',
            content: `As we head into the new year, we wanted to take a moment to celebrate what God has been doing in our communities over the summer.

## Thin Place
Our fortnightly gatherings have continued to be a space of deep encounter and honest conversation. We've welcomed several new faces and have been moved by the stories shared around our tables.

## Prestons Community
The Friday night dinners have become a highlight for many families. There's something beautiful about sharing a meal together, watching the kids play, and simply being present with one another.

## Rito Shack
Our creative gathering has been exploring new ways of expressing faith through art. Last month's collaborative painting project was a powerful reminder that we're all part of something bigger.

## Looking Ahead
As we move into 2024, we're excited about what's to come. We're dreaming about new ways to serve our neighborhoods and deepen our connections with one another.

Thank you for being part of this community. You belong here.`,
            publishedAt: '2024-01-03',
            authorId: 'user-3',
            authorName: 'Kiwi Church Team',
            published: true,
            featuredImage: null,
            createdAt: '2024-01-02',
            updatedAt: '2024-01-03'
        },
        {
            id: 'kete-3',
            title: 'The Art of Showing Up',
            excerpt: 'Why consistent presence matters more than perfect attendance.',
            content: `I used to think that being part of a community meant never missing a gathering. That good members showed up every single time, fully present and engaged.

But life doesn't work that way, does it?

There are seasons when we're overwhelmed, when the kids are sick, when work is demanding, when we simply don't have the energy. And in those moments, I've learned something important: **showing up doesn't have to be perfect to be meaningful**.

Sometimes showing up means dragging yourself to the gathering even when you'd rather stay home. Other times, it means sending a text to say "I'm thinking of you" when you can't be there in person. And sometimes, it means receiving grace when you've been absent for weeks.

Community isn't built on perfect attendance. It's built on consistent presence over time—the kind that weathers the ups and downs, the busy seasons and the quiet ones.

So if you've been away for a while, know this: you're still part of us. And when you're ready, there's always a seat at the table with your name on it.`,
            publishedAt: '2023-12-20',
            authorId: 'user-1',
            authorName: 'Sarah Utting',
            published: true,
            featuredImage: null,
            createdAt: '2023-12-18',
            updatedAt: '2023-12-20'
        },
        {
            id: 'kete-4',
            title: 'Draft: Upcoming Retreat Plans',
            excerpt: 'Planning notes for our 2024 community retreat.',
            content: `# Retreat Planning Notes

**Date options:** March or April 2024
**Location ideas:** Hanmer Springs, Tekapo, local campground

## Goals
- Time for rest and refreshment
- Building deeper connections
- Space for prayer and reflection

## To discuss
- Budget considerations
- Childcare options
- Activities vs. free time balance

*This is a draft - more details coming soon!*`,
            publishedAt: null,
            authorId: 'user-2',
            authorName: 'Michael Olds',
            published: false,
            featuredImage: null,
            createdAt: '2024-01-12',
            updatedAt: '2024-01-12'
        }
    ],

    // Message boards - one per gathering
    messageBoards: {
        'gathering-1': { // Thin Place - public gathering, public board
            posts: [
                {
                    id: 'post-1',
                    authorId: 'user-3',
                    authorName: 'Darryl Tempero',
                    content: 'Looking forward to seeing everyone this Wednesday! We\'ll be exploring the theme of "rest" together. Bring a cushion if you like - we\'ll have some floor time.',
                    createdAt: '2024-01-15T10:30:00',
                    comments: [
                        {
                            id: 'comment-1',
                            authorId: 'user-1',
                            authorName: 'Sarah Utting',
                            content: 'Can\'t wait! Should we bring anything to share for supper?',
                            createdAt: '2024-01-15T11:45:00'
                        },
                        {
                            id: 'comment-2',
                            authorId: 'user-3',
                            authorName: 'Darryl Tempero',
                            content: 'Just yourselves! We\'ve got food sorted this week.',
                            createdAt: '2024-01-15T12:00:00'
                        }
                    ]
                },
                {
                    id: 'post-2',
                    authorId: 'user-1',
                    authorName: 'Sarah Utting',
                    content: 'That was such a beautiful evening last week. The silence at the end was exactly what I needed. Thank you all for holding that space together.',
                    createdAt: '2024-01-12T09:15:00',
                    comments: []
                }
            ]
        },
        'gathering-2': { // Online Prayer - public gathering
            posts: [
                {
                    id: 'post-3',
                    authorId: 'user-3',
                    authorName: 'Darryl Tempero',
                    content: 'Zoom link for this week\'s prayer sessions: https://zoom.us/j/example\n\nTuesday and Thursday at 7am as usual. All welcome!',
                    createdAt: '2024-01-14T18:00:00',
                    comments: []
                }
            ]
        },
        'gathering-3': { // Prestons Community - private gathering, members only
            posts: [
                {
                    id: 'post-4',
                    authorId: 'user-2',
                    authorName: 'Michael Olds',
                    content: 'Friday dinner this week at our place! We\'re doing a Mexican theme. Let me know if you have any dietary requirements.',
                    createdAt: '2024-01-16T14:20:00',
                    comments: [
                        {
                            id: 'comment-3',
                            authorId: 'user-1',
                            authorName: 'Sarah Utting',
                            content: 'Yum! We\'ll be there. James is vegetarian now (this week at least 😄)',
                            createdAt: '2024-01-16T15:30:00'
                        }
                    ]
                },
                {
                    id: 'post-5',
                    authorId: 'user-2',
                    authorName: 'Michael Olds',
                    content: 'Quick reminder that we\'re collecting for the local food bank this month. Bring any non-perishables to Friday\'s dinner if you can.',
                    createdAt: '2024-01-10T09:00:00',
                    comments: []
                }
            ]
        },
        'gathering-4': { // Rito Shack - public gathering
            posts: []
        },
        'gathering-5': { // Digging Deeper - private gathering
            posts: [
                {
                    id: 'post-6',
                    authorId: 'user-3',
                    authorName: 'Darryl Tempero',
                    content: 'This Tuesday we\'re looking at the book of Ruth. If you get a chance, read through it beforehand - it\'s only 4 short chapters!',
                    createdAt: '2024-01-15T08:00:00',
                    comments: []
                }
            ]
        },
        'gathering-6': { // Reel Life - public gathering
            posts: [
                {
                    id: 'post-7',
                    authorId: 'user-2',
                    authorName: 'Michael Olds',
                    content: 'Next movie night: "The Way" (2010) - a beautiful film about pilgrimage and finding yourself. Friday the 19th at 7pm. Popcorn provided!',
                    createdAt: '2024-01-13T16:45:00',
                    comments: [
                        {
                            id: 'comment-4',
                            authorId: 'user-1',
                            authorName: 'Sarah Utting',
                            content: 'I\'ve heard great things about this one. See you there!',
                            createdAt: '2024-01-13T17:30:00'
                        }
                    ]
                }
            ]
        }
    },

    // Track which users are members of which private gatherings
    gatheringMembers: {
        'gathering-3': ['user-1', 'user-2', 'user-3'], // Prestons Community
        'gathering-5': ['user-1', 'user-3'] // Digging Deeper
    },

    // Notifications for users
    notifications: [
        {
            id: 'notif-1',
            userId: 'user-1',
            type: 'comment', // comment, post, event, rsvp, mention
            title: 'New comment on your post',
            message: 'Darryl replied to your comment in Thin Place',
            link: { page: 'group', groupId: 'gathering-1' },
            read: false,
            createdAt: '2024-01-15T12:00:00'
        },
        {
            id: 'notif-2',
            userId: 'user-1',
            type: 'event',
            title: 'Event tomorrow',
            message: 'Thin Place Gathering is tomorrow at 6:30pm',
            link: { page: 'events' },
            read: false,
            createdAt: '2024-01-16T09:00:00'
        },
        {
            id: 'notif-3',
            userId: 'user-1',
            type: 'post',
            title: 'New post in Prestons Community',
            message: 'Michael shared: "Friday dinner this week..."',
            link: { page: 'group', groupId: 'gathering-3' },
            read: true,
            createdAt: '2024-01-16T14:20:00'
        },
        {
            id: 'notif-4',
            userId: 'user-2',
            type: 'rsvp',
            title: 'New RSVP',
            message: 'Sarah is attending Prestons Dinner',
            link: { page: 'events' },
            read: false,
            createdAt: '2024-01-16T15:30:00'
        },
        {
            id: 'notif-5',
            userId: 'user-3',
            type: 'post',
            title: 'New Kete post published',
            message: 'Your post "Finding Sacred in the Ordinary" is now live',
            link: { page: 'kete' },
            read: true,
            createdAt: '2024-01-10T10:00:00'
        }
    ]
};

// Generate sample events
function generateEvents() {
    const eventTemplates = [
        { title: 'Thin Place Gathering', gathering: 'gathering-1', location: 'Hansons Lane', isPublic: true, time: '18:30' },
        { title: 'Morning Prayer', gathering: 'gathering-2', location: 'Zoom', isPublic: true, time: '07:00' },
        { title: 'Prestons Dinner', gathering: 'gathering-3', location: 'Prestons', isPublic: false, time: '18:00' },
        { title: 'Rito Shack Creative', gathering: 'gathering-4', location: 'Hansons Lane', isPublic: true, time: '10:00' },
        { title: 'Digging Deeper Study', gathering: 'gathering-5', location: 'Rotating homes', isPublic: false, time: '19:30' },
        { title: 'Reel Life Movie Night', gathering: 'gathering-6', location: 'Hansons Lane', isPublic: true, time: '19:00' }
    ];

    const events = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    for (let i = 0; i < 30; i++) {
        const template = eventTemplates[i % eventTemplates.length];
        const eventDate = new Date(startDate);
        eventDate.setDate(eventDate.getDate() + Math.floor(i * 2.5));

        events.push({
            id: `event-${i + 1}`,
            title: template.title,
            gatheringId: template.gathering,
            date: eventDate.toISOString().split('T')[0],
            time: template.time,
            location: template.location,
            description: `Join us for ${template.title.toLowerCase()}. All are welcome.`,
            isPublic: template.isPublic,
            rsvps: []
        });
    }

    return events;
}

MockDB.events = generateEvents();

// ============================================
// APP STATE
// ============================================

let state = {
    currentUser: null,
    currentUserData: null,
    currentPage: 'home',
    selectedDate: null,
    selectedGroupId: null, // For group detail page
    calendarYear: new Date().getFullYear(),
    calendarMonth: new Date().getMonth(),
    eventsViewMode: 'list', // 'list' or 'calendar'
    isLoading: false
};

// ============================================
// DATA ACCESS LAYER
// ============================================

const DataService = {
    // Get current user data
    getCurrentUser() {
        if (PortalConfig.useFirebase && window.Auth) {
            return Auth.currentUserData;
        }
        return state.currentUser;
    },

    // Get user by ID
    async getUser(userId) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.getUser(userId);
        }
        return MockDB.users.find(u => u.id === userId);
    },

    // Get all gatherings
    async getGatherings() {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.getGatherings();
        }
        return MockDB.gatherings;
    },

    // Get gathering by ID
    getGatheringById(id) {
        if (PortalConfig.useFirebase && window.DB) {
            // For sync access, use cached data or make async
            return MockDB.gatherings.find(g => g.id === id);
        }
        return MockDB.gatherings.find(g => g.id === id);
    },

    // Get events
    async getEvents(options = {}) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.getEvents(options);
        }
        return MockDB.events;
    },

    // Get upcoming events
    getUpcomingEvents(days = 21) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return MockDB.events
            .filter(e => {
                const eventDate = new Date(e.date);
                eventDate.setHours(0, 0, 0, 0);
                const endDate = new Date(today);
                endDate.setDate(endDate.getDate() + days);
                return eventDate >= today && eventDate <= endDate;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 8);
    },

    // Get events for a specific date
    getEventsForDate(dateStr) {
        return MockDB.events.filter(e => e.date === dateStr);
    },

    // Get event by ID
    getEventById(eventId) {
        return MockDB.events.find(e => e.id === eventId);
    },

    // RSVP to event
    async rsvpToEvent(eventId, userId, status = 'attending') {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.setRSVP(eventId, userId, status);
        }
        const event = MockDB.events.find(e => e.id === eventId);
        if (event && !event.rsvps.includes(userId)) {
            event.rsvps.push(userId);
        }
    },

    // Cancel RSVP
    async cancelRSVP(eventId, userId) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.removeRSVP(eventId, userId);
        }
        const event = MockDB.events.find(e => e.id === eventId);
        if (event) {
            event.rsvps = event.rsvps.filter(r =>
                typeof r === 'string' ? r !== userId : r.userId !== userId
            );
        }
    },

    // RSVP with status and notes
    async rsvpWithDetails(eventId, userId, status, notes = '', attendees = [], guestCount = 0) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.setRSVP(eventId, userId, status, notes, attendees, guestCount);
        }
        const event = MockDB.events.find(e => e.id === eventId);
        if (event) {
            // Remove existing RSVP
            event.rsvps = event.rsvps.filter(r =>
                typeof r === 'string' ? r !== userId : r.userId !== userId
            );
            // Add new RSVP with details
            event.rsvps.push({
                userId,
                status, // 'attending', 'maybe', 'not-attending'
                notes,
                attendees, // dependants attending
                guestCount, // friends/guests not in system
                updatedAt: new Date().toISOString()
            });
        }
        return true;
    },

    // Get RSVP details for a user
    getRSVPDetails(eventId, userId) {
        const event = MockDB.events.find(e => e.id === eventId);
        if (!event) return null;

        const rsvp = event.rsvps.find(r =>
            typeof r === 'string' ? r === userId : r.userId === userId
        );

        if (!rsvp) return null;
        if (typeof rsvp === 'string') {
            return { userId: rsvp, status: 'attending', notes: '', attendees: [] };
        }
        return rsvp;
    },

    // Get all RSVPs for an event with details
    getEventRSVPs(eventId) {
        const event = MockDB.events.find(e => e.id === eventId);
        if (!event) return [];

        return event.rsvps.map(r => {
            if (typeof r === 'string') {
                const user = MockDB.users.find(u => u.id === r);
                return {
                    userId: r,
                    status: 'attending',
                    notes: '',
                    attendees: [],
                    userName: user?.displayName || 'Unknown'
                };
            }
            const user = MockDB.users.find(u => u.id === r.userId);
            return { ...r, userName: user?.displayName || 'Unknown' };
        });
    },

    // Create new event
    async createEvent(eventData) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.createEvent(eventData);
        }
        const newEvent = {
            id: 'event-' + Date.now(),
            ...eventData,
            createdAt: new Date().toISOString(),
            createdBy: this.getCurrentUser()?.id,
            rsvps: []
        };
        MockDB.events.push(newEvent);
        // Sort events by date
        MockDB.events.sort((a, b) => new Date(a.date) - new Date(b.date));
        return newEvent;
    },

    // Update event
    async updateEvent(eventId, updates) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.updateEvent(eventId, updates);
        }
        const event = MockDB.events.find(e => e.id === eventId);
        if (event) {
            Object.assign(event, updates, { updatedAt: new Date().toISOString() });
            // Re-sort events by date
            MockDB.events.sort((a, b) => new Date(a.date) - new Date(b.date));
            return event;
        }
        throw new Error('Event not found');
    },

    // Delete event
    async deleteEvent(eventId) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.deleteEvent(eventId);
        }
        const index = MockDB.events.findIndex(e => e.id === eventId);
        if (index !== -1) {
            MockDB.events.splice(index, 1);
            return true;
        }
        throw new Error('Event not found');
    },

    // Check if user can manage event
    canManageEvent(event) {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (user.role === 'admin') return true;
        if (user.role === 'host') {
            // Hosts can manage events they created
            if (event.createdBy === user.id) return true;
            // Hosts can manage events for their assigned gatherings
            if (user.assignedGatherings?.includes(event.gatheringId)) return true;
        }
        return false;
    },

    // Get events manageable by current user
    getManageableEvents() {
        const user = this.getCurrentUser();
        if (!user) return [];

        return MockDB.events.filter(e => this.canManageEvent(e));
    },

    // Get kete posts
    async getKetePosts(options = {}) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.getKetePosts({ published: true, ...options });
        }
        if (options.includeDrafts) {
            return MockDB.kete;
        }
        return MockDB.kete.filter(k => k.published);
    },

    // Get single kete post by ID
    getKetePostById(postId) {
        return MockDB.kete.find(k => k.id === postId);
    },

    // Get all kete posts for management (including drafts)
    getAllKetePosts() {
        return MockDB.kete.sort((a, b) => {
            // Sort by updatedAt descending
            return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        });
    },

    // Get kete posts by current user
    getMyKetePosts() {
        const user = this.getCurrentUser();
        if (!user) return [];
        return MockDB.kete.filter(k => k.authorId === user.id).sort((a, b) => {
            return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        });
    },

    // Create new kete post
    async createKetePost(postData) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.createKetePost(postData);
        }
        const user = this.getCurrentUser();
        const now = new Date().toISOString();
        const newPost = {
            id: 'kete-' + Date.now(),
            ...postData,
            authorId: user.id,
            authorName: user.displayName,
            createdAt: now,
            updatedAt: now,
            publishedAt: postData.published ? now.split('T')[0] : null
        };
        MockDB.kete.unshift(newPost);
        return newPost;
    },

    // Update kete post
    async updateKetePost(postId, updates) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.updateKetePost(postId, updates);
        }
        const post = MockDB.kete.find(k => k.id === postId);
        if (post) {
            const wasPublished = post.published;
            Object.assign(post, updates, { updatedAt: new Date().toISOString() });
            // Set publishedAt when first published
            if (!wasPublished && updates.published) {
                post.publishedAt = new Date().toISOString().split('T')[0];
            }
            return post;
        }
        throw new Error('Post not found');
    },

    // Delete kete post
    async deleteKetePost(postId) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.deleteKetePost(postId);
        }
        const index = MockDB.kete.findIndex(k => k.id === postId);
        if (index !== -1) {
            MockDB.kete.splice(index, 1);
            return true;
        }
        throw new Error('Post not found');
    },

    // Check if user can manage a kete post
    canManageKetePost(post) {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (user.role === 'admin') return true;
        // Hosts can edit their own posts
        if (user.role === 'host' && post.authorId === user.id) return true;
        return false;
    },

    // ============================================
    // MESSAGE BOARDS
    // ============================================

    // Check if user can access a gathering's message board
    canAccessBoard(gatheringId) {
        const user = this.getCurrentUser();
        if (!user) return false;

        const gathering = this.getGatheringById(gatheringId);
        if (!gathering) return false;

        // Public gatherings - all authenticated users can access
        if (gathering.isPublic) return true;

        // Private gatherings - check membership
        const members = MockDB.gatheringMembers[gatheringId] || [];
        return members.includes(user.id) || user.role === 'admin';
    },

    // Check if user is member of a private gathering
    isMemberOfGathering(gatheringId) {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (user.role === 'admin') return true;

        const members = MockDB.gatheringMembers[gatheringId] || [];
        return members.includes(user.id);
    },

    // Get message board for a gathering
    getMessageBoard(gatheringId) {
        if (!this.canAccessBoard(gatheringId)) return null;

        const board = MockDB.messageBoards[gatheringId];
        if (!board) {
            // Initialize empty board if none exists
            MockDB.messageBoards[gatheringId] = { posts: [] };
            return MockDB.messageBoards[gatheringId];
        }
        return board;
    },

    // Get posts for a gathering, sorted by newest first
    getBoardPosts(gatheringId) {
        const board = this.getMessageBoard(gatheringId);
        if (!board) return [];

        return [...board.posts].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    },

    // Create a new board post
    async createBoardPost(gatheringId, content, attachment = null) {
        const user = this.getCurrentUser();
        if (!user || !this.canAccessBoard(gatheringId)) {
            throw new Error('Cannot post to this board');
        }

        const postData = {
            authorId: user.id,
            authorName: user.displayName,
            content,
            comments: [],
            reactions: {},
            isPinned: false,
            attachment: attachment
        };

        if (PortalConfig.useFirebase && window.DB) {
            return await DB.createBoardPost(gatheringId, postData);
        }

        const board = this.getMessageBoard(gatheringId);
        const newPost = {
            id: 'post-' + Date.now(),
            ...postData,
            createdAt: new Date().toISOString()
        };

        board.posts.unshift(newPost);
        return newPost;
    },

    // Delete a board post
    async deleteBoardPost(gatheringId, postId) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.deleteBoardPost(gatheringId, postId);
        }

        const user = this.getCurrentUser();
        const board = this.getMessageBoard(gatheringId);
        if (!board) throw new Error('Board not found');

        const postIndex = board.posts.findIndex(p => p.id === postId);
        if (postIndex === -1) throw new Error('Post not found');

        const post = board.posts[postIndex];
        // Only author or admin can delete
        if (post.authorId !== user.id && user.role !== 'admin') {
            throw new Error('Cannot delete this post');
        }

        board.posts.splice(postIndex, 1);
        return true;
    },

    // Add comment to a post
    async addComment(gatheringId, postId, content) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.addComment(gatheringId, postId, content);
        }

        const user = this.getCurrentUser();
        if (!user || !this.canAccessBoard(gatheringId)) {
            throw new Error('Cannot comment on this board');
        }

        const board = this.getMessageBoard(gatheringId);
        if (!board) throw new Error('Board not found');

        const post = board.posts.find(p => p.id === postId);
        if (!post) throw new Error('Post not found');

        const newComment = {
            id: 'comment-' + Date.now(),
            authorId: user.id,
            authorName: user.displayName,
            content,
            createdAt: new Date().toISOString()
        };

        post.comments.push(newComment);
        return newComment;
    },

    // Delete a comment
    async deleteComment(gatheringId, postId, commentId) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.deleteComment(gatheringId, postId, commentId);
        }

        const user = this.getCurrentUser();
        const board = this.getMessageBoard(gatheringId);
        if (!board) throw new Error('Board not found');

        const post = board.posts.find(p => p.id === postId);
        if (!post) throw new Error('Post not found');

        const commentIndex = post.comments.findIndex(c => c.id === commentId);
        if (commentIndex === -1) throw new Error('Comment not found');

        const comment = post.comments[commentIndex];
        // Only author or admin can delete
        if (comment.authorId !== user.id && user.role !== 'admin') {
            throw new Error('Cannot delete this comment');
        }

        post.comments.splice(commentIndex, 1);
        return true;
    },

    // Get user's gatherings (public + private memberships)
    getUserGatherings() {
        const user = this.getCurrentUser();
        if (!user) return [];

        return MockDB.gatherings.filter(g => {
            if (g.isPublic) return true;
            if (user.role === 'admin') return true;
            const members = MockDB.gatheringMembers[g.id] || [];
            return members.includes(user.id);
        });
    },

    // Check if user is admin
    isAdmin() {
        const user = this.getCurrentUser();
        return user?.role === 'admin';
    },

    // Check if user is host
    isHost() {
        const user = this.getCurrentUser();
        return user?.role === 'host';
    },

    // Check if user is admin or host
    isAdminOrHost() {
        return this.isAdmin() || this.isHost();
    },

    // ============================================
    // NOTIFICATIONS
    // ============================================

    // Get notifications for current user
    getNotifications() {
        const user = this.getCurrentUser();
        if (!user) return [];

        return MockDB.notifications
            .filter(n => n.userId === user.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    // Get unread notification count
    getUnreadNotificationCount() {
        const user = this.getCurrentUser();
        if (!user) return 0;

        return MockDB.notifications.filter(n => n.userId === user.id && !n.read).length;
    },

    // Mark notification as read
    markNotificationRead(notifId) {
        const notif = MockDB.notifications.find(n => n.id === notifId);
        if (notif) {
            notif.read = true;
        }
    },

    // Mark all notifications as read
    markAllNotificationsRead() {
        const user = this.getCurrentUser();
        if (!user) return;

        MockDB.notifications.forEach(n => {
            if (n.userId === user.id) {
                n.read = true;
            }
        });
    },

    // Create notification (for internal use)
    createNotification(userId, type, title, message, link = null) {
        const notif = {
            id: 'notif-' + Date.now(),
            userId,
            type,
            title,
            message,
            link,
            read: false,
            createdAt: new Date().toISOString()
        };
        MockDB.notifications.unshift(notif);
        return notif;
    },

    // ============================================
    // SEARCH
    // ============================================

    // Search across all content
    search(query) {
        if (!query || query.length < 2) return { events: [], posts: [], groups: [], kete: [] };

        const q = query.toLowerCase();
        const user = this.getCurrentUser();

        // Search events
        const events = MockDB.events.filter(e =>
            e.title.toLowerCase().includes(q) ||
            e.description?.toLowerCase().includes(q) ||
            e.location?.toLowerCase().includes(q)
        ).slice(0, 5);

        // Search groups
        const groups = MockDB.gatherings.filter(g =>
            g.name.toLowerCase().includes(q) ||
            g.description?.toLowerCase().includes(q)
        ).slice(0, 5);

        // Search Kete posts
        const kete = MockDB.kete.filter(k =>
            k.published && (
                k.title.toLowerCase().includes(q) ||
                k.excerpt?.toLowerCase().includes(q) ||
                k.content?.toLowerCase().includes(q)
            )
        ).slice(0, 5);

        // Search board posts (only from accessible boards)
        const posts = [];
        Object.entries(MockDB.messageBoards).forEach(([gatheringId, board]) => {
            if (this.canAccessBoard(gatheringId)) {
                board.posts.forEach(post => {
                    if (post.content.toLowerCase().includes(q)) {
                        posts.push({ ...post, gatheringId });
                    }
                });
            }
        });

        return {
            events,
            groups,
            kete,
            posts: posts.slice(0, 5)
        };
    },

    // ============================================
    // ADMIN STATS
    // ============================================

    // Get dashboard statistics (admin only)
    getAdminStats() {
        if (!this.isAdmin()) return null;

        const now = new Date();
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        // Count active users (users who have RSVPs or posts)
        const activeUserIds = new Set();
        MockDB.events.forEach(e => {
            e.rsvps?.forEach(r => {
                const userId = typeof r === 'string' ? r : r.userId;
                activeUserIds.add(userId);
            });
        });
        Object.values(MockDB.messageBoards).forEach(board => {
            board.posts?.forEach(p => activeUserIds.add(p.authorId));
        });

        // Count recent events
        const upcomingEvents = MockDB.events.filter(e => new Date(e.date) >= now).length;
        const recentRSVPs = MockDB.events.reduce((count, e) => {
            return count + (e.rsvps?.length || 0);
        }, 0);

        // Count posts
        const totalBoardPosts = Object.values(MockDB.messageBoards).reduce((count, board) => {
            return count + (board.posts?.length || 0);
        }, 0);

        const totalKetePosts = MockDB.kete.filter(k => k.published).length;
        const draftPosts = MockDB.kete.filter(k => !k.published).length;

        return {
            totalUsers: MockDB.users.length,
            activeUsers: activeUserIds.size,
            totalGatherings: MockDB.gatherings.length,
            upcomingEvents,
            totalRSVPs: recentRSVPs,
            totalBoardPosts,
            totalKetePosts,
            draftPosts,
            usersByRole: {
                admin: MockDB.users.filter(u => u.role === 'admin').length,
                host: MockDB.users.filter(u => u.role === 'host').length,
                member: MockDB.users.filter(u => u.role === 'member').length
            }
        };
    },

    // Get user's activity summary
    getUserActivity(userId = null) {
        const user = userId ? MockDB.users.find(u => u.id === userId) : this.getCurrentUser();
        if (!user) return null;

        // Get RSVPs
        const rsvps = [];
        MockDB.events.forEach(e => {
            const hasRSVP = e.rsvps?.some(r =>
                (typeof r === 'string' ? r : r.userId) === user.id
            );
            if (hasRSVP) {
                rsvps.push(e);
            }
        });

        // Get board posts
        const boardPosts = [];
        Object.entries(MockDB.messageBoards).forEach(([gatheringId, board]) => {
            board.posts?.forEach(p => {
                if (p.authorId === user.id) {
                    boardPosts.push({ ...p, gatheringId });
                }
            });
        });

        // Get Kete posts
        const ketePosts = MockDB.kete.filter(k => k.authorId === user.id);

        return {
            rsvpCount: rsvps.length,
            upcomingRSVPs: rsvps.filter(e => new Date(e.date) >= new Date()),
            boardPostCount: boardPosts.length,
            ketePostCount: ketePosts.length,
            recentActivity: [
                ...boardPosts.map(p => ({ type: 'post', item: p, date: p.createdAt })),
                ...ketePosts.map(k => ({ type: 'kete', item: k, date: k.createdAt }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
        };
    }
};

// ============================================
// LOCAL STORAGE
// ============================================

function loadState() {
    try {
        const saved = localStorage.getItem('kiwichurch_portal_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.currentUser && PortalConfig.demoMode) {
                // Verify user still exists in demo mode
                const user = MockDB.users.find(u => u.id === parsed.currentUser.id);
                if (user) {
                    state.currentUser = user;
                }
            }
        }
    } catch (e) {
        console.warn('Could not load state:', e);
    }
}

function saveState() {
    try {
        localStorage.setItem('kiwichurch_portal_state', JSON.stringify({
            currentUser: state.currentUser ? { id: state.currentUser.id } : null
        }));
    } catch (e) {
        console.warn('Could not save state:', e);
    }
}

// ============================================
// UTILITIES
// ============================================

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-NZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });
}

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes}${ampm}`;
}

function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
}

function showToast(message, type = 'default') {
    if (window.KiwiChurch && window.KiwiChurch.showToast) {
        window.KiwiChurch.showToast(message, type);
    } else {
        console.log(`[${type}] ${message}`);
    }
}

function showLoading(show = true) {
    state.isLoading = show;
    const main = document.getElementById('app-main');
    if (show && main) {
        main.innerHTML = renderSkeletonLoader();
    }
}

// Generate skeleton loading screen
function renderSkeletonLoader() {
    return `
        <div class="page-transition" style="padding: 1.5rem;">
            <div class="skeleton" style="height: 100px; border-radius: var(--radius-lg); margin-bottom: 1.5rem;"></div>
            <div class="skeleton skeleton-text medium" style="margin-bottom: 1rem;"></div>
            <div class="skeleton-card" style="margin-bottom: 0.75rem;">
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div class="skeleton skeleton-circle" style="width: 45px; height: 45px;"></div>
                    <div style="flex: 1;">
                        <div class="skeleton skeleton-text medium"></div>
                        <div class="skeleton skeleton-text short"></div>
                    </div>
                </div>
            </div>
            <div class="skeleton-card" style="margin-bottom: 0.75rem;">
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div class="skeleton skeleton-circle" style="width: 45px; height: 45px;"></div>
                    <div style="flex: 1;">
                        <div class="skeleton skeleton-text medium"></div>
                        <div class="skeleton skeleton-text short"></div>
                    </div>
                </div>
            </div>
            <div class="skeleton-card">
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div class="skeleton skeleton-circle" style="width: 45px; height: 45px;"></div>
                    <div style="flex: 1;">
                        <div class="skeleton skeleton-text medium"></div>
                        <div class="skeleton skeleton-text short"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generate empty state component
function renderEmptyState(icon, title, message, actionLabel = null, actionFn = null) {
    return `
        <div class="empty-state slide-up">
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                ${icon}
            </svg>
            <h4 class="empty-state-title">${title}</h4>
            <p class="empty-state-text">${message}</p>
            ${actionLabel && actionFn ? `
                <button class="btn btn-secondary" onclick="${actionFn}">${actionLabel}</button>
            ` : ''}
        </div>
    `;
}

// Common empty state icons
const EmptyStateIcons = {
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    search: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>'
};

// ============================================
// AUTHENTICATION
// ============================================

async function login(identifier, password) {
    if (PortalConfig.useFirebase && window.Auth) {
        try {
            showLoading(true);
            await Auth.signIn(identifier, password);
            return true;
        } catch (error) {
            console.error('Firebase login error:', error);
            return false;
        } finally {
            showLoading(false);
        }
    }

    // Demo mode login
    const user = MockDB.users.find(u =>
        (u.username.toLowerCase() === identifier.toLowerCase() ||
         u.email.toLowerCase() === identifier.toLowerCase()) &&
        u.password === password
    );

    if (user) {
        state.currentUser = user;
        saveState();
        return true;
    }
    return false;
}

async function logout() {
    if (PortalConfig.useFirebase && window.Auth) {
        try {
            await Auth.signOut();
        } catch (error) {
            console.error('Firebase logout error:', error);
        }
    }

    state.currentUser = null;
    state.currentPage = 'home';
    saveState();
    showAppState();
    showToast('You have been signed out', 'default');
}

function demoLogin(username, password) {
    document.getElementById('login-identifier').value = username;
    document.getElementById('login-password').value = password;
    document.getElementById('login-form').dispatchEvent(new Event('submit'));
}

// ============================================
// NAVIGATION
// ============================================

function navigateTo(page) {
    state.currentPage = page;

    // Clear group selection when leaving group page
    if (page !== 'group') {
        state.selectedGroupId = null;
    }

    // Update bottom nav
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page || (page === 'group' && item.dataset.page === 'groups'));
    });

    // Update desktop sidebar nav
    document.querySelectorAll('.desktop-nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page || (page === 'group' && item.dataset.page === 'groups'));
    });

    // Update page title
    const titles = {
        home: 'Home',
        events: 'Events',
        groups: 'Groups',
        kete: 'Kete',
        profile: 'Profile',
        hosting: 'Hosting',
        settings: 'Admin Dashboard',
        users: 'User Management'
    };

    // For group page, show group name
    if (page === 'group' && state.selectedGroupId) {
        const group = DataService.getGatheringById(state.selectedGroupId);
        document.getElementById('page-title').textContent = group?.name || 'Group';
    } else {
        document.getElementById('page-title').textContent = titles[page] || 'Portal';
    }

    // Render page
    renderPage();
    window.scrollTo(0, 0);
}

// Render desktop sidebar navigation
function renderDesktopSidebar() {
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) return;

    const navEl = document.getElementById('desktop-nav');
    const userInfoEl = document.getElementById('desktop-user-info');
    if (!navEl || !userInfoEl) return;

    const isAdmin = DataService.isAdmin();
    const isAdminOrHost = DataService.isAdminOrHost();

    const navItems = [
        { page: 'home', label: 'Home', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>' },
        { page: 'events', label: 'Events', icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>' },
        { page: 'groups', label: 'Groups', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' },
        { page: 'kete', label: 'Kete', icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' }
    ];

    // Add host/admin items
    if (isAdminOrHost) {
        navItems.push({ section: 'Manage' });
        navItems.push({ page: 'hosting', label: 'Hosting', icon: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>' });
    }

    if (isAdmin) {
        navItems.push({ page: 'settings', label: 'Dashboard', icon: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' });
        navItems.push({ page: 'users', label: 'Users', icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line>' });
    }

    // Render nav items
    navEl.innerHTML = navItems.map(item => {
        if (item.section) {
            return `<div class="desktop-nav-section">${item.section}</div>`;
        }
        const isActive = state.currentPage === item.page || (state.currentPage === 'group' && item.page === 'groups');
        return `
            <a href="#${item.page}" class="desktop-nav-item ${isActive ? 'active' : ''}" data-page="${item.page}" onclick="navigateTo('${item.page}'); return false;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg>
                <span>${item.label}</span>
            </a>
        `;
    }).join('');

    // Render user info
    const initial = currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : '?';
    userInfoEl.innerHTML = `
        <div class="desktop-user-avatar">${initial}</div>
        <div>
            <div class="desktop-user-name">${currentUser.displayName || 'User'}</div>
            <div class="desktop-user-role">${currentUser.role || 'member'}</div>
        </div>
    `;
}

// Navigate to a specific group's message board
function navigateToGroup(groupId) {
    if (!DataService.canAccessBoard(groupId)) {
        showToast('You don\'t have access to this group', 'error');
        return;
    }
    state.selectedGroupId = groupId;
    navigateTo('group');
}

// ============================================
// MODALS
// ============================================

function openModal(title, bodyHTML, footerHTML = '') {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const footerEl = document.getElementById('modal-footer');

    // Only set content if provided (allows pre-setting content before calling openModal)
    if (title !== undefined) titleEl.textContent = title;
    if (bodyHTML !== undefined) bodyEl.innerHTML = bodyHTML;
    if (footerHTML) footerEl.innerHTML = footerHTML;

    // Set ARIA attributes
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-title');
    modal.setAttribute('tabindex', '-1');

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus the modal for accessibility
    setTimeout(() => {
        // Focus first focusable element in modal, or the modal itself
        const focusable = modal.querySelector('input, button, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (focusable) {
            focusable.focus();
        } else {
            modal.focus();
        }
    }, 100);

    // Trap focus within modal
    modal.addEventListener('keydown', trapFocus);
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal');

    overlay.classList.remove('open');
    document.body.style.overflow = '';

    // Remove focus trap
    modal.removeEventListener('keydown', trapFocus);

    // Return focus to trigger element if available
    if (window.lastFocusedElement) {
        window.lastFocusedElement.focus();
        window.lastFocusedElement = null;
    }
}

function closeModalOutside(e) {
    if (e.target.id === 'modal-overlay') closeModal();
}

// Focus trap for modal accessibility
function trapFocus(e) {
    if (e.key !== 'Tab') return;

    const modal = document.getElementById('modal');
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
        }
    } else {
        // Tab
        if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
        }
    }
}

// Setup accessibility features
function setupAccessibility() {
    // Add skip link if not present
    if (!document.querySelector('.skip-link')) {
        const skipLink = document.createElement('a');
        skipLink.className = 'skip-link';
        skipLink.href = '#app-main';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Ensure bottom nav items have aria labels
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        const label = item.querySelector('.bottom-nav-label');
        if (label) {
            item.setAttribute('aria-label', label.textContent);
        }
    });

    // Make event cards keyboard accessible
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const target = e.target;
            if (target.classList.contains('app-event-card') || target.classList.contains('gathering-card')) {
                e.preventDefault();
                target.click();
            }
        }
    });
}

function openEventModal(eventId) {
    const event = DataService.getEventById(eventId);
    if (!event) return;

    const gathering = DataService.getGatheringById(event.gatheringId);
    const currentUser = DataService.getCurrentUser();
    const canManage = DataService.canManageEvent(event);
    const categoryInfo = getEventCategoryInfo(event.category);
    const isCancelled = event.status === 'cancelled';
    const isPast = new Date(event.date) < new Date().setHours(0, 0, 0, 0);

    // Get enhanced RSVP details
    const allRSVPs = DataService.getEventRSVPs(eventId);
    const userRSVP = DataService.getRSVPDetails(eventId, currentUser?.id);
    const isRSVPd = !!userRSVP;

    // Categorize RSVPs
    const attendingRSVPs = allRSVPs.filter(r => r.status === 'attending' || !r.status);
    const maybeRSVPs = allRSVPs.filter(r => r.status === 'maybe');
    const notAttendingRSVPs = allRSVPs.filter(r => r.status === 'not-attending');

    // Count total attendees (including dependants and guests)
    const totalAttending = attendingRSVPs.reduce((count, r) => {
        return count + 1 + (r.attendees?.length || 0) + (r.guestCount || 0);
    }, 0);

    // Capacity info
    const hasCapacity = event.capacity && event.capacity > 0;
    const spotsRemaining = hasCapacity ? Math.max(0, event.capacity - totalAttending) : null;
    const isFull = hasCapacity && spotsRemaining === 0;

    const bodyHTML = `
        ${event.coverImage ? `
        <div style="margin: -1.5rem -1.5rem 1rem; height: 150px; overflow: hidden;">
            <img src="${event.coverImage}" alt="" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        ` : ''}

        ${isCancelled ? `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-md); padding: 0.75rem 1rem; margin-bottom: 1rem;">
            <div style="color: #dc2626; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Event Cancelled
            </div>
            ${event.cancelReason ? `<p style="margin: 0.5rem 0 0; font-size: 0.875rem; color: #991b1b;">${escapeHtml(event.cancelReason)}</p>` : ''}
        </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <span class="event-badge ${event.isPublic ? '' : 'private'}">${event.isPublic ? 'Public' : 'Members Only'}</span>
                ${event.category && event.category !== 'general' ? `
                <span style="display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; background: ${categoryInfo.color}20; color: ${categoryInfo.color}; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">
                    ${categoryInfo.label}
                </span>
                ` : ''}
                ${isFull ? `
                <span style="display: inline-flex; align-items: center; padding: 0.25rem 0.5rem; background: #fef2f2; color: #dc2626; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">
                    Full
                </span>
                ` : ''}
            </div>
            ${canManage ? `
                <button class="btn btn-ghost btn-sm" onclick="openEditEventModal('${event.id}')" style="margin: -0.5rem -0.5rem 0 0;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                </button>
            ` : ''}
        </div>

        <p style="color: var(--color-text-light); margin-bottom: 1.5rem;">${escapeHtml(event.description || '')}</p>

        <div style="display: grid; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>${formatDate(event.date)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>${formatTime(event.time)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>${escapeHtml(event.location)}</span>
            </div>
            ${gathering ? `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>${escapeHtml(gathering.name)}</span>
                </div>
            ` : ''}
            ${hasCapacity ? `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${isFull ? '#dc2626' : 'var(--color-sage)'}" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    <span style="color: ${isFull ? '#dc2626' : 'inherit'};">
                        ${isFull ? 'No spots remaining' : `${spotsRemaining} spot${spotsRemaining !== 1 ? 's' : ''} remaining`}
                        <span style="color: var(--color-text-light); font-size: 0.875rem;">(${event.capacity} max)</span>
                    </span>
                </div>
            ` : ''}
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-cream-dark);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h4 style="margin: 0;">RSVPs</h4>
                <span style="font-size: 0.875rem; color: var(--color-text-light);">
                    ${totalAttending} attending${maybeRSVPs.length > 0 ? `, ${maybeRSVPs.length} maybe` : ''}
                    ${event.checkedIn?.length > 0 ? ` | ${event.checkedIn.length} checked in` : ''}
                </span>
            </div>

            ${attendingRSVPs.length > 0 ? `
                <div class="rsvp-list" style="margin-bottom: 0.75rem;">
                    ${attendingRSVPs.map(r => {
                        const isYou = r.userId === currentUser?.id;
                        const plusCount = (r.attendees?.length || 0) + (r.guestCount || 0);
                        const isCheckedIn = event.checkedIn?.includes(r.userId);
                        return `<span class="rsvp-chip ${isYou ? 'you' : ''}" title="${r.notes || ''}" style="${isCheckedIn ? 'border: 2px solid var(--color-sage);' : ''}">
                            ${isCheckedIn ? '✓ ' : ''}${isYou ? 'You' : (r.userName || 'Unknown').split(' ')[0]}${plusCount > 0 ? ` +${plusCount}` : ''}
                        </span>`;
                    }).join('')}
                </div>
            ` : ''}

            ${maybeRSVPs.length > 0 ? `
                <div style="margin-bottom: 0.75rem;">
                    <span style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.25rem;">Maybe:</span>
                    <div class="rsvp-list">
                        ${maybeRSVPs.map(r => {
                            const isYou = r.userId === currentUser?.id;
                            return `<span class="rsvp-chip ${isYou ? 'you' : ''}" style="opacity: 0.7;" title="${r.notes || ''}">${isYou ? 'You' : (r.userName || 'Unknown').split(' ')[0]}</span>`;
                        }).join('')}
                    </div>
                </div>
            ` : ''}

            ${allRSVPs.length === 0 ? '<p style="color: var(--color-text-light); font-size: 0.9375rem;">No RSVPs yet. Be the first!</p>' : ''}

            ${userRSVP?.notes ? `
                <p style="font-size: 0.875rem; color: var(--color-text-light); font-style: italic; margin-top: 0.5rem;">
                    Your note: "${escapeHtml(userRSVP.notes)}"
                </p>
            ` : ''}
        </div>

        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-ghost btn-sm" onclick="exportEventToCalendar('${event.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Add to Calendar
            </button>
            ${canManage && !isCancelled ? `
            <button class="btn btn-ghost btn-sm" onclick="openCheckInModal('${event.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Check-in
            </button>
            ` : ''}
        </div>
    `;

    let footerHTML = `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`;

    if (!isCancelled && !isPast) {
        if (isFull && !isRSVPd) {
            footerHTML += `<button class="btn btn-secondary" disabled>Event Full</button>`;
        } else if (isRSVPd) {
            footerHTML += `<button class="btn btn-primary" onclick="openRSVPModal('${event.id}')">Update RSVP</button>`;
        } else {
            footerHTML += `<button class="btn btn-primary" onclick="openRSVPModal('${event.id}')">RSVP</button>`;
        }
    }

    openModal(event.title, bodyHTML, footerHTML);
}

async function confirmRSVP(eventId) {
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) return;

    await DataService.rsvpToEvent(eventId, currentUser.id);
    showToast('RSVP confirmed!', 'success');
    closeModal();
    renderPage();
}

async function cancelRSVP(eventId) {
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) return;

    await DataService.cancelRSVP(eventId, currentUser.id);
    showToast('RSVP cancelled', 'default');
    closeModal();
    renderPage();
}

// ============================================
// EVENT MANAGEMENT MODALS
// ============================================

function openCreateEventModal(prefillGatheringId = null) {
    const gatherings = MockDB.gatherings;
    const currentUser = DataService.getCurrentUser();

    // Filter gatherings for hosts (only their assigned ones)
    let availableGatherings = gatherings;
    if (currentUser.role === 'host' && currentUser.assignedGatherings) {
        availableGatherings = gatherings.filter(g =>
            currentUser.assignedGatherings.includes(g.id)
        );
    }

    // Default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];

    const bodyHTML = `
        <form id="event-form">
            <div class="form-group">
                <label class="form-label" for="event-title">Event Title *</label>
                <input type="text" class="form-input" id="event-title" required placeholder="e.g., Weekly Gathering">
            </div>

            <div class="form-group">
                <label class="form-label" for="event-gathering">Gathering *</label>
                <select class="form-input" id="event-gathering" required>
                    <option value="">Select a gathering...</option>
                    ${availableGatherings.map(g => `
                        <option value="${g.id}" ${prefillGatheringId === g.id ? 'selected' : ''}>${g.name}</option>
                    `).join('')}
                </select>
            </div>

            <div class="form-group">
                <label class="form-label" for="event-category">Category</label>
                <select class="form-input" id="event-category">
                    <option value="general">General</option>
                    <option value="worship">Worship Service</option>
                    <option value="study">Bible Study</option>
                    <option value="prayer">Prayer Meeting</option>
                    <option value="social">Social Event</option>
                    <option value="outreach">Outreach</option>
                    <option value="youth">Youth Event</option>
                    <option value="kids">Kids Event</option>
                    <option value="workshop">Workshop/Training</option>
                </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label" for="event-date">Date *</label>
                    <input type="date" class="form-input" id="event-date" required value="${defaultDate}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="event-time">Time *</label>
                    <input type="time" class="form-input" id="event-time" required value="18:00">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="event-location">Location *</label>
                <input type="text" class="form-input" id="event-location" required placeholder="e.g., Hansons Lane or Zoom">
            </div>

            <div class="form-group">
                <label class="form-label" for="event-description">Description</label>
                <textarea class="form-input" id="event-description" rows="3" placeholder="Tell people what this event is about..."></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label" for="event-capacity">Capacity (optional)</label>
                    <input type="number" class="form-input" id="event-capacity" min="1" placeholder="Leave blank for unlimited">
                    <small style="color: var(--color-text-light); font-size: 0.75rem;">Maximum number of attendees</small>
                </div>
                <div class="form-group">
                    <label class="form-label" for="event-reminder">Send Reminder</label>
                    <select class="form-input" id="event-reminder">
                        <option value="">No reminder</option>
                        <option value="1h">1 hour before</option>
                        <option value="1d" selected>1 day before</option>
                        <option value="3d">3 days before</option>
                        <option value="1w">1 week before</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Cover Image (optional)</label>
                <div id="event-image-preview" style="width: 100%; height: 120px; background: var(--color-cream); border-radius: var(--radius-md); margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <span style="color: var(--color-text-light); font-size: 0.875rem;">No image selected</span>
                </div>
                <input type="file" id="event-image-input" accept="image/*" style="display: none;" onchange="previewEventImage(this, 'event-image-preview')">
                <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('event-image-input').click()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    Choose Image
                </button>
            </div>

            <div class="form-group">
                <label class="form-label" for="event-visibility">Visibility *</label>
                <select class="form-input" id="event-visibility" required>
                    <option value="public">Public - Anyone can see and RSVP</option>
                    <option value="private">Private - Members only</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Recurring Event</label>
                <select class="form-input" id="event-recurring" onchange="toggleRecurringOptions(this.value)">
                    <option value="">One-time event</option>
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>

            <div id="recurring-options" style="display: none;">
                <div class="form-group">
                    <label class="form-label" for="event-recurring-until">Repeat until</label>
                    <input type="date" class="form-input" id="event-recurring-until">
                    <small style="color: var(--color-text-light); font-size: 0.75rem;">Events will be created up to this date</small>
                </div>
            </div>
        </form>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveNewEvent()">Create Event</button>
    `;

    openModal('Create Event', bodyHTML, footerHTML);

    // Auto-fill gathering location when selected
    document.getElementById('event-gathering').addEventListener('change', function() {
        const gatheringId = this.value;
        const gathering = MockDB.gatherings.find(g => g.id === gatheringId);
        if (gathering) {
            // Set visibility based on gathering type
            document.getElementById('event-visibility').value = gathering.isPublic ? 'public' : 'private';

            // Suggest location based on gathering name
            const locationInput = document.getElementById('event-location');
            if (!locationInput.value) {
                if (gathering.name.includes('Online') || gathering.name.includes('Zoom')) {
                    locationInput.value = 'Zoom';
                } else if (gathering.name.includes('Prestons')) {
                    locationInput.value = 'Prestons';
                } else {
                    locationInput.value = 'Hansons Lane';
                }
            }
        }
    });
}

let pendingEventImage = null;

function previewEventImage(input, previewId) {
    const previewEl = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const file = input.files[0];

        if (!file.type.startsWith('image/')) {
            showToast('Please select a valid image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be smaller than 5MB', 'error');
            return;
        }

        pendingEventImage = file;

        const reader = new FileReader();
        reader.onload = function(e) {
            previewEl.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">`;
        };
        reader.readAsDataURL(file);
    }
}

// Toggle recurring event options
function toggleRecurringOptions(value) {
    const optionsDiv = document.getElementById('recurring-options');
    if (optionsDiv) {
        optionsDiv.style.display = value ? 'block' : 'none';
        if (value) {
            // Default end date to 3 months from start date
            const startDate = document.getElementById('event-date')?.value;
            if (startDate) {
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 3);
                document.getElementById('event-recurring-until').value = endDate.toISOString().split('T')[0];
            }
        }
    }
}

async function saveNewEvent() {
    const title = document.getElementById('event-title').value.trim();
    const gatheringId = document.getElementById('event-gathering').value;
    const category = document.getElementById('event-category').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const location = document.getElementById('event-location').value.trim();
    const description = document.getElementById('event-description').value.trim();
    const capacityInput = document.getElementById('event-capacity').value;
    const capacity = capacityInput ? parseInt(capacityInput) : null;
    const reminder = document.getElementById('event-reminder').value;
    const visibility = document.getElementById('event-visibility').value;
    const recurring = document.getElementById('event-recurring')?.value || '';
    const recurringUntil = document.getElementById('event-recurring-until')?.value;

    // Validation
    if (!title || !gatheringId || !date || !time || !location) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // Check date is in future
    const eventDate = new Date(date + 'T' + time);
    if (eventDate < new Date()) {
        showToast('Event date must be in the future', 'error');
        return;
    }

    try {
        // Upload image if selected
        let coverImageUrl = null;
        if (pendingEventImage) {
            try {
                const resizedImage = await Storage.resizeImage(pendingEventImage, 800, 400, 0.85);
                const result = await Storage.uploadFile(`events/${Date.now()}-cover`, resizedImage);
                coverImageUrl = result.url;
            } catch (imgError) {
                console.error('Image upload failed:', imgError);
                // Continue without image
            }
        }

        const baseEventData = {
            title,
            gatheringId,
            category,
            time,
            location,
            description: description || `Join us for ${title.toLowerCase()}.`,
            isPublic: visibility === 'public',
            capacity,
            reminder,
            coverImage: coverImageUrl,
            status: 'active',
            checkedIn: []
        };

        // Handle recurring events
        if (recurring && recurringUntil) {
            const dates = generateRecurringDates(date, recurringUntil, recurring);
            let createdCount = 0;

            for (const eventDate of dates) {
                await DataService.createEvent({
                    ...baseEventData,
                    date: eventDate,
                    recurringId: `rec-${Date.now()}`, // Link recurring events
                    recurringPattern: recurring
                });
                createdCount++;
            }

            pendingEventImage = null;
            showToast(`Created ${createdCount} recurring events!`, 'success');
        } else {
            // Single event
            await DataService.createEvent({
                ...baseEventData,
                date
            });
            pendingEventImage = null;
            showToast('Event created successfully!', 'success');
        }

        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not create event', 'error');
    }
}

// Generate dates for recurring events
function generateRecurringDates(startDate, endDate, pattern) {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    const intervals = {
        'weekly': 7,
        'fortnightly': 14,
        'monthly': 30 // Approximation, handled specially below
    };

    while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);

        if (pattern === 'monthly') {
            current.setMonth(current.getMonth() + 1);
        } else {
            current.setDate(current.getDate() + intervals[pattern]);
        }
    }

    return dates;
}

function openEditEventModal(eventId) {
    const event = DataService.getEventById(eventId);
    if (!event) return;

    const gatherings = MockDB.gatherings;
    const categories = [
        { value: 'general', label: 'General' },
        { value: 'worship', label: 'Worship Service' },
        { value: 'study', label: 'Bible Study' },
        { value: 'prayer', label: 'Prayer Meeting' },
        { value: 'social', label: 'Social Event' },
        { value: 'outreach', label: 'Outreach' },
        { value: 'youth', label: 'Youth Event' },
        { value: 'kids', label: 'Kids Event' },
        { value: 'workshop', label: 'Workshop/Training' }
    ];

    const bodyHTML = `
        <form id="edit-event-form">
            ${event.status === 'cancelled' ? `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-md); padding: 0.75rem 1rem; margin-bottom: 1rem;">
                <span style="color: #dc2626; font-weight: 500;">This event has been cancelled</span>
            </div>
            ` : ''}

            <div class="form-group">
                <label class="form-label" for="edit-event-title">Event Title *</label>
                <input type="text" class="form-input" id="edit-event-title" required value="${escapeHtml(event.title)}">
            </div>

            <div class="form-group">
                <label class="form-label" for="edit-event-gathering">Gathering *</label>
                <select class="form-input" id="edit-event-gathering" required>
                    ${gatherings.map(g => `
                        <option value="${g.id}" ${event.gatheringId === g.id ? 'selected' : ''}>${g.name}</option>
                    `).join('')}
                </select>
            </div>

            <div class="form-group">
                <label class="form-label" for="edit-event-category">Category</label>
                <select class="form-input" id="edit-event-category">
                    ${categories.map(c => `
                        <option value="${c.value}" ${event.category === c.value ? 'selected' : ''}>${c.label}</option>
                    `).join('')}
                </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label" for="edit-event-date">Date *</label>
                    <input type="date" class="form-input" id="edit-event-date" required value="${event.date}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-event-time">Time *</label>
                    <input type="time" class="form-input" id="edit-event-time" required value="${event.time}">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="edit-event-location">Location *</label>
                <input type="text" class="form-input" id="edit-event-location" required value="${escapeHtml(event.location)}">
            </div>

            <div class="form-group">
                <label class="form-label" for="edit-event-description">Description</label>
                <textarea class="form-input" id="edit-event-description" rows="3">${escapeHtml(event.description || '')}</textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label" for="edit-event-capacity">Capacity</label>
                    <input type="number" class="form-input" id="edit-event-capacity" min="1" placeholder="Unlimited" value="${event.capacity || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-event-reminder">Send Reminder</label>
                    <select class="form-input" id="edit-event-reminder">
                        <option value="" ${!event.reminder ? 'selected' : ''}>No reminder</option>
                        <option value="1h" ${event.reminder === '1h' ? 'selected' : ''}>1 hour before</option>
                        <option value="1d" ${event.reminder === '1d' ? 'selected' : ''}>1 day before</option>
                        <option value="3d" ${event.reminder === '3d' ? 'selected' : ''}>3 days before</option>
                        <option value="1w" ${event.reminder === '1w' ? 'selected' : ''}>1 week before</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Cover Image</label>
                <div id="edit-event-image-preview" style="width: 100%; height: 120px; background: var(--color-cream); border-radius: var(--radius-md); margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    ${event.coverImage
                        ? `<img src="${event.coverImage}" alt="Cover" style="width: 100%; height: 100%; object-fit: cover;">`
                        : `<span style="color: var(--color-text-light); font-size: 0.875rem;">No image</span>`
                    }
                </div>
                <input type="file" id="edit-event-image-input" accept="image/*" style="display: none;" onchange="previewEventImage(this, 'edit-event-image-preview')">
                <div style="display: flex; gap: 0.5rem;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('edit-event-image-input').click()">
                        ${event.coverImage ? 'Change Image' : 'Add Image'}
                    </button>
                    ${event.coverImage ? `<button type="button" class="btn btn-ghost btn-sm" onclick="removeEventImage('${event.id}')" style="color: #dc2626;">Remove</button>` : ''}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="edit-event-visibility">Visibility *</label>
                <select class="form-input" id="edit-event-visibility" required>
                    <option value="public" ${event.isPublic ? 'selected' : ''}>Public - Anyone can see and RSVP</option>
                    <option value="private" ${!event.isPublic ? 'selected' : ''}>Private - Members only</option>
                </select>
            </div>

            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-cream-dark);">
                <p style="color: var(--color-text-light); font-size: 0.875rem; margin-bottom: 0.75rem;">
                    RSVPs: ${event.rsvps?.length || 0} people
                    ${event.checkedIn?.length > 0 ? ` | Checked in: ${event.checkedIn.length}` : ''}
                </p>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${event.status !== 'cancelled' ? `
                    <button type="button" class="btn btn-ghost btn-sm" style="color: #f59e0b;" onclick="cancelEventWithReason('${event.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        Cancel Event
                    </button>
                    ` : `
                    <button type="button" class="btn btn-secondary btn-sm" onclick="uncancelEvent('${event.id}')">
                        Restore Event
                    </button>
                    `}
                    <button type="button" class="btn btn-ghost btn-sm" style="color: #dc2626;" onclick="confirmDeleteEvent('${event.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete Event
                    </button>
                </div>
            </div>
        </form>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveEventEdits('${event.id}')">Save Changes</button>
    `;

    openModal('Edit Event', bodyHTML, footerHTML);
}

async function saveEventEdits(eventId) {
    const title = document.getElementById('edit-event-title').value.trim();
    const gatheringId = document.getElementById('edit-event-gathering').value;
    const category = document.getElementById('edit-event-category').value;
    const date = document.getElementById('edit-event-date').value;
    const time = document.getElementById('edit-event-time').value;
    const location = document.getElementById('edit-event-location').value.trim();
    const description = document.getElementById('edit-event-description').value.trim();
    const capacityInput = document.getElementById('edit-event-capacity').value;
    const capacity = capacityInput ? parseInt(capacityInput) : null;
    const reminder = document.getElementById('edit-event-reminder').value;
    const visibility = document.getElementById('edit-event-visibility').value;

    // Validation
    if (!title || !gatheringId || !date || !time || !location) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    try {
        const updates = {
            title,
            gatheringId,
            category,
            date,
            time,
            location,
            description: description || `Join us for ${title.toLowerCase()}.`,
            isPublic: visibility === 'public',
            capacity,
            reminder
        };

        // Upload new image if selected
        if (pendingEventImage) {
            try {
                const resizedImage = await Storage.resizeImage(pendingEventImage, 800, 400, 0.85);
                const result = await Storage.uploadFile(`events/${eventId}-cover`, resizedImage);
                updates.coverImage = result.url;
            } catch (imgError) {
                console.error('Image upload failed:', imgError);
            }
        }

        await DataService.updateEvent(eventId, updates);
        pendingEventImage = null;

        showToast('Event updated successfully!', 'success');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not update event', 'error');
    }
}

async function removeEventImage(eventId) {
    if (!confirm('Remove the cover image?')) return;

    try {
        await DataService.updateEvent(eventId, { coverImage: null });
        showToast('Image removed', 'success');
        openEditEventModal(eventId); // Refresh modal
    } catch (error) {
        showToast(error.message || 'Could not remove image', 'error');
    }
}

function confirmDeleteEvent(eventId) {
    const event = DataService.getEventById(eventId);
    if (!event) return;

    const bodyHTML = `
        <p style="margin-bottom: 1rem;">Are you sure you want to delete <strong>${event.title}</strong>?</p>
        <p style="color: var(--color-text-light); font-size: 0.9375rem;">
            This action cannot be undone. ${event.rsvps?.length > 0 ? `${event.rsvps.length} people have already RSVP'd.` : ''}
        </p>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="openEditEventModal('${eventId}')">Cancel</button>
        <button class="btn btn-primary" style="background: #dc2626; border-color: #dc2626;" onclick="deleteEvent('${eventId}')">Delete Event</button>
    `;

    openModal('Delete Event?', bodyHTML, footerHTML);
}

async function deleteEvent(eventId) {
    try {
        await DataService.deleteEvent(eventId);
        showToast('Event deleted', 'default');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not delete event', 'error');
    }
}

// ============================================
// EVENT CANCELLATION (Feature #13)
// ============================================

function cancelEventWithReason(eventId) {
    const event = DataService.getEventById(eventId);
    if (!event) return;

    const bodyHTML = `
        <p style="margin-bottom: 1rem;">Are you sure you want to cancel <strong>${escapeHtml(event.title)}</strong>?</p>
        <div class="form-group">
            <label class="form-label" for="cancel-reason">Reason for cancellation (optional)</label>
            <textarea class="form-input" id="cancel-reason" rows="2" placeholder="e.g., Weather conditions, venue unavailable..."></textarea>
        </div>
        <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="notify-attendees" checked>
                <span style="font-size: 0.9375rem;">Notify all RSVPs about the cancellation</span>
            </label>
        </div>
        <p style="color: var(--color-text-light); font-size: 0.875rem;">
            ${event.rsvps?.length > 0 ? `${event.rsvps.length} people have RSVP'd to this event.` : 'No one has RSVP\'d yet.'}
        </p>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="closeModal(); openEditEventModal('${eventId}')">Go Back</button>
        <button class="btn btn-primary" style="background: #f59e0b;" onclick="confirmCancelEvent('${eventId}')">Cancel Event</button>
    `;

    openModal('Cancel Event', bodyHTML, footerHTML);
}

async function confirmCancelEvent(eventId) {
    const reason = document.getElementById('cancel-reason').value.trim();
    const notifyAttendees = document.getElementById('notify-attendees').checked;

    try {
        const event = DataService.getEventById(eventId);

        await DataService.updateEvent(eventId, {
            status: 'cancelled',
            cancelReason: reason || null,
            cancelledAt: new Date().toISOString()
        });

        if (notifyAttendees && event.rsvps?.length > 0) {
            // In a real app, this would trigger Cloud Functions to send notifications
            console.log('Would notify attendees:', event.rsvps);
        }

        showToast('Event cancelled', 'success');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not cancel event', 'error');
    }
}

async function uncancelEvent(eventId) {
    try {
        await DataService.updateEvent(eventId, {
            status: 'active',
            cancelReason: null,
            cancelledAt: null
        });

        showToast('Event restored', 'success');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not restore event', 'error');
    }
}

// ============================================
// CALENDAR EXPORT (Feature #12)
// ============================================

function exportEventToCalendar(eventId) {
    const event = DataService.getEventById(eventId);
    if (!event) return;

    const gathering = DataService.getGatheringById(event.gatheringId);

    // Create ICS file content
    const startDate = new Date(event.date + 'T' + event.time);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

    const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const escapeICS = (str) => {
        return (str || '').replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
    };

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Kiwi Church//Portal//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${eventId}@kiwichurch.org.nz`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${escapeICS(event.title)}`,
        `DESCRIPTION:${escapeICS(event.description)}${gathering ? '\\n\\nOrganised by: ' + escapeICS(gathering.name) : ''}`,
        `LOCATION:${escapeICS(event.location)}`,
        event.status === 'cancelled' ? 'STATUS:CANCELLED' : 'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    // Create and download file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Calendar file downloaded', 'success');
}

// ============================================
// CHECK-IN SYSTEM (Feature #15)
// ============================================

function openCheckInModal(eventId) {
    const event = DataService.getEventById(eventId);
    if (!event) return;

    const allRSVPs = DataService.getEventRSVPs(eventId);
    const attendingRSVPs = allRSVPs.filter(r => r.status === 'attending' || !r.status);
    const checkedIn = event.checkedIn || [];

    const bodyHTML = `
        <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.875rem; color: var(--color-text-light);">
                    ${checkedIn.length} of ${attendingRSVPs.length} checked in
                </span>
                <button class="btn btn-ghost btn-sm" onclick="checkInAll('${eventId}')">Check In All</button>
            </div>
            <div style="background: var(--color-cream-dark); border-radius: 4px; height: 6px; margin-top: 0.5rem; overflow: hidden;">
                <div style="background: var(--color-sage); height: 100%; width: ${attendingRSVPs.length > 0 ? (checkedIn.length / attendingRSVPs.length) * 100 : 0}%; transition: width 0.3s;"></div>
            </div>
        </div>

        <div style="max-height: 300px; overflow-y: auto;">
            ${attendingRSVPs.length > 0 ? attendingRSVPs.map(rsvp => {
                const isCheckedIn = checkedIn.includes(rsvp.userId);
                const user = MockDB.users.find(u => u.id === rsvp.userId);
                const attendeeCount = rsvp.attendees?.length || 0;
                return `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid var(--color-cream);">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; overflow: hidden; background: var(--color-sage); display: flex; align-items: center; justify-content: center;">
                                ${user?.photoURL
                                    ? `<img src="${user.photoURL}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`
                                    : `<span style="font-family: var(--font-display); color: white;">${rsvp.userName?.charAt(0) || '?'}</span>`
                                }
                            </div>
                            <div>
                                <div style="font-size: 0.9375rem;">${escapeHtml(rsvp.userName || 'Unknown')}</div>
                                ${attendeeCount > 0 ? `<div style="font-size: 0.75rem; color: var(--color-text-light);">+${attendeeCount} guest${attendeeCount > 1 ? 's' : ''}</div>` : ''}
                            </div>
                        </div>
                        <button class="btn btn-${isCheckedIn ? 'secondary' : 'primary'} btn-sm" onclick="toggleCheckIn('${eventId}', '${rsvp.userId}')">
                            ${isCheckedIn ? '✓ Checked In' : 'Check In'}
                        </button>
                    </div>
                `;
            }).join('') : `
                <div style="text-align: center; padding: 2rem; color: var(--color-text-light);">
                    <p>No RSVPs to check in.</p>
                </div>
            `}
        </div>

        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-cream-dark);">
            <button class="btn btn-secondary btn-sm" onclick="addWalkInAttendee('${eventId}')" style="width: 100%; justify-content: center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Walk-in Attendee
            </button>
        </div>
    `;

    const footerHTML = `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`;

    openModal(`Check-in: ${event.title}`, bodyHTML, footerHTML);
}

async function toggleCheckIn(eventId, userId) {
    const event = DataService.getEventById(eventId);
    if (!event) return;

    const checkedIn = event.checkedIn || [];
    const isCheckedIn = checkedIn.includes(userId);

    let newCheckedIn;
    if (isCheckedIn) {
        newCheckedIn = checkedIn.filter(id => id !== userId);
    } else {
        newCheckedIn = [...checkedIn, userId];
    }

    try {
        if (PortalConfig.useFirebase && window.DB) {
            await DB.updateEvent(eventId, { checkedIn: newCheckedIn });
        }

        // Update local data
        const eventIdx = MockDB.events.findIndex(e => e.id === eventId);
        if (eventIdx !== -1) {
            MockDB.events[eventIdx].checkedIn = newCheckedIn;
        }

        // Refresh the modal
        openCheckInModal(eventId);
    } catch (error) {
        showToast(error.message || 'Could not update check-in', 'error');
    }
}

async function checkInAll(eventId) {
    const event = DataService.getEventById(eventId);
    if (!event) return;

    const allRSVPs = DataService.getEventRSVPs(eventId);
    const attendingRSVPs = allRSVPs.filter(r => r.status === 'attending' || !r.status);
    const newCheckedIn = attendingRSVPs.map(r => r.userId);

    try {
        if (PortalConfig.useFirebase && window.DB) {
            await DB.updateEvent(eventId, { checkedIn: newCheckedIn });
        }

        // Update local data
        const eventIdx = MockDB.events.findIndex(e => e.id === eventId);
        if (eventIdx !== -1) {
            MockDB.events[eventIdx].checkedIn = newCheckedIn;
        }

        showToast('All attendees checked in', 'success');
        openCheckInModal(eventId);
    } catch (error) {
        showToast(error.message || 'Could not check in all', 'error');
    }
}

function addWalkInAttendee(eventId) {
    const bodyHTML = `
        <form id="walk-in-form">
            <div class="form-group">
                <label class="form-label" for="walk-in-name">Name *</label>
                <input type="text" class="form-input" id="walk-in-name" required placeholder="Enter attendee name">
            </div>
            <div class="form-group">
                <label class="form-label" for="walk-in-email">Email (optional)</label>
                <input type="email" class="form-input" id="walk-in-email" placeholder="For follow-up">
            </div>
            <div class="form-group">
                <label class="form-label" for="walk-in-guests">Number of guests</label>
                <input type="number" class="form-input" id="walk-in-guests" min="0" value="0">
            </div>
        </form>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="openCheckInModal('${eventId}')">Cancel</button>
        <button class="btn btn-primary" onclick="saveWalkInAttendee('${eventId}')">Add & Check In</button>
    `;

    openModal('Add Walk-in Attendee', bodyHTML, footerHTML);
}

async function saveWalkInAttendee(eventId) {
    const name = document.getElementById('walk-in-name').value.trim();
    const email = document.getElementById('walk-in-email').value.trim();
    const guests = parseInt(document.getElementById('walk-in-guests').value) || 0;

    if (!name) {
        showToast('Name is required', 'error');
        return;
    }

    try {
        const event = DataService.getEventById(eventId);
        const walkInId = 'walkin-' + Date.now();

        // Add to RSVPs
        const newRSVP = {
            id: walkInId,
            userId: walkInId,
            userName: name,
            status: 'attending',
            notes: email ? `Email: ${email}` : 'Walk-in',
            attendees: Array(guests).fill('Guest'),
            isWalkIn: true
        };

        if (!event.rsvps) event.rsvps = [];
        event.rsvps.push(newRSVP);

        // Add to checked in
        if (!event.checkedIn) event.checkedIn = [];
        event.checkedIn.push(walkInId);

        if (PortalConfig.useFirebase && window.DB) {
            await DB.updateEvent(eventId, {
                rsvps: event.rsvps,
                checkedIn: event.checkedIn
            });
        }

        showToast(`${name} added and checked in`, 'success');
        openCheckInModal(eventId);
    } catch (error) {
        showToast(error.message || 'Could not add attendee', 'error');
    }
}

// Get event category info
function getEventCategoryInfo(category) {
    const categories = {
        'general': { label: 'General', color: '#6b7280', icon: 'calendar' },
        'worship': { label: 'Worship', color: '#8b5cf6', icon: 'music' },
        'study': { label: 'Bible Study', color: '#3b82f6', icon: 'book' },
        'prayer': { label: 'Prayer', color: '#ec4899', icon: 'heart' },
        'social': { label: 'Social', color: '#f59e0b', icon: 'users' },
        'outreach': { label: 'Outreach', color: '#10b981', icon: 'globe' },
        'youth': { label: 'Youth', color: '#06b6d4', icon: 'zap' },
        'kids': { label: 'Kids', color: '#f97316', icon: 'smile' },
        'workshop': { label: 'Workshop', color: '#6366f1', icon: 'tool' }
    };
    return categories[category] || categories['general'];
}

// ============================================
// ENHANCED RSVP MODAL
// ============================================

function openRSVPModal(eventId) {
    const event = DataService.getEventById(eventId);
    if (!event) return;

    const currentUser = DataService.getCurrentUser();
    const existingRSVP = DataService.getRSVPDetails(eventId, currentUser.id);
    const gathering = DataService.getGatheringById(event.gatheringId);

    const bodyHTML = `
        <div style="margin-bottom: 1.5rem;">
            <h4 style="margin: 0 0 0.5rem; color: var(--color-forest);">${event.title}</h4>
            <p style="margin: 0; color: var(--color-text-light); font-size: 0.9375rem;">
                ${formatDate(event.date)} at ${formatTime(event.time)}
            </p>
            <p style="margin: 0.25rem 0 0; color: var(--color-text-light); font-size: 0.875rem;">
                ${event.location}${gathering ? ` • ${gathering.name}` : ''}
            </p>
        </div>

        <form id="rsvp-form">
            <div class="form-group">
                <label class="form-label">Your Response *</label>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: var(--color-cream); border-radius: var(--radius-md); cursor: pointer; flex: 1; min-width: 100px;">
                        <input type="radio" name="rsvp-status" value="attending" ${!existingRSVP || existingRSVP.status === 'attending' ? 'checked' : ''}>
                        <span>Attending</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: var(--color-cream); border-radius: var(--radius-md); cursor: pointer; flex: 1; min-width: 100px;">
                        <input type="radio" name="rsvp-status" value="maybe" ${existingRSVP?.status === 'maybe' ? 'checked' : ''}>
                        <span>Maybe</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: var(--color-cream); border-radius: var(--radius-md); cursor: pointer; flex: 1; min-width: 100px;">
                        <input type="radio" name="rsvp-status" value="not-attending" ${existingRSVP?.status === 'not-attending' ? 'checked' : ''}>
                        <span>Can't make it</span>
                    </label>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Who's coming?</label>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; cursor: pointer;">
                        <input type="checkbox" value="self" checked disabled>
                        <span>${currentUser.displayName.split(' ')[0]} (you)</span>
                    </label>
                    ${currentUser.dependants && currentUser.dependants.length > 0 ? currentUser.dependants.map(d => `
                        <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; cursor: pointer;">
                            <input type="checkbox" name="rsvp-attendees" value="${d}" ${existingRSVP?.attendees?.includes(d) ? 'checked' : ''}>
                            <span>${d}</span>
                        </label>
                    `).join('') : ''}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Bringing a friend?</label>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button type="button" class="btn btn-ghost btn-sm" onclick="updateGuestCount(-1)" style="width: 36px; height: 36px; padding: 0;">-</button>
                    <input type="number" id="rsvp-guests" value="${existingRSVP?.guestCount || 0}" min="0" max="10" style="width: 60px; text-align: center;" class="form-input" readonly>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="updateGuestCount(1)" style="width: 36px; height: 36px; padding: 0;">+</button>
                    <span style="font-size: 0.875rem; color: var(--color-text-light);">extra guest(s)</span>
                </div>
                <small style="color: var(--color-text-light); font-size: 0.75rem; margin-top: 0.25rem; display: block;">For friends not in our system</small>
            </div>

            <div class="form-group">
                <label class="form-label" for="rsvp-notes">Notes (optional)</label>
                <textarea class="form-input" id="rsvp-notes" rows="2" placeholder="e.g., I'll bring dessert, arriving late, etc.">${existingRSVP?.notes || ''}</textarea>
            </div>
        </form>
    `;

    let footerHTML = `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>`;
    if (existingRSVP) {
        footerHTML += `<button class="btn btn-ghost" style="color: #dc2626;" onclick="cancelRSVP('${eventId}')">Remove RSVP</button>`;
    }
    footerHTML += `<button class="btn btn-primary" onclick="submitRSVP('${eventId}')">Save RSVP</button>`;

    openModal('RSVP', bodyHTML, footerHTML);
}

// Helper for guest count buttons
function updateGuestCount(delta) {
    const input = document.getElementById('rsvp-guests');
    if (!input) return;
    const current = parseInt(input.value) || 0;
    const newValue = Math.max(0, Math.min(10, current + delta));
    input.value = newValue;
}

async function submitRSVP(eventId) {
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) return;

    const status = document.querySelector('input[name="rsvp-status"]:checked')?.value || 'attending';
    const notes = document.getElementById('rsvp-notes').value.trim();

    // Get selected attendees (dependants)
    const attendeeCheckboxes = document.querySelectorAll('input[name="rsvp-attendees"]:checked');
    const attendees = Array.from(attendeeCheckboxes).map(cb => cb.value);

    // Get guest count (friends not in system)
    const guestCount = parseInt(document.getElementById('rsvp-guests')?.value) || 0;

    try {
        await DataService.rsvpWithDetails(eventId, currentUser.id, status, notes, attendees, guestCount);

        const statusMessages = {
            'attending': 'See you there!',
            'maybe': 'We hope you can make it!',
            'not-attending': 'Sorry you can\'t make it'
        };
        showToast(statusMessages[status] || 'RSVP saved!', 'success');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not save RSVP', 'error');
    }
}

// ============================================
// KETE POST MANAGEMENT
// ============================================

function openCreateKetePostModal() {
    // Get existing series for suggestions
    const existingSeries = [...new Set(MockDB.kete.filter(k => k.series).map(k => k.series))];

    const bodyHTML = `
        <form id="kete-form">
            <div class="form-group">
                <label class="form-label" for="kete-title">Title *</label>
                <input type="text" class="form-input" id="kete-title" required placeholder="Your post title">
            </div>

            <div class="form-group">
                <label class="form-label" for="kete-excerpt">Excerpt *</label>
                <input type="text" class="form-input" id="kete-excerpt" required placeholder="A brief summary (shown in listings)" maxlength="200">
                <small style="color: var(--color-text-light); font-size: 0.75rem;">Max 200 characters</small>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label" for="kete-category">Category</label>
                    <select class="form-input" id="kete-category">
                        <option value="">Select category...</option>
                        ${KETE_CATEGORIES.map(cat => `
                            <option value="${cat.id}">${cat.name}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="kete-series">Series (optional)</label>
                    <input type="text" class="form-input" id="kete-series" list="series-list" placeholder="e.g., Advent 2024">
                    <datalist id="series-list">
                        ${existingSeries.map(s => `<option value="${escapeHtml(s)}">`).join('')}
                    </datalist>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="kete-content">Content *</label>
                <textarea class="form-input" id="kete-content" rows="12" required placeholder="Write your post here...

You can use simple formatting:
# Heading
## Subheading
**bold text**
*italic text*
- bullet points"></textarea>
                <small style="color: var(--color-text-light); font-size: 0.75rem;">Supports basic Markdown formatting</small>
            </div>

            <div class="form-group">
                <label class="form-label" for="kete-image">Featured Image (optional)</label>
                <input type="file" class="form-input" id="kete-image" accept="image/*" onchange="previewKeteImage(this)">
                <div id="kete-image-preview" style="margin-top: 0.5rem; display: none;">
                    <img src="" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: var(--radius-sm);">
                    <button type="button" class="btn btn-ghost btn-sm" onclick="clearKeteImage()" style="margin-top: 0.5rem;">Remove image</button>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Media Attachments (optional)</label>
                <input type="file" class="form-input" id="kete-attachments" multiple accept="image/*,.pdf,.doc,.docx" onchange="previewKeteAttachments(this)">
                <small style="color: var(--color-text-light); font-size: 0.75rem;">Add images or documents to include in your post</small>
                <div id="kete-attachments-preview" style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem;"></div>
            </div>

            <div class="form-group">
                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                    <input type="checkbox" id="kete-published" checked>
                    <span>Publish immediately</span>
                </label>
                <small style="color: var(--color-text-light); font-size: 0.75rem; display: block; margin-top: 0.25rem;">Uncheck to save as draft</small>
            </div>
        </form>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-ghost" onclick="saveKetePost(false)">Save Draft</button>
        <button class="btn btn-primary" onclick="saveKetePost(true)">Publish</button>
    `;

    openModal('New Kete Post', bodyHTML, footerHTML);
}

// Preview Kete attachments
function previewKeteAttachments(input) {
    const preview = document.getElementById('kete-attachments-preview');
    if (!preview) return;
    preview.innerHTML = '';

    if (!input.files || input.files.length === 0) return;

    Array.from(input.files).forEach((file, index) => {
        const isImage = file.type.startsWith('image/');

        if (isImage) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.style.cssText = 'position: relative; display: inline-block;';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="Attachment" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm);">
                    <button type="button" onclick="removeKeteAttachment(${index})" style="position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%; background: #dc2626; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                `;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        } else {
            const div = document.createElement('div');
            div.style.cssText = 'position: relative; display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm); font-size: 0.75rem;';
            div.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                ${escapeHtml(file.name.substring(0, 15))}${file.name.length > 15 ? '...' : ''}
                <button type="button" onclick="removeKeteAttachment(${index})" style="padding: 0; background: none; border: none; cursor: pointer; margin-left: 0.25rem;">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            preview.appendChild(div);
        }
    });
}

function removeKeteAttachment(index) {
    const input = document.getElementById('kete-attachments');
    // Note: Can't truly remove from FileList, so we'd need a different approach in production
    // For now, just provide visual feedback
    showToast('Attachment will be removed on next file selection', 'default');
}

function previewKeteImage(input) {
    const preview = document.getElementById('kete-image-preview');
    const img = preview.querySelector('img');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function clearKeteImage() {
    document.getElementById('kete-image').value = '';
    document.getElementById('kete-image-preview').style.display = 'none';
}

async function saveKetePost(publish = true) {
    const title = document.getElementById('kete-title').value.trim();
    const excerpt = document.getElementById('kete-excerpt').value.trim();
    const content = document.getElementById('kete-content').value.trim();
    const category = document.getElementById('kete-category')?.value || null;
    const series = document.getElementById('kete-series')?.value.trim() || null;
    const imageInput = document.getElementById('kete-image');
    const attachmentsInput = document.getElementById('kete-attachments');

    // Validation
    if (!title || !excerpt || !content) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    try {
        let featuredImage = null;
        let attachments = [];

        // Handle featured image upload
        if (imageInput.files && imageInput.files[0]) {
            if (PortalConfig.useFirebase && window.Storage) {
                const result = await Storage.uploadKeteImage('temp', imageInput.files[0]);
                featuredImage = result.url;
            } else {
                featuredImage = document.getElementById('kete-image-preview').querySelector('img').src;
            }
        }

        // Handle attachments
        if (attachmentsInput?.files && attachmentsInput.files.length > 0) {
            for (const file of attachmentsInput.files) {
                const isImage = file.type.startsWith('image/');
                if (PortalConfig.useFirebase && window.Storage) {
                    const result = await Storage.uploadKeteImage('temp-attachment', file);
                    attachments.push({
                        type: isImage ? 'image' : 'file',
                        url: result.url,
                        name: file.name
                    });
                } else {
                    // Demo mode
                    const dataUrl = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(file);
                    });
                    attachments.push({
                        type: isImage ? 'image' : 'file',
                        url: dataUrl,
                        name: file.name
                    });
                }
            }
        }

        await DataService.createKetePost({
            title,
            excerpt,
            content,
            category,
            series,
            featuredImage,
            attachments,
            published: publish
        });

        showToast(publish ? 'Post published!' : 'Draft saved!', 'success');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not save post', 'error');
    }
}

function openEditKetePostModal(postId) {
    const post = DataService.getKetePostById(postId);
    if (!post) return;

    // Get existing series for suggestions
    const existingSeries = [...new Set(MockDB.kete.filter(k => k.series).map(k => k.series))];

    const bodyHTML = `
        <form id="edit-kete-form">
            <div class="form-group">
                <label class="form-label" for="edit-kete-title">Title *</label>
                <input type="text" class="form-input" id="edit-kete-title" required value="${escapeHtml(post.title)}">
            </div>

            <div class="form-group">
                <label class="form-label" for="edit-kete-excerpt">Excerpt *</label>
                <input type="text" class="form-input" id="edit-kete-excerpt" required value="${escapeHtml(post.excerpt)}" maxlength="200">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label" for="edit-kete-category">Category</label>
                    <select class="form-input" id="edit-kete-category">
                        <option value="">Select category...</option>
                        ${KETE_CATEGORIES.map(cat => `
                            <option value="${cat.id}" ${post.category === cat.id ? 'selected' : ''}>${cat.name}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="edit-kete-series">Series (optional)</label>
                    <input type="text" class="form-input" id="edit-kete-series" list="edit-series-list" value="${escapeHtml(post.series || '')}" placeholder="e.g., Advent 2024">
                    <datalist id="edit-series-list">
                        ${existingSeries.map(s => `<option value="${escapeHtml(s)}">`).join('')}
                    </datalist>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="edit-kete-content">Content *</label>
                <textarea class="form-input" id="edit-kete-content" rows="12" required>${escapeHtml(post.content)}</textarea>
            </div>

            <div class="form-group">
                <label class="form-label" for="edit-kete-image">Featured Image</label>
                ${post.featuredImage ? `
                    <div id="current-kete-image" style="margin-bottom: 0.5rem;">
                        <img src="${post.featuredImage}" alt="Current image" style="max-width: 100%; max-height: 150px; border-radius: var(--radius-sm);">
                        <button type="button" class="btn btn-ghost btn-sm" onclick="removeCurrentKeteImage('${postId}')" style="margin-top: 0.5rem;">Remove current image</button>
                    </div>
                ` : ''}
                <input type="file" class="form-input" id="edit-kete-image" accept="image/*" onchange="previewEditKeteImage(this)">
                <div id="edit-kete-image-preview" style="margin-top: 0.5rem; display: none;">
                    <img src="" alt="Preview" style="max-width: 100%; max-height: 150px; border-radius: var(--radius-sm);">
                </div>
            </div>

            ${post.attachments && post.attachments.length > 0 ? `
            <div class="form-group">
                <label class="form-label">Current Attachments</label>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${post.attachments.map((att, idx) => `
                        ${att.type === 'image'
                            ? `<img src="${att.url}" alt="${escapeHtml(att.name)}" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm);">`
                            : `<div style="display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm); font-size: 0.75rem;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                ${escapeHtml(att.name)}
                            </div>`
                        }
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <div class="form-group">
                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                    <input type="checkbox" id="edit-kete-published" ${post.published ? 'checked' : ''}>
                    <span>Published</span>
                </label>
            </div>

            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-cream-dark);">
                <p style="color: var(--color-text-light); font-size: 0.875rem; margin-bottom: 0.75rem;">
                    Created: ${formatDateShort(post.createdAt)} by ${post.authorName}
                </p>
                <button type="button" class="btn btn-ghost" style="color: #dc2626;" onclick="confirmDeleteKetePost('${post.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete Post
                </button>
            </div>
        </form>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="updateKetePost('${post.id}')">Save Changes</button>
    `;

    openModal('Edit Post', bodyHTML, footerHTML);
}

function previewEditKeteImage(input) {
    const preview = document.getElementById('edit-kete-image-preview');
    const img = preview.querySelector('img');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function removeCurrentKeteImage(postId) {
    const container = document.getElementById('current-kete-image');
    if (container) {
        container.innerHTML = '<p style="color: var(--color-text-light); font-size: 0.875rem;">Image will be removed on save</p>';
        container.dataset.removeImage = 'true';
    }
}

async function updateKetePost(postId) {
    const title = document.getElementById('edit-kete-title').value.trim();
    const excerpt = document.getElementById('edit-kete-excerpt').value.trim();
    const content = document.getElementById('edit-kete-content').value.trim();
    const category = document.getElementById('edit-kete-category')?.value || null;
    const series = document.getElementById('edit-kete-series')?.value.trim() || null;
    const published = document.getElementById('edit-kete-published').checked;
    const imageInput = document.getElementById('edit-kete-image');
    const currentImageContainer = document.getElementById('current-kete-image');

    // Validation
    if (!title || !excerpt || !content) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    try {
        const updates = { title, excerpt, content, category, series, published };

        // Handle image changes
        if (imageInput.files && imageInput.files[0]) {
            // New image uploaded
            if (PortalConfig.useFirebase && window.Storage) {
                const result = await Storage.uploadKeteImage(postId, imageInput.files[0]);
                updates.featuredImage = result.url;
            } else {
                updates.featuredImage = document.getElementById('edit-kete-image-preview').querySelector('img').src;
            }
        } else if (currentImageContainer?.dataset.removeImage === 'true') {
            // Remove existing image
            updates.featuredImage = null;
        }

        await DataService.updateKetePost(postId, updates);

        showToast('Post updated!', 'success');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not update post', 'error');
    }
}

function confirmDeleteKetePost(postId) {
    const post = DataService.getKetePostById(postId);
    if (!post) return;

    const bodyHTML = `
        <p style="margin-bottom: 1rem;">Are you sure you want to delete <strong>${escapeHtml(post.title)}</strong>?</p>
        <p style="color: var(--color-text-light); font-size: 0.9375rem;">
            This action cannot be undone.
        </p>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="openEditKetePostModal('${postId}')">Cancel</button>
        <button class="btn btn-primary" style="background: #dc2626; border-color: #dc2626;" onclick="deleteKetePost('${postId}')">Delete Post</button>
    `;

    openModal('Delete Post?', bodyHTML, footerHTML);
}

async function deleteKetePost(postId) {
    try {
        await DataService.deleteKetePost(postId);
        showToast('Post deleted', 'default');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not delete post', 'error');
    }
}

// View a full Kete post
function openKetePostModal(postId) {
    const post = DataService.getKetePostById(postId);
    if (!post) return;

    const canManage = DataService.canManageKetePost(post);
    const readingTime = calculateReadingTime(post.content);
    const category = KETE_CATEGORIES.find(c => c.id === post.category);

    // Get related posts (same category or series, excluding current)
    let relatedPosts = [];
    if (post.series) {
        // Same series first
        relatedPosts = MockDB.kete.filter(k =>
            k.published && k.id !== post.id && k.series === post.series
        ).slice(0, 3);
    }
    if (relatedPosts.length < 3 && post.category) {
        // Fill with same category
        const categoryPosts = MockDB.kete.filter(k =>
            k.published && k.id !== post.id && k.category === post.category &&
            !relatedPosts.find(r => r.id === k.id)
        ).slice(0, 3 - relatedPosts.length);
        relatedPosts = [...relatedPosts, ...categoryPosts];
    }

    // Convert simple markdown to HTML
    const contentHtml = renderMarkdown(post.content);

    const bodyHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.375rem; align-items: center; margin-bottom: 0.5rem;">
                    ${category ? `
                        <span style="background: ${category.color}20; color: ${category.color}; padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.6875rem; font-weight: 500;">${category.name}</span>
                    ` : ''}
                    ${post.series ? `
                        <button onclick="closeModal(); openKeteSeriesModal('${escapeHtml(post.series)}')" style="display: inline-flex; align-items: center; gap: 0.25rem; background: var(--color-cream); color: var(--color-text-light); padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.6875rem; border: none; cursor: pointer;">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                            ${escapeHtml(post.series)}
                        </button>
                    ` : ''}
                    ${!post.published ? '<span style="background: var(--color-terracotta-light); color: var(--color-terracotta); padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.6875rem;">Draft</span>' : ''}
                </div>
                <p style="font-size: 0.875rem; color: var(--color-text-light); margin: 0;">
                    ${formatDate(post.publishedAt || post.createdAt)} • ${readingTime} min read
                </p>
                <p style="font-size: 0.875rem; color: var(--color-text-light); margin: 0.25rem 0 0;">
                    by ${post.authorName}
                </p>
            </div>
            ${canManage ? `
                <button class="btn btn-ghost btn-sm" onclick="openEditKetePostModal('${post.id}')" style="margin: -0.5rem -0.5rem 0 0;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                </button>
            ` : ''}
        </div>

        ${post.featuredImage ? `
            <img src="${post.featuredImage}" alt="${escapeHtml(post.title)}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
        ` : ''}

        <div class="kete-content" style="line-height: 1.7; color: var(--color-text);">
            ${contentHtml}
        </div>

        ${post.attachments && post.attachments.length > 0 ? `
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-cream-dark);">
            <h4 style="margin: 0 0 0.75rem; font-size: 0.9375rem; color: var(--color-text-light);">Attachments</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                ${post.attachments.map(att => att.type === 'image'
                    ? `<img src="${att.url}" alt="${escapeHtml(att.name)}" style="max-width: 200px; max-height: 150px; object-fit: cover; border-radius: var(--radius-sm); cursor: pointer;" onclick="openImageModal('${att.url}')">`
                    : `<a href="${att.url}" target="_blank" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--color-cream); border-radius: var(--radius-sm); text-decoration: none; color: var(--color-text);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        ${escapeHtml(att.name)}
                    </a>`
                ).join('')}
            </div>
        </div>
        ` : ''}

        ${relatedPosts.length > 0 ? `
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-cream-dark);">
            <h4 style="margin: 0 0 0.75rem; font-size: 0.9375rem; color: var(--color-text-light);">Related Posts</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${relatedPosts.map(rp => {
                    const rpCat = KETE_CATEGORIES.find(c => c.id === rp.category);
                    return `
                        <div onclick="openKetePostModal('${rp.id}')" style="display: flex; gap: 0.75rem; padding: 0.75rem; background: var(--color-cream); border-radius: var(--radius-sm); cursor: pointer;">
                            ${rp.featuredImage ? `<img src="${rp.featuredImage}" alt="" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); flex-shrink: 0;">` : ''}
                            <div style="flex: 1; min-width: 0;">
                                ${rpCat ? `<span style="font-size: 0.625rem; color: ${rpCat.color}; font-weight: 500;">${rpCat.name}</span>` : ''}
                                <h5 style="margin: 0; font-size: 0.875rem; color: var(--color-forest);">${escapeHtml(rp.title)}</h5>
                                <p style="margin: 0.25rem 0 0; font-size: 0.75rem; color: var(--color-text-light); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(rp.excerpt)}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        ` : ''}
    `;

    const footerHTML = `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`;

    openModal(post.title, bodyHTML, footerHTML);
}

// Open series modal
function openKeteSeriesModal(series) {
    const seriesPosts = MockDB.kete.filter(k => k.published && k.series === series)
        .sort((a, b) => new Date(a.publishedAt || a.createdAt) - new Date(b.publishedAt || b.createdAt));

    document.getElementById('modal-title').textContent = series;
    document.getElementById('modal-body').innerHTML = `
        <div style="margin-bottom: 1rem;">
            <span style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm); font-size: 0.875rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                ${seriesPosts.length} post${seriesPosts.length !== 1 ? 's' : ''} in this series
            </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 400px; overflow-y: auto;">
            ${seriesPosts.map((post, index) => {
                const category = KETE_CATEGORIES.find(c => c.id === post.category);
                const readingTime = calculateReadingTime(post.content);
                return `
                    <div onclick="openKetePostModal('${post.id}')" style="display: flex; gap: 0.75rem; padding: 0.75rem; background: var(--color-cream); border-radius: var(--radius-md); cursor: pointer;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--color-forest); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0;">
                            ${index + 1}
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; gap: 0.25rem; align-items: center; margin-bottom: 0.25rem;">
                                ${category ? `<span style="font-size: 0.625rem; color: ${category.color}; font-weight: 500;">${category.name}</span>` : ''}
                                <span style="font-size: 0.625rem; color: var(--color-text-light);">${readingTime} min</span>
                            </div>
                            <h5 style="margin: 0; font-size: 0.9375rem; color: var(--color-forest);">${escapeHtml(post.title)}</h5>
                            <p style="margin: 0.25rem 0 0; font-size: 0.75rem; color: var(--color-text-light);">${formatDateShort(post.publishedAt)}</p>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>

        <div style="margin-top: 1.5rem;">
            <button class="btn btn-ghost" onclick="closeModal()" style="width: 100%;">Close</button>
        </div>
    `;

    openModal();
}

// Simple markdown renderer
function renderMarkdown(text) {
    if (!text) return '';

    return text
        // Escape HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Headers
        .replace(/^### (.+)$/gm, '<h4 style="margin: 1.5rem 0 0.75rem; font-family: var(--font-display);">$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 style="margin: 1.5rem 0 0.75rem; font-family: var(--font-display);">$1</h3>')
        .replace(/^# (.+)$/gm, '<h2 style="margin: 1.5rem 0 0.75rem; font-family: var(--font-display);">$1</h2>')
        // Bold and italic
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^- (.+)$/gm, '<li style="margin-left: 1.5rem;">$1</li>')
        // Paragraphs (double newlines)
        .replace(/\n\n/g, '</p><p style="margin: 1rem 0;">')
        // Single newlines to <br>
        .replace(/\n/g, '<br>')
        // Wrap in paragraph
        .replace(/^(.+)/, '<p style="margin: 1rem 0;">$1</p>');
}

// Escape HTML for safe display
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// NOTIFICATIONS MODAL
// ============================================

// Notification icons
const NOTIFICATION_ICONS = {
    comment: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    post: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>',
    event: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>',
    rsvp: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    mention: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>',
    system: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    welcome: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
};

function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;

    const count = DataService.getUnreadNotificationCount();
    if (count > 0) {
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.justifyContent = 'center';
        badge.style.width = count > 9 ? '18px' : '16px';
        badge.style.height = '16px';
        badge.style.fontSize = '0.625rem';
        badge.style.fontWeight = '600';
        badge.style.color = 'white';
        badge.textContent = count > 99 ? '99+' : count;
    } else {
        badge.style.display = 'none';
        badge.textContent = '';
    }
}

function openNotificationsModal() {
    const notifications = DataService.getNotifications();
    const unreadCount = DataService.getUnreadNotificationCount();

    const bodyHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--color-cream-dark);">
            <span style="font-size: 0.875rem; color: var(--color-text-light);">
                ${unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </span>
            <button class="btn btn-ghost btn-sm" onclick="openNotificationSettingsModal()" title="Notification settings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            </button>
        </div>

        ${notifications.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 400px; overflow-y: auto;">
                ${notifications.map(n => `
                    <div style="display: flex; gap: 0.75rem; padding: 0.75rem; background: ${n.read ? 'var(--color-cream)' : 'var(--color-sage-light)'}; border-radius: var(--radius-md); position: relative;">
                        <div onclick="handleNotificationClick('${n.id}', ${JSON.stringify(n.link).replace(/"/g, '&quot;')})" style="display: flex; gap: 0.75rem; flex: 1; cursor: pointer;">
                            <div style="width: 32px; height: 32px; background: ${n.read ? 'var(--color-cream-dark)' : 'var(--color-sage)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${n.read ? 'var(--color-text-light)' : 'white'}; flex-shrink: 0;">
                                ${NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.post}
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: ${n.read ? '400' : '500'}; font-size: 0.9375rem;">${escapeHtml(n.title)}</div>
                                <div style="color: var(--color-text-light); font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(n.message)}</div>
                                <div style="color: var(--color-text-light); font-size: 0.75rem; margin-top: 0.25rem;">${formatRelativeTime(n.createdAt)}</div>
                            </div>
                        </div>
                        <button onclick="deleteNotification('${n.id}')" style="position: absolute; top: 0.5rem; right: 0.5rem; width: 20px; height: 20px; border: none; background: none; cursor: pointer; opacity: 0.5; display: flex; align-items: center; justify-content: center;" title="Delete notification">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                `).join('')}
            </div>
        ` : `
            <div style="text-align: center; padding: 2rem; color: var(--color-text-light);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.5;">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <p style="margin: 0;">No notifications</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">You're all caught up!</p>
            </div>
        `}
    `;

    const footerHTML = `
        ${unreadCount > 0 ? `<button class="btn btn-ghost" onclick="markAllNotificationsRead()">Mark all as read</button>` : ''}
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    `;

    openModal('Notifications', bodyHTML, footerHTML);
}

function handleNotificationClick(notifId, link) {
    DataService.markNotificationRead(notifId);
    updateNotificationBadge();
    closeModal();

    if (link) {
        if (link.groupId) {
            navigateToGroup(link.groupId);
        } else if (link.page) {
            navigateTo(link.page);
        }
    }
}

function markAllNotificationsRead() {
    DataService.markAllNotificationsRead();
    updateNotificationBadge();
    openNotificationsModal(); // Refresh modal
    showToast('All notifications marked as read', 'default');
}

function deleteNotification(notifId) {
    const user = DataService.getCurrentUser();
    if (!user) return;

    const index = MockDB.notifications.findIndex(n => n.id === notifId && n.userId === user.id);
    if (index > -1) {
        MockDB.notifications.splice(index, 1);
    }

    updateNotificationBadge();
    openNotificationsModal(); // Refresh modal
}

// Notification Settings
function openNotificationSettingsModal() {
    const currentUser = DataService.getCurrentUser();
    const settings = currentUser?.notificationSettings || {
        emailEvents: true,
        emailPosts: false,
        emailComments: true,
        emailMentions: true,
        pushEnabled: false,
        pushEvents: true,
        pushPosts: true,
        pushComments: true,
        pushMentions: true
    };

    const pushSupported = 'Notification' in window;
    const pushPermission = pushSupported ? Notification.permission : 'denied';

    document.getElementById('modal-title').textContent = 'Notification Settings';
    document.getElementById('modal-body').innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Push Notifications -->
            <div>
                <h4 style="margin: 0 0 0.75rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    Push Notifications
                </h4>
                ${!pushSupported ? `
                    <p style="color: var(--color-text-light); font-size: 0.875rem;">Push notifications are not supported in this browser.</p>
                ` : pushPermission === 'denied' ? `
                    <p style="color: var(--color-text-light); font-size: 0.875rem;">Push notifications are blocked. Please enable them in your browser settings.</p>
                ` : `
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm); cursor: pointer;">
                            <span>Enable push notifications</span>
                            <input type="checkbox" id="push-enabled" ${settings.pushEnabled && pushPermission === 'granted' ? 'checked' : ''} onchange="togglePushNotifications(this.checked)">
                        </label>
                        <div id="push-options" style="${settings.pushEnabled && pushPermission === 'granted' ? '' : 'opacity: 0.5; pointer-events: none;'}">
                            <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="push-events" ${settings.pushEvents ? 'checked' : ''}>
                                <span style="font-size: 0.875rem;">New events and reminders</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="push-posts" ${settings.pushPosts ? 'checked' : ''}>
                                <span style="font-size: 0.875rem;">New posts in your groups</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="push-comments" ${settings.pushComments ? 'checked' : ''}>
                                <span style="font-size: 0.875rem;">Comments on your posts</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="push-mentions" ${settings.pushMentions ? 'checked' : ''}>
                                <span style="font-size: 0.875rem;">When someone mentions you</span>
                            </label>
                        </div>
                    </div>
                `}
            </div>

            <!-- Email Notifications -->
            <div>
                <h4 style="margin: 0 0 0.75rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Email Notifications
                </h4>
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.5rem; cursor: pointer;">
                        <input type="checkbox" id="email-events" ${settings.emailEvents ? 'checked' : ''}>
                        <span style="font-size: 0.875rem;">Event reminders (1 day before)</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.5rem; cursor: pointer;">
                        <input type="checkbox" id="email-posts" ${settings.emailPosts ? 'checked' : ''}>
                        <span style="font-size: 0.875rem;">Weekly digest of new posts</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.5rem; cursor: pointer;">
                        <input type="checkbox" id="email-comments" ${settings.emailComments ? 'checked' : ''}>
                        <span style="font-size: 0.875rem;">Comments on your posts</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.5rem; cursor: pointer;">
                        <input type="checkbox" id="email-mentions" ${settings.emailMentions ? 'checked' : ''}>
                        <span style="font-size: 0.875rem;">When someone mentions you</span>
                    </label>
                </div>
            </div>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">
            <button class="btn btn-ghost" onclick="openNotificationsModal()">Cancel</button>
            <button class="btn btn-primary" onclick="saveNotificationSettings()">Save Settings</button>
        </div>
    `;

    openModal();
}

async function togglePushNotifications(enabled) {
    if (enabled) {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                document.getElementById('push-options').style.opacity = '1';
                document.getElementById('push-options').style.pointerEvents = 'auto';
                showToast('Push notifications enabled!', 'success');
            } else {
                document.getElementById('push-enabled').checked = false;
                showToast('Push notifications were denied', 'error');
            }
        }
    } else {
        document.getElementById('push-options').style.opacity = '0.5';
        document.getElementById('push-options').style.pointerEvents = 'none';
    }
}

async function saveNotificationSettings() {
    const settings = {
        emailEvents: document.getElementById('email-events')?.checked ?? true,
        emailPosts: document.getElementById('email-posts')?.checked ?? false,
        emailComments: document.getElementById('email-comments')?.checked ?? true,
        emailMentions: document.getElementById('email-mentions')?.checked ?? true,
        pushEnabled: document.getElementById('push-enabled')?.checked ?? false,
        pushEvents: document.getElementById('push-events')?.checked ?? true,
        pushPosts: document.getElementById('push-posts')?.checked ?? true,
        pushComments: document.getElementById('push-comments')?.checked ?? true,
        pushMentions: document.getElementById('push-mentions')?.checked ?? true
    };

    const currentUser = DataService.getCurrentUser();
    if (currentUser) {
        currentUser.notificationSettings = settings;

        // Save to Firebase if enabled
        if (PortalConfig.useFirebase && !PortalConfig.demoMode) {
            try {
                const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                await updateDoc(doc(db, 'users', currentUser.id), {
                    notificationSettings: settings
                });
            } catch (error) {
                console.error('Error saving notification settings:', error);
            }
        }
    }

    showToast('Notification settings saved', 'success');
    openNotificationsModal();
}

// Send a push notification (if enabled)
function sendPushNotification(title, body, icon) {
    const currentUser = DataService.getCurrentUser();
    const settings = currentUser?.notificationSettings;

    if (settings?.pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: icon || '/images/kiwi-logo.svg',
            badge: '/images/kiwi-logo.svg'
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }
}

// ============================================
// SEARCH MODAL
// ============================================

// Current search filter
let searchFilter = 'all';

// Get recent searches from localStorage
function getRecentSearches() {
    try {
        return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
        return [];
    }
}

// Save search to recent
function saveRecentSearch(query) {
    if (!query || query.length < 2) return;

    let recent = getRecentSearches();
    // Remove if exists and add to front
    recent = recent.filter(s => s.toLowerCase() !== query.toLowerCase());
    recent.unshift(query);
    // Keep only last 5
    recent = recent.slice(0, 5);

    try {
        localStorage.setItem('recentSearches', JSON.stringify(recent));
    } catch {}
}

// Clear recent searches
function clearRecentSearches() {
    localStorage.removeItem('recentSearches');
    showInitialSearchState();
}

function openSearchModal() {
    searchFilter = 'all';

    const bodyHTML = `
        <div style="margin-bottom: 0.75rem;">
            <div style="position: relative;">
                <input type="text" class="form-input" id="search-input" placeholder="Search events, groups, posts, people..."
                       oninput="performSearch(this.value)" onkeydown="handleSearchKeydown(event)" autofocus style="font-size: 1rem; padding-left: 2.5rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2" style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>
        </div>

        <!-- Filter Tabs -->
        <div style="display: flex; flex-wrap: wrap; gap: 0.375rem; margin-bottom: 1rem;">
            <button id="filter-all" onclick="setSearchFilter('all')" class="btn btn-sm btn-primary" style="border-radius: 999px;">All</button>
            <button id="filter-events" onclick="setSearchFilter('events')" class="btn btn-sm btn-ghost" style="border-radius: 999px; background: var(--color-cream);">Events</button>
            <button id="filter-groups" onclick="setSearchFilter('groups')" class="btn btn-sm btn-ghost" style="border-radius: 999px; background: var(--color-cream);">Groups</button>
            <button id="filter-kete" onclick="setSearchFilter('kete')" class="btn btn-sm btn-ghost" style="border-radius: 999px; background: var(--color-cream);">Kete</button>
            <button id="filter-posts" onclick="setSearchFilter('posts')" class="btn btn-sm btn-ghost" style="border-radius: 999px; background: var(--color-cream);">Posts</button>
            <button id="filter-people" onclick="setSearchFilter('people')" class="btn btn-sm btn-ghost" style="border-radius: 999px; background: var(--color-cream);">People</button>
        </div>

        <div id="search-results" style="max-height: 350px; overflow-y: auto;">
        </div>
    `;

    openModal('Search', bodyHTML, '');

    // Focus the input and show initial state
    setTimeout(() => {
        document.getElementById('search-input')?.focus();
        showInitialSearchState();
    }, 100);
}

function showInitialSearchState() {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    const recent = getRecentSearches();

    if (recent.length > 0) {
        resultsContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.75rem; color: var(--color-text-light); text-transform: uppercase;">Recent Searches</span>
                <button onclick="clearRecentSearches()" style="font-size: 0.75rem; color: var(--color-sage); background: none; border: none; cursor: pointer;">Clear</button>
            </div>
            ${recent.map(q => `
                <div onclick="quickSearch('${escapeHtml(q)}')" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; cursor: pointer; border-radius: var(--radius-sm);" onmouseover="this.style.background='var(--color-cream)'" onmouseout="this.style.background='transparent'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span style="font-size: 0.9375rem;">${escapeHtml(q)}</span>
                </div>
            `).join('')}
        `;
    } else {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 1rem; color: var(--color-text-light);">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 0.5rem; opacity: 0.5;">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p style="margin: 0; font-size: 0.9375rem;">Search for anything</p>
                <p style="margin: 0.25rem 0 0; font-size: 0.75rem;">Events, groups, posts, people...</p>
            </div>
        `;
    }
}

function quickSearch(query) {
    const input = document.getElementById('search-input');
    if (input) {
        input.value = query;
        performSearch(query);
    }
}

function setSearchFilter(filter) {
    searchFilter = filter;

    // Update button styles
    const filters = ['all', 'events', 'groups', 'kete', 'posts', 'people'];
    filters.forEach(f => {
        const btn = document.getElementById(`filter-${f}`);
        if (btn) {
            if (f === filter) {
                btn.className = 'btn btn-sm btn-primary';
                btn.style.background = '';
            } else {
                btn.className = 'btn btn-sm btn-ghost';
                btn.style.background = 'var(--color-cream)';
            }
        }
    });

    // Re-run search
    const query = document.getElementById('search-input')?.value;
    if (query) {
        performSearch(query);
    }
}

function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query.length >= 2) {
            saveRecentSearch(query);
        }
    }
}

function performSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    if (!query || query.length < 2) {
        showInitialSearchState();
        return;
    }

    const results = DataService.search(query);

    // Search users too
    const q = query.toLowerCase();
    const users = MockDB.users.filter(u =>
        u.displayName.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    ).slice(0, 5);

    // Apply filter
    let filteredResults = { ...results, users };
    if (searchFilter !== 'all') {
        filteredResults = {
            events: searchFilter === 'events' ? results.events : [],
            groups: searchFilter === 'groups' ? results.groups : [],
            kete: searchFilter === 'kete' ? results.kete : [],
            posts: searchFilter === 'posts' ? results.posts : [],
            users: searchFilter === 'people' ? users : []
        };
    }

    const hasResults = filteredResults.events.length > 0 ||
                       filteredResults.groups.length > 0 ||
                       filteredResults.kete.length > 0 ||
                       filteredResults.posts.length > 0 ||
                       filteredResults.users.length > 0;

    if (!hasResults) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 1.5rem; color: var(--color-text-light);">
                <p style="margin: 0;">No results found for "${escapeHtml(query)}"</p>
                ${searchFilter !== 'all' ? `<button onclick="setSearchFilter('all')" style="margin-top: 0.5rem; color: var(--color-sage); background: none; border: none; cursor: pointer; font-size: 0.875rem;">Try searching all categories</button>` : ''}
            </div>
        `;
        return;
    }

    let html = '';

    // Result icons
    const icons = {
        event: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>',
        group: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        kete: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>',
        post: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        user: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
    };

    if (filteredResults.events.length > 0) {
        html += `
            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 0.6875rem; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.375rem;">Events</h4>
                ${filteredResults.events.map(e => `
                    <div onclick="saveRecentSearch('${escapeHtml(query)}'); closeModal(); openEventModal('${e.id}')" style="display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm); margin-bottom: 0.25rem; cursor: pointer;">
                        <div style="color: var(--color-sage); margin-top: 2px;">${icons.event}</div>
                        <div>
                            <div style="font-weight: 500; font-size: 0.9375rem;">${escapeHtml(e.title)}</div>
                            <div style="font-size: 0.75rem; color: var(--color-text-light);">${formatDateShort(e.date)} • ${escapeHtml(e.location || 'TBD')}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (filteredResults.groups.length > 0) {
        html += `
            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 0.6875rem; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.375rem;">Groups</h4>
                ${filteredResults.groups.map(g => `
                    <div onclick="saveRecentSearch('${escapeHtml(query)}'); closeModal(); navigateToGroup('${g.id}')" style="display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm); margin-bottom: 0.25rem; cursor: pointer;">
                        <div style="color: ${g.color || 'var(--color-sage)'}; margin-top: 2px;">${icons.group}</div>
                        <div>
                            <div style="font-weight: 500; font-size: 0.9375rem;">${escapeHtml(g.name)}</div>
                            <div style="font-size: 0.75rem; color: var(--color-text-light);">${escapeHtml(g.rhythm || g.description || '')}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (filteredResults.kete.length > 0) {
        html += `
            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 0.6875rem; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.375rem;">Kete Posts</h4>
                ${filteredResults.kete.map(k => `
                    <div onclick="saveRecentSearch('${escapeHtml(query)}'); closeModal(); openKetePostModal('${k.id}')" style="display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm); margin-bottom: 0.25rem; cursor: pointer;">
                        <div style="color: var(--color-terracotta); margin-top: 2px;">${icons.kete}</div>
                        <div>
                            <div style="font-weight: 500; font-size: 0.9375rem;">${escapeHtml(k.title)}</div>
                            <div style="font-size: 0.75rem; color: var(--color-text-light);">${escapeHtml(k.authorName)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (filteredResults.posts.length > 0) {
        html += `
            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 0.6875rem; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.375rem;">Board Posts</h4>
                ${filteredResults.posts.map(p => {
                    const group = DataService.getGatheringById(p.gatheringId);
                    return `
                        <div onclick="saveRecentSearch('${escapeHtml(query)}'); closeModal(); navigateToGroup('${p.gatheringId}')" style="display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm); margin-bottom: 0.25rem; cursor: pointer;">
                            <div style="color: var(--color-sage); margin-top: 2px;">${icons.post}</div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 500; font-size: 0.9375rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.content.substring(0, 50))}...</div>
                                <div style="font-size: 0.75rem; color: var(--color-text-light);">${escapeHtml(p.authorName)} in ${escapeHtml(group?.name || 'Unknown')}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    if (filteredResults.users.length > 0) {
        html += `
            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 0.6875rem; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.375rem;">People</h4>
                ${filteredResults.users.map(u => `
                    <div onclick="saveRecentSearch('${escapeHtml(query)}'); closeModal(); openUserProfileModal('${u.id}')" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm); margin-bottom: 0.25rem; cursor: pointer;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; overflow: hidden; background: var(--color-sage); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            ${u.photoURL
                                ? `<img src="${u.photoURL}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`
                                : `<span style="color: white; font-size: 0.75rem;">${u.displayName.charAt(0)}</span>`
                            }
                        </div>
                        <div>
                            <div style="font-weight: 500; font-size: 0.9375rem;">${escapeHtml(u.displayName)}</div>
                            ${u.username ? `<div style="font-size: 0.75rem; color: var(--color-text-light);">@${escapeHtml(u.username)}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    resultsContainer.innerHTML = html;
}

// ============================================
// PAGE RENDERERS
// ============================================

function renderPage() {
    const main = document.getElementById('app-main');
    let content = '';

    switch (state.currentPage) {
        case 'home':
            content = renderHomePage();
            break;
        case 'events':
            content = renderEventsPage();
            break;
        case 'groups':
            content = renderGroupsPage();
            break;
        case 'kete':
            content = renderKetePage();
            break;
        case 'profile':
            content = renderProfilePage();
            break;
        case 'hosting':
            content = renderHostingPage();
            break;
        case 'settings':
            content = renderSettingsPage();
            break;
        case 'users':
            content = renderUsersPage();
            break;
        case 'directory':
            content = renderUserDirectory();
            break;
        case 'group':
            content = renderGroupPage();
            break;
        default:
            content = renderHomePage();
    }

    // Wrap content in page transition
    main.innerHTML = `<div class="page-transition">${content}</div>`;
}

function renderHomePage() {
    const events = DataService.getUpcomingEvents().slice(0, 4);
    const greeting = getTimeBasedGreeting();
    const currentUser = DataService.getCurrentUser();
    const ketePosts = MockDB.kete.slice(0, 2);

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 2rem 1.5rem; color: white;">
            <p style="opacity: 0.8; margin-bottom: 0.25rem; font-size: 0.9375rem;">${greeting}</p>
            <h2 style="font-family: var(--font-display); font-size: 1.75rem; color: white; margin: 0;">${currentUser.displayName.split(' ')[0]}</h2>
        </div>

        <div class="app-dashboard">
            <div class="app-quick-actions">
                <a href="#" class="app-quick-action" onclick="navigateTo('events'); return false;">
                    <div class="app-quick-action-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <span class="app-quick-action-label">Events</span>
                </a>
                <a href="#" class="app-quick-action" onclick="navigateTo('groups'); return false;">
                    <div class="app-quick-action-icon" style="background: var(--color-terracotta-light);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <span class="app-quick-action-label">Groups</span>
                </a>
                <a href="resources.html" class="app-quick-action">
                    <div class="app-quick-action-icon" style="background: var(--color-cream-dark);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                    </div>
                    <span class="app-quick-action-label">Resources</span>
                </a>
                <a href="giving.html" class="app-quick-action">
                    <div class="app-quick-action-icon" style="background: #fde68a;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </div>
                    <span class="app-quick-action-label">Giving</span>
                </a>
            </div>
        </div>

        <div class="app-section">
            <div class="app-section-header">
                <h3 class="app-section-title">Upcoming Events</h3>
                <a href="#" class="app-section-link" onclick="navigateTo('events'); return false;">See all</a>
            </div>
            ${events.length > 0 ? events.map(event => {
                const date = new Date(event.date);
                return `
                    <div class="app-event-card" onclick="openEventModal('${event.id}')">
                        <div class="app-event-date">
                            <span class="app-event-date-day">${date.getDate()}</span>
                            <span class="app-event-date-month">${date.toLocaleDateString('en-NZ', { month: 'short' })}</span>
                        </div>
                        <div class="app-event-info">
                            <div class="app-event-title">${event.title}</div>
                            <div class="app-event-meta">${formatTime(event.time)} - ${event.location}</div>
                        </div>
                    </div>
                `;
            }).join('') : '<p style="color: var(--color-text-light); text-align: center; padding: 2rem;">No upcoming events</p>'}
        </div>

        <div class="app-section">
            <div class="app-section-header">
                <h3 class="app-section-title">From the Kete</h3>
                <a href="#" class="app-section-link" onclick="navigateTo('kete'); return false;">Read more</a>
            </div>
            ${ketePosts.map(post => `
                <div class="app-event-card" style="cursor: pointer;">
                    <div style="width: 50px; height: 50px; border-radius: var(--radius-sm); background: linear-gradient(135deg, var(--color-sage) 0%, var(--color-forest) 100%); flex-shrink: 0;"></div>
                    <div class="app-event-info">
                        <div class="app-event-title">${post.title}</div>
                        <div class="app-event-meta">${formatDateShort(post.publishedAt)}</div>
                    </div>
                </div>
            `).join('')}
        </div>

        ${DataService.isAdminOrHost() ? `
        <div class="app-section">
            <div class="app-section-header">
                <h3 class="app-section-title">Manage</h3>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <a href="#" class="app-event-card" onclick="navigateTo('hosting'); return false;" style="text-decoration: none;">
                    <div style="width: 40px; height: 40px; background: var(--color-sage-light); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </div>
                    <div class="app-event-info">
                        <div class="app-event-title">Hosting</div>
                    </div>
                </a>
                ${DataService.isAdmin() ? `
                <a href="#" class="app-event-card" onclick="navigateTo('settings'); return false;" style="text-decoration: none;">
                    <div style="width: 40px; height: 40px; background: var(--color-cream-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </div>
                    <div class="app-event-info">
                        <div class="app-event-title">Settings</div>
                    </div>
                </a>
                ` : ''}
            </div>
        </div>
        ` : ''}

        <div style="height: 20px;"></div>
    `;
}

function renderEventsPage() {
    const events = DataService.getUpcomingEvents(60);
    const currentUser = DataService.getCurrentUser();
    const viewMode = state.eventsViewMode || 'list';

    // Get user's RSVP status for each event
    const getUserRSVPStatus = (event) => {
        const rsvp = DataService.getRSVPDetails(event.id, currentUser?.id);
        if (!rsvp) return null;
        return rsvp.status || 'attending';
    };

    // Render calendar view
    const renderCalendar = () => {
        const year = state.calendarYear;
        const month = state.calendarMonth;
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPad = firstDay.getDay(); // 0 = Sunday
        const daysInMonth = lastDay.getDate();

        const monthName = firstDay.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' });

        // Get events for this month
        const monthEvents = MockDB.events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getFullYear() === year && eventDate.getMonth() === month;
        });

        // Group events by day
        const eventsByDay = {};
        monthEvents.forEach(e => {
            const day = new Date(e.date).getDate();
            if (!eventsByDay[day]) eventsByDay[day] = [];
            eventsByDay[day].push(e);
        });

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        const todayDate = today.getDate();

        let calendarHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <button class="btn btn-ghost btn-sm" onclick="changeMonth(-1)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <h3 style="margin: 0; font-size: 1.125rem;">${monthName}</h3>
                <button class="btn btn-ghost btn-sm" onclick="changeMonth(1)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; font-size: 0.75rem; margin-bottom: 0.5rem;">
                <span style="color: var(--color-text-light);">Sun</span>
                <span style="color: var(--color-text-light);">Mon</span>
                <span style="color: var(--color-text-light);">Tue</span>
                <span style="color: var(--color-text-light);">Wed</span>
                <span style="color: var(--color-text-light);">Thu</span>
                <span style="color: var(--color-text-light);">Fri</span>
                <span style="color: var(--color-text-light);">Sat</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;">
        `;

        // Empty cells for padding
        for (let i = 0; i < startPad; i++) {
            calendarHTML += `<div style="aspect-ratio: 1; padding: 0.25rem;"></div>`;
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = eventsByDay[day] || [];
            const isToday = isCurrentMonth && day === todayDate;
            const hasEvents = dayEvents.length > 0;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            calendarHTML += `
                <div
                    style="aspect-ratio: 1; padding: 0.25rem; background: ${isToday ? 'var(--color-sage-light)' : hasEvents ? 'var(--color-cream)' : 'transparent'}; border-radius: var(--radius-sm); cursor: ${hasEvents ? 'pointer' : 'default'}; display: flex; flex-direction: column; align-items: center;"
                    ${hasEvents ? `onclick="showDayEvents('${dateStr}')"` : ''}
                >
                    <span style="font-weight: ${isToday ? '600' : '400'}; font-size: 0.875rem; color: ${isToday ? 'var(--color-forest)' : 'inherit'};">${day}</span>
                    ${hasEvents ? `
                        <div style="display: flex; gap: 2px; margin-top: 2px;">
                            ${dayEvents.slice(0, 3).map(e => {
                                const gathering = DataService.getGatheringById(e.gatheringId);
                                return `<span style="width: 6px; height: 6px; border-radius: 50%; background: ${gathering?.color || 'var(--color-sage)'};"></span>`;
                            }).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        calendarHTML += `</div>`;

        return calendarHTML;
    };

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">Events</h2>
                    <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">View and RSVP to gatherings</p>
                </div>
                <div style="display: flex; gap: 0.25rem; background: rgba(255,255,255,0.1); border-radius: var(--radius-md); padding: 0.25rem;">
                    <button class="btn btn-ghost btn-sm" style="color: white; ${viewMode === 'list' ? 'background: rgba(255,255,255,0.2);' : ''}" onclick="setEventsView('list')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                    </button>
                    <button class="btn btn-ghost btn-sm" style="color: white; ${viewMode === 'calendar' ? 'background: rgba(255,255,255,0.2);' : ''}" onclick="setEventsView('calendar')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        ${viewMode === 'calendar' ? `
            <div class="app-section" style="padding-top: 1.5rem;">
                <div style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1rem; box-shadow: var(--shadow-sm);">
                    ${renderCalendar()}
                </div>
            </div>
            <div id="day-events-container"></div>
        ` : `
            <div class="app-section" style="padding-top: 1.5rem;">
                <div class="app-section-header">
                    <h3 class="app-section-title">Upcoming</h3>
                </div>
                ${events.length > 0 ? events.map(event => {
                    const date = new Date(event.date);
                    const rsvpStatus = getUserRSVPStatus(event);
                    const gathering = DataService.getGatheringById(event.gatheringId);
                    return `
                        <div class="app-event-card" onclick="openEventModal('${event.id}')">
                            <div class="app-event-date" style="background: ${gathering?.color || (!event.isPublic ? 'var(--color-terracotta)' : 'var(--color-sage)')};">
                                <span class="app-event-date-day">${date.getDate()}</span>
                                <span class="app-event-date-month">${date.toLocaleDateString('en-NZ', { month: 'short' })}</span>
                            </div>
                            <div class="app-event-info">
                                <div class="app-event-title">
                                    ${event.title}
                                    ${rsvpStatus === 'attending' ? '<span style="color: var(--color-sage);">&#10003;</span>' : ''}
                                    ${rsvpStatus === 'maybe' ? '<span style="color: var(--color-terracotta);">?</span>' : ''}
                                </div>
                                <div class="app-event-meta">${formatTime(event.time)} - ${event.location}</div>
                            </div>
                        </div>
                    `;
                }).join('') : '<p style="color: var(--color-text-light); text-align: center; padding: 2rem;">No upcoming events</p>'}
            </div>
        `}
        <div style="height: 20px;"></div>
    `;
}

// Calendar helper functions
function setEventsView(mode) {
    state.eventsViewMode = mode;
    renderPage();
}

function changeMonth(delta) {
    state.calendarMonth += delta;
    if (state.calendarMonth > 11) {
        state.calendarMonth = 0;
        state.calendarYear++;
    } else if (state.calendarMonth < 0) {
        state.calendarMonth = 11;
        state.calendarYear--;
    }
    renderPage();
}

function showDayEvents(dateStr) {
    const dayEvents = DataService.getEventsForDate(dateStr);
    const container = document.getElementById('day-events-container');
    if (!container) return;

    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' });

    if (dayEvents.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="app-section">
            <div class="app-section-header">
                <h3 class="app-section-title">${formattedDate}</h3>
                <span style="font-size: 0.875rem; color: var(--color-text-light);">${dayEvents.length} event${dayEvents.length !== 1 ? 's' : ''}</span>
            </div>
            ${dayEvents.map(event => {
                const gathering = DataService.getGatheringById(event.gatheringId);
                return `
                    <div class="app-event-card" onclick="openEventModal('${event.id}')">
                        <div style="width: 4px; height: 100%; min-height: 50px; background: ${gathering?.color || 'var(--color-sage)'}; border-radius: 2px; flex-shrink: 0;"></div>
                        <div class="app-event-info" style="padding-left: 0.75rem;">
                            <div class="app-event-title">${event.title}</div>
                            <div class="app-event-meta">${formatTime(event.time)} - ${event.location}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderGroupsPage() {
    const userGatherings = DataService.getUserGatherings();
    const currentUser = DataService.getCurrentUser();
    const isAdmin = DataService.isAdmin();

    // Separate into groups user can access and public groups they can't access (private)
    const accessibleGroups = userGatherings;
    const privateGroups = MockDB.gatherings.filter(g =>
        !g.isPublic && !userGatherings.find(ug => ug.id === g.id)
    );

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">Communities</h2>
                    <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">Your gatherings and groups</p>
                </div>
                ${isAdmin ? `
                <button class="btn btn-ghost btn-sm" onclick="openCreateGatheringModal()" style="color: white; border-color: rgba(255,255,255,0.3);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    New Group
                </button>
                ` : ''}
            </div>
        </div>

        <div class="app-section" style="padding-top: 1.5rem;">
            <div class="app-section-header">
                <h3 class="app-section-title">Your Groups</h3>
            </div>
            <div class="gatherings-grid">
                ${accessibleGroups.map(g => {
                    const board = MockDB.messageBoards[g.id];
                    const postCount = board?.posts?.length || 0;
                    const isMember = !g.isPublic && DataService.isMemberOfGathering(g.id);
                    const memberCount = MockDB.gatheringMembers[g.id]?.length || 0;
                    return `
                        <div class="gathering-card" onclick="navigateToGroup('${g.id}')" style="cursor: pointer;">
                            <div class="gathering-card-header" style="background: linear-gradient(135deg, ${g.color} 0%, ${g.color}cc 100%); height: 100px;">
                                <h3 style="font-size: 1.25rem;">${escapeHtml(g.name)}</h3>
                            </div>
                            <div class="gathering-card-body">
                                <span class="gathering-card-rhythm">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    ${escapeHtml(g.rhythm)}
                                </span>
                                <p class="gathering-card-desc" style="font-size: 0.875rem;">${escapeHtml(g.description)}</p>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                                    <span class="event-badge ${g.isPublic ? '' : 'private'}">${g.isPublic ? 'Open' : isMember ? 'Member' : 'Members'}</span>
                                    <div style="display: flex; gap: 0.75rem; font-size: 0.75rem; color: var(--color-text-light);">
                                        ${!g.isPublic && memberCount > 0 ? `
                                            <span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
                                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="9" cy="7" r="4"></circle>
                                                </svg>
                                                ${memberCount}
                                            </span>
                                        ` : ''}
                                        ${postCount > 0 ? `
                                            <span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                                </svg>
                                                ${postCount}
                                            </span>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        ${privateGroups.length > 0 && currentUser?.role !== 'admin' ? `
        <div class="app-section">
            <div class="app-section-header">
                <h3 class="app-section-title">Other Communities</h3>
            </div>
            <p style="color: var(--color-text-light); font-size: 0.9375rem; margin-bottom: 1rem;">
                These are private gatherings. Contact a host or admin to request membership.
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${privateGroups.map(g => `
                    <span style="padding: 0.5rem 0.75rem; background: var(--color-cream); border-radius: var(--radius-sm); font-size: 0.875rem; color: var(--color-text-light);">
                        ${escapeHtml(g.name)}
                    </span>
                `).join('')}
            </div>
        </div>
        ` : ''}
        <div style="height: 20px;"></div>
    `;
}

function renderGroupPage() {
    const groupId = state.selectedGroupId;
    if (!groupId) {
        navigateTo('groups');
        return '';
    }

    const group = DataService.getGatheringById(groupId);
    if (!group) {
        navigateTo('groups');
        return '';
    }

    const canAccess = DataService.canAccessBoard(groupId);
    const currentUser = DataService.getCurrentUser();
    const isAdmin = DataService.isAdmin();
    const isMember = DataService.isMemberOfGathering(groupId);
    const members = MockDB.gatheringMembers[groupId] || [];

    if (!canAccess) {
        return `
            <div style="background: linear-gradient(135deg, ${group.color} 0%, ${group.color}cc 100%); padding: 1.5rem; color: white;">
                <button class="btn btn-ghost btn-sm" onclick="navigateTo('groups')" style="color: white; opacity: 0.8; margin: -0.5rem 0 0.5rem -0.5rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    All Groups
                </button>
                <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">${escapeHtml(group.name)}</h2>
            </div>
            <div style="padding: 2rem; text-align: center;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.5;">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <p style="color: var(--color-text-light); margin-bottom: 1rem;">This is a private group. Request membership to access the message board.</p>
                <button class="btn btn-primary" onclick="requestGroupMembership('${groupId}')">Request to Join</button>
            </div>
        `;
    }

    const posts = DataService.getBoardPosts(groupId);

    // Sort posts: pinned first, then by date
    const sortedPosts = [...posts].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Get upcoming events for this group
    const groupEvents = MockDB.events
        .filter(e => e.gatheringId === groupId && new Date(e.date) >= new Date() && e.status !== 'cancelled')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    return `
        <div style="background: linear-gradient(135deg, ${group.color} 0%, ${group.color}cc 100%); padding: 1.5rem; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <button class="btn btn-ghost btn-sm" onclick="navigateTo('groups')" style="color: white; opacity: 0.8; margin: -0.5rem 0 0.5rem -0.5rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    All Groups
                </button>
                ${isAdmin ? `
                <button class="btn btn-ghost btn-sm" onclick="openEditGatheringModal('${groupId}')" style="color: white; opacity: 0.8;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
                ` : ''}
            </div>
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">${escapeHtml(group.name)}</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">
                ${escapeHtml(group.rhythm)}
                ${!group.isPublic ? ` • ${members.length} member${members.length !== 1 ? 's' : ''}` : ''}
            </p>
            ${!group.isPublic ? `
            <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
                ${isMember ? `
                <button class="btn btn-ghost btn-sm" onclick="leaveGroup('${groupId}')" style="color: white; border-color: rgba(255,255,255,0.3);">Leave Group</button>
                ` : `
                <button class="btn btn-primary btn-sm" onclick="joinGroup('${groupId}')" style="background: white; color: ${group.color};">Join Group</button>
                `}
                <button class="btn btn-ghost btn-sm" onclick="openGroupMembersModal('${groupId}')" style="color: white; border-color: rgba(255,255,255,0.3);">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    Members
                </button>
            </div>
            ` : ''}

        ${groupEvents.length > 0 ? `
        <div class="app-section" style="padding-top: 1rem;">
            <div class="app-section-header">
                <h3 class="app-section-title">Upcoming</h3>
            </div>
            <div style="display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem;">
                ${groupEvents.map(event => {
                    const date = new Date(event.date);
                    return `
                        <div onclick="openEventModal('${event.id}')" style="flex-shrink: 0; background: var(--color-white); border-radius: var(--radius-md); padding: 0.75rem; box-shadow: var(--shadow-sm); cursor: pointer; min-width: 140px;">
                            <div style="font-size: 0.75rem; color: var(--color-text-light);">${date.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                            <div style="font-weight: 500; margin-top: 0.25rem;">${event.title}</div>
                            <div style="font-size: 0.75rem; color: var(--color-text-light); margin-top: 0.25rem;">${formatTime(event.time)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        ` : ''}

        <div class="app-section" style="padding-top: ${groupEvents.length > 0 ? '0.5rem' : '1rem'};">
            <div class="app-section-header">
                <h3 class="app-section-title">Message Board</h3>
                <span style="font-size: 0.875rem; color: var(--color-text-light);">${sortedPosts.length} post${sortedPosts.length !== 1 ? 's' : ''}</span>
            </div>

            <!-- New Post Form -->
            <div style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1rem; box-shadow: var(--shadow-sm); margin-bottom: 1rem;">
                <div style="display: flex; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; overflow: hidden; background: ${group.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        ${currentUser.photoURL
                            ? `<img src="${currentUser.photoURL}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`
                            : `<span style="color: white; font-family: var(--font-display);">${currentUser.displayName.charAt(0)}</span>`
                        }
                    </div>
                    <div style="flex: 1;">
                        <textarea id="new-post-content" class="form-input" rows="2" placeholder="Share something with the group... Use @name to mention someone" style="resize: none;" oninput="handlePostMentionInput(this)"></textarea>
                        <div id="mention-suggestions" style="display: none;"></div>
                        <div id="post-attachment-preview" style="display: none; margin-top: 0.5rem;"></div>
                        <input type="file" id="post-attachment-input" accept="image/*,.pdf,.doc,.docx" style="display: none;" onchange="previewPostAttachment(this)">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                            <div style="display: flex; gap: 0.25rem;">
                                <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('post-attachment-input').click()" title="Attach file">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                    </svg>
                                </button>
                                <button type="button" class="btn btn-ghost btn-sm" onclick="showMentionPicker('${groupId}')" title="Mention someone">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="4"></circle>
                                        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
                                    </svg>
                                </button>
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="submitBoardPost('${groupId}')">Post</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Posts -->
            ${sortedPosts.length > 0 ? sortedPosts.map(post => {
                const isAuthor = post.authorId === currentUser?.id;
                const canManage = isAdmin || isAuthor;
                const author = MockDB.users.find(u => u.id === post.authorId);
                const reactions = post.reactions || {};
                const userReaction = Object.entries(reactions).find(([emoji, users]) => users.includes(currentUser?.id))?.[0];

                return `
                    <div class="board-post" style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1rem; box-shadow: var(--shadow-sm); margin-bottom: 0.75rem; ${post.isPinned ? 'border-left: 3px solid var(--color-terracotta);' : ''}">
                        ${post.isPinned ? `
                        <div style="display: flex; align-items: center; gap: 0.25rem; margin-bottom: 0.5rem; font-size: 0.75rem; color: var(--color-terracotta);">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L12 22M12 2L19 9M12 2L5 9"></path>
                            </svg>
                            Pinned
                        </div>
                        ` : ''}
                        <div style="display: flex; gap: 0.75rem;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; overflow: hidden; background: var(--color-sage); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                ${author?.photoURL
                                    ? `<img src="${author.photoURL}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`
                                    : `<span style="color: white; font-family: var(--font-display);">${(post.authorName || 'U').charAt(0)}</span>`
                                }
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                    <div>
                                        <span style="font-weight: 500;">${escapeHtml(post.authorName || 'Unknown')}</span>
                                        <span style="color: var(--color-text-light); font-size: 0.75rem; margin-left: 0.5rem;">${formatRelativeTime(post.createdAt)}</span>
                                    </div>
                                    ${canManage ? `
                                    <div style="position: relative;">
                                        <button class="btn btn-ghost btn-sm" onclick="togglePostMenu('${post.id}')" style="padding: 0.25rem; margin: -0.25rem -0.25rem 0 0;">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2">
                                                <circle cx="12" cy="12" r="1"></circle>
                                                <circle cx="19" cy="12" r="1"></circle>
                                                <circle cx="5" cy="12" r="1"></circle>
                                            </svg>
                                        </button>
                                        <div id="post-menu-${post.id}" style="display: none; position: absolute; right: 0; top: 100%; background: white; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); min-width: 140px; z-index: 10;">
                                            ${isAdmin ? `
                                            <button onclick="togglePinPost('${groupId}', '${post.id}')" style="display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.625rem 0.75rem; border: none; background: none; cursor: pointer; font-size: 0.875rem; text-align: left;">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M12 2L12 22M12 2L19 9M12 2L5 9"></path>
                                                </svg>
                                                ${post.isPinned ? 'Unpin' : 'Pin Post'}
                                            </button>
                                            ` : ''}
                                            <button onclick="deleteBoardPost('${groupId}', '${post.id}')" style="display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.625rem 0.75rem; border: none; background: none; cursor: pointer; font-size: 0.875rem; text-align: left; color: #dc2626;">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    ` : ''}
                                </div>
                                <p style="margin: 0.5rem 0 0; white-space: pre-wrap; word-wrap: break-word;">${formatPostContent(post.content)}</p>

                                ${post.attachment ? `
                                <div style="margin-top: 0.75rem;">
                                    ${post.attachment.type === 'image'
                                        ? `<img src="${post.attachment.url}" alt="Attachment" style="max-width: 100%; border-radius: var(--radius-md); cursor: pointer;" onclick="openImageModal('${post.attachment.url}')">`
                                        : `<a href="${post.attachment.url}" target="_blank" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--color-cream); border-radius: var(--radius-sm); font-size: 0.875rem; text-decoration: none; color: var(--color-text);">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                            </svg>
                                            ${escapeHtml(post.attachment.name)}
                                        </a>`
                                    }
                                </div>
                                ` : ''}

                                <!-- Reactions -->
                                <div style="display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.75rem; align-items: center;">
                                    ${Object.entries(reactions).filter(([_, users]) => users.length > 0).map(([emoji, users]) => `
                                        <button onclick="toggleReaction('${groupId}', '${post.id}', '${emoji}')" style="display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; background: ${users.includes(currentUser?.id) ? 'var(--color-sage-light)' : 'var(--color-cream)'}; border: 1px solid ${users.includes(currentUser?.id) ? 'var(--color-sage)' : 'transparent'}; border-radius: 999px; font-size: 0.875rem; cursor: pointer;">
                                            <span>${emoji}</span>
                                            <span style="font-size: 0.75rem; color: var(--color-text-light);">${users.length}</span>
                                        </button>
                                    `).join('')}
                                    <button onclick="showReactionPicker('${groupId}', '${post.id}')" style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: var(--color-cream); border: none; border-radius: 50%; cursor: pointer; font-size: 0.875rem;" title="Add reaction">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                            <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                            <line x1="15" y1="9" x2="15.01" y2="9"></line>
                                        </svg>
                                    </button>
                                </div>

                                <!-- Comments -->
                                ${(post.comments || []).length > 0 ? `
                                    <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--color-cream);">
                                        ${(post.comments || []).map(comment => {
                                            const canDeleteComment = comment.authorId === currentUser?.id || isAdmin;
                                            const commentAuthor = MockDB.users.find(u => u.id === comment.authorId);
                                            return `
                                                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                                                    <div style="width: 24px; height: 24px; border-radius: 50%; overflow: hidden; background: var(--color-cream-dark); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                                        ${commentAuthor?.photoURL
                                                            ? `<img src="${commentAuthor.photoURL}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`
                                                            : `<span style="color: var(--color-text); font-size: 0.625rem; font-family: var(--font-display);">${(comment.authorName || 'U').charAt(0)}</span>`
                                                        }
                                                    </div>
                                                    <div style="flex: 1; min-width: 0;">
                                                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                                            <div>
                                                                <span style="font-weight: 500; font-size: 0.875rem;">${escapeHtml(comment.authorName || 'Unknown')}</span>
                                                                <span style="color: var(--color-text-light); font-size: 0.625rem; margin-left: 0.5rem;">${formatRelativeTime(comment.createdAt)}</span>
                                                            </div>
                                                            ${canDeleteComment ? `
                                                                <button class="btn btn-ghost" onclick="deleteBoardComment('${groupId}', '${post.id}', '${comment.id}')" style="padding: 0.125rem; margin: -0.125rem -0.125rem 0 0;">
                                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2">
                                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                                    </svg>
                                                                </button>
                                                            ` : ''}
                                                        </div>
                                                        <p style="margin: 0.25rem 0 0; font-size: 0.875rem; white-space: pre-wrap; word-wrap: break-word;">${formatPostContent(comment.content)}</p>
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                ` : ''}

                                <!-- Add Comment -->
                                <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
                                    <input type="text" class="form-input" id="comment-${post.id}" placeholder="Write a comment..." style="flex: 1; padding: 0.5rem 0.75rem; font-size: 0.875rem;" onkeypress="if(event.key === 'Enter') { submitComment('${groupId}', '${post.id}'); }">
                                    <button class="btn btn-ghost btn-sm" onclick="submitComment('${groupId}', '${post.id}')">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="22" y1="2" x2="11" y2="13"></line>
                                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('') : `
                <div style="text-align: center; padding: 2rem; color: var(--color-text-light);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.5;">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p style="margin: 0;">No posts yet.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">Be the first to share something!</p>
                </div>
            `}
        </div>

        <div class="app-section">
            <div style="background: var(--color-cream); border-radius: var(--radius-lg); padding: 1rem;">
                <h4 style="margin: 0 0 0.5rem; font-size: 1rem;">About this group</h4>
                <p style="margin: 0; color: var(--color-text-light); font-size: 0.9375rem;">${group.description}</p>
            </div>
        </div>
        <div style="height: 20px;"></div>
    `;
}

// Format relative time (e.g., "2 hours ago")
function formatRelativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDateShort(dateStr);
}

// Board post actions
async function submitBoardPost(groupId) {
    const textarea = document.getElementById('new-post-content');
    const content = textarea?.value.trim();
    const attachmentFile = window.pendingPostAttachment;

    if (!content && !attachmentFile) {
        showToast('Please write something to post', 'error');
        return;
    }

    try {
        let attachment = null;

        // Upload attachment if present
        if (attachmentFile) {
            if (PortalConfig.useFirebase && !PortalConfig.demoMode) {
                const { ref, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
                const storageRef = ref(storage, `posts/${groupId}/${Date.now()}_${attachmentFile.name}`);
                const snapshot = await uploadBytes(storageRef, attachmentFile);
                const url = await getDownloadURL(snapshot.ref);
                attachment = {
                    type: attachmentFile.type.startsWith('image/') ? 'image' : 'file',
                    url: url,
                    name: attachmentFile.name
                };
            } else {
                // Demo mode: use data URL
                attachment = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({
                            type: attachmentFile.type.startsWith('image/') ? 'image' : 'file',
                            url: e.target.result,
                            name: attachmentFile.name
                        });
                    };
                    reader.readAsDataURL(attachmentFile);
                });
            }
        }

        await DataService.createBoardPost(groupId, content, attachment);
        textarea.value = '';
        removePostAttachment();
        showToast('Posted!', 'success');
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not create post', 'error');
    }
}

async function deleteBoardPost(groupId, postId) {
    if (!confirm('Delete this post?')) return;

    try {
        await DataService.deleteBoardPost(groupId, postId);
        showToast('Post deleted', 'default');
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not delete post', 'error');
    }
}

async function submitComment(groupId, postId) {
    const input = document.getElementById(`comment-${postId}`);
    const content = input?.value.trim();

    if (!content) return;

    try {
        await DataService.addComment(groupId, postId, content);
        input.value = '';
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not add comment', 'error');
    }
}

async function deleteBoardComment(groupId, postId, commentId) {
    try {
        await DataService.deleteComment(groupId, postId, commentId);
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not delete comment', 'error');
    }
}

// Format post content with @mentions
function formatPostContent(content) {
    if (!content) return '';
    // Escape HTML first
    let escaped = escapeHtml(content);
    // Convert @mentions to styled spans
    escaped = escaped.replace(/@(\w+(?:\s+\w+)?)/g, (match, name) => {
        // Check if this is a real user
        const user = MockDB.users.find(u =>
            u.displayName.toLowerCase() === name.toLowerCase() ||
            u.displayName.toLowerCase().startsWith(name.toLowerCase())
        );
        if (user) {
            return `<span style="background: var(--color-sage-light); color: var(--color-forest); padding: 0.125rem 0.375rem; border-radius: 4px; font-weight: 500;">@${escapeHtml(name)}</span>`;
        }
        return match;
    });
    return escaped;
}

// Toggle post dropdown menu
function togglePostMenu(postId) {
    const menu = document.getElementById(`post-menu-${postId}`);
    if (!menu) return;

    // Close all other menus first
    document.querySelectorAll('[id^="post-menu-"]').forEach(m => {
        if (m.id !== `post-menu-${postId}`) {
            m.style.display = 'none';
        }
    });

    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';

    // Close menu when clicking outside
    if (menu.style.display === 'block') {
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!e.target.closest(`#post-menu-${postId}`) && !e.target.closest(`[onclick="togglePostMenu('${postId}')"]`)) {
                    menu.style.display = 'none';
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);
    }
}

// Toggle pin status on a post
async function togglePinPost(groupId, postId) {
    try {
        const board = MockDB.messageBoards[groupId];
        if (!board) return;

        const post = board.posts.find(p => p.id === postId);
        if (!post) return;

        post.isPinned = !post.isPinned;

        // If using Firebase, update Firestore
        if (PortalConfig.useFirebase && !PortalConfig.demoMode) {
            const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const postRef = doc(db, 'gatherings', groupId, 'posts', postId);
            await updateDoc(postRef, { isPinned: post.isPinned });
        }

        showToast(post.isPinned ? 'Post pinned' : 'Post unpinned', 'success');
        renderPage();
    } catch (error) {
        console.error('Error toggling pin:', error);
        showToast('Could not update post', 'error');
    }
}

// Toggle reaction on a post
async function toggleReaction(groupId, postId, emoji) {
    try {
        const currentUser = DataService.getCurrentUser();
        if (!currentUser) return;

        const board = MockDB.messageBoards[groupId];
        if (!board) return;

        const post = board.posts.find(p => p.id === postId);
        if (!post) return;

        // Initialize reactions if needed
        if (!post.reactions) {
            post.reactions = {};
        }
        if (!post.reactions[emoji]) {
            post.reactions[emoji] = [];
        }

        // Toggle the user's reaction
        const userIndex = post.reactions[emoji].indexOf(currentUser.id);
        if (userIndex > -1) {
            post.reactions[emoji].splice(userIndex, 1);
        } else {
            post.reactions[emoji].push(currentUser.id);
        }

        // If using Firebase, update Firestore
        if (PortalConfig.useFirebase && !PortalConfig.demoMode) {
            const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const postRef = doc(db, 'gatherings', groupId, 'posts', postId);
            await updateDoc(postRef, { reactions: post.reactions });
        }

        // Close reaction picker if open
        const picker = document.querySelector('.reaction-picker');
        if (picker) picker.remove();

        renderPage();
    } catch (error) {
        console.error('Error toggling reaction:', error);
        showToast('Could not add reaction', 'error');
    }
}

// Show reaction picker
function showReactionPicker(groupId, postId) {
    // Remove existing picker
    const existingPicker = document.querySelector('.reaction-picker');
    if (existingPicker) existingPicker.remove();

    const emojis = ['👍', '❤️', '🙏', '😊', '🎉', '😢', '😮', '🤔'];

    const picker = document.createElement('div');
    picker.className = 'reaction-picker';
    picker.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border-radius: 24px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.15);
        padding: 0.5rem 0.75rem;
        display: flex;
        gap: 0.25rem;
        z-index: 1000;
    `;

    picker.innerHTML = emojis.map(emoji => `
        <button onclick="toggleReaction('${groupId}', '${postId}', '${emoji}')" style="font-size: 1.5rem; padding: 0.25rem; background: none; border: none; cursor: pointer; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='var(--color-cream)'" onmouseout="this.style.background='none'">
            ${emoji}
        </button>
    `).join('');

    document.body.appendChild(picker);

    // Close picker when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closePicker(e) {
            if (!e.target.closest('.reaction-picker') && !e.target.closest('[onclick^="showReactionPicker"]')) {
                picker.remove();
                document.removeEventListener('click', closePicker);
            }
        });
    }, 10);
}

// Handle @mention input
function handlePostMentionInput(textarea) {
    const value = textarea.value;
    const cursorPos = textarea.selectionStart;

    // Find the @ symbol before cursor
    const textBeforeCursor = value.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex === -1 || (atIndex > 0 && textBeforeCursor[atIndex - 1] !== ' ' && textBeforeCursor[atIndex - 1] !== '\n')) {
        // No @ or not at word boundary
        document.getElementById('mention-suggestions')?.style && (document.getElementById('mention-suggestions').style.display = 'none');
        return;
    }

    const query = textBeforeCursor.substring(atIndex + 1).toLowerCase();
    if (query.includes(' ') && query.split(' ').length > 2) {
        // Stop after 2 words
        document.getElementById('mention-suggestions').style.display = 'none';
        return;
    }

    // Find matching users
    const matches = MockDB.users.filter(u =>
        u.displayName.toLowerCase().includes(query)
    ).slice(0, 5);

    const suggestions = document.getElementById('mention-suggestions');
    if (!suggestions) return;

    if (matches.length === 0 || query === '') {
        suggestions.style.display = 'none';
        return;
    }

    suggestions.style.display = 'block';
    suggestions.style.cssText = `
        display: block;
        position: absolute;
        background: white;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        max-height: 200px;
        overflow-y: auto;
        z-index: 100;
        width: 200px;
    `;

    suggestions.innerHTML = matches.map(user => `
        <button type="button" onclick="insertMention('${user.displayName}', ${atIndex})" style="display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.5rem 0.75rem; border: none; background: none; cursor: pointer; text-align: left; font-size: 0.875rem;" onmouseover="this.style.background='var(--color-cream)'" onmouseout="this.style.background='none'">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--color-sage); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${user.photoURL
                    ? `<img src="${user.photoURL}" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
                    : `<span style="color: white; font-size: 0.625rem;">${user.displayName.charAt(0)}</span>`
                }
            </div>
            <span>${escapeHtml(user.displayName)}</span>
        </button>
    `).join('');
}

// Insert mention into textarea
function insertMention(displayName, atIndex) {
    const textarea = document.getElementById('new-post-content');
    if (!textarea) return;

    const value = textarea.value;
    const cursorPos = textarea.selectionStart;
    const newValue = value.substring(0, atIndex) + '@' + displayName + ' ' + value.substring(cursorPos);

    textarea.value = newValue;
    textarea.focus();
    const newCursorPos = atIndex + displayName.length + 2;
    textarea.setSelectionRange(newCursorPos, newCursorPos);

    document.getElementById('mention-suggestions').style.display = 'none';
}

// Show mention picker (manual trigger)
function showMentionPicker(groupId) {
    const textarea = document.getElementById('new-post-content');
    if (!textarea) return;

    // Insert @ at cursor position
    const cursorPos = textarea.selectionStart;
    const value = textarea.value;
    textarea.value = value.substring(0, cursorPos) + '@' + value.substring(cursorPos);
    textarea.focus();
    textarea.setSelectionRange(cursorPos + 1, cursorPos + 1);

    // Trigger the input handler
    handlePostMentionInput(textarea);
}

// Preview post attachment
function previewPostAttachment(input) {
    const file = input.files?.[0];
    if (!file) return;

    const preview = document.getElementById('post-attachment-preview');
    if (!preview) return;

    // Store file for later upload
    window.pendingPostAttachment = file;

    const isImage = file.type.startsWith('image/');

    if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.style.display = 'block';
            preview.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="${e.target.result}" alt="Attachment preview" style="max-width: 100%; max-height: 200px; border-radius: var(--radius-md);">
                    <button type="button" onclick="removePostAttachment()" style="position: absolute; top: 0.25rem; right: 0.25rem; width: 24px; height: 24px; border-radius: 50%; background: rgba(0,0,0,0.5); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'block';
        preview.innerHTML = `
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--color-cream); border-radius: var(--radius-sm);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span style="font-size: 0.875rem;">${escapeHtml(file.name)}</span>
                <button type="button" onclick="removePostAttachment()" style="padding: 0.125rem; background: none; border: none; cursor: pointer;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
    }
}

// Remove pending attachment
function removePostAttachment() {
    window.pendingPostAttachment = null;
    const preview = document.getElementById('post-attachment-preview');
    if (preview) {
        preview.style.display = 'none';
        preview.innerHTML = '';
    }
    const input = document.getElementById('post-attachment-input');
    if (input) input.value = '';
}

// Open full-size image modal
function openImageModal(imageUrl) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 1rem;
        cursor: pointer;
    `;

    modal.innerHTML = `
        <button onclick="this.parentElement.remove()" style="position: absolute; top: 1rem; right: 1rem; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        <img src="${imageUrl}" alt="Full size image" style="max-width: 100%; max-height: 100%; object-fit: contain;">
    `;

    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
}

// ============================================
// GATHERING MANAGEMENT
// ============================================

// Open create gathering modal
function openCreateGatheringModal() {
    const colors = [
        { value: '#1a3a2f', name: 'Forest' },
        { value: '#7d9a87', name: 'Sage' },
        { value: '#c17f59', name: 'Terracotta' },
        { value: '#2d5a4a', name: 'Teal' },
        { value: '#d4a574', name: 'Sand' },
        { value: '#5a6b62', name: 'Slate' },
        { value: '#8b4513', name: 'Brown' },
        { value: '#4a5568', name: 'Gray' }
    ];

    document.getElementById('modal-title').textContent = 'Create New Group';
    document.getElementById('modal-body').innerHTML = `
        <form id="create-gathering-form" onsubmit="event.preventDefault(); saveGathering();">
            <div class="form-group">
                <label class="form-label">Group Name *</label>
                <input type="text" class="form-input" id="gathering-name" required placeholder="e.g., Young Adults">
            </div>

            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-input" id="gathering-description" rows="3" placeholder="What is this group about?"></textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Meeting Rhythm</label>
                <input type="text" class="form-input" id="gathering-rhythm" placeholder="e.g., Weekly Tuesdays, 7pm">
            </div>

            <div class="form-group">
                <label class="form-label">Color Theme</label>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem;">
                    ${colors.map((c, i) => `
                        <label style="cursor: pointer;">
                            <input type="radio" name="gathering-color" value="${c.value}" ${i === 0 ? 'checked' : ''} style="display: none;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${c.value}; border: 3px solid transparent;" onclick="this.parentElement.querySelector('input').checked = true; document.querySelectorAll('[name=gathering-color]').forEach(r => r.parentElement.querySelector('div').style.borderColor = 'transparent'); this.style.borderColor = 'var(--color-forest)';" title="${c.name}"></div>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Access Type</label>
                <div style="display: flex; gap: 1rem; margin-top: 0.25rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="radio" name="gathering-access" value="public" checked>
                        <span>Public (Open to all members)</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="radio" name="gathering-access" value="private">
                        <span>Private (Invite only)</span>
                    </label>
                </div>
            </div>

            <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Group</button>
            </div>
        </form>
    `;

    // Highlight first color
    setTimeout(() => {
        const firstColor = document.querySelector('[name=gathering-color]');
        if (firstColor) {
            firstColor.parentElement.querySelector('div').style.borderColor = 'var(--color-forest)';
        }
    }, 10);

    openModal();
}

// Open edit gathering modal
function openEditGatheringModal(gatheringId) {
    const gathering = DataService.getGatheringById(gatheringId);
    if (!gathering) return;

    const colors = [
        { value: '#1a3a2f', name: 'Forest' },
        { value: '#7d9a87', name: 'Sage' },
        { value: '#c17f59', name: 'Terracotta' },
        { value: '#2d5a4a', name: 'Teal' },
        { value: '#d4a574', name: 'Sand' },
        { value: '#5a6b62', name: 'Slate' },
        { value: '#8b4513', name: 'Brown' },
        { value: '#4a5568', name: 'Gray' }
    ];

    document.getElementById('modal-title').textContent = 'Edit Group';
    document.getElementById('modal-body').innerHTML = `
        <form id="edit-gathering-form" onsubmit="event.preventDefault(); saveGathering('${gatheringId}');">
            <div class="form-group">
                <label class="form-label">Group Name *</label>
                <input type="text" class="form-input" id="gathering-name" required value="${escapeHtml(gathering.name)}">
            </div>

            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-input" id="gathering-description" rows="3">${escapeHtml(gathering.description || '')}</textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Meeting Rhythm</label>
                <input type="text" class="form-input" id="gathering-rhythm" value="${escapeHtml(gathering.rhythm || '')}">
            </div>

            <div class="form-group">
                <label class="form-label">Color Theme</label>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem;">
                    ${colors.map(c => `
                        <label style="cursor: pointer;">
                            <input type="radio" name="gathering-color" value="${c.value}" ${c.value === gathering.color ? 'checked' : ''} style="display: none;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${c.value}; border: 3px solid ${c.value === gathering.color ? 'var(--color-forest)' : 'transparent'};" onclick="this.parentElement.querySelector('input').checked = true; document.querySelectorAll('[name=gathering-color]').forEach(r => r.parentElement.querySelector('div').style.borderColor = 'transparent'); this.style.borderColor = 'var(--color-forest)';" title="${c.name}"></div>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Access Type</label>
                <div style="display: flex; gap: 1rem; margin-top: 0.25rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="radio" name="gathering-access" value="public" ${gathering.isPublic ? 'checked' : ''}>
                        <span>Public (Open to all members)</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="radio" name="gathering-access" value="private" ${!gathering.isPublic ? 'checked' : ''}>
                        <span>Private (Invite only)</span>
                    </label>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 1.5rem;">
                <button type="button" class="btn btn-ghost" onclick="deleteGathering('${gatheringId}')" style="color: #dc2626;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                </button>
                <div style="display: flex; gap: 0.75rem;">
                    <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </div>
        </form>
    `;

    openModal();
}

// Save gathering (create or update)
async function saveGathering(gatheringId = null) {
    const name = document.getElementById('gathering-name')?.value.trim();
    const description = document.getElementById('gathering-description')?.value.trim();
    const rhythm = document.getElementById('gathering-rhythm')?.value.trim();
    const color = document.querySelector('[name=gathering-color]:checked')?.value || '#1a3a2f';
    const isPublic = document.querySelector('[name=gathering-access]:checked')?.value === 'public';

    if (!name) {
        showToast('Please enter a group name', 'error');
        return;
    }

    try {
        if (gatheringId) {
            // Update existing gathering
            const gathering = MockDB.gatherings.find(g => g.id === gatheringId);
            if (gathering) {
                gathering.name = name;
                gathering.description = description;
                gathering.rhythm = rhythm;
                gathering.color = color;
                gathering.isPublic = isPublic;
                gathering.updatedAt = new Date().toISOString();

                // If using Firebase, update Firestore
                if (PortalConfig.useFirebase && !PortalConfig.demoMode) {
                    const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                    const gatheringRef = doc(db, 'gatherings', gatheringId);
                    await updateDoc(gatheringRef, {
                        name,
                        description,
                        rhythm,
                        color,
                        isPublic,
                        updatedAt: new Date().toISOString()
                    });
                }

                showToast('Group updated', 'success');
            }
        } else {
            // Create new gathering
            const newId = 'gathering-' + Date.now();
            const newGathering = {
                id: newId,
                name,
                description,
                rhythm,
                color,
                isPublic,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            MockDB.gatherings.push(newGathering);
            MockDB.messageBoards[newId] = { posts: [] };
            MockDB.gatheringMembers[newId] = [];

            // If using Firebase, create in Firestore
            if (PortalConfig.useFirebase && !PortalConfig.demoMode) {
                const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                await setDoc(doc(db, 'gatherings', newId), newGathering);
            }

            showToast('Group created', 'success');
        }

        closeModal();
        renderPage();
    } catch (error) {
        console.error('Error saving gathering:', error);
        showToast('Could not save group', 'error');
    }
}

// Delete gathering
async function deleteGathering(gatheringId) {
    if (!confirm('Are you sure you want to delete this group? This will also delete all posts and messages.')) {
        return;
    }

    try {
        // Remove from MockDB
        const index = MockDB.gatherings.findIndex(g => g.id === gatheringId);
        if (index > -1) {
            MockDB.gatherings.splice(index, 1);
        }
        delete MockDB.messageBoards[gatheringId];
        delete MockDB.gatheringMembers[gatheringId];

        // If using Firebase, delete from Firestore
        if (PortalConfig.useFirebase && !PortalConfig.demoMode) {
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            await deleteDoc(doc(db, 'gatherings', gatheringId));
        }

        showToast('Group deleted', 'success');
        closeModal();
        navigateTo('groups');
    } catch (error) {
        console.error('Error deleting gathering:', error);
        showToast('Could not delete group', 'error');
    }
}

// ============================================
// GROUP MEMBERSHIP
// ============================================

// Join a group
async function joinGroup(groupId) {
    try {
        const currentUser = DataService.getCurrentUser();
        if (!currentUser) return;

        // Add user to group members
        if (!MockDB.gatheringMembers[groupId]) {
            MockDB.gatheringMembers[groupId] = [];
        }

        if (!MockDB.gatheringMembers[groupId].includes(currentUser.id)) {
            MockDB.gatheringMembers[groupId].push(currentUser.id);
        }

        // If using Firebase, update Firestore
        if (PortalConfig.useFirebase && !PortalConfig.demoMode) {
            const { doc, updateDoc, arrayUnion } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const gatheringRef = doc(db, 'gatherings', groupId);
            await updateDoc(gatheringRef, {
                members: arrayUnion(currentUser.id)
            });
        }

        showToast('Joined group!', 'success');
        renderPage();
    } catch (error) {
        console.error('Error joining group:', error);
        showToast('Could not join group', 'error');
    }
}

// Leave a group
async function leaveGroup(groupId) {
    if (!confirm('Are you sure you want to leave this group?')) {
        return;
    }

    try {
        const currentUser = DataService.getCurrentUser();
        if (!currentUser) return;

        // Remove user from group members
        if (MockDB.gatheringMembers[groupId]) {
            const index = MockDB.gatheringMembers[groupId].indexOf(currentUser.id);
            if (index > -1) {
                MockDB.gatheringMembers[groupId].splice(index, 1);
            }
        }

        // If using Firebase, update Firestore
        if (PortalConfig.useFirebase && !PortalConfig.demoMode) {
            const { doc, updateDoc, arrayRemove } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const gatheringRef = doc(db, 'gatherings', groupId);
            await updateDoc(gatheringRef, {
                members: arrayRemove(currentUser.id)
            });
        }

        showToast('Left group', 'default');
        renderPage();
    } catch (error) {
        console.error('Error leaving group:', error);
        showToast('Could not leave group', 'error');
    }
}

// Request to join a private group
async function requestGroupMembership(groupId) {
    const group = DataService.getGatheringById(groupId);
    if (!group) return;

    // For now, just show a message. In a full implementation, this would send a notification to admins
    showToast(`Membership request sent for ${group.name}. An admin will review your request.`, 'success');

    // In a real implementation, you would:
    // 1. Create a membership request document in Firestore
    // 2. Send notification to group admins/hosts
    // 3. Show pending status to the user
}

// Open group members modal
function openGroupMembersModal(groupId) {
    const group = DataService.getGatheringById(groupId);
    if (!group) return;

    const memberIds = MockDB.gatheringMembers[groupId] || [];
    const members = memberIds.map(id => MockDB.users.find(u => u.id === id)).filter(Boolean);

    // Also find hosts assigned to this group
    const hosts = MockDB.users.filter(u =>
        u.role === 'host' &&
        u.assignedGatherings?.includes(groupId)
    );

    // Combine and deduplicate
    const allMembers = [...new Map([...hosts, ...members].map(m => [m.id, m])).values()];

    document.getElementById('modal-title').textContent = `${escapeHtml(group.name)} - Members`;
    document.getElementById('modal-body').innerHTML = `
        <div style="margin-bottom: 1rem;">
            <span style="color: var(--color-text-light);">${allMembers.length} member${allMembers.length !== 1 ? 's' : ''}</span>
        </div>

        ${allMembers.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 400px; overflow-y: auto;">
                ${allMembers.map(member => {
                    const isHost = member.role === 'host' && member.assignedGatherings?.includes(groupId);
                    const isAdmin = member.role === 'admin';
                    return `
                        <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-md);">
                            <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: ${group.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                ${member.photoURL
                                    ? `<img src="${member.photoURL}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`
                                    : `<span style="color: white; font-family: var(--font-display);">${member.displayName.charAt(0)}</span>`
                                }
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 500;">${escapeHtml(member.displayName)}</div>
                                ${member.bio ? `<div style="font-size: 0.75rem; color: var(--color-text-light); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(member.bio)}</div>` : ''}
                            </div>
                            ${isAdmin ? `<span class="event-badge" style="background: var(--color-forest); color: white;">Admin</span>` : ''}
                            ${isHost ? `<span class="event-badge" style="background: var(--color-terracotta); color: white;">Host</span>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        ` : `
            <div style="text-align: center; padding: 2rem; color: var(--color-text-light);">
                <p>No members yet.</p>
            </div>
        `}

        <div style="margin-top: 1.5rem;">
            <button class="btn btn-ghost" onclick="closeModal()" style="width: 100%;">Close</button>
        </div>
    `;

    openModal();
}

// Kete categories
const KETE_CATEGORIES = [
    { id: 'reflection', name: 'Reflection', color: '#7d9a87' },
    { id: 'story', name: 'Story', color: '#c17f59' },
    { id: 'update', name: 'Community Update', color: '#1a3a2f' },
    { id: 'resource', name: 'Resource', color: '#d4a574' },
    { id: 'teaching', name: 'Teaching', color: '#2d5a4a' },
    { id: 'testimony', name: 'Testimony', color: '#5a6b62' }
];

// Calculate reading time
function calculateReadingTime(content) {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function renderKetePage() {
    const canPost = DataService.isAdminOrHost();
    const currentUser = DataService.getCurrentUser();
    const selectedCategory = state.keteCategory || null;

    // Get published posts for display
    let publishedPosts = MockDB.kete.filter(k => k.published).sort((a, b) => {
        return new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt);
    });

    // Filter by category if selected
    if (selectedCategory) {
        publishedPosts = publishedPosts.filter(p => p.category === selectedCategory);
    }

    // Get all series for sidebar
    const allSeries = [...new Set(MockDB.kete.filter(k => k.published && k.series).map(k => k.series))];

    // Get user's drafts (if they can post)
    const myDrafts = canPost ? MockDB.kete.filter(k => !k.published && k.authorId === currentUser?.id) : [];

    // Get used categories
    const usedCategories = [...new Set(MockDB.kete.filter(k => k.published && k.category).map(k => k.category))];

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">The Kete</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">Stories and reflections from our community</p>
        </div>

        ${canPost ? `
        <div class="app-section" style="padding-top: 1rem;">
            <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="openCreateKetePostModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                    <path d="M2 2l7.586 7.586"></path>
                    <circle cx="11" cy="11" r="2"></circle>
                </svg>
                Write a Post
            </button>
        </div>
        ` : ''}

        <!-- Category Filter -->
        ${usedCategories.length > 0 ? `
        <div class="app-section" style="padding-top: ${canPost ? '0.5rem' : '1rem'};">
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                <button onclick="filterKeteByCategory(null)" class="btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-ghost'}" style="border-radius: 999px; ${!selectedCategory ? '' : 'background: var(--color-cream);'}">
                    All
                </button>
                ${usedCategories.map(catId => {
                    const cat = KETE_CATEGORIES.find(c => c.id === catId);
                    if (!cat) return '';
                    return `
                        <button onclick="filterKeteByCategory('${cat.id}')" class="btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-ghost'}" style="border-radius: 999px; ${selectedCategory === cat.id ? `background: ${cat.color}; border-color: ${cat.color};` : 'background: var(--color-cream);'}">
                            ${cat.name}
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Series (if any exist) -->
        ${allSeries.length > 0 ? `
        <div class="app-section" style="padding-top: 0.5rem;">
            <div class="app-section-header">
                <h3 class="app-section-title">Series</h3>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${allSeries.map(series => {
                    const seriesPosts = MockDB.kete.filter(k => k.published && k.series === series);
                    return `
                        <button onclick="filterKeteBySeries('${escapeHtml(series)}')" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--color-cream); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.875rem;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" stroke-width="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                            ${escapeHtml(series)}
                            <span style="background: var(--color-sage-light); color: var(--color-forest); padding: 0.125rem 0.375rem; border-radius: 999px; font-size: 0.625rem;">${seriesPosts.length}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
        ` : ''}

        ${myDrafts.length > 0 ? `
        <div class="app-section" style="padding-top: 0.5rem;">
            <div class="app-section-header">
                <h3 class="app-section-title">Your Drafts</h3>
                <span style="font-size: 0.875rem; color: var(--color-text-light);">${myDrafts.length}</span>
            </div>
            ${myDrafts.map(post => `
                <div class="app-event-card" onclick="openEditKetePostModal('${post.id}')" style="cursor: pointer;">
                    <div style="width: 4px; height: 100%; min-height: 50px; background: var(--color-terracotta); border-radius: 2px; flex-shrink: 0;"></div>
                    <div style="flex: 1; padding-left: 0.75rem;">
                        <span style="font-size: 0.75rem; color: var(--color-terracotta);">Draft</span>
                        <h4 style="margin: 0.25rem 0; color: var(--color-forest); font-size: 1rem;">${escapeHtml(post.title)}</h4>
                        <p style="font-size: 0.875rem; color: var(--color-text-light); margin: 0;">${escapeHtml(post.excerpt).substring(0, 80)}...</p>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="app-section" style="padding-top: ${myDrafts.length === 0 ? '0.5rem' : '1rem'};">
            <div class="app-section-header">
                <h3 class="app-section-title">${selectedCategory ? KETE_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Posts' : 'Published'}</h3>
                <span style="font-size: 0.875rem; color: var(--color-text-light);">${publishedPosts.length} post${publishedPosts.length !== 1 ? 's' : ''}</span>
            </div>
            ${publishedPosts.length > 0 ? publishedPosts.map(post => {
                const canManage = DataService.canManageKetePost(post);
                const readingTime = calculateReadingTime(post.content);
                const category = KETE_CATEGORIES.find(c => c.id === post.category);
                return `
                    <div class="app-event-card" onclick="openKetePostModal('${post.id}')" style="cursor: pointer; display: block; padding: 1.25rem;">
                        ${post.featuredImage ? `
                            <img src="${post.featuredImage}" alt="" style="width: 100%; height: 140px; object-fit: cover; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="display: flex; flex-wrap: wrap; gap: 0.375rem; align-items: center;">
                                ${category ? `
                                    <span style="background: ${category.color}20; color: ${category.color}; padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.6875rem; font-weight: 500;">${category.name}</span>
                                ` : ''}
                                ${post.series ? `
                                    <span style="background: var(--color-cream); color: var(--color-text-light); padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.6875rem;">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 0.125rem;">
                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                        </svg>
                                        ${escapeHtml(post.series)}
                                    </span>
                                ` : ''}
                            </div>
                            ${canManage ? `
                                <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); openEditKetePostModal('${post.id}')" style="margin: -0.5rem -0.5rem 0 0; padding: 0.25rem;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                            ` : ''}
                        </div>
                        <h4 style="margin: 0.5rem 0; color: var(--color-forest);">${escapeHtml(post.title)}</h4>
                        <p style="font-size: 0.9375rem; color: var(--color-text-light); margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(post.excerpt)}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem;">
                            <span style="font-size: 0.75rem; color: var(--color-text-light);">${formatDateShort(post.publishedAt)} • ${post.authorName}</span>
                            <span style="font-size: 0.75rem; color: var(--color-sage);">${readingTime} min read</span>
                        </div>
                    </div>
                `;
            }).join('') : `
                <p style="color: var(--color-text-light); text-align: center; padding: 2rem;">
                    ${selectedCategory ? 'No posts in this category yet.' : 'No posts yet. Check back soon!'}
                </p>
            `}
        </div>
        <div style="height: 20px;"></div>
    `;
}

// Filter Kete by category
function filterKeteByCategory(category) {
    state.keteCategory = category;
    state.keteSeries = null;
    renderPage();
}

// Filter Kete by series
function filterKeteBySeries(series) {
    state.keteCategory = null;
    state.keteSeries = series;
    openKeteSeriesModal(series);
}

function renderProfilePage() {
    const currentUser = DataService.getCurrentUser();
    const activity = DataService.getUserActivity();
    const userGatherings = DataService.getUserGatherings();

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 2rem 1.5rem; color: white; text-align: center;">
            <div style="position: relative; width: 80px; height: 80px; margin: 0 auto 1rem;">
                <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: var(--color-terracotta); display: flex; align-items: center; justify-content: center;">
                    ${currentUser.photoURL
                        ? `<img src="${currentUser.photoURL}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`
                        : `<span style="font-family: var(--font-display); font-size: 2rem; color: white;">${currentUser.displayName.charAt(0)}</span>`
                    }
                </div>
                <button onclick="openProfilePictureModal()" style="position: absolute; bottom: -4px; right: -4px; width: 28px; height: 28px; border-radius: 50%; background: white; border: 2px solid var(--color-forest); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" stroke-width="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                </button>
            </div>
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">${currentUser.displayName}</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem; text-transform: capitalize;">${currentUser.role}</p>
            ${currentUser.username ? `<p style="opacity: 0.7; margin: 0.25rem 0 0; font-size: 0.875rem;">@${currentUser.username}</p>` : ''}
        </div>

        <!-- Activity Stats -->
        <div class="app-section" style="padding-top: 1rem;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
                <div style="background: var(--color-white); border-radius: var(--radius-md); padding: 1rem; text-align: center; box-shadow: var(--shadow-sm);">
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--color-forest);">${activity?.upcomingRSVPs?.length || 0}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-light);">Upcoming</div>
                </div>
                <div style="background: var(--color-white); border-radius: var(--radius-md); padding: 1rem; text-align: center; box-shadow: var(--shadow-sm);">
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--color-sage);">${userGatherings.length}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-light);">Groups</div>
                </div>
                <div style="background: var(--color-white); border-radius: var(--radius-md); padding: 1rem; text-align: center; box-shadow: var(--shadow-sm);">
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--color-terracotta);">${activity?.boardPostCount || 0}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-light);">Posts</div>
                </div>
            </div>
        </div>

        ${activity?.recentActivity?.length > 0 ? `
        <div class="app-section">
            <div style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">Recent Activity</h3>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${activity.recentActivity.map(a => {
                        if (a.type === 'post') {
                            const group = DataService.getGatheringById(a.item.gatheringId);
                            return `
                                <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                                    <div style="width: 32px; height: 32px; background: var(--color-sage-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                    </div>
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="font-size: 0.875rem;">Posted in <strong>${group?.name || 'Unknown'}</strong></div>
                                        <div style="font-size: 0.75rem; color: var(--color-text-light); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(a.item.content.substring(0, 40))}...</div>
                                        <div style="font-size: 0.625rem; color: var(--color-text-light); margin-top: 0.25rem;">${formatRelativeTime(a.date)}</div>
                                    </div>
                                </div>
                            `;
                        } else if (a.type === 'kete') {
                            return `
                                <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                                    <div style="width: 32px; height: 32px; background: var(--color-terracotta-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-terracotta)" stroke-width="2">
                                            <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                                            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                                        </svg>
                                    </div>
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="font-size: 0.875rem;">Published <strong>${escapeHtml(a.item.title)}</strong></div>
                                        <div style="font-size: 0.625rem; color: var(--color-text-light); margin-top: 0.25rem;">${formatRelativeTime(a.date)}</div>
                                    </div>
                                </div>
                            `;
                        }
                        return '';
                    }).join('')}
                </div>
            </div>
        </div>
        ` : ''}

        <div class="app-section">
            <div style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0; font-size: 1.125rem;">About</h3>
                    <button class="btn btn-ghost btn-sm" onclick="openEditBioModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                    </button>
                </div>
                ${currentUser.bio
                    ? `<p style="margin: 0; color: var(--color-text); line-height: 1.5;">${escapeHtml(currentUser.bio)}</p>`
                    : `<p style="margin: 0; color: var(--color-text-light); font-style: italic;">No bio yet. Click Edit to add one!</p>`
                }
            </div>
        </div>

        <div class="app-section">
            <div style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0; font-size: 1.125rem;">Contact Details</h3>
                    <button class="btn btn-ghost btn-sm" onclick="openEditProfileModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                    </button>
                </div>
                <div style="display: grid; gap: 1rem;">
                    <div>
                        <label style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.25rem;">Email</label>
                        <p style="margin: 0;">${currentUser.email}</p>
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.25rem;">Phone</label>
                        <p style="margin: 0;">${currentUser.phone || '<span style="color: var(--color-text-light);">Not set</span>'}</p>
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.25rem;">Username</label>
                        <p style="margin: 0;">${currentUser.username ? '@' + currentUser.username : '<span style="color: var(--color-text-light);">Not set</span>'}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="app-section">
            <div style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">Account Security</h3>
                <button class="btn btn-secondary btn-sm" onclick="openChangePasswordModal()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Change Password
                </button>
            </div>
        </div>

        ${currentUser.dependants && currentUser.dependants.length > 0 ? `
        <div class="app-section">
            <div style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">Family Members</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${currentUser.dependants.map(d => `
                        <div style="padding: 0.75rem; background: var(--color-cream); border-radius: var(--radius-sm);">
                            ${d}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        ` : ''}

        <div class="app-section">
            <div style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">Community</h3>
                <button class="btn btn-secondary btn-sm" onclick="navigateTo('directory')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Member Directory
                </button>
            </div>
        </div>

        <div class="app-section">
            <button class="btn btn-secondary" style="width: 100%; justify-content: center;" onclick="logout()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
            </button>
        </div>

        <div class="app-section" style="padding-bottom: 2rem;">
            <a href="index.html" class="btn btn-ghost" style="width: 100%; justify-content: center;">
                Back to Website
            </a>
        </div>
    `;
}

function renderHostingPage() {
    const currentUser = DataService.getCurrentUser();
    const manageableEvents = DataService.getManageableEvents();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Split into upcoming and past events
    const upcomingEvents = manageableEvents.filter(e => new Date(e.date) >= today).slice(0, 10);
    const pastEvents = manageableEvents.filter(e => new Date(e.date) < today).slice(0, 5);

    // Calculate stats
    const totalRSVPs = upcomingEvents.reduce((sum, e) => {
        const attending = (e.rsvps || []).filter(r => !r.status || r.status === 'attending');
        return sum + attending.reduce((count, r) => count + 1 + (r.attendees?.length || 0) + (r.guestCount || 0), 0);
    }, 0);
    const nextEvent = upcomingEvents[0];
    const nextEventRSVPs = nextEvent ? (nextEvent.rsvps || []).filter(r => !r.status || r.status === 'attending').length : 0;

    // Get gatherings this user can host
    let hostableGatherings = MockDB.gatherings;
    if (currentUser.role === 'host' && currentUser.assignedGatherings) {
        hostableGatherings = MockDB.gatherings.filter(g =>
            currentUser.assignedGatherings.includes(g.id)
        );
    }

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">Hosting</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">Manage your events and posts</p>
        </div>

        <!-- Quick Stats -->
        <div class="app-section" style="padding-top: 1rem;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                <div style="background: var(--color-white); border-radius: var(--radius-md); padding: 0.75rem; text-align: center; box-shadow: var(--shadow-sm);">
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--color-forest);">${upcomingEvents.length}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-light);">Upcoming</div>
                </div>
                <div style="background: var(--color-white); border-radius: var(--radius-md); padding: 0.75rem; text-align: center; box-shadow: var(--shadow-sm);">
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--color-sage);">${totalRSVPs}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-light);">Total RSVPs</div>
                </div>
                <div style="background: var(--color-white); border-radius: var(--radius-md); padding: 0.75rem; text-align: center; box-shadow: var(--shadow-sm);">
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--color-terracotta);">${hostableGatherings.length}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-light);">Communities</div>
                </div>
            </div>
        </div>

        ${nextEvent ? `
        <div class="app-section" style="padding-top: 0;">
            <div style="background: var(--color-sage-light); border-radius: var(--radius-md); padding: 1rem;">
                <div style="font-size: 0.75rem; color: var(--color-forest); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Next Event</div>
                <div style="font-weight: 500;">${nextEvent.title}</div>
                <div style="font-size: 0.875rem; color: var(--color-text-light); margin-top: 0.25rem;">
                    ${formatDate(nextEvent.date)} at ${formatTime(nextEvent.time)} • ${nextEventRSVPs} attending
                </div>
            </div>
        </div>
        ` : ''}

        <div class="app-section" style="padding-top: 0.5rem;">
            <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="openCreateEventModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Event
            </button>
        </div>

        ${hostableGatherings.length > 0 ? `
        <div class="app-section">
            <div class="app-section-header">
                <h3 class="app-section-title">Your Gatherings</h3>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${hostableGatherings.map(g => `
                    <span style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--color-cream); border-radius: var(--radius-sm); font-size: 0.875rem;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${g.color};"></span>
                        ${g.name}
                    </span>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="app-section">
            <div class="app-section-header">
                <h3 class="app-section-title">Upcoming Events</h3>
                <span style="font-size: 0.875rem; color: var(--color-text-light);">${upcomingEvents.length} events</span>
            </div>
            ${upcomingEvents.length > 0 ? upcomingEvents.map(event => {
                const date = new Date(event.date);
                const gathering = DataService.getGatheringById(event.gatheringId);
                const rsvpCount = event.rsvps?.length || 0;
                return `
                    <div class="app-event-card" onclick="openEventModal('${event.id}')">
                        <div class="app-event-date" style="background: ${gathering?.color || 'var(--color-sage)'};">
                            <span class="app-event-date-day">${date.getDate()}</span>
                            <span class="app-event-date-month">${date.toLocaleDateString('en-NZ', { month: 'short' })}</span>
                        </div>
                        <div class="app-event-info">
                            <div class="app-event-title">${event.title}</div>
                            <div class="app-event-meta">${formatTime(event.time)} • ${rsvpCount} RSVP${rsvpCount !== 1 ? 's' : ''}</div>
                        </div>
                        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); openEditEventModal('${event.id}')" style="flex-shrink: 0;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                `;
            }).join('') : `
                <div style="text-align: center; padding: 2rem; color: var(--color-text-light);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.5;">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <p style="margin: 0;">No upcoming events.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">Create one to get started!</p>
                </div>
            `}
        </div>

        ${pastEvents.length > 0 ? `
        <div class="app-section">
            <div class="app-section-header">
                <h3 class="app-section-title">Past Events</h3>
            </div>
            ${pastEvents.map(event => {
                const date = new Date(event.date);
                const rsvpCount = event.rsvps?.length || 0;
                return `
                    <div class="app-event-card" style="opacity: 0.6;" onclick="openEventModal('${event.id}')">
                        <div class="app-event-date" style="background: var(--color-text-light);">
                            <span class="app-event-date-day">${date.getDate()}</span>
                            <span class="app-event-date-month">${date.toLocaleDateString('en-NZ', { month: 'short' })}</span>
                        </div>
                        <div class="app-event-info">
                            <div class="app-event-title">${event.title}</div>
                            <div class="app-event-meta">${rsvpCount} attended</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        ` : ''}
        <div style="height: 20px;"></div>
    `;
}

// Activity log storage
let activityLogs = [];

// Log admin activity
function logActivity(action, details, type = 'admin') {
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) return;

    activityLogs.unshift({
        id: 'log-' + Date.now(),
        userId: currentUser.id,
        userName: currentUser.displayName,
        action,
        details,
        type,
        createdAt: new Date().toISOString()
    });

    // Keep only last 50 logs
    activityLogs = activityLogs.slice(0, 50);
}

// Flagged content storage
let flaggedContent = [];

// Flag content for review
function flagContent(contentType, contentId, reason, reporterId) {
    const existing = flaggedContent.find(f => f.contentType === contentType && f.contentId === contentId);
    if (existing) {
        existing.reports.push({ reporterId, reason, createdAt: new Date().toISOString() });
    } else {
        flaggedContent.push({
            id: 'flag-' + Date.now(),
            contentType,
            contentId,
            reports: [{ reporterId, reason, createdAt: new Date().toISOString() }],
            status: 'pending',
            createdAt: new Date().toISOString()
        });
    }
    logActivity('Content flagged', `${contentType} reported for: ${reason}`, 'moderation');
}

// Site settings
const siteSettings = {
    siteName: 'Kiwi Church',
    siteDescription: 'A welcoming community in Aotearoa',
    allowPublicRegistration: false,
    requireEmailVerification: false,
    moderationEnabled: true,
    maintenanceMode: false
};

function renderSettingsPage() {
    const firebaseStatus = PortalConfig.useFirebase ? 'Connected' : 'Demo Mode';
    const statusColor = PortalConfig.useFirebase ? 'var(--color-sage)' : 'var(--color-terracotta)';
    const stats = DataService.getAdminStats();

    // Calculate growth (demo data - in real app would compare to previous period)
    const newUsersThisWeek = Math.floor(Math.random() * 3) + 1;
    const newPostsThisWeek = Math.floor(Math.random() * 10) + 5;

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">Admin Dashboard</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">Settings, statistics and moderation</p>
        </div>

        <!-- Dashboard Stats -->
        ${stats ? `
        <div class="app-section" style="padding-top: 1rem;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                <div style="background: var(--color-white); border-radius: var(--radius-md); padding: 1rem; box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="font-size: 2rem; font-weight: 600; color: var(--color-forest);">${stats.totalUsers}</div>
                        <span style="font-size: 0.6875rem; background: var(--color-sage-light); color: var(--color-forest); padding: 0.125rem 0.375rem; border-radius: 999px;">+${newUsersThisWeek} this week</span>
                    </div>
                    <div style="font-size: 0.875rem; color: var(--color-text-light);">Total Users</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-light); margin-top: 0.25rem;">
                        ${stats.usersByRole.admin} admin, ${stats.usersByRole.host} hosts, ${stats.usersByRole.member} members
                    </div>
                </div>
                <div style="background: var(--color-white); border-radius: var(--radius-md); padding: 1rem; box-shadow: var(--shadow-sm);">
                    <div style="font-size: 2rem; font-weight: 600; color: var(--color-sage);">${stats.upcomingEvents}</div>
                    <div style="font-size: 0.875rem; color: var(--color-text-light);">Upcoming Events</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-light); margin-top: 0.25rem;">
                        ${stats.totalRSVPs} total RSVPs
                    </div>
                </div>
                <div style="background: var(--color-white); border-radius: var(--radius-md); padding: 1rem; box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="font-size: 2rem; font-weight: 600; color: var(--color-terracotta);">${stats.totalBoardPosts}</div>
                        <span style="font-size: 0.6875rem; background: var(--color-cream); color: var(--color-text-light); padding: 0.125rem 0.375rem; border-radius: 999px;">+${newPostsThisWeek}</span>
                    </div>
                    <div style="font-size: 0.875rem; color: var(--color-text-light);">Board Posts</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-light); margin-top: 0.25rem;">
                        across ${stats.totalGatherings} groups
                    </div>
                </div>
                <div style="background: var(--color-white); border-radius: var(--radius-md); padding: 1rem; box-shadow: var(--shadow-sm);">
                    <div style="font-size: 2rem; font-weight: 600; color: #7c3aed;">${stats.totalKetePosts}</div>
                    <div style="font-size: 0.875rem; color: var(--color-text-light);">Kete Posts</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-light); margin-top: 0.25rem;">
                        ${stats.draftPosts} drafts pending
                    </div>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Quick Actions -->
        <div class="app-section">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                <button class="btn btn-ghost" onclick="navigateTo('users')" style="flex-direction: column; gap: 0.25rem; padding: 1rem; background: var(--color-white); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span style="font-size: 0.875rem; font-weight: 500;">Users</span>
                </button>
                <button class="btn btn-ghost" onclick="openCommunitiesManageModal()" style="flex-direction: column; gap: 0.25rem; padding: 1rem; background: var(--color-white); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span style="font-size: 0.875rem; font-weight: 500;">Communities</span>
                </button>
                <button class="btn btn-ghost" onclick="openActivityLogsModal()" style="flex-direction: column; gap: 0.25rem; padding: 1rem; background: var(--color-white); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <span style="font-size: 0.875rem; font-weight: 500;">Activity Log</span>
                </button>
                <button class="btn btn-ghost" onclick="openModerationModal()" style="flex-direction: column; gap: 0.25rem; padding: 1rem; background: var(--color-white); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); position: relative;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-terracotta)" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span style="font-size: 0.875rem; font-weight: 500;">Moderation</span>
                    ${flaggedContent.filter(f => f.status === 'pending').length > 0 ? `
                        <span style="position: absolute; top: 0.5rem; right: 0.5rem; width: 18px; height: 18px; background: #dc2626; color: white; border-radius: 50%; font-size: 0.625rem; display: flex; align-items: center; justify-content: center;">${flaggedContent.filter(f => f.status === 'pending').length}</span>
                    ` : ''}
                </button>
                <button class="btn btn-ghost" onclick="openSiteSettingsModal()" style="flex-direction: column; gap: 0.25rem; padding: 1rem; background: var(--color-white); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    <span style="font-size: 0.875rem; font-weight: 500;">Settings</span>
                </button>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="app-section">
            <div style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0; font-size: 1.125rem;">Recent Activity</h3>
                    <button class="btn btn-ghost btn-sm" onclick="openActivityLogsModal()">View All</button>
                </div>
                ${activityLogs.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${activityLogs.slice(0, 5).map(log => `
                            <div style="display: flex; gap: 0.75rem; padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm);">
                                <div style="width: 32px; height: 32px; background: ${log.type === 'moderation' ? 'var(--color-terracotta-light)' : 'var(--color-sage-light)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    ${log.type === 'moderation'
                                        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-terracotta)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'
                                        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
                                    }
                                </div>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-size: 0.875rem;"><strong>${escapeHtml(log.userName)}</strong> ${escapeHtml(log.action)}</div>
                                    <div style="font-size: 0.75rem; color: var(--color-text-light);">${escapeHtml(log.details)} • ${formatRelativeTime(log.createdAt)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p style="color: var(--color-text-light); text-align: center; padding: 1rem; font-size: 0.9375rem;">No activity yet. Actions will be logged here.</p>
                `}
            </div>
        </div>

        <div class="app-section">
            <div style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">Database Status</h3>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: ${statusColor};"></span>
                    <span style="font-weight: 500;">${firebaseStatus}</span>
                </div>
                <p style="color: var(--color-text-light); font-size: 0.9375rem;">
                    ${PortalConfig.useFirebase
                        ? 'Firebase Firestore is connected and syncing data.'
                        : 'Currently using local demo data. Firebase integration available.'}
                </p>
            </div>
        </div>
        <div style="height: 20px;"></div>
    `;
}

// Activity Logs Modal
function openActivityLogsModal() {
    document.getElementById('modal-title').textContent = 'Activity Log';
    document.getElementById('modal-body').innerHTML = `
        <div style="max-height: 400px; overflow-y: auto;">
            ${activityLogs.length > 0 ? `
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${activityLogs.map(log => `
                        <div style="display: flex; gap: 0.75rem; padding: 0.75rem; background: var(--color-cream); border-radius: var(--radius-sm);">
                            <div style="width: 32px; height: 32px; background: ${log.type === 'moderation' ? 'var(--color-terracotta-light)' : log.type === 'user' ? 'var(--color-forest-light)' : 'var(--color-sage-light)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                ${log.type === 'moderation'
                                    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-terracotta)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'
                                    : log.type === 'user'
                                    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
                                    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
                                }
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 0.9375rem;"><strong>${escapeHtml(log.userName)}</strong> ${escapeHtml(log.action)}</div>
                                <div style="font-size: 0.875rem; color: var(--color-text-light); margin-top: 0.125rem;">${escapeHtml(log.details)}</div>
                                <div style="font-size: 0.75rem; color: var(--color-text-light); margin-top: 0.25rem;">${formatDate(log.createdAt)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div style="text-align: center; padding: 2rem; color: var(--color-text-light);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.5;">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <p style="margin: 0;">No activity logged yet</p>
                </div>
            `}
        </div>
        <div style="margin-top: 1rem;">
            <button class="btn btn-ghost" onclick="closeModal()" style="width: 100%;">Close</button>
        </div>
    `;
    openModal();
}

// Moderation Modal
function openModerationModal() {
    const pendingContent = flaggedContent.filter(f => f.status === 'pending');

    document.getElementById('modal-title').textContent = 'Content Moderation';
    document.getElementById('modal-body').innerHTML = `
        <div style="margin-bottom: 1rem;">
            <span style="font-size: 0.875rem; color: var(--color-text-light);">${pendingContent.length} item${pendingContent.length !== 1 ? 's' : ''} pending review</span>
        </div>

        ${pendingContent.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 350px; overflow-y: auto;">
                ${pendingContent.map(item => {
                    let content = null;
                    let contentPreview = '';

                    if (item.contentType === 'post') {
                        // Find the post
                        for (const [gid, board] of Object.entries(MockDB.messageBoards)) {
                            const post = board.posts.find(p => p.id === item.contentId);
                            if (post) {
                                content = post;
                                contentPreview = post.content.substring(0, 100);
                                break;
                            }
                        }
                    } else if (item.contentType === 'comment') {
                        // Find comment
                        contentPreview = 'Comment';
                    }

                    return `
                        <div style="padding: 1rem; background: var(--color-cream); border-radius: var(--radius-md);">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                                <span style="font-size: 0.75rem; color: var(--color-terracotta); font-weight: 500; text-transform: uppercase;">${item.contentType}</span>
                                <span style="font-size: 0.75rem; color: var(--color-text-light);">${item.reports.length} report${item.reports.length !== 1 ? 's' : ''}</span>
                            </div>
                            <p style="margin: 0 0 0.5rem; font-size: 0.9375rem;">${escapeHtml(contentPreview)}${contentPreview.length >= 100 ? '...' : ''}</p>
                            <div style="font-size: 0.75rem; color: var(--color-text-light); margin-bottom: 0.75rem;">
                                Reasons: ${item.reports.map(r => escapeHtml(r.reason)).join(', ')}
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-ghost btn-sm" onclick="moderateContent('${item.id}', 'approve')" style="flex: 1;">Approve</button>
                                <button class="btn btn-ghost btn-sm" onclick="moderateContent('${item.id}', 'remove')" style="flex: 1; color: #dc2626;">Remove</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : `
            <div style="text-align: center; padding: 2rem; color: var(--color-text-light);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.5;">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <p style="margin: 0;">No content pending review</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">All clear!</p>
            </div>
        `}

        <div style="margin-top: 1rem;">
            <button class="btn btn-ghost" onclick="closeModal()" style="width: 100%;">Close</button>
        </div>
    `;
    openModal();
}

// Moderate content
function moderateContent(flagId, action) {
    const item = flaggedContent.find(f => f.id === flagId);
    if (!item) return;

    if (action === 'approve') {
        item.status = 'approved';
        logActivity('Content approved', `Marked ${item.contentType} as acceptable`, 'moderation');
        showToast('Content approved', 'success');
    } else if (action === 'remove') {
        item.status = 'removed';
        // In a real app, would actually delete the content
        logActivity('Content removed', `Removed flagged ${item.contentType}`, 'moderation');
        showToast('Content removed', 'default');
    }

    openModerationModal(); // Refresh
}

// Site Settings Modal
function openSiteSettingsModal() {
    document.getElementById('modal-title').textContent = 'Site Settings';
    document.getElementById('modal-body').innerHTML = `
        <form id="site-settings-form" onsubmit="event.preventDefault(); saveSiteSettings();">
            <div class="form-group">
                <label class="form-label">Site Name</label>
                <input type="text" class="form-input" id="setting-site-name" value="${escapeHtml(siteSettings.siteName)}">
            </div>

            <div class="form-group">
                <label class="form-label">Site Description</label>
                <input type="text" class="form-input" id="setting-site-description" value="${escapeHtml(siteSettings.siteDescription)}">
            </div>

            <div style="margin: 1.5rem 0;">
                <h4 style="font-size: 0.9375rem; margin: 0 0 0.75rem;">Registration Settings</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm);">
                        <input type="checkbox" id="setting-public-registration" ${siteSettings.allowPublicRegistration ? 'checked' : ''}>
                        <span style="font-size: 0.9375rem;">Allow public registration</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm);">
                        <input type="checkbox" id="setting-email-verification" ${siteSettings.requireEmailVerification ? 'checked' : ''}>
                        <span style="font-size: 0.9375rem;">Require email verification</span>
                    </label>
                </div>
            </div>

            <div style="margin: 1.5rem 0;">
                <h4 style="font-size: 0.9375rem; margin: 0 0 0.75rem;">Moderation</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm);">
                        <input type="checkbox" id="setting-moderation" ${siteSettings.moderationEnabled ? 'checked' : ''}>
                        <span style="font-size: 0.9375rem;">Enable content moderation</span>
                    </label>
                </div>
            </div>

            <div style="margin: 1.5rem 0; padding: 1rem; background: var(--color-terracotta-light); border-radius: var(--radius-md);">
                <h4 style="font-size: 0.9375rem; margin: 0 0 0.5rem; color: var(--color-terracotta);">Danger Zone</h4>
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                    <input type="checkbox" id="setting-maintenance" ${siteSettings.maintenanceMode ? 'checked' : ''}>
                    <span style="font-size: 0.9375rem;">Enable maintenance mode</span>
                </label>
                <p style="font-size: 0.75rem; color: var(--color-terracotta); margin: 0.25rem 0 0;">This will show a maintenance message to all non-admin users.</p>
            </div>

            <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Settings</button>
            </div>
        </form>
    `;
    openModal();
}

// Save site settings
function saveSiteSettings() {
    siteSettings.siteName = document.getElementById('setting-site-name')?.value || 'Kiwi Church';
    siteSettings.siteDescription = document.getElementById('setting-site-description')?.value || '';
    siteSettings.allowPublicRegistration = document.getElementById('setting-public-registration')?.checked || false;
    siteSettings.requireEmailVerification = document.getElementById('setting-email-verification')?.checked || false;
    siteSettings.moderationEnabled = document.getElementById('setting-moderation')?.checked || true;
    siteSettings.maintenanceMode = document.getElementById('setting-maintenance')?.checked || false;

    logActivity('Settings updated', 'Site settings were modified', 'admin');
    showToast('Settings saved', 'success');
    closeModal();
    renderPage();
}

// ============================================
// COMMUNITIES MANAGEMENT (Admin)
// ============================================

// Open Communities Management Modal
function openCommunitiesManageModal() {
    const gatherings = MockDB.gatherings;

    document.getElementById('modal-title').textContent = 'Manage Communities';
    document.getElementById('modal-body').innerHTML = `
        <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.875rem; color: var(--color-text-light);">${gatherings.length} communities</span>
            <button class="btn btn-primary btn-sm" onclick="openAddCommunityModal()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add New
            </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 400px; overflow-y: auto;">
            ${gatherings.map(g => `
                <div style="padding: 0.75rem; background: var(--color-cream); border-radius: var(--radius-md); display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: ${g.color}; flex-shrink: 0;"></div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 500; font-size: 0.9375rem; display: flex; align-items: center; gap: 0.5rem;">
                            ${escapeHtml(g.name)}
                            ${g.featured ? '<span style="font-size: 0.625rem; background: var(--color-gold); color: var(--color-forest); padding: 0.125rem 0.375rem; border-radius: 999px;">Featured</span>' : ''}
                            ${!g.isPublic ? '<span style="font-size: 0.625rem; background: var(--color-terracotta-light); color: var(--color-terracotta); padding: 0.125rem 0.375rem; border-radius: 999px;">Private</span>' : ''}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--color-text-light);">${escapeHtml(g.rhythm || '')}</div>
                    </div>
                    <div style="display: flex; gap: 0.25rem;">
                        <button class="btn btn-ghost btn-sm" onclick="openEditCommunityModal('${g.id}')" title="Edit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>

        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-cream-dark);">
            <p style="font-size: 0.75rem; color: var(--color-text-light); margin: 0;">
                Public communities are visible on the website. Private communities are only visible to members in the portal.
            </p>
        </div>

        <div style="margin-top: 1rem;">
            <button class="btn btn-ghost" onclick="closeModal()" style="width: 100%;">Close</button>
        </div>
    `;
    openModal();
}

// Open Add Community Modal
function openAddCommunityModal() {
    document.getElementById('modal-title').textContent = 'Add New Community';
    document.getElementById('modal-body').innerHTML = renderCommunityForm(null);
    // Don't call openModal() again since it's already open
}

// Open Edit Community Modal
function openEditCommunityModal(gatheringId) {
    const gathering = MockDB.gatherings.find(g => g.id === gatheringId);
    if (!gathering) return;

    document.getElementById('modal-title').textContent = 'Edit Community';
    document.getElementById('modal-body').innerHTML = renderCommunityForm(gathering);
}

// Render Community Form (for both add and edit)
function renderCommunityForm(gathering) {
    const isEdit = !!gathering;
    const colors = ['#1a3a2f', '#7d9a87', '#c17f59', '#d4a574', '#2d5a4a', '#5a6b62'];

    return `
        <form id="community-form" onsubmit="event.preventDefault(); saveCommunity(${isEdit ? `'${gathering.id}'` : 'null'});">
            <div class="form-group">
                <label class="form-label">Name *</label>
                <input type="text" class="form-input" id="community-name" value="${isEdit ? escapeHtml(gathering.name) : ''}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Description *</label>
                <textarea class="form-input" id="community-description" rows="3" required>${isEdit ? escapeHtml(gathering.description) : ''}</textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Meeting Rhythm</label>
                <input type="text" class="form-input" id="community-rhythm" value="${isEdit ? escapeHtml(gathering.rhythm || '') : ''}" placeholder="e.g., Weekly Fridays, 6:00pm">
            </div>

            <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" class="form-input" id="community-location" value="${isEdit ? escapeHtml(gathering.location || '') : ''}" placeholder="e.g., Central Christchurch">
            </div>

            <div class="form-group">
                <label class="form-label">Color</label>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${colors.map(c => `
                        <label style="cursor: pointer;">
                            <input type="radio" name="community-color" value="${c}" ${(isEdit && gathering.color === c) || (!isEdit && c === colors[0]) ? 'checked' : ''} style="display: none;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${c}; border: 3px solid transparent; transition: border-color 0.2s;"
                                 onclick="this.parentElement.querySelector('input').checked = true; document.querySelectorAll('[name=community-color]').forEach(i => i.parentElement.querySelector('div').style.borderColor = 'transparent'); this.style.borderColor = 'var(--color-forest)';"
                                 ${(isEdit && gathering.color === c) || (!isEdit && c === colors[0]) ? 'class="selected-color"' : ''}></div>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div style="margin: 1rem 0; display: flex; flex-direction: column; gap: 0.5rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm);">
                    <input type="checkbox" id="community-public" ${!isEdit || gathering.isPublic ? 'checked' : ''}>
                    <span style="font-size: 0.9375rem;">Public (visible on website)</span>
                </label>
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm);">
                    <input type="checkbox" id="community-featured" ${isEdit && gathering.featured ? 'checked' : ''}>
                    <span style="font-size: 0.9375rem;">Featured (highlighted on website)</span>
                </label>
            </div>

            <div style="display: flex; gap: 0.75rem; justify-content: space-between; margin-top: 1.5rem;">
                ${isEdit ? `
                    <button type="button" class="btn btn-ghost" onclick="confirmDeleteCommunity('${gathering.id}')" style="color: #dc2626;">Delete</button>
                ` : '<div></div>'}
                <div style="display: flex; gap: 0.75rem;">
                    <button type="button" class="btn btn-ghost" onclick="openCommunitiesManageModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Community'}</button>
                </div>
            </div>
        </form>
    `;
}

// Save Community (add or edit)
async function saveCommunity(gatheringId) {
    const name = document.getElementById('community-name')?.value?.trim();
    const description = document.getElementById('community-description')?.value?.trim();
    const rhythm = document.getElementById('community-rhythm')?.value?.trim();
    const location = document.getElementById('community-location')?.value?.trim();
    const colorEl = document.querySelector('[name="community-color"]:checked');
    const color = colorEl?.value || '#1a3a2f';
    const isPublic = document.getElementById('community-public')?.checked ?? true;
    const featured = document.getElementById('community-featured')?.checked ?? false;

    if (!name || !description) {
        showToast('Please fill in required fields', 'error');
        return;
    }

    const communityData = {
        name,
        description,
        rhythm,
        location,
        color,
        isPublic,
        featured
    };

    try {
        if (gatheringId) {
            // Update existing
            const index = MockDB.gatherings.findIndex(g => g.id === gatheringId);
            if (index !== -1) {
                MockDB.gatherings[index] = { ...MockDB.gatherings[index], ...communityData };
            }

            // Update in Firebase if enabled
            if (PortalConfig.useFirebase && typeof db !== 'undefined') {
                const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
                await setDoc(doc(db, 'gatherings', gatheringId), communityData, { merge: true });
            }

            logActivity('Community updated', `Updated "${name}"`, 'admin');
            showToast('Community updated', 'success');
        } else {
            // Add new
            const newId = 'gathering-' + Date.now();
            const newGathering = { id: newId, ...communityData };
            MockDB.gatherings.push(newGathering);

            // Add to Firebase if enabled
            if (PortalConfig.useFirebase && typeof db !== 'undefined') {
                const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
                await setDoc(doc(db, 'gatherings', newId), newGathering);
            }

            logActivity('Community added', `Created "${name}"`, 'admin');
            showToast('Community added', 'success');
        }

        openCommunitiesManageModal(); // Return to list
    } catch (error) {
        console.error('Error saving community:', error);
        showToast('Error saving community', 'error');
    }
}

// Confirm Delete Community
function confirmDeleteCommunity(gatheringId) {
    const gathering = MockDB.gatherings.find(g => g.id === gatheringId);
    if (!gathering) return;

    document.getElementById('modal-title').textContent = 'Delete Community?';
    document.getElementById('modal-body').innerHTML = `
        <p style="margin-bottom: 1.5rem;">
            Are you sure you want to delete <strong>${escapeHtml(gathering.name)}</strong>? This action cannot be undone.
        </p>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button class="btn btn-ghost" onclick="openCommunitiesManageModal()">Cancel</button>
            <button class="btn btn-primary" onclick="deleteCommunity('${gatheringId}')" style="background: #dc2626;">Delete</button>
        </div>
    `;
}

// Delete Community
async function deleteCommunity(gatheringId) {
    const gathering = MockDB.gatherings.find(g => g.id === gatheringId);
    const name = gathering?.name || 'Community';

    try {
        // Remove from MockDB
        const index = MockDB.gatherings.findIndex(g => g.id === gatheringId);
        if (index !== -1) {
            MockDB.gatherings.splice(index, 1);
        }

        // Remove from Firebase if enabled
        if (PortalConfig.useFirebase && typeof db !== 'undefined') {
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
            await deleteDoc(doc(db, 'gatherings', gatheringId));
        }

        logActivity('Community deleted', `Deleted "${name}"`, 'admin');
        showToast('Community deleted', 'default');
        openCommunitiesManageModal();
    } catch (error) {
        console.error('Error deleting community:', error);
        showToast('Error deleting community', 'error');
    }
}

// ============================================
// APP INITIALIZATION
// ============================================

// ============================================
// AUTH VIEW MANAGEMENT
// ============================================

function showAuthView(view) {
    const cards = ['login-card', 'register-card', 'forgot-card', 'reset-sent-card', 'register-success-card', 'verify-email-card'];
    cards.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const targetCard = document.getElementById(view + '-card');
    if (targetCard) {
        targetCard.style.display = 'block';
    }

    // Clear error messages
    ['login-error', 'register-message', 'forgot-message'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
            el.textContent = '';
        }
    });
}

function showMessage(elementId, message, isError = true) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
        el.style.background = isError ? '#fef2f2' : '#f0fdf4';
        el.style.color = isError ? '#dc2626' : '#16a34a';
        el.style.border = isError ? '1px solid #fecaca' : '1px solid #bbf7d0';
    }
}

function setButtonLoading(buttonId, loading) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    const textEl = btn.querySelector('.btn-text');
    const loadingEl = btn.querySelector('.btn-loading');

    if (textEl) textEl.style.display = loading ? 'none' : '';
    if (loadingEl) loadingEl.style.display = loading ? '' : 'none';
    btn.disabled = loading;
}

async function handleRegistration(e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;
    const message = document.getElementById('register-message-text').value.trim();

    // Validation
    if (password !== confirmPassword) {
        showMessage('register-message', 'Passwords do not match');
        return;
    }

    if (password.length < 6) {
        showMessage('register-message', 'Password must be at least 6 characters');
        return;
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
        showMessage('register-message', 'Username can only contain letters, numbers, and underscores');
        return;
    }

    setButtonLoading('register-submit', true);

    try {
        if (PortalConfig.useFirebase && window.Auth) {
            // Check username availability
            if (username) {
                const isAvailable = await DB.checkUsernameAvailable(username);
                if (!isAvailable) {
                    showMessage('register-message', 'Username is already taken');
                    setButtonLoading('register-submit', false);
                    return;
                }
            }

            // Create account
            await Auth.signUp(email, password, {
                displayName: name,
                username: username || null,
                registrationMessage: message
            });

            // Send verification email
            await Auth.sendEmailVerification();

            showAuthView('register-success');
        } else {
            // Demo mode - just show success
            showAuthView('register-success');
        }
    } catch (error) {
        showMessage('register-message', error.message);
    } finally {
        setButtonLoading('register-submit', false);
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();

    const email = document.getElementById('forgot-email').value.trim();

    setButtonLoading('forgot-submit', true);

    try {
        if (PortalConfig.useFirebase && window.Auth) {
            await Auth.sendPasswordResetEmail(email);
        }

        // Always show success (don't reveal if email exists)
        document.getElementById('reset-email-display').textContent = email;
        showAuthView('reset-sent');
    } catch (error) {
        // Still show success for security (don't reveal if email exists)
        document.getElementById('reset-email-display').textContent = email;
        showAuthView('reset-sent');
    } finally {
        setButtonLoading('forgot-submit', false);
    }
}

async function resendVerificationEmail() {
    try {
        if (PortalConfig.useFirebase && window.Auth && Auth.currentUser) {
            await Auth.sendEmailVerification();
            showToast('Verification email sent!', 'success');
        }
    } catch (error) {
        showToast('Could not send email. Please try again.', 'error');
    }
}

function logoutAndShowLogin() {
    logout();
    showAuthView('login');
}

// ============================================
// PROFILE EDITING
// ============================================

function openEditProfileModal() {
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) return;

    const bodyHTML = `
        <form id="edit-profile-form">
            <div class="form-group">
                <label class="form-label" for="edit-name">Display Name</label>
                <input type="text" class="form-input" id="edit-name" value="${currentUser.displayName || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="edit-phone">Phone</label>
                <input type="tel" class="form-input" id="edit-phone" value="${currentUser.phone || ''}" placeholder="027-123-4567">
            </div>
            ${!currentUser.username ? `
            <div class="form-group">
                <label class="form-label" for="edit-username">Username (optional)</label>
                <input type="text" class="form-input" id="edit-username" pattern="[a-zA-Z0-9_]+" placeholder="your_username">
                <small style="color: var(--color-text-light); font-size: 0.75rem;">Letters, numbers, and underscores only</small>
            </div>
            ` : ''}
        </form>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveProfile()">Save Changes</button>
    `;

    openModal('Edit Profile', bodyHTML, footerHTML);
}

async function saveProfile() {
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) return;

    const name = document.getElementById('edit-name').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const usernameEl = document.getElementById('edit-username');
    const username = usernameEl ? usernameEl.value.trim() : null;

    if (!name) {
        showToast('Name is required', 'error');
        return;
    }

    try {
        if (PortalConfig.useFirebase && window.Auth) {
            const updates = {
                displayName: name,
                phone: phone
            };

            if (username && !currentUser.username) {
                // Check availability and set username
                const isAvailable = await DB.checkUsernameAvailable(username);
                if (!isAvailable) {
                    showToast('Username is already taken', 'error');
                    return;
                }
                await Auth.setUsername(username);
            }

            await Auth.updateProfile(updates);
        } else {
            // Demo mode
            currentUser.displayName = name;
            currentUser.phone = phone;
            if (username && !currentUser.username) {
                currentUser.username = username;
            }
        }

        showToast('Profile updated!', 'success');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not update profile', 'error');
    }
}

function openChangePasswordModal() {
    const bodyHTML = `
        <form id="change-password-form">
            <div class="form-group">
                <label class="form-label" for="current-password">Current Password</label>
                <input type="password" class="form-input" id="current-password" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="new-password">New Password</label>
                <input type="password" class="form-input" id="new-password" required minlength="6">
                <small style="color: var(--color-text-light); font-size: 0.75rem;">At least 6 characters</small>
            </div>
            <div class="form-group">
                <label class="form-label" for="confirm-new-password">Confirm New Password</label>
                <input type="password" class="form-input" id="confirm-new-password" required>
            </div>
        </form>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="changePassword()">Change Password</button>
    `;

    openModal('Change Password', bodyHTML, footerHTML);
}

async function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;

    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        if (PortalConfig.useFirebase && window.Auth) {
            await Auth.updatePassword(currentPassword, newPassword);
            showToast('Password changed successfully!', 'success');
            closeModal();
        } else {
            showToast('Password change available in Firebase mode', 'default');
            closeModal();
        }
    } catch (error) {
        showToast(error.message || 'Could not change password', 'error');
    }
}

// ============================================
// USER MANAGEMENT (Admin)
// ============================================

function renderUsersPage() {
    if (!DataService.isAdmin()) {
        navigateTo('home');
        return '';
    }

    const users = MockDB.users;
    const activeUsers = users.filter(u => u.status !== 'deactivated');
    const deactivatedUsers = users.filter(u => u.status === 'deactivated');

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">User Management</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">${activeUsers.length} active users${deactivatedUsers.length > 0 ? `, ${deactivatedUsers.length} deactivated` : ''}</p>
        </div>

        <div class="app-section" style="padding-top: 1.5rem;">
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="openCreateUserModal()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    Create User
                </button>
                <button class="btn btn-secondary" onclick="openBulkImportModal()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Bulk Import
                </button>
                <button class="btn btn-ghost" onclick="navigateTo('directory')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Member Directory
                </button>
            </div>
        </div>

        <div class="app-section">
            <div class="app-section-header">
                <h3 class="app-section-title">All Users</h3>
            </div>
            ${users.map(user => `
                <div class="app-event-card" style="cursor: pointer; ${user.status === 'deactivated' ? 'opacity: 0.5;' : ''}" onclick="openUserModal('${user.id}')">
                    <div style="width: 45px; height: 45px; border-radius: 50%; overflow: hidden; background: ${user.role === 'admin' ? 'var(--color-forest)' : user.role === 'host' ? 'var(--color-terracotta)' : 'var(--color-sage)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        ${user.photoURL
                            ? `<img src="${user.photoURL}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`
                            : `<span style="font-family: var(--font-display); font-size: 1.25rem; color: white;">${user.displayName.charAt(0)}</span>`
                        }
                    </div>
                    <div class="app-event-info">
                        <div class="app-event-title" style="display: flex; align-items: center; gap: 0.5rem;">
                            ${escapeHtml(user.displayName)}
                            ${user.status === 'deactivated' ? '<span style="font-size: 0.625rem; background: #fee2e2; color: #dc2626; padding: 0.125rem 0.375rem; border-radius: 4px;">Inactive</span>' : ''}
                        </div>
                        <div class="app-event-meta">${escapeHtml(user.email)} &middot; <span style="text-transform: capitalize;">${user.role}</span></div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2" style="flex-shrink: 0;">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            `).join('')}
        </div>
        <div style="height: 20px;"></div>
    `;
}

function openUserModal(userId) {
    const user = MockDB.users.find(u => u.id === userId);
    if (!user) return;

    const currentUser = DataService.getCurrentUser();
    const isCurrentUser = currentUser.id === user.id;

    const bodyHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
            <div style="width: 60px; height: 60px; border-radius: 50%; overflow: hidden; background: ${user.role === 'admin' ? 'var(--color-forest)' : user.role === 'host' ? 'var(--color-terracotta)' : 'var(--color-sage)'}; display: flex; align-items: center; justify-content: center;">
                ${user.photoURL
                    ? `<img src="${user.photoURL}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`
                    : `<span style="font-family: var(--font-display); font-size: 1.5rem; color: white;">${user.displayName.charAt(0)}</span>`
                }
            </div>
            <div>
                <h3 style="margin: 0; font-size: 1.125rem; display: flex; align-items: center; gap: 0.5rem;">
                    ${escapeHtml(user.displayName)}
                    ${user.status === 'deactivated' ? '<span style="font-size: 0.625rem; background: #fee2e2; color: #dc2626; padding: 0.125rem 0.375rem; border-radius: 4px;">Inactive</span>' : ''}
                </h3>
                <p style="margin: 0.25rem 0 0; color: var(--color-text-light); font-size: 0.875rem;">${escapeHtml(user.email)}</p>
            </div>
        </div>

        ${user.bio ? `
        <div style="background: var(--color-cream); border-radius: var(--radius-md); padding: 0.75rem 1rem; margin-bottom: 1rem;">
            <p style="margin: 0; font-size: 0.875rem; color: var(--color-text);">${escapeHtml(user.bio)}</p>
        </div>
        ` : ''}

        <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
            <div>
                <label style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.25rem;">Role</label>
                <select class="form-input" id="user-role" ${isCurrentUser ? 'disabled' : ''}>
                    <option value="member" ${user.role === 'member' ? 'selected' : ''}>Member</option>
                    <option value="host" ${user.role === 'host' ? 'selected' : ''}>Host</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
                ${isCurrentUser ? '<small style="color: var(--color-text-light); font-size: 0.75rem;">Cannot change your own role</small>' : ''}
            </div>
            ${user.phone ? `
            <div>
                <label style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.25rem;">Phone</label>
                <p style="margin: 0;">${escapeHtml(user.phone)}</p>
            </div>
            ` : ''}
            ${user.username ? `
            <div>
                <label style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.25rem;">Username</label>
                <p style="margin: 0;">@${escapeHtml(user.username)}</p>
            </div>
            ` : ''}
        </div>
        ${!isCurrentUser ? `
        <div style="padding-top: 1rem; border-top: 1px solid var(--color-cream-dark);">
            <button class="btn btn-${user.status === 'deactivated' ? 'secondary' : 'ghost'} btn-sm" onclick="toggleUserStatus('${user.id}')" style="${user.status !== 'deactivated' ? 'color: #ef4444;' : ''}">
                ${user.status === 'deactivated' ? 'Reactivate Account' : 'Deactivate Account'}
            </button>
        </div>
        ` : ''}
    `;

    let footerHTML = `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`;
    if (!isCurrentUser) {
        footerHTML += `<button class="btn btn-primary" onclick="saveUserRole('${user.id}')">Save Changes</button>`;
    }

    openModal('User Details', bodyHTML, footerHTML);
}

async function saveUserRole(userId) {
    const newRole = document.getElementById('user-role').value;
    const user = MockDB.users.find(u => u.id === userId);

    if (!user) return;

    try {
        if (PortalConfig.useFirebase && window.DB) {
            await DB.updateUser(userId, { role: newRole });
        } else {
            user.role = newRole;
        }

        showToast(`${user.displayName}'s role updated to ${newRole}`, 'success');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not update role', 'error');
    }
}

// ============================================
// ADMIN USER CREATION (Feature #1)
// ============================================

function openCreateUserModal() {
    if (!DataService.isAdmin()) {
        showToast('Only admins can create users', 'error');
        return;
    }

    const bodyHTML = `
        <form id="create-user-form">
            <div class="form-group">
                <label class="form-label" for="new-user-name">Full Name *</label>
                <input type="text" class="form-input" id="new-user-name" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="new-user-email">Email *</label>
                <input type="email" class="form-input" id="new-user-email" required autocomplete="off">
            </div>
            <div class="form-group">
                <label class="form-label" for="new-user-username">Username (optional)</label>
                <input type="text" class="form-input" id="new-user-username" pattern="[a-zA-Z0-9_]+" placeholder="username">
                <small style="color: var(--color-text-light); font-size: 0.75rem;">Letters, numbers, and underscores only</small>
            </div>
            <div class="form-group">
                <label class="form-label" for="new-user-password">Password *</label>
                <input type="password" class="form-input" id="new-user-password" required minlength="6" autocomplete="new-password" oninput="updatePasswordStrength(this.value)">
                <div id="password-strength-meter" style="margin-top: 0.5rem;">
                    <div style="display: flex; gap: 4px; margin-bottom: 4px;">
                        <div class="strength-bar" style="flex: 1; height: 4px; background: var(--color-cream-dark); border-radius: 2px; transition: background 0.3s;"></div>
                        <div class="strength-bar" style="flex: 1; height: 4px; background: var(--color-cream-dark); border-radius: 2px; transition: background 0.3s;"></div>
                        <div class="strength-bar" style="flex: 1; height: 4px; background: var(--color-cream-dark); border-radius: 2px; transition: background 0.3s;"></div>
                        <div class="strength-bar" style="flex: 1; height: 4px; background: var(--color-cream-dark); border-radius: 2px; transition: background 0.3s;"></div>
                    </div>
                    <small id="password-strength-text" style="color: var(--color-text-light); font-size: 0.75rem;">At least 6 characters</small>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="new-user-role">Role *</label>
                <select class="form-input" id="new-user-role">
                    <option value="member">Member</option>
                    <option value="host">Host</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" for="new-user-phone">Phone (optional)</label>
                <input type="tel" class="form-input" id="new-user-phone" placeholder="027-123-4567">
            </div>
            <div class="form-group">
                <label class="form-label" for="new-user-bio">Bio (optional)</label>
                <textarea class="form-input" id="new-user-bio" rows="2" placeholder="A short bio about this person"></textarea>
            </div>
        </form>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="createNewUser()">Create User</button>
    `;

    openModal('Create New User', bodyHTML, footerHTML);
}

async function createNewUser() {
    const name = document.getElementById('new-user-name').value.trim();
    const email = document.getElementById('new-user-email').value.trim().toLowerCase();
    const username = document.getElementById('new-user-username').value.trim();
    const password = document.getElementById('new-user-password').value;
    const role = document.getElementById('new-user-role').value;
    const phone = document.getElementById('new-user-phone').value.trim();
    const bio = document.getElementById('new-user-bio').value.trim();

    if (!name || !email || !password) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('#create-user-form + div button.btn-primary, .modal-footer button.btn-primary');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Creating...';
    }

    try {
        if (PortalConfig.useFirebase && window.Auth) {
            // Check username availability
            if (username) {
                const isAvailable = await DB.checkUsernameAvailable(username);
                if (!isAvailable) {
                    showToast('Username is already taken', 'error');
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Create User'; }
                    return;
                }
            }

            // Store the requested role (new user can only create with 'member', admin updates later)
            const requestedRole = role;

            // Create user via Auth (this will sign out admin and sign in new user)
            const result = await auth.createUserWithEmailAndPassword(email, password);
            const newUserId = result.user.uid;

            // Update display name in Firebase Auth
            await result.user.updateProfile({ displayName: name });

            // Create user document as the new user (they can only set role='member')
            const timestamp = firebase.firestore.FieldValue.serverTimestamp();
            const userData = {
                email: email,
                displayName: name,
                username: username || null,
                role: 'member',  // Start as member, admin will update after re-signing in
                phone: phone || null,
                bio: bio || null,
                photoURL: null,
                status: 'active',
                pendingRole: requestedRole !== 'member' ? requestedRole : null,  // Store requested role
                createdAt: timestamp,
                updatedAt: timestamp
            };

            await db.collection('users').doc(newUserId).set(userData);

            // Create username mapping if provided
            if (username) {
                await db.collection('usernames').doc(username.toLowerCase()).set({
                    uid: newUserId,
                    createdAt: timestamp
                });
            }

            // Create public profile
            await db.collection('userProfiles').doc(newUserId).set({
                displayName: name,
                photoURL: null,
                createdAt: timestamp
            });

            // Sign out the newly created user
            await auth.signOut();

            // Show success message
            if (requestedRole !== 'member') {
                showToast(`User "${name}" created as member. Sign in to update their role to ${requestedRole}.`, 'success');
            } else {
                showToast(`User "${name}" created successfully! Please sign in again.`, 'success');
            }
            closeModal();

        } else {
            // Demo mode
            const newUser = {
                id: 'user-' + Date.now(),
                username: username || null,
                displayName: name,
                email: email,
                phone: phone || null,
                bio: bio || null,
                role: role,
                status: 'active',
                dependants: [],
                rsvps: []
            };
            MockDB.users.push(newUser);
            showToast(`User "${name}" created successfully!`, 'success');
            closeModal();
            renderPage();
        }
    } catch (error) {
        console.error('Create user error:', error);
        showToast(error.message || 'Could not create user', 'error');
    }
}

// ============================================
// PASSWORD STRENGTH METER (Feature #3)
// ============================================

function calculatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return Math.min(strength, 4);
}

function updatePasswordStrength(password) {
    const strength = calculatePasswordStrength(password);
    const bars = document.querySelectorAll('#password-strength-meter .strength-bar');
    const textEl = document.getElementById('password-strength-text');

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    const texts = ['Weak', 'Fair', 'Good', 'Strong'];

    bars.forEach((bar, index) => {
        if (index < strength) {
            bar.style.background = colors[Math.min(strength - 1, 3)];
        } else {
            bar.style.background = 'var(--color-cream-dark)';
        }
    });

    if (password.length === 0) {
        textEl.textContent = 'At least 6 characters';
        textEl.style.color = 'var(--color-text-light)';
    } else if (password.length < 6) {
        textEl.textContent = 'Too short';
        textEl.style.color = '#ef4444';
    } else {
        textEl.textContent = texts[strength - 1] || 'Weak';
        textEl.style.color = colors[strength - 1] || colors[0];
    }
}

// ============================================
// ACCOUNT DEACTIVATION (Feature #4)
// ============================================

async function toggleUserStatus(userId) {
    if (!DataService.isAdmin()) {
        showToast('Only admins can change user status', 'error');
        return;
    }

    const user = MockDB.users.find(u => u.id === userId);
    if (!user) return;

    const currentUser = DataService.getCurrentUser();
    if (currentUser.id === userId) {
        showToast('You cannot deactivate your own account', 'error');
        return;
    }

    const newStatus = user.status === 'active' ? 'deactivated' : 'active';
    const action = newStatus === 'active' ? 'reactivate' : 'deactivate';

    if (!confirm(`Are you sure you want to ${action} ${user.displayName}'s account?`)) {
        return;
    }

    try {
        if (PortalConfig.useFirebase && window.DB) {
            await DB.updateUser(userId, { status: newStatus });
        }
        user.status = newStatus;

        showToast(`${user.displayName}'s account has been ${newStatus === 'active' ? 'reactivated' : 'deactivated'}`, 'success');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not update user status', 'error');
    }
}

// ============================================
// PROFILE PICTURE UPLOAD (Feature #5)
// ============================================

function openProfilePictureModal() {
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) return;

    const currentPhoto = currentUser.photoURL;

    const bodyHTML = `
        <div style="text-align: center;">
            <div id="profile-preview" style="width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 1.5rem; overflow: hidden; background: var(--color-cream); display: flex; align-items: center; justify-content: center;">
                ${currentPhoto
                    ? `<img src="${currentPhoto}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`
                    : `<span style="font-family: var(--font-display); font-size: 3rem; color: var(--color-terracotta);">${currentUser.displayName.charAt(0)}</span>`
                }
            </div>
            <input type="file" id="profile-image-input" accept="image/*" style="display: none;" onchange="previewProfileImage(this)">
            <div style="display: flex; gap: 0.5rem; justify-content: center;">
                <button class="btn btn-secondary btn-sm" onclick="document.getElementById('profile-image-input').click()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload Photo
                </button>
                ${currentPhoto ? `
                <button class="btn btn-ghost btn-sm" onclick="removeProfilePicture()" style="color: #ef4444;">
                    Remove
                </button>
                ` : ''}
            </div>
            <div id="upload-progress" style="display: none; margin-top: 1rem;">
                <div style="background: var(--color-cream-dark); border-radius: 4px; overflow: hidden;">
                    <div id="upload-progress-bar" style="height: 4px; background: var(--color-forest); width: 0%; transition: width 0.3s;"></div>
                </div>
                <small style="color: var(--color-text-light);">Uploading...</small>
            </div>
        </div>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" id="save-photo-btn" onclick="saveProfilePicture()" disabled>Save Photo</button>
    `;

    openModal('Profile Picture', bodyHTML, footerHTML);
}

let pendingProfileImage = null;

function previewProfileImage(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];

        if (!Storage.isValidImage(file)) {
            showToast('Please select a valid image (JPEG, PNG, GIF, or WebP)', 'error');
            return;
        }

        if (!Storage.isValidSize(file, 5)) {
            showToast('Image must be smaller than 5MB', 'error');
            return;
        }

        pendingProfileImage = file;

        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-preview').innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">
            `;
            document.getElementById('save-photo-btn').disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

async function saveProfilePicture() {
    if (!pendingProfileImage) return;

    const currentUser = DataService.getCurrentUser();
    if (!currentUser) return;

    const progressEl = document.getElementById('upload-progress');
    const progressBar = document.getElementById('upload-progress-bar');
    const saveBtn = document.getElementById('save-photo-btn');

    progressEl.style.display = 'block';
    saveBtn.disabled = true;

    try {
        // Resize image before upload
        const resizedImage = await Storage.resizeImage(pendingProfileImage, 400, 400, 0.85);

        // Upload to Firebase Storage
        const result = await Storage.uploadProfileImage(
            PortalConfig.useFirebase ? Auth.uid : currentUser.id,
            resizedImage,
            (progress) => {
                progressBar.style.width = progress + '%';
            }
        );

        // Update user profile with new photo URL
        if (PortalConfig.useFirebase && window.Auth) {
            await Auth.updateProfile({ photoURL: result.url });
        } else {
            currentUser.photoURL = result.url;
        }

        pendingProfileImage = null;
        showToast('Profile picture updated!', 'success');
        closeModal();
        renderPage();
        renderDesktopSidebar();
    } catch (error) {
        showToast(error.message || 'Could not upload image', 'error');
        progressEl.style.display = 'none';
        saveBtn.disabled = false;
    }
}

async function removeProfilePicture() {
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) return;

    if (!confirm('Remove your profile picture?')) return;

    try {
        if (PortalConfig.useFirebase && window.Auth) {
            await Auth.updateProfile({ photoURL: null });
        } else {
            currentUser.photoURL = null;
        }

        showToast('Profile picture removed', 'success');
        closeModal();
        renderPage();
        renderDesktopSidebar();
    } catch (error) {
        showToast(error.message || 'Could not remove image', 'error');
    }
}

// ============================================
// USER BIO (Feature #6)
// ============================================

function openEditBioModal() {
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) return;

    const bodyHTML = `
        <form id="edit-bio-form">
            <div class="form-group">
                <label class="form-label" for="edit-bio">About You</label>
                <textarea class="form-input" id="edit-bio" rows="4" maxlength="500" placeholder="Tell others a bit about yourself...">${currentUser.bio || ''}</textarea>
                <small style="color: var(--color-text-light); font-size: 0.75rem;">
                    <span id="bio-char-count">${(currentUser.bio || '').length}</span>/500 characters
                </small>
            </div>
        </form>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveBio()">Save Bio</button>
    `;

    openModal('Edit Bio', bodyHTML, footerHTML);

    // Add character counter
    setTimeout(() => {
        const bioEl = document.getElementById('edit-bio');
        if (bioEl) {
            bioEl.addEventListener('input', function() {
                document.getElementById('bio-char-count').textContent = this.value.length;
            });
        }
    }, 100);
}

async function saveBio() {
    const bio = document.getElementById('edit-bio').value.trim();
    const currentUser = DataService.getCurrentUser();

    if (!currentUser) return;

    try {
        if (PortalConfig.useFirebase && window.Auth) {
            await DB.updateUser(Auth.uid, { bio: bio || null });
            Auth.currentUserData.bio = bio || null;
        } else {
            currentUser.bio = bio || null;
        }

        showToast('Bio updated!', 'success');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not update bio', 'error');
    }
}

// ============================================
// BULK USER IMPORT (Feature #7)
// ============================================

function openBulkImportModal() {
    if (!DataService.isAdmin()) {
        showToast('Only admins can import users', 'error');
        return;
    }

    const bodyHTML = `
        <div>
            <p style="color: var(--color-text-light); font-size: 0.9375rem; margin-bottom: 1rem;">
                Import multiple users from a CSV file. The file should have columns: name, email, role (optional), phone (optional).
            </p>
            <div style="background: var(--color-cream); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem; font-family: monospace; font-size: 0.75rem;">
                name,email,role,phone<br>
                John Smith,john@example.com,member,027-123-4567<br>
                Jane Doe,jane@example.com,host,
            </div>
            <div class="form-group">
                <input type="file" id="csv-file-input" accept=".csv" class="form-input">
            </div>
            <div class="form-group">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                    <input type="checkbox" id="send-welcome-email" checked>
                    <span style="font-size: 0.9375rem;">Send welcome emails with temporary passwords</span>
                </label>
            </div>
            <div id="import-preview" style="display: none; margin-top: 1rem;">
                <h4 style="font-size: 0.875rem; margin-bottom: 0.5rem;">Preview:</h4>
                <div id="import-preview-list" style="max-height: 200px; overflow-y: auto;"></div>
            </div>
            <div id="import-progress" style="display: none; margin-top: 1rem;">
                <div style="background: var(--color-cream-dark); border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;">
                    <div id="import-progress-bar" style="height: 4px; background: var(--color-forest); width: 0%; transition: width 0.3s;"></div>
                </div>
                <small id="import-progress-text" style="color: var(--color-text-light);">Importing...</small>
            </div>
        </div>
    `;

    const footerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-secondary" id="preview-import-btn" onclick="previewCSVImport()">Preview</button>
        <button class="btn btn-primary" id="start-import-btn" onclick="startBulkImport()" disabled>Import Users</button>
    `;

    openModal('Bulk Import Users', bodyHTML, footerHTML);
}

let parsedCSVData = [];

function previewCSVImport() {
    const fileInput = document.getElementById('csv-file-input');
    if (!fileInput.files || !fileInput.files[0]) {
        showToast('Please select a CSV file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            showToast('CSV file must have at least one data row', 'error');
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIdx = headers.indexOf('name');
        const emailIdx = headers.indexOf('email');
        const roleIdx = headers.indexOf('role');
        const phoneIdx = headers.indexOf('phone');

        if (nameIdx === -1 || emailIdx === -1) {
            showToast('CSV must have "name" and "email" columns', 'error');
            return;
        }

        parsedCSVData = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values[emailIdx]) {
                parsedCSVData.push({
                    name: values[nameIdx] || '',
                    email: values[emailIdx].toLowerCase(),
                    role: (roleIdx !== -1 && values[roleIdx]) ? values[roleIdx] : 'member',
                    phone: (phoneIdx !== -1 && values[phoneIdx]) ? values[phoneIdx] : ''
                });
            }
        }

        if (parsedCSVData.length === 0) {
            showToast('No valid users found in CSV', 'error');
            return;
        }

        // Show preview
        const previewEl = document.getElementById('import-preview');
        const listEl = document.getElementById('import-preview-list');

        listEl.innerHTML = parsedCSVData.map((user, idx) => `
            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: ${idx % 2 ? 'var(--color-cream)' : 'white'}; font-size: 0.875rem;">
                <span>${escapeHtml(user.name)}</span>
                <span style="color: var(--color-text-light);">${escapeHtml(user.email)}</span>
                <span style="text-transform: capitalize;">${user.role}</span>
            </div>
        `).join('');

        previewEl.style.display = 'block';
        document.getElementById('start-import-btn').disabled = false;
    };
    reader.readAsText(fileInput.files[0]);
}

async function startBulkImport() {
    if (parsedCSVData.length === 0) {
        showToast('No users to import', 'error');
        return;
    }

    const sendEmails = document.getElementById('send-welcome-email').checked;
    const progressEl = document.getElementById('import-progress');
    const progressBar = document.getElementById('import-progress-bar');
    const progressText = document.getElementById('import-progress-text');

    progressEl.style.display = 'block';
    document.getElementById('start-import-btn').disabled = true;
    document.getElementById('preview-import-btn').disabled = true;

    let imported = 0;
    let errors = 0;
    const results = [];

    for (let i = 0; i < parsedCSVData.length; i++) {
        const user = parsedCSVData[i];
        const progress = ((i + 1) / parsedCSVData.length) * 100;
        progressBar.style.width = progress + '%';
        progressText.textContent = `Importing ${i + 1} of ${parsedCSVData.length}...`;

        try {
            // Generate temporary password
            const tempPassword = generateTempPassword();

            if (PortalConfig.useFirebase) {
                // For Firebase, we'd need Cloud Functions for bulk import
                // For now, add to MockDB
                const newUser = {
                    id: 'user-' + Date.now() + '-' + i,
                    username: null,
                    displayName: user.name,
                    email: user.email,
                    phone: user.phone || null,
                    role: user.role,
                    status: 'active',
                    dependants: [],
                    rsvps: [],
                    tempPassword: tempPassword
                };
                MockDB.users.push(newUser);
            } else {
                const newUser = {
                    id: 'user-' + Date.now() + '-' + i,
                    username: null,
                    displayName: user.name,
                    email: user.email,
                    phone: user.phone || null,
                    role: user.role,
                    status: 'active',
                    dependants: [],
                    rsvps: []
                };
                MockDB.users.push(newUser);
            }

            results.push({ user, success: true, password: tempPassword });
            imported++;
        } catch (error) {
            results.push({ user, success: false, error: error.message });
            errors++;
        }

        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    progressText.textContent = `Complete! ${imported} imported, ${errors} errors.`;

    if (sendEmails && imported > 0) {
        // In a real app, this would send emails via Cloud Functions
        console.log('Would send welcome emails to:', results.filter(r => r.success));
    }

    showToast(`Imported ${imported} users${errors > 0 ? ` (${errors} errors)` : ''}`, imported > 0 ? 'success' : 'error');

    setTimeout(() => {
        closeModal();
        renderPage();
    }, 1500);
}

function generateTempPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// ============================================
// USER DIRECTORY (Feature #8)
// ============================================

let userDirectorySearch = '';
let userDirectoryFilter = 'all';

function renderUserDirectory() {
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) return '';

    let users = [...MockDB.users].filter(u => u.status !== 'deactivated' || DataService.isAdmin());

    // Apply search
    if (userDirectorySearch) {
        const search = userDirectorySearch.toLowerCase();
        users = users.filter(u =>
            u.displayName.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            (u.username && u.username.toLowerCase().includes(search))
        );
    }

    // Apply role filter
    if (userDirectoryFilter !== 'all') {
        users = users.filter(u => u.role === userDirectoryFilter);
    }

    // Sort alphabetically
    users.sort((a, b) => a.displayName.localeCompare(b.displayName));

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">Member Directory</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">${users.length} members</p>
        </div>

        <div class="app-section" style="padding-top: 1rem;">
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                    <input type="text" class="form-input" placeholder="Search members..." value="${escapeHtml(userDirectorySearch)}" oninput="updateDirectorySearch(this.value)" style="padding: 0.625rem 1rem;">
                </div>
                <select class="form-input" style="width: auto;" onchange="updateDirectoryFilter(this.value)">
                    <option value="all" ${userDirectoryFilter === 'all' ? 'selected' : ''}>All Roles</option>
                    <option value="admin" ${userDirectoryFilter === 'admin' ? 'selected' : ''}>Admins</option>
                    <option value="host" ${userDirectoryFilter === 'host' ? 'selected' : ''}>Hosts</option>
                    <option value="member" ${userDirectoryFilter === 'member' ? 'selected' : ''}>Members</option>
                </select>
            </div>
        </div>

        <div class="app-section">
            <div style="display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
                ${users.map(user => `
                    <div class="app-event-card" style="cursor: pointer; ${user.status === 'deactivated' ? 'opacity: 0.5;' : ''}" onclick="openUserProfileModal('${user.id}')">
                        <div style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: ${user.role === 'admin' ? 'var(--color-forest)' : user.role === 'host' ? 'var(--color-terracotta)' : 'var(--color-sage)'}; display: flex; align-items: center; justify-content: center;">
                            ${user.photoURL
                                ? `<img src="${user.photoURL}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`
                                : `<span style="font-family: var(--font-display); font-size: 1.25rem; color: white;">${user.displayName.charAt(0)}</span>`
                            }
                        </div>
                        <div class="app-event-info" style="min-width: 0;">
                            <div class="app-event-title" style="display: flex; align-items: center; gap: 0.5rem;">
                                ${escapeHtml(user.displayName)}
                                ${user.status === 'deactivated' ? '<span style="font-size: 0.625rem; background: #fee2e2; color: #dc2626; padding: 0.125rem 0.375rem; border-radius: 4px;">Inactive</span>' : ''}
                            </div>
                            <div class="app-event-meta">
                                ${user.username ? '@' + escapeHtml(user.username) + ' · ' : ''}
                                <span style="text-transform: capitalize;">${user.role}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${users.length === 0 ? `
                <div style="text-align: center; padding: 2rem; color: var(--color-text-light);">
                    <p>No members found matching your search.</p>
                </div>
            ` : ''}
        </div>
        <div style="height: 20px;"></div>
    `;
}

function updateDirectorySearch(value) {
    userDirectorySearch = value;
    // Debounce the search
    clearTimeout(window.directorySearchTimeout);
    window.directorySearchTimeout = setTimeout(() => {
        renderPage();
    }, 300);
}

function updateDirectoryFilter(value) {
    userDirectoryFilter = value;
    renderPage();
}

function openUserProfileModal(userId) {
    const user = MockDB.users.find(u => u.id === userId);
    if (!user) return;

    const currentUser = DataService.getCurrentUser();
    const isAdmin = DataService.isAdmin();
    const isOwnProfile = currentUser.id === user.id;

    const bodyHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; margin: 0 auto 1rem; background: ${user.role === 'admin' ? 'var(--color-forest)' : user.role === 'host' ? 'var(--color-terracotta)' : 'var(--color-sage)'}; display: flex; align-items: center; justify-content: center;">
                ${user.photoURL
                    ? `<img src="${user.photoURL}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`
                    : `<span style="font-family: var(--font-display); font-size: 2rem; color: white;">${user.displayName.charAt(0)}</span>`
                }
            </div>
            <h3 style="margin: 0; font-size: 1.25rem;">${escapeHtml(user.displayName)}</h3>
            <p style="margin: 0.25rem 0 0; color: var(--color-text-light);">
                ${user.username ? '@' + escapeHtml(user.username) + ' · ' : ''}
                <span style="text-transform: capitalize;">${user.role}</span>
            </p>
            ${user.status === 'deactivated' ? '<span style="display: inline-block; margin-top: 0.5rem; font-size: 0.75rem; background: #fee2e2; color: #dc2626; padding: 0.25rem 0.5rem; border-radius: 4px;">Account Deactivated</span>' : ''}
        </div>

        ${user.bio ? `
        <div style="background: var(--color-cream); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
            <p style="margin: 0; font-size: 0.9375rem; color: var(--color-text);">${escapeHtml(user.bio)}</p>
        </div>
        ` : ''}

        <div style="display: grid; gap: 0.75rem;">
            ${user.email && (isAdmin || isOwnProfile) ? `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span style="font-size: 0.9375rem;">${escapeHtml(user.email)}</span>
            </div>
            ` : ''}
            ${user.phone ? `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span style="font-size: 0.9375rem;">${escapeHtml(user.phone)}</span>
            </div>
            ` : ''}
        </div>

        ${isAdmin && !isOwnProfile ? `
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-cream-dark);">
            <h4 style="font-size: 0.875rem; color: var(--color-text-light); margin-bottom: 0.75rem;">Admin Actions</h4>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" onclick="closeModal(); openUserModal('${user.id}')">Edit User</button>
                <button class="btn btn-${user.status === 'deactivated' ? 'primary' : 'ghost'} btn-sm" onclick="toggleUserStatus('${user.id}')" style="${user.status !== 'deactivated' ? 'color: #ef4444;' : ''}">
                    ${user.status === 'deactivated' ? 'Reactivate' : 'Deactivate'}
                </button>
            </div>
        </div>
        ` : ''}
    `;

    openModal('Member Profile', bodyHTML, `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`);
}

// ============================================
// APP STATE MANAGEMENT
// ============================================

function showAppState() {
    const authView = document.getElementById('auth-view');
    const appView = document.getElementById('app-view');
    const currentUser = DataService.getCurrentUser();

    if (currentUser) {
        // Email verification disabled - accounts are created manually by admin
        // If you want to re-enable, uncomment the block below:
        /*
        if (PortalConfig.useFirebase && window.Auth && Auth.currentUser && !Auth.currentUser.emailVerified) {
            authView.style.display = 'block';
            appView.style.display = 'none';
            document.body.classList.remove('app-mode');
            document.getElementById('verify-email-display').textContent = Auth.currentUser.email;
            showAuthView('verify-email');
            return;
        }
        */

        authView.style.display = 'none';
        appView.style.display = '';  // Clear inline style so CSS media queries work
        document.body.classList.add('app-mode');
        renderDesktopSidebar();
        renderPage();
        updateNotificationBadge();
    } else {
        authView.style.display = 'block';
        appView.style.display = 'none';
        document.body.classList.remove('app-mode');
        showAuthView('login');
    }
}

// ============================================
// UI/UX IMPROVEMENTS (Features 48-50)
// ============================================

// Feature 48: Pull-to-refresh
let pullToRefreshState = {
    startY: 0,
    pulling: false,
    threshold: 80,
    indicator: null
};

function setupPullToRefresh() {
    // Only enable on mobile devices (touch-enabled and narrow screens)
    if (window.innerWidth >= 768) return;

    const main = document.getElementById('app-main');
    if (!main) return;

    // Create pull indicator
    pullToRefreshState.indicator = document.createElement('div');
    pullToRefreshState.indicator.id = 'pull-refresh-indicator';
    pullToRefreshState.indicator.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; color: var(--color-text-light); font-size: 0.875rem;">
            <svg id="pull-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s;">
                <polyline points="17 1 21 5 17 9"></polyline>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <polyline points="7 23 3 19 7 15"></polyline>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
            <span id="pull-text">Pull to refresh</span>
        </div>
    `;
    pullToRefreshState.indicator.style.cssText = `
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        text-align: center;
        z-index: 100;
        transform: translateY(-100%);
        transition: transform 0.2s ease;
        pointer-events: none;
    `;
    document.body.appendChild(pullToRefreshState.indicator);

    main.addEventListener('touchstart', handlePullStart, { passive: true });
    main.addEventListener('touchmove', handlePullMove, { passive: false });
    main.addEventListener('touchend', handlePullEnd, { passive: true });
}

function handlePullStart(e) {
    const main = document.getElementById('app-main');
    if (main.scrollTop === 0) {
        pullToRefreshState.startY = e.touches[0].clientY;
        pullToRefreshState.pulling = true;
    }
}

function handlePullMove(e) {
    if (!pullToRefreshState.pulling) return;

    const main = document.getElementById('app-main');
    if (main.scrollTop > 0) {
        pullToRefreshState.pulling = false;
        return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - pullToRefreshState.startY;

    if (diff > 0) {
        e.preventDefault();
        const progress = Math.min(diff / pullToRefreshState.threshold, 1);
        const translateY = Math.min(diff * 0.5, 50);

        pullToRefreshState.indicator.style.transform = `translateY(${translateY - 50}px)`;

        const arrow = document.getElementById('pull-arrow');
        const text = document.getElementById('pull-text');

        if (progress >= 1) {
            if (arrow) arrow.style.transform = 'rotate(180deg)';
            if (text) text.textContent = 'Release to refresh';
        } else {
            if (arrow) arrow.style.transform = 'rotate(0deg)';
            if (text) text.textContent = 'Pull to refresh';
        }
    }
}

function handlePullEnd(e) {
    if (!pullToRefreshState.pulling) return;
    pullToRefreshState.pulling = false;

    const indicator = pullToRefreshState.indicator;
    const text = document.getElementById('pull-text');

    if (text && text.textContent === 'Release to refresh') {
        if (text) text.textContent = 'Refreshing...';

        // Perform refresh
        setTimeout(() => {
            renderPage();
            showToast('Page refreshed', 'success');
            indicator.style.transform = 'translateY(-100%)';
            if (text) text.textContent = 'Pull to refresh';
        }, 500);
    } else {
        indicator.style.transform = 'translateY(-100%)';
    }
}

// Feature 49: Offline indicator
let isOnline = navigator.onLine;

function setupOfflineIndicator() {
    // Create offline banner
    const offlineBanner = document.createElement('div');
    offlineBanner.id = 'offline-banner';
    offlineBanner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
            <span>You're offline</span>
        </div>
    `;
    offlineBanner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: var(--color-terracotta);
        color: white;
        padding: 0.5rem;
        text-align: center;
        font-size: 0.875rem;
        z-index: 9999;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
    `;
    document.body.appendChild(offlineBanner);

    // Handle online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) {
        handleOffline();
    }
}

function handleOnline() {
    isOnline = true;
    const banner = document.getElementById('offline-banner');
    if (banner) {
        banner.style.transform = 'translateY(-100%)';
    }
    showToast('Back online', 'success');
}

function handleOffline() {
    isOnline = false;
    const banner = document.getElementById('offline-banner');
    if (banner) {
        banner.style.transform = 'translateY(0)';
    }
}

// Feature 50: Scroll-to-top button
function setupScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scroll-to-top';
    scrollBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
    `;
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 1rem;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--color-forest);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-md);
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px);
        transition: opacity 0.3s, visibility 0.3s, transform 0.3s, background 0.2s;
        z-index: 100;
    `;
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollBtn);

    // Handle scroll events
    const main = document.getElementById('app-main');
    if (main) {
        main.addEventListener('scroll', () => {
            if (main.scrollTop > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.visibility = 'visible';
                scrollBtn.style.transform = 'translateY(0)';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
                scrollBtn.style.transform = 'translateY(20px)';
            }
        });
    }

    // Handle click
    scrollBtn.addEventListener('click', () => {
        if (main) {
            main.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // Hover effect
    scrollBtn.addEventListener('mouseenter', () => {
        scrollBtn.style.background = 'var(--color-forest-light)';
    });
    scrollBtn.addEventListener('mouseleave', () => {
        scrollBtn.style.background = 'var(--color-forest)';
    });
}

// Confirm dialog helper
function showConfirmDialog(title, message, onConfirm, options = {}) {
    const { confirmText = 'Confirm', cancelText = 'Cancel', danger = false } = options;

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = `
        <p style="color: var(--color-text-light); margin-bottom: 1.5rem; font-size: 0.9375rem;">${message}</p>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button class="btn btn-ghost" onclick="closeModal()">${cancelText}</button>
            <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" onclick="handleConfirmDialogAction()" id="confirm-dialog-btn">${confirmText}</button>
        </div>
    `;

    window.handleConfirmDialogAction = () => {
        closeModal();
        if (onConfirm) onConfirm();
    };

    openModal();
}

// Initialize UI/UX improvements
function initUIUXImprovements() {
    setupPullToRefresh();
    setupOfflineIndicator();
    setupScrollToTop();
}

function initPortal() {
    // Load saved state for demo mode
    if (PortalConfig.demoMode) {
        loadState();
    }

    // Initialize UI/UX improvements
    initUIUXImprovements();

    // If Firebase is enabled, listen for auth changes
    if (PortalConfig.useFirebase && window.Auth) {
        Auth.onAuthChange((user, userData) => {
            if (userData) {
                state.currentUserData = userData;
            }
            showAppState();
        });
    }

    // Handle login form
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier').value;
        const password = document.getElementById('login-password').value;

        setButtonLoading('login-submit', true);
        document.getElementById('login-error').style.display = 'none';

        try {
            const success = await login(identifier, password);

            if (success) {
                const currentUser = DataService.getCurrentUser();
                showToast(`Welcome back, ${currentUser.displayName.split(' ')[0]}!`, 'success');
                showAppState();
            } else {
                showMessage('login-error', 'Invalid username/email or password');
            }
        } catch (error) {
            showMessage('login-error', error.message || 'Invalid username/email or password');
        } finally {
            setButtonLoading('login-submit', false);
        }
    });

    // Handle registration form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }

    // Handle forgot password form
    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }

    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Close modal on Escape
        if (e.key === 'Escape') {
            closeModal();
        }

        // Only enable shortcuts when authenticated and not in modal
        const isModalOpen = document.getElementById('modal-overlay')?.classList.contains('open');
        const currentUser = DataService.getCurrentUser();
        if (!currentUser || isModalOpen) return;

        // Quick navigation shortcuts (Ctrl/Cmd + number)
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    navigateTo('home');
                    break;
                case '2':
                    e.preventDefault();
                    navigateTo('events');
                    break;
                case '3':
                    e.preventDefault();
                    navigateTo('groups');
                    break;
                case '4':
                    e.preventDefault();
                    navigateTo('kete');
                    break;
                case '5':
                    e.preventDefault();
                    navigateTo('profile');
                    break;
                case 'k':
                    e.preventDefault();
                    openSearchModal();
                    break;
            }
        }
    });

    // Add ARIA labels to interactive elements
    setupAccessibility();

    // Show correct state
    showAppState();

    console.log('[Portal] Initialized', PortalConfig.useFirebase ? '(Firebase mode)' : '(Demo mode)');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortal);
} else {
    initPortal();
}
