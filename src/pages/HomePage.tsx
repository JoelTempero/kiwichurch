import { useAuth } from '@/hooks/useAuth'
import { useUpcomingEvents } from '@/hooks/useEvents'
import { usePublishedKetePosts } from '@/hooks/useKete'
import { Link } from 'react-router-dom'
import { Calendar, Users, BookOpen, Heart, Settings, BookMarked } from 'lucide-react'
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

  const { data: events = [], isLoading: loadingEvents, refetch: refetchEvents } = useUpcomingEvents(3)
  const { data: ketePosts = [], isLoading: loadingKete, refetch: refetchKete } = usePublishedKetePosts(2)

  const handleRefresh = async () => {
    await Promise.all([refetchEvents(), refetchKete()])
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {/* Hero greeting */}
      <div className="bg-gradient-to-br from-forest to-forest-light px-6 py-8 text-white">
        <p className="opacity-80 mb-1 text-[0.9375rem]">{greeting}</p>
        <h2 className="font-display text-3xl text-white m-0">{firstName}</h2>
      </div>

      <div className="app-dashboard">
        {/* Quick Actions */}
        <div className="app-quick-actions">
          <Link to="/events" className="app-quick-action">
            <div className="app-quick-action-icon">
              <Calendar size={24} />
            </div>
            <span className="app-quick-action-label">Events</span>
          </Link>

          <Link to="/groups" className="app-quick-action">
            <div className="app-quick-action-icon" style={{ background: 'var(--color-terracotta-light)' }}>
              <Users size={24} />
            </div>
            <span className="app-quick-action-label">Groups</span>
          </Link>

          <Link to="/kete" className="app-quick-action">
            <div className="app-quick-action-icon" style={{ background: 'var(--color-cream-dark)' }}>
              <BookOpen size={24} />
            </div>
            <span className="app-quick-action-label">Kete</span>
          </Link>

          <Link to="/giving" className="app-quick-action">
            <div className="app-quick-action-icon" style={{ background: '#fde68a' }}>
              <Heart size={24} />
            </div>
            <span className="app-quick-action-label">Giving</span>
          </Link>
        </div>

        {/* Upcoming Events Section */}
        <section className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl m-0">Upcoming Events</h3>
            <Link to="/events" className="text-sm text-forest">See all</Link>
          </div>
          <div className="min-h-[100px]">
            {loadingEvents ? (
              <div className="flex flex-col gap-4">
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
              <div className="flex flex-col gap-4">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Kete Section */}
        <section className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl m-0">From the Kete</h3>
            <Link to="/kete" className="text-sm text-forest">Read more</Link>
          </div>
          <div className="min-h-[100px]">
            {loadingKete ? (
              <div className="flex flex-col gap-4">
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
              <div className="grid gap-4 sm:grid-cols-2">
                {ketePosts.map(post => (
                  <KeteCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Admin Quick Links */}
        {isAdminOrHost && (
          <section className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl m-0">Admin</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/hosting" className="flex items-center gap-3 p-4 bg-cream rounded-md text-text-primary no-underline hover:bg-cream-dark hover:text-forest transition-colors">
                <Settings size={20} />
                <span>Manage Events</span>
              </Link>
              <Link to="/directory" className="flex items-center gap-3 p-4 bg-cream rounded-md text-text-primary no-underline hover:bg-cream-dark hover:text-forest transition-colors">
                <BookMarked size={20} />
                <span>Directory</span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </PullToRefresh>
  )
}
