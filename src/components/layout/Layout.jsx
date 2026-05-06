import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-paper">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="page-enter">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  )
}
