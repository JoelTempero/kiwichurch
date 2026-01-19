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
    users: [
        {
            id: 'user-1',
            username: 'Utting',
            password: 'Freedom',
            displayName: 'Sarah Utting',
            email: 'utting@kiwichurch.org.nz',
            phone: '027-123-4567',
            role: 'member',
            dependants: ['James Utting', 'Emma Utting'],
            rsvps: []
        },
        {
            id: 'user-2',
            username: 'Olds',
            password: 'Prestons',
            displayName: 'Michael Olds',
            email: 'olds@kiwichurch.org.nz',
            phone: '027-234-5678',
            role: 'host',
            dependants: ['Lucy Olds'],
            assignedGatherings: ['gathering-3', 'gathering-6'],
            rsvps: []
        },
        {
            id: 'user-3',
            username: 'Tempero',
            password: 'Hansons',
            displayName: 'Darryl Tempero',
            email: 'tempero@kiwichurch.org.nz',
            phone: '027-556-0055',
            role: 'admin',
            dependants: [],
            rsvps: []
        }
    ],

    gatherings: [
        {
            id: 'gathering-1',
            name: 'Thin Place',
            description: 'A space for allowing our humanity to be held gently. A space for wonder, for being at home, for lamenting, hoping, playing, and encounter.',
            rhythm: 'Fortnightly Wednesdays, 6:30pm',
            isPublic: true,
            color: '#1a3a2f'
        },
        {
            id: 'gathering-2',
            name: 'Online Prayer',
            description: 'Join us in the Zoom room for prayer and connection. All are welcome to these times of shared spiritual practice.',
            rhythm: 'Tues & Thu mornings, 7:00am',
            isPublic: true,
            color: '#7d9a87'
        },
        {
            id: 'gathering-3',
            name: 'Prestons Community',
            description: 'A geographical community gathering in the Prestons area. We share food, fellowship, and faith together.',
            rhythm: 'Weekly Fridays, 6:00pm',
            isPublic: false,
            color: '#c17f59'
        },
        {
            id: 'gathering-4',
            name: 'Rito Shack',
            description: 'A creative gathering space exploring faith through art, music, and making together.',
            rhythm: 'Monthly - First Saturday',
            isPublic: true,
            color: '#2d5a4a'
        },
        {
            id: 'gathering-5',
            name: 'Digging Deeper',
            description: 'A time where we go deeper into God\'s story, exploring ways to listen to God\'s word.',
            rhythm: 'Fortnightly Tuesdays, 7:30pm',
            isPublic: false,
            color: '#d4a574'
        },
        {
            id: 'gathering-6',
            name: 'Reel Life',
            description: 'For those who love movies, acknowledging God is in all things. We watch together and reflect.',
            rhythm: 'Monthly - Third Friday',
            isPublic: true,
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
    async rsvpWithDetails(eventId, userId, status, notes = '', attendees = []) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.setRSVP(eventId, userId, status, notes, attendees);
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
    async createBoardPost(gatheringId, content) {
        if (PortalConfig.useFirebase && window.DB) {
            return await DB.createBoardPost(gatheringId, content);
        }

        const user = this.getCurrentUser();
        if (!user || !this.canAccessBoard(gatheringId)) {
            throw new Error('Cannot post to this board');
        }

        const board = this.getMessageBoard(gatheringId);
        const newPost = {
            id: 'post-' + Date.now(),
            authorId: user.id,
            authorName: user.displayName,
            content,
            createdAt: new Date().toISOString(),
            comments: []
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

    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHTML;
    footerEl.innerHTML = footerHTML;

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

    // Get enhanced RSVP details
    const allRSVPs = DataService.getEventRSVPs(eventId);
    const userRSVP = DataService.getRSVPDetails(eventId, currentUser?.id);
    const isRSVPd = !!userRSVP;

    // Categorize RSVPs
    const attendingRSVPs = allRSVPs.filter(r => r.status === 'attending' || !r.status);
    const maybeRSVPs = allRSVPs.filter(r => r.status === 'maybe');
    const notAttendingRSVPs = allRSVPs.filter(r => r.status === 'not-attending');

    // Count total attendees (including dependants)
    const totalAttending = attendingRSVPs.reduce((count, r) => {
        return count + 1 + (r.attendees?.length || 0);
    }, 0);

    const bodyHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <span class="event-badge ${event.isPublic ? '' : 'private'}">${event.isPublic ? 'Public Event' : 'Members Only'}</span>
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
        <p style="color: var(--color-text-light); margin-bottom: 1.5rem;">${event.description}</p>
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
                <span>${event.location}</span>
            </div>
            ${gathering ? `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>${gathering.name}</span>
                </div>
            ` : ''}
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-cream-dark);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h4 style="margin: 0;">RSVPs</h4>
                <span style="font-size: 0.875rem; color: var(--color-text-light);">
                    ${totalAttending} attending${maybeRSVPs.length > 0 ? `, ${maybeRSVPs.length} maybe` : ''}
                </span>
            </div>

            ${attendingRSVPs.length > 0 ? `
                <div class="rsvp-list" style="margin-bottom: 0.75rem;">
                    ${attendingRSVPs.map(r => {
                        const isYou = r.userId === currentUser?.id;
                        const attendeeCount = r.attendees?.length || 0;
                        return `<span class="rsvp-chip ${isYou ? 'you' : ''}" title="${r.notes || ''}">${isYou ? 'You' : r.userName.split(' ')[0]}${attendeeCount > 0 ? ` +${attendeeCount}` : ''}</span>`;
                    }).join('')}
                </div>
            ` : ''}

            ${maybeRSVPs.length > 0 ? `
                <div style="margin-bottom: 0.75rem;">
                    <span style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.25rem;">Maybe:</span>
                    <div class="rsvp-list">
                        ${maybeRSVPs.map(r => {
                            const isYou = r.userId === currentUser?.id;
                            return `<span class="rsvp-chip ${isYou ? 'you' : ''}" style="opacity: 0.7;" title="${r.notes || ''}">${isYou ? 'You' : r.userName.split(' ')[0]}</span>`;
                        }).join('')}
                    </div>
                </div>
            ` : ''}

            ${allRSVPs.length === 0 ? '<p style="color: var(--color-text-light); font-size: 0.9375rem;">No RSVPs yet. Be the first!</p>' : ''}

            ${userRSVP?.notes ? `
                <p style="font-size: 0.875rem; color: var(--color-text-light); font-style: italic; margin-top: 0.5rem;">
                    Your note: "${userRSVP.notes}"
                </p>
            ` : ''}
        </div>
    `;

    let footerHTML = `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`;
    if (isRSVPd) {
        footerHTML += `<button class="btn btn-primary" onclick="openRSVPModal('${event.id}')">Update RSVP</button>`;
    } else {
        footerHTML += `<button class="btn btn-primary" onclick="openRSVPModal('${event.id}')">RSVP</button>`;
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

            <div class="form-group">
                <label class="form-label" for="event-visibility">Visibility *</label>
                <select class="form-input" id="event-visibility" required>
                    <option value="public">Public - Anyone can see and RSVP</option>
                    <option value="private">Private - Members only</option>
                </select>
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

async function saveNewEvent() {
    const title = document.getElementById('event-title').value.trim();
    const gatheringId = document.getElementById('event-gathering').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const location = document.getElementById('event-location').value.trim();
    const description = document.getElementById('event-description').value.trim();
    const visibility = document.getElementById('event-visibility').value;

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
        await DataService.createEvent({
            title,
            gatheringId,
            date,
            time,
            location,
            description: description || `Join us for ${title.toLowerCase()}.`,
            isPublic: visibility === 'public'
        });

        showToast('Event created successfully!', 'success');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not create event', 'error');
    }
}

function openEditEventModal(eventId) {
    const event = DataService.getEventById(eventId);
    if (!event) return;

    const gatherings = MockDB.gatherings;

    const bodyHTML = `
        <form id="edit-event-form">
            <div class="form-group">
                <label class="form-label" for="edit-event-title">Event Title *</label>
                <input type="text" class="form-input" id="edit-event-title" required value="${event.title}">
            </div>

            <div class="form-group">
                <label class="form-label" for="edit-event-gathering">Gathering *</label>
                <select class="form-input" id="edit-event-gathering" required>
                    ${gatherings.map(g => `
                        <option value="${g.id}" ${event.gatheringId === g.id ? 'selected' : ''}>${g.name}</option>
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
                <input type="text" class="form-input" id="edit-event-location" required value="${event.location}">
            </div>

            <div class="form-group">
                <label class="form-label" for="edit-event-description">Description</label>
                <textarea class="form-input" id="edit-event-description" rows="3">${event.description || ''}</textarea>
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
                </p>
                <button type="button" class="btn btn-ghost" style="color: #dc2626;" onclick="confirmDeleteEvent('${event.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete Event
                </button>
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
    const date = document.getElementById('edit-event-date').value;
    const time = document.getElementById('edit-event-time').value;
    const location = document.getElementById('edit-event-location').value.trim();
    const description = document.getElementById('edit-event-description').value.trim();
    const visibility = document.getElementById('edit-event-visibility').value;

    // Validation
    if (!title || !gatheringId || !date || !time || !location) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    try {
        await DataService.updateEvent(eventId, {
            title,
            gatheringId,
            date,
            time,
            location,
            description: description || `Join us for ${title.toLowerCase()}.`,
            isPublic: visibility === 'public'
        });

        showToast('Event updated successfully!', 'success');
        closeModal();
        renderPage();
    } catch (error) {
        showToast(error.message || 'Could not update event', 'error');
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

            ${currentUser.dependants && currentUser.dependants.length > 0 ? `
            <div class="form-group">
                <label class="form-label">Who's coming?</label>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; cursor: pointer;">
                        <input type="checkbox" value="self" checked disabled>
                        <span>${currentUser.displayName.split(' ')[0]} (you)</span>
                    </label>
                    ${currentUser.dependants.map(d => `
                        <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; cursor: pointer;">
                            <input type="checkbox" name="rsvp-attendees" value="${d}" ${existingRSVP?.attendees?.includes(d) ? 'checked' : ''}>
                            <span>${d}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            ` : ''}

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

async function submitRSVP(eventId) {
    const currentUser = DataService.getCurrentUser();
    if (!currentUser) return;

    const status = document.querySelector('input[name="rsvp-status"]:checked')?.value || 'attending';
    const notes = document.getElementById('rsvp-notes').value.trim();

    // Get selected attendees (dependants)
    const attendeeCheckboxes = document.querySelectorAll('input[name="rsvp-attendees"]:checked');
    const attendees = Array.from(attendeeCheckboxes).map(cb => cb.value);

    try {
        await DataService.rsvpWithDetails(eventId, currentUser.id, status, notes, attendees);

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
    const imageInput = document.getElementById('kete-image');

    // Validation
    if (!title || !excerpt || !content) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    try {
        let featuredImage = null;

        // Handle image upload (demo mode - store as data URL)
        if (imageInput.files && imageInput.files[0]) {
            if (PortalConfig.useFirebase && window.Storage) {
                // Upload to Firebase Storage
                const result = await Storage.uploadKeteImage('temp', imageInput.files[0]);
                featuredImage = result.url;
            } else {
                // Demo mode - store as data URL
                featuredImage = document.getElementById('kete-image-preview').querySelector('img').src;
            }
        }

        await DataService.createKetePost({
            title,
            excerpt,
            content,
            featuredImage,
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
    const published = document.getElementById('edit-kete-published').checked;
    const imageInput = document.getElementById('edit-kete-image');
    const currentImageContainer = document.getElementById('current-kete-image');

    // Validation
    if (!title || !excerpt || !content) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    try {
        const updates = { title, excerpt, content, published };

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

    // Convert simple markdown to HTML
    const contentHtml = renderMarkdown(post.content);

    const bodyHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
                <p style="font-size: 0.875rem; color: var(--color-text-light); margin: 0;">
                    ${formatDate(post.publishedAt || post.createdAt)} ${!post.published ? '<span style="background: var(--color-terracotta-light); color: var(--color-terracotta); padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.75rem;">Draft</span>' : ''}
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
    `;

    const footerHTML = `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`;

    openModal(post.title, bodyHTML, footerHTML);
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

function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;

    const count = DataService.getUnreadNotificationCount();
    badge.style.display = count > 0 ? 'block' : 'none';
}

function openNotificationsModal() {
    const notifications = DataService.getNotifications();

    const notificationIcons = {
        comment: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        post: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>',
        event: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>',
        rsvp: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        mention: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>'
    };

    const bodyHTML = notifications.length > 0 ? `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${notifications.map(n => `
                <div onclick="handleNotificationClick('${n.id}', ${JSON.stringify(n.link).replace(/"/g, '&quot;')})"
                     style="display: flex; gap: 0.75rem; padding: 0.75rem; background: ${n.read ? 'var(--color-cream)' : 'var(--color-sage-light)'}; border-radius: var(--radius-md); cursor: pointer;">
                    <div style="width: 32px; height: 32px; background: ${n.read ? 'var(--color-cream-dark)' : 'var(--color-sage)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${n.read ? 'var(--color-text-light)' : 'white'}; flex-shrink: 0;">
                        ${notificationIcons[n.type] || notificationIcons.post}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: ${n.read ? '400' : '500'}; font-size: 0.9375rem;">${n.title}</div>
                        <div style="color: var(--color-text-light); font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${n.message}</div>
                        <div style="color: var(--color-text-light); font-size: 0.75rem; margin-top: 0.25rem;">${formatRelativeTime(n.createdAt)}</div>
                    </div>
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
    `;

    const unreadCount = DataService.getUnreadNotificationCount();
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

// ============================================
// SEARCH MODAL
// ============================================

function openSearchModal() {
    const bodyHTML = `
        <div style="margin-bottom: 1rem;">
            <input type="text" class="form-input" id="search-input" placeholder="Search events, groups, posts..."
                   oninput="performSearch(this.value)" autofocus style="font-size: 1rem;">
        </div>
        <div id="search-results" style="max-height: 400px; overflow-y: auto;">
            <p style="color: var(--color-text-light); text-align: center; padding: 1rem;">
                Type to search...
            </p>
        </div>
    `;

    openModal('Search', bodyHTML, '');

    // Focus the input after modal opens
    setTimeout(() => {
        document.getElementById('search-input')?.focus();
    }, 100);
}

function performSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    if (!query || query.length < 2) {
        resultsContainer.innerHTML = `<p style="color: var(--color-text-light); text-align: center; padding: 1rem;">Type at least 2 characters to search...</p>`;
        return;
    }

    const results = DataService.search(query);
    const hasResults = results.events.length > 0 || results.groups.length > 0 || results.kete.length > 0 || results.posts.length > 0;

    if (!hasResults) {
        resultsContainer.innerHTML = `<p style="color: var(--color-text-light); text-align: center; padding: 1rem;">No results found for "${escapeHtml(query)}"</p>`;
        return;
    }

    let html = '';

    if (results.events.length > 0) {
        html += `
            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 0.75rem; color: var(--color-text-light); text-transform: uppercase; margin-bottom: 0.5rem;">Events</h4>
                ${results.events.map(e => `
                    <div onclick="closeModal(); openEventModal('${e.id}')" style="padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm); margin-bottom: 0.25rem; cursor: pointer;">
                        <div style="font-weight: 500;">${escapeHtml(e.title)}</div>
                        <div style="font-size: 0.75rem; color: var(--color-text-light);">${formatDateShort(e.date)} • ${e.location}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (results.groups.length > 0) {
        html += `
            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 0.75rem; color: var(--color-text-light); text-transform: uppercase; margin-bottom: 0.5rem;">Groups</h4>
                ${results.groups.map(g => `
                    <div onclick="closeModal(); navigateToGroup('${g.id}')" style="padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm); margin-bottom: 0.25rem; cursor: pointer;">
                        <div style="font-weight: 500;">${escapeHtml(g.name)}</div>
                        <div style="font-size: 0.75rem; color: var(--color-text-light);">${g.rhythm}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (results.kete.length > 0) {
        html += `
            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 0.75rem; color: var(--color-text-light); text-transform: uppercase; margin-bottom: 0.5rem;">Kete Posts</h4>
                ${results.kete.map(k => `
                    <div onclick="closeModal(); openKetePostModal('${k.id}')" style="padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm); margin-bottom: 0.25rem; cursor: pointer;">
                        <div style="font-weight: 500;">${escapeHtml(k.title)}</div>
                        <div style="font-size: 0.75rem; color: var(--color-text-light);">${k.authorName}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (results.posts.length > 0) {
        html += `
            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 0.75rem; color: var(--color-text-light); text-transform: uppercase; margin-bottom: 0.5rem;">Board Posts</h4>
                ${results.posts.map(p => {
                    const group = DataService.getGatheringById(p.gatheringId);
                    return `
                        <div onclick="closeModal(); navigateToGroup('${p.gatheringId}')" style="padding: 0.5rem; background: var(--color-cream); border-radius: var(--radius-sm); margin-bottom: 0.25rem; cursor: pointer;">
                            <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.content.substring(0, 50))}...</div>
                            <div style="font-size: 0.75rem; color: var(--color-text-light);">${p.authorName} in ${group?.name || 'Unknown'}</div>
                        </div>
                    `;
                }).join('')}
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

    // Separate into groups user can access and public groups they can't access (private)
    const accessibleGroups = userGatherings;
    const privateGroups = MockDB.gatherings.filter(g =>
        !g.isPublic && !userGatherings.find(ug => ug.id === g.id)
    );

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">Communities</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">Your gatherings and groups</p>
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
                    return `
                        <div class="gathering-card" onclick="navigateToGroup('${g.id}')" style="cursor: pointer;">
                            <div class="gathering-card-header" style="background: linear-gradient(135deg, ${g.color} 0%, ${g.color}cc 100%); height: 100px;">
                                <h3 style="font-size: 1.25rem;">${g.name}</h3>
                            </div>
                            <div class="gathering-card-body">
                                <span class="gathering-card-rhythm">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    ${g.rhythm}
                                </span>
                                <p class="gathering-card-desc" style="font-size: 0.875rem;">${g.description}</p>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                                    <span class="event-badge ${g.isPublic ? '' : 'private'}">${g.isPublic ? 'Open' : isMember ? 'Member' : 'Members'}</span>
                                    ${postCount > 0 ? `
                                        <span style="font-size: 0.75rem; color: var(--color-text-light);">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                            ${postCount} post${postCount !== 1 ? 's' : ''}
                                        </span>
                                    ` : ''}
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
                        ${g.name}
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
    if (!canAccess) {
        return `
            <div style="padding: 2rem; text-align: center;">
                <p style="color: var(--color-text-light);">You don't have access to this group's message board.</p>
                <button class="btn btn-secondary" onclick="navigateTo('groups')">Back to Groups</button>
            </div>
        `;
    }

    const currentUser = DataService.getCurrentUser();
    const posts = DataService.getBoardPosts(groupId);
    const isMember = DataService.isMemberOfGathering(groupId);

    // Get upcoming events for this group
    const groupEvents = MockDB.events
        .filter(e => e.gatheringId === groupId && new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    return `
        <div style="background: linear-gradient(135deg, ${group.color} 0%, ${group.color}cc 100%); padding: 1.5rem; color: white;">
            <button class="btn btn-ghost btn-sm" onclick="navigateTo('groups')" style="color: white; opacity: 0.8; margin: -0.5rem 0 0.5rem -0.5rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                All Groups
            </button>
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">${group.name}</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">
                ${group.rhythm}
                ${!group.isPublic ? ' • Members Only' : ''}
            </p>
        </div>

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
                <span style="font-size: 0.875rem; color: var(--color-text-light);">${posts.length} post${posts.length !== 1 ? 's' : ''}</span>
            </div>

            <!-- New Post Form -->
            <div style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1rem; box-shadow: var(--shadow-sm); margin-bottom: 1rem;">
                <div style="display: flex; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; background: ${group.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-family: var(--font-display); flex-shrink: 0;">
                        ${currentUser.displayName.charAt(0)}
                    </div>
                    <div style="flex: 1;">
                        <textarea id="new-post-content" class="form-input" rows="2" placeholder="Share something with the group..." style="resize: none;"></textarea>
                        <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
                            <button class="btn btn-primary btn-sm" onclick="submitBoardPost('${groupId}')">Post</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Posts -->
            ${posts.length > 0 ? posts.map(post => {
                const isAuthor = post.authorId === currentUser?.id;
                const isAdmin = currentUser?.role === 'admin';
                const canDelete = isAuthor || isAdmin;

                return `
                    <div class="board-post" style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1rem; box-shadow: var(--shadow-sm); margin-bottom: 0.75rem;">
                        <div style="display: flex; gap: 0.75rem;">
                            <div style="width: 36px; height: 36px; background: var(--color-sage); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-family: var(--font-display); flex-shrink: 0;">
                                ${post.authorName.charAt(0)}
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                    <div>
                                        <span style="font-weight: 500;">${post.authorName}</span>
                                        <span style="color: var(--color-text-light); font-size: 0.75rem; margin-left: 0.5rem;">${formatRelativeTime(post.createdAt)}</span>
                                    </div>
                                    ${canDelete ? `
                                        <button class="btn btn-ghost btn-sm" onclick="deleteBoardPost('${groupId}', '${post.id}')" style="padding: 0.25rem; margin: -0.25rem -0.25rem 0 0;">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" stroke-width="2">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    ` : ''}
                                </div>
                                <p style="margin: 0.5rem 0 0; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(post.content)}</p>

                                <!-- Comments -->
                                ${post.comments.length > 0 ? `
                                    <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--color-cream);">
                                        ${post.comments.map(comment => {
                                            const canDeleteComment = comment.authorId === currentUser?.id || isAdmin;
                                            return `
                                                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                                                    <div style="width: 24px; height: 24px; background: var(--color-cream-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-text); font-size: 0.625rem; font-family: var(--font-display); flex-shrink: 0;">
                                                        ${comment.authorName.charAt(0)}
                                                    </div>
                                                    <div style="flex: 1; min-width: 0;">
                                                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                                            <div>
                                                                <span style="font-weight: 500; font-size: 0.875rem;">${comment.authorName}</span>
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
                                                        <p style="margin: 0.25rem 0 0; font-size: 0.875rem; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(comment.content)}</p>
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

    if (!content) {
        showToast('Please write something to post', 'error');
        return;
    }

    try {
        await DataService.createBoardPost(groupId, content);
        textarea.value = '';
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

function renderKetePage() {
    const canPost = DataService.isAdminOrHost();
    const currentUser = DataService.getCurrentUser();

    // Get published posts for display
    const publishedPosts = MockDB.kete.filter(k => k.published).sort((a, b) => {
        return new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt);
    });

    // Get user's drafts (if they can post)
    const myDrafts = canPost ? MockDB.kete.filter(k => !k.published && k.authorId === currentUser?.id) : [];

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

        <div class="app-section" style="padding-top: ${canPost && myDrafts.length === 0 ? '0.5rem' : '1.5rem'};">
            <div class="app-section-header">
                <h3 class="app-section-title">Published</h3>
            </div>
            ${publishedPosts.length > 0 ? publishedPosts.map(post => {
                const canManage = DataService.canManageKetePost(post);
                return `
                    <div class="app-event-card" onclick="openKetePostModal('${post.id}')" style="cursor: pointer; display: block; padding: 1.25rem;">
                        ${post.featuredImage ? `
                            <img src="${post.featuredImage}" alt="" style="width: 100%; height: 120px; object-fit: cover; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <span style="font-size: 0.75rem; color: var(--color-text-light);">${formatDateShort(post.publishedAt)} • ${post.authorName}</span>
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
                        <p style="font-size: 0.9375rem; color: var(--color-text-light); margin: 0;">${escapeHtml(post.excerpt)}</p>
                        <span style="display: inline-block; margin-top: 0.75rem; font-size: 0.875rem; color: var(--color-sage); font-weight: 500;">Read more →</span>
                    </div>
                `;
            }).join('') : `
                <p style="color: var(--color-text-light); text-align: center; padding: 2rem;">No posts yet. Check back soon!</p>
            `}
        </div>
        <div style="height: 20px;"></div>
    `;
}

function renderProfilePage() {
    const currentUser = DataService.getCurrentUser();
    const activity = DataService.getUserActivity();
    const userGatherings = DataService.getUserGatherings();

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 2rem 1.5rem; color: white; text-align: center;">
            <div style="width: 80px; height: 80px; background: var(--color-terracotta); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 2rem; color: white;">
                ${currentUser.displayName.charAt(0)}
            </div>
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">${currentUser.displayName}</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem; text-transform: capitalize;">${currentUser.role}</p>
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

        <div class="app-section" style="padding-top: 1.5rem;">
            <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="openCreateEventModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Event
            </button>
        </div>

        <div class="app-section">
            <button class="btn btn-secondary" style="width: 100%; justify-content: center;" onclick="openCreateKetePostModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                    <path d="M2 2l7.586 7.586"></path>
                    <circle cx="11" cy="11" r="2"></circle>
                </svg>
                Write Kete Post
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

function renderSettingsPage() {
    const firebaseStatus = PortalConfig.useFirebase ? 'Connected' : 'Demo Mode';
    const statusColor = PortalConfig.useFirebase ? 'var(--color-sage)' : 'var(--color-terracotta)';
    const stats = DataService.getAdminStats();

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">Admin Dashboard</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">Settings and statistics</p>
        </div>

        <!-- Dashboard Stats -->
        ${stats ? `
        <div class="app-section" style="padding-top: 1rem;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                <div style="background: var(--color-white); border-radius: var(--radius-md); padding: 1rem; box-shadow: var(--shadow-sm);">
                    <div style="font-size: 2rem; font-weight: 600; color: var(--color-forest);">${stats.totalUsers}</div>
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
                    <div style="font-size: 2rem; font-weight: 600; color: var(--color-terracotta);">${stats.totalBoardPosts}</div>
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

        <div class="app-section">
            <div style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">User Management</h3>
                <p style="color: var(--color-text-light); font-size: 0.9375rem; margin-bottom: 1rem;">
                    Manage user accounts, roles, and permissions.
                </p>
                <button class="btn btn-primary btn-sm" onclick="navigateTo('users')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Manage Users
                </button>
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

        <div class="app-section">
            <div style="background: var(--color-white); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">Development Progress</h3>
                <div style="display: grid; gap: 0.5rem; font-size: 0.875rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>Stage 1: Multi-Page Architecture</span>
                        <span style="color: var(--color-sage);">Complete</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Stage 2: Firebase Core Setup</span>
                        <span style="color: var(--color-sage);">Complete</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Stage 3: Authentication</span>
                        <span style="color: var(--color-sage);">Complete</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Stage 4: Events & RSVP</span>
                        <span style="color: var(--color-sage);">Complete</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Stage 5: Kete Blog System</span>
                        <span style="color: var(--color-sage);">Complete</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Stage 6: Group Messaging</span>
                        <span style="color: var(--color-sage);">Complete</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Stage 7: Advanced Features</span>
                        <span style="color: var(--color-sage);">Complete</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Stage 8: Final Polish</span>
                        <span style="color: var(--color-sage);">Complete</span>
                    </div>
                </div>
            </div>
        </div>
        <div style="height: 20px;"></div>
    `;
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

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">User Management</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">${users.length} registered users</p>
        </div>

        <div class="app-section" style="padding-top: 1.5rem;">
            <div class="app-section-header">
                <h3 class="app-section-title">All Users</h3>
            </div>
            ${users.map(user => `
                <div class="app-event-card" style="cursor: pointer;" onclick="openUserModal('${user.id}')">
                    <div style="width: 45px; height: 45px; background: ${user.role === 'admin' ? 'var(--color-forest)' : user.role === 'host' ? 'var(--color-terracotta)' : 'var(--color-sage)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.25rem; color: white; flex-shrink: 0;">
                        ${user.displayName.charAt(0)}
                    </div>
                    <div class="app-event-info">
                        <div class="app-event-title">${user.displayName}</div>
                        <div class="app-event-meta">${user.email} &middot; <span style="text-transform: capitalize;">${user.role}</span></div>
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
            <div style="width: 60px; height: 60px; background: ${user.role === 'admin' ? 'var(--color-forest)' : user.role === 'host' ? 'var(--color-terracotta)' : 'var(--color-sage)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.5rem; color: white;">
                ${user.displayName.charAt(0)}
            </div>
            <div>
                <h3 style="margin: 0; font-size: 1.125rem;">${user.displayName}</h3>
                <p style="margin: 0.25rem 0 0; color: var(--color-text-light); font-size: 0.875rem;">${user.email}</p>
            </div>
        </div>

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
                <p style="margin: 0;">${user.phone}</p>
            </div>
            ` : ''}
            ${user.username ? `
            <div>
                <label style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.25rem;">Username</label>
                <p style="margin: 0;">@${user.username}</p>
            </div>
            ` : ''}
        </div>
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
        appView.style.display = 'block';
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

function initPortal() {
    // Load saved state for demo mode
    if (PortalConfig.demoMode) {
        loadState();
    }

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
