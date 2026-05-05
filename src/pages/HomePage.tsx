import { useAuth } from '@/hooks/useAuth'
import { useUpcomingEvents } from '@/hooks/useEvents'
import { useActivityFeed } from '@/hooks/useActivityFeed'
import { Link } from 'react-router-dom'
import { Settings, BookMarked } from 'lucide-react'
import { EventCard } from '@/components/events'
import { ActivityFeedItem } from '@/components/home/ActivityFeedItem'
import { Skeleton, PullToRefresh, EmptyState, Button } from '@/components/common'

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes}${ampm}`
}

export function HomePage() {
  const { user, isAdminOrHost } = useAuth()
  const greeting = getTimeBasedGreeting()
  const firstName = user?.displayName?.split(' ')[0] || 'there'

  const { data: events = [], isLoading: loadingEvents, refetch: refetchEvents } = useUpcomingEvents(5)
  const { data: activities = [], isLoading: loadingActivity, refetch: refetchActivity } = useActivityFeed()

  const handleRefresh = async () => {
    await Promise.all([refetchEvents(), refetchActivity()])
  }

  const [featuredEvent, ...remainingEvents] = events

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="font-display text-2xl text-forest mb-1">{greeting}, {firstName}</h1>

        {/* Upcoming Events */}
        <section className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase tracking-widest font-medium text-terracotta">Upcoming Events</span>
            <Link to="/events" className="text-sm text-sage font-medium no-underline hover:text-forest">See all →</Link>
          </div>

          {loadingEvents ? (
            <div className="flex flex-col gap-2">
              <Skeleton variant="rectangular" height={80} />
              <Skeleton variant="rectangular" height={48} />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No upcoming events"
              message="Check the calendar for future events"
              action={<Link to="/events"><Button variant="outline" size="sm">View Calendar</Button></Link>}
            />
          ) : (
            <>
              {/* Featured next event — dark container */}
              {featuredEvent && (
                <div className="bg-forest rounded-lg p-4 mb-2 cursor-pointer hover:bg-forest-light transition-colors">
                  <div className="text-xs uppercase tracking-widest text-gold mb-2 font-medium">Next Up</div>
                  <div className="font-semibold text-cream text-lg">{featuredEvent.title}</div>
                  <div className="text-sm text-cream/70 mt-1">
                    {new Date(featuredEvent.date).toLocaleDateString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}{formatTime(featuredEvent.time)}
                    {featuredEvent.location && ` · ${featuredEvent.location}`}
                  </div>
                </div>
              )}
              {/* Remaining events as rows with dividers */}
              {remainingEvents.length > 0 && (
                <div className="divide-y divide-[#e0dbd2]">
                  {remainingEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Activity Feed */}
        <section className="mt-8">
          <span className="text-xs uppercase tracking-widest font-medium text-terracotta">Recent Activity</span>

          {loadingActivity ? (
            <div className="mt-3 flex flex-col gap-2">
              <Skeleton variant="rectangular" height={48} />
              <Skeleton variant="rectangular" height={48} />
              <Skeleton variant="rectangular" height={48} />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-text-light mt-3">No recent activity from your communities.</p>
          ) : (
            <div className="mt-3 divide-y divide-[#e0dbd2]">
              {activities.map(item => (
                <ActivityFeedItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Admin Quick Links */}
        {isAdminOrHost && (
          <section className="mt-8 mb-4">
            <span className="text-xs uppercase tracking-widest font-medium text-terracotta">Admin</span>
            <div className="mt-3 divide-y divide-[#e0dbd2]">
              <Link to="/hosting" className="flex items-center gap-3 py-3 px-2 text-text-primary no-underline hover:bg-cream/50 transition-colors">
                <Settings size={18} className="text-text-light" />
                <span className="text-sm font-medium">Manage Events</span>
              </Link>
              <Link to="/directory" className="flex items-center gap-3 py-3 px-2 text-text-primary no-underline hover:bg-cream/50 transition-colors">
                <BookMarked size={18} className="text-text-light" />
                <span className="text-sm font-medium">Directory</span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </PullToRefresh>
  )
}
