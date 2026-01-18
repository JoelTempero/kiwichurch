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
            event.rsvps = event.rsvps.filter(id => id !== userId);
        }
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
    document.getElementById('login-username').value = username;
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
        settings: 'Settings'
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
    const isRSVPd = currentUser && event.rsvps.includes(currentUser.id);

    const rsvpNames = event.rsvps.map(id => {
        const u = MockDB.users.find(user => user.id === id);
        return u ? (u.id === currentUser?.id ? 'You' : u.displayName.split(' ')[0]) : 'Unknown';
    });

    const bodyHTML = `
        <div style="margin-bottom: 1rem;">
            <span class="event-badge ${event.isPublic ? '' : 'private'}">${event.isPublic ? 'Public Event' : 'Members Only'}</span>
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
            <h4 style="margin-bottom: 0.75rem;">RSVPs (${event.rsvps.length})</h4>
            ${rsvpNames.length > 0 ? `
                <div class="rsvp-list">
                    ${rsvpNames.map(n => `<span class="rsvp-chip ${n === 'You' ? 'you' : ''}">${n}</span>`).join('')}
                </div>
            ` : '<p style="color: var(--color-text-light); font-size: 0.9375rem;">No RSVPs yet</p>'}
        </div>
    `;

    let footerHTML = `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`;
    if (isRSVPd) {
        footerHTML += `<button class="btn btn-primary" onclick="cancelRSVP('${event.id}')">Cancel RSVP</button>`;
    } else {
        footerHTML += `<button class="btn btn-primary" onclick="confirmRSVP('${event.id}')">RSVP</button>`;
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

    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">Events</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">View and RSVP to gatherings</p>
        </div>

        <div class="app-section" style="padding-top: 1.5rem;">
            <div class="app-section-header">
                <h3 class="app-section-title">Upcoming</h3>
            </div>
            ${events.length > 0 ? events.map(event => {
                const date = new Date(event.date);
                const isRSVPd = event.rsvps.includes(currentUser?.id);
                return `
                    <div class="app-event-card" onclick="openEventModal('${event.id}')">
                        <div class="app-event-date" ${!event.isPublic ? 'style="background: var(--color-terracotta);"' : ''}>
                            <span class="app-event-date-day">${date.getDate()}</span>
                            <span class="app-event-date-month">${date.toLocaleDateString('en-NZ', { month: 'short' })}</span>
                        </div>
                        <div class="app-event-info">
                            <div class="app-event-title">${event.title} ${isRSVPd ? '<span style="color: var(--color-sage);">&#10003;</span>' : ''}</div>
                            <div class="app-event-meta">${formatTime(event.time)} - ${event.location}</div>
                        </div>
                    </div>
                `;
            }).join('') : '<p style="color: var(--color-text-light); text-align: center; padding: 2rem;">No upcoming events</p>'}
        </div>
        <div style="height: 20px;"></div>
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
                <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">Contact Details</h3>
                <div style="display: grid; gap: 1rem;">
                    <div>
                        <label style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.25rem;">Email</label>
                        <p style="margin: 0;">${currentUser.email}</p>
                    </div>
                    <div>
                        <label style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.25rem;">Phone</label>
                        <p style="margin: 0;">${currentUser.phone}</p>
                    </div>
                    ${currentUser.username ? `
                    <div>
                        <label style="font-size: 0.75rem; color: var(--color-text-light); display: block; margin-bottom: 0.25rem;">Username</label>
                        <p style="margin: 0;">@${currentUser.username}</p>
                    </div>
                    ` : ''}
                </div>
                <button class="btn btn-secondary btn-sm" style="margin-top: 1rem;" onclick="showToast('Profile editing coming in Stage 3!', 'default')">Edit Profile</button>
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
    return `
        <div style="background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); padding: 1.5rem; color: white;">
            <h2 style="font-family: var(--font-display); font-size: 1.5rem; color: white; margin: 0;">Hosting</h2>
            <p style="opacity: 0.8; margin: 0.25rem 0 0; font-size: 0.9375rem;">Manage your events and posts</p>
        </div>

        <div class="app-section" style="padding-top: 1.5rem;">
            <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="showToast('Event creation coming in Stage 4!', 'default')">
                + Create Event
            </button>
        </div>

        <div class="app-section">
            <button class="btn btn-secondary" style="width: 100%; justify-content: center;" onclick="showToast('Post creation coming in Stage 5!', 'default')">
                + Write Kete Post
            </button>
        </div>

        <div class="app-section">
            <div class="app-section-header">
                <h3 class="app-section-title">Your Events</h3>
            </div>
            <p style="color: var(--color-text-light); text-align: center; padding: 2rem;">
                Event management will be available once Firebase is connected.
                <br><br>
                <span style="font-size: 0.875rem;">Stage 4: Events & RSVP System</span>
            </p>
        </div>
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
                <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">User Management</h3>
                <p style="color: var(--color-text-light); font-size: 0.9375rem;">
                    User management features will be available in Stage 3: Authentication & User Management.
                </p>
                <button class="btn btn-secondary btn-sm" style="margin-top: 1rem;" onclick="showToast('Coming in Stage 3!', 'default')">Manage Users</button>
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
                        <span style="color: var(--color-text-light);">Pending</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Stage 4: Events & RSVP</span>
                        <span style="color: var(--color-text-light);">Pending</span>
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

function showAppState() {
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const currentUser = DataService.getCurrentUser();

    if (currentUser) {
        loginView.style.display = 'none';
        appView.style.display = 'block';
        document.body.classList.add('app-mode');
        renderPage();
    } else {
        loginView.style.display = 'block';
        appView.style.display = 'none';
        document.body.classList.remove('app-mode');
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
        const identifier = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const success = await login(identifier, password);

        if (success) {
            const currentUser = DataService.getCurrentUser();
            showToast(`Welcome back, ${currentUser.displayName.split(' ')[0]}!`, 'success');
            showAppState();
        } else {
            const errorEl = document.getElementById('login-error');
            errorEl.textContent = 'Invalid username/email or password';
            errorEl.style.display = 'block';
        }
    });

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
