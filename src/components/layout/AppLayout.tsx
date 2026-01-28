import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { DesktopSidebar } from './DesktopSidebar'
import { AppHeader } from './AppHeader'

export function AppLayout() {
  const handleSearchClick = () => {
    // TODO: Open search modal
    console.log('Search clicked')
  }

  const handleNotificationsClick = () => {
    // TODO: Open notifications modal
    console.log('Notifications clicked')
  }

  return (
    <div className="app-view">
      <DesktopSidebar />

      <AppHeader
        onSearchClick={handleSearchClick}
        onNotificationsClick={handleNotificationsClick}
      />

      <main id="app-main">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
