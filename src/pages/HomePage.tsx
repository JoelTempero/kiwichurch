import { useAuth } from '@/hooks/useAuth'
import { useUpcomingEvents } from '@/hooks/useEvents'
import { usePublishedKetePosts } from '@/hooks/useKete'
import { Link } from 'react-router-dom'
import { EventCard } from '@/components/events'
import { KeteCard } from '@/components/kete'
import { Skeleton, PullToRefresh, EmptyState, Button } from '@/components/common'

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomePage() {
  const { user, isAdminOrHost } = useAuth()
  const greeting = getTimeBasedGreeting()
  const firstName = user?.displayName?.split(' ')[0] || 'there'

  // Fetch upcoming events (limit 3)
  const { data: events = [], isLoading: loadingEvents, refetch: refetchEvents } = useUpcomingEvents(3)

  // Fetch recent kete posts (limit 2)
  const { data: ketePosts = [], isLoading: loadingKete, refetch: refetchKete } = usePublishedKetePosts(2)

  const handleRefresh = async () => {
    await Promise.all([refetchEvents(), refetchKete()])
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {/* Hero greeting */}
      <div className="home-greeting" style={{
        background: 'linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%)',
        padding: '2rem 1.5rem',
        color: 'white'
      }}>
        <p style={{ opacity: 0.8, marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
          {greeting}
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.75rem',
          color: 'white',
          margin: 0
        }}>
          {firstName}
        </h2>
      </div>

      <div className="app-dashboard">
        {/* Quick Actions */}
        <div className="app-quick-actions">
          <Link to="/events" className="app-quick-action">
            <div className="app-quick-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="app-quick-action-label">Events</span>
          </Link>

          <Link to="/groups" className="app-quick-action">
            <div className="app-quick-action-icon" style={{ background: 'var(--color-terracotta-light)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="app-quick-action-label">Groups</span>
          </Link>

          <Link to="/kete" className="app-quick-action">
            <div className="app-quick-action-icon" style={{ background: 'var(--color-cream-dark)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span className="app-quick-action-label">Kete</span>
          </Link>

          <Link to="/giving" className="app-quick-action">
            <div className="app-quick-action-icon" style={{ background: '#fde68a' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <span className="app-quick-action-label">Giving</span>
          </Link>
        </div>

        {/* Upcoming Events Section */}
        <section className="app-section">
          <div className="app-section-header">
            <h3 className="app-section-title">Upcoming Events</h3>
            <Link to="/events" className="app-section-link">See all</Link>
          </div>
          <div className="app-section-content">
            {loadingEvents ? (
              <div className="home-events-loading">
                <Skeleton variant="rectangular" height={120} />
                <Skeleton variant="rectangular" height={120} />
              </div>
            ) : events.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="No upcoming events"
                message="Check the calendar for future events"
                action={
                  <Link to="/events">
                    <Button variant="outline" size="sm">View Calendar</Button>
                  </Link>
                }
              />
            ) : (
              <div className="home-events-list">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Kete Section */}
        <section className="app-section">
          <div className="app-section-header">
            <h3 className="app-section-title">From the Kete</h3>
            <Link to="/kete" className="app-section-link">Read more</Link>
          </div>
          <div className="app-section-content">
            {loadingKete ? (
              <div className="home-kete-loading">
                <Skeleton variant="rectangular" height={200} />
              </div>
            ) : ketePosts.length === 0 ? (
              <EmptyState
                icon="book"
                title="No posts yet"
                message="Stories and reflections will appear here"
                action={
                  <Link to="/kete">
                    <Button variant="outline" size="sm">Browse Kete</Button>
                  </Link>
                }
              />
            ) : (
              <div className="home-kete-list">
                {ketePosts.map(post => (
                  <KeteCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Admin Quick Links */}
        {isAdminOrHost && (
          <section className="app-section">
            <div className="app-section-header">
              <h3 className="app-section-title">Admin</h3>
            </div>
            <div className="app-admin-links">
              <Link to="/hosting" className="app-admin-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Manage Events</span>
              </Link>
              <Link to="/directory" className="app-admin-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span>Directory</span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </PullToRefresh>
  )
}
