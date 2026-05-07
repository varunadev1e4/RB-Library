import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import UpdatePrompt from '../pwa/UpdatePrompt'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-paper">
      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 sidebar-safe">
        <Sidebar />
      </div>

      {/* Main content area */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* Safe-area top padding on mobile (for notch/island) */}
        <div
          className="max-w-5xl mx-auto px-4 sm:px-6 py-4 md:py-6 content-scroll md:pb-8"
          style={{ paddingTop: 'calc(1rem + var(--sat))' }}
        >
          <div className="page-enter">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>

      {/* PWA update prompt */}
      <UpdatePrompt />
    </div>
  )
}
