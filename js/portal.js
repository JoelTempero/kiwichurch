/* ============================================
   Kiwi Church - Portal JavaScript
   Authenticated member portal functionality
   ============================================ */

// ============================================
// CONFIGURATION
// ============================================

const PortalConfig = {
    // Set to true to use Firebase, false for demo mode
    useFirebase: false,
    demoMode: true
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
            content: 'Full article content here...',
            publishedAt: '2024-01-10',
            authorName: 'Darryl Tempero',
            published: true
        },
        {
            id: 'kete-2',
            title: 'Community Update: Summer 2024',
            excerpt: 'A look back at what God has been doing in our communities over the past season.',
            content: 'Full article content here...',
            publishedAt: '2024-01-03',
            authorName: 'Kiwi Church Team',
            published: true
        },
        {
            id: 'kete-3',
            title: 'The Art of Showing Up',
            excerpt: 'Why consistent presence matters more than perfect attendance.',
            content: 'Full article content here...',
            publishedAt: '2023-12-20',
            authorName: 'Sarah Utting',
            published: true
        }
    ],

    messages: []
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
        return MockDB.kete.filter(k => k.published);
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
    // Could add a loading indicator UI here
}

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

    // Update bottom nav
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Update page title
    const titles = {
        home: 'Home',
        events: 'Events',
        groups: 'Groups',
        kete: 'Kete',
        profile: 'Profile',
        hosting: 'Hosting',
        settings: 'Settings',
        users: 'Users'
    };
    document.getElementById('page-title').textContent = titles[page] || 'Portal';

    // Render page
    renderPage();
    window.scrollTo(0, 0);
}

// ============================================
// MODALS
// ============================================

function openModal(title, bodyHTML, footerHTML = '') {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-footer').innerHTML = footerHTML;
    document.getElementById('modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
}

function closeModalOutside(e) {
    if (e.target.id === 'modal-overlay') closeModal();
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
// PAGE RENDERERS
// ============================================

function renderPage() {
    const main = document.getElementById('app-main');

    switch (state.currentPage) {
        case 'home':
            main.innerHTML = renderHomePage();
            break;
        case 'events':
            main.innerHTML = renderEventsPage();
            break;
        case 'groups':
            main.innerHTML = renderGroupsPage();
            break;
        case 'kete':
            main.innerHTML = renderKetePage();
            break;
        case 'profile':
            main.innerHTML = renderProfilePage();
            break;
        case 'hosting':
            main.innerHTML = renderHostingPage();
            break;
        case 'settings':
            main.innerHTML = renderSettingsPage();
            break;
        case 'users':
            main.innerHTML = renderUsersPage();
            break;
        default:
            main.innerHTML = renderHomePage();
    }
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
    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">Communities</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">Your gatherings and groups</p>
        </div>

        <div class="app-section" style="padding-top: 1.5rem;">
            <div class="gatherings-grid">
                ${MockDB.gatherings.map(g => `
                    <div class="gathering-card">
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
                            <span class="event-badge ${g.isPublic ? '' : 'private'}">${g.isPublic ? 'Open' : 'Members'}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div style="height: 20px;"></div>
    `;
}

function renderKetePage() {
    const canPost = DataService.isAdminOrHost();

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">The Kete</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">Stories and reflections</p>
        </div>

        ${canPost ? `
        <div class="app-section" style="padding-top: 1rem;">
            <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="showToast('Post creation coming in Stage 5!', 'default')">
                + New Post
            </button>
        </div>
        ` : ''}

        <div class="app-section" style="padding-top: ${canPost ? '0.5rem' : '1.5rem'};">
            ${MockDB.kete.map(post => `
                <div class="app-event-card" style="display: block; padding: 1.25rem;">
                    <span style="font-size: 0.75rem; color: var(--color-text-light);">${formatDateShort(post.publishedAt)} - ${post.authorName}</span>
                    <h4 style="margin: 0.5rem 0; color: var(--color-forest);">${post.title}</h4>
                    <p style="font-size: 0.9375rem; color: var(--color-text-light); margin: 0;">${post.excerpt}</p>
                </div>
            `).join('')}
        </div>
        <div style="height: 20px;"></div>
    `;
}

function renderProfilePage() {
    const currentUser = DataService.getCurrentUser();

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 2rem 1.5rem; color: white; text-align: center;">
            <div style="width: 80px; height: 80px; background: var(--color-terracotta); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 2rem; color: white;">
                ${currentUser.displayName.charAt(0)}
            </div>
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">${currentUser.displayName}</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem; text-transform: capitalize;">${currentUser.role}</p>
        </div>

        <div class="app-section" style="padding-top: 1.5rem;">
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
            <button class="btn btn-secondary" style="width: 100%; justify-content: center;" onclick="showToast('Post creation coming in Stage 5!', 'default')">
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

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">Settings</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">Admin controls</p>
        </div>

        <div class="app-section" style="padding-top: 1.5rem;">
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
                        <span style="color: var(--color-text-light);">Pending</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Stage 6: Group Messaging</span>
                        <span style="color: var(--color-text-light);">Pending</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Stage 7: Advanced Features</span>
                        <span style="color: var(--color-text-light);">Pending</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Stage 8: Final Polish</span>
                        <span style="color: var(--color-text-light);">Pending</span>
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
        // Check if email verification is required (Firebase mode)
        if (PortalConfig.useFirebase && window.Auth && Auth.currentUser && !Auth.currentUser.emailVerified) {
            authView.style.display = 'block';
            appView.style.display = 'none';
            document.body.classList.remove('app-mode');
            document.getElementById('verify-email-display').textContent = Auth.currentUser.email;
            showAuthView('verify-email');
            return;
        }

        authView.style.display = 'none';
        appView.style.display = 'block';
        document.body.classList.add('app-mode');
        renderPage();
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
        if (e.key === 'Escape') {
            closeModal();
        }
    });

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
