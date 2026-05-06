import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import BookCard from '../components/books/BookCard'
import { Spinner, Badge } from '../components/ui/index.jsx'

const TABS = [
  { key: 'to_read',   label: 'To Read',   emoji: '📋' },
  { key: 'reading',   label: 'Reading',   emoji: '📖' },
  { key: 'completed', label: 'Completed', emoji: '✅' },
]

export default function MyBooks() {
  const { profile } = useAuthStore()
  const [activeTab, setActiveTab] = useState('reading')
  const [booksByStatus, setBooksByStatus] = useState({ to_read: [], reading: [], completed: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserBooks()
  }, [])

  const fetchUserBooks = async () => {
    if (!profile?.id) return
    setLoading(true)

    const { data } = await supabase
      .from('user_books')
      .select('*, books(*)')
      .eq('user_id', profile.id)
      .order('updated_at', { ascending: false })

    const grouped = { to_read: [], reading: [], completed: [] }
    data?.forEach((ub) => {
      if (grouped[ub.status]) grouped[ub.status].push(ub)
    })
    setBooksByStatus(grouped)
    setLoading(false)
  }

  const currentBooks = booksByStatus[activeTab] ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-mahogany-800 text-3xl font-bold">My Books</h1>
        <p className="text-mahogany-500 font-sans text-sm mt-1">Your personal reading tracker</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {TABS.map(({ key, label, emoji }) => (
          <div key={key} className="bg-white rounded-xl border border-mahogany-100 p-4 text-center">
            <div className="text-2xl mb-1">{emoji}</div>
            <div className="font-display text-mahogany-800 text-2xl font-bold">
              {booksByStatus[key]?.length ?? 0}
            </div>
            <div className="font-sans text-mahogany-500 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-paper-dark rounded-xl p-1">
        {TABS.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-sans font-medium transition-all ${
              activeTab === key
                ? 'bg-white text-mahogany-800 shadow-sm'
                : 'text-mahogany-500 hover:text-mahogany-700'
            }`}
          >
            <span>{emoji}</span>
            <span className="hidden sm:inline">{label}</span>
            {booksByStatus[key]?.length > 0 && (
              <span className={`text-xs rounded-full w-4 h-4 flex items-center justify-center ${
                activeTab === key ? 'bg-amber-100 text-amber-700' : 'bg-mahogany-200 text-mahogany-600'
              }`}>
                {booksByStatus[key].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Book list */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : currentBooks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-mahogany-200 p-12 text-center">
          <div className="text-4xl mb-3">{TABS.find((t) => t.key === activeTab)?.emoji}</div>
          <p className="font-display text-mahogany-600 text-xl">No books here yet</p>
          <p className="text-mahogany-400 font-sans text-sm mt-1">
            {activeTab === 'to_read' && 'Add books you want to read from the Search page'}
            {activeTab === 'reading' && 'Mark a book as "Currently Reading" to see it here'}
            {activeTab === 'completed' && 'Books you\'ve finished will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {currentBooks.map((ub) => (
            <BookCard
              key={ub.id}
              book={ub.books}
              userBook={ub}
            />
          ))}
        </div>
      )}
    </div>
  )
}
