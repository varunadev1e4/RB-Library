import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Home from './pages/Home'
import SearchBooks from './pages/SearchBooks'
import BookDetail from './pages/BookDetail'
import MyBooks from './pages/MyBooks'
import Summaries from './pages/Summaries'
import Profile from './pages/Profile'
import AdminPanel from './pages/admin/AdminPanel'
import Spinner from './components/ui/Spinner'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, initialized } = useAuthStore()
  if (!initialized) return <div className="flex items-center justify-center min-h-screen bg-paper"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, initialized } = useAuthStore()
  if (!initialized) return <div className="flex items-center justify-center min-h-screen bg-paper"><Spinner /></div>
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth)
  const initialized = useAuthStore((s) => s.initialized)

  useEffect(() => {
    initAuth()
  }, [])

  if (!initialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-paper gap-4">
        <div className="text-5xl">📚</div>
        <Spinner size="lg" />
        <p className="font-serif text-mahogany-500 text-sm">Loading your library…</p>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected app routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="search" element={<SearchBooks />} />
        <Route path="books/:id" element={<BookDetail />} />
        <Route path="my-books" element={<MyBooks />} />
        <Route path="summaries" element={<Summaries />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={
          <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>
        } />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
