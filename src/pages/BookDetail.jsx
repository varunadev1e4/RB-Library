import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { Button, Badge, Spinner, Textarea } from '../components/ui/index.jsx'
import Modal from '../components/ui/Modal'
import { stringToColor, timeAgo } from '../lib/utils'

const STATUS_OPTIONS = [
  { value: 'to_read',   label: '📋 To Read',         variant: 'to_read'   },
  { value: 'reading',   label: '📖 Currently Reading', variant: 'reading'   },
  { value: 'completed', label: '✅ Completed',         variant: 'completed' },
]

export default function BookDetail() {
  const { id } = useParams()
  const { profile } = useAuthStore()
  const [book, setBook] = useState(null)
  const [userBook, setUserBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const spineColor = book ? stringToColor(book.title) : '#B87748'

  useEffect(() => {
    fetchBook()
  }, [id])

  const fetchBook = async () => {
    const { data: bookData } = await supabase.from('books').select('*').eq('id', id).single()
    setBook(bookData)

    if (profile?.id) {
      const { data: ub } = await supabase
        .from('user_books')
        .select('*')
        .eq('user_id', profile.id)
        .eq('book_id', id)
        .maybeSingle()
      setUserBook(ub)
      if (ub?.summary) setSummary(ub.summary)
    }
    setLoading(false)
  }

  const handleStatusChange = async (status) => {
    if (!profile) return
    setStatusLoading(true)

    if (status === 'completed') {
      // Update status first
      await upsertUserBook(status)
      setShowSummaryModal(true)
    } else {
      await upsertUserBook(status)
    }
    setStatusLoading(false)
  }

  const upsertUserBook = async (status) => {
    if (userBook) {
      const { data } = await supabase
        .from('user_books')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', userBook.id)
        .select()
        .single()
      setUserBook(data)
    } else {
      const { data } = await supabase
        .from('user_books')
        .insert({ user_id: profile.id, book_id: id, status })
        .select()
        .single()
      setUserBook(data)
    }
  }

  const handleSaveSummary = async () => {
    if (!userBook) return
    setSummaryLoading(true)
    const { data } = await supabase
      .from('user_books')
      .update({ summary })
      .eq('id', userBook.id)
      .select()
      .single()
    setUserBook(data)
    setSummaryLoading(false)
    setShowSummaryModal(false)
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  }

  if (!book) {
    return (
      <div className="text-center py-24">
        <p className="font-display text-mahogany-600 text-xl">Book not found</p>
        <Link to="/search" className="text-amber-600 font-sans text-sm mt-2 inline-block hover:underline">
          ← Back to search
        </Link>
      </div>
    )
  }

  const currentStatus = userBook?.status

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/search" className="inline-flex items-center gap-1 text-mahogany-500 hover:text-mahogany-700 font-sans text-sm transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </Link>

      {/* Book header */}
      <div className="flex gap-5 items-start">
        {/* Book cover mockup */}
        <div
          className="flex-shrink-0 w-20 h-28 sm:w-28 sm:h-40 rounded-lg shadow-book-lg flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: spineColor }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
          <span className="text-3xl sm:text-4xl opacity-80">📖</span>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-mahogany-800 text-2xl sm:text-3xl font-bold leading-tight">
            {book.title}
          </h1>
          <p className="font-serif text-mahogany-600 text-lg mt-1 italic">{book.author}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {book.category && <Badge variant="default">{book.category}</Badge>}
            {book.location_code && (
              <Badge variant="amber">📍 Shelf {book.location_code}</Badge>
            )}
            {currentStatus && (
              <Badge variant={currentStatus}>{currentStatus.replace('_', ' ')}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <div className="bg-paper-dark rounded-xl p-5 border border-mahogany-100">
          <h2 className="font-display text-mahogany-700 font-semibold mb-2">About this book</h2>
          <p className="font-serif text-mahogany-600 text-sm leading-relaxed">{book.description}</p>
        </div>
      )}

      {/* Reading status */}
      <div className="bg-white rounded-xl border border-mahogany-100 p-5">
        <h2 className="font-display text-mahogany-700 font-semibold mb-3">Reading Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(({ value, label, variant }) => (
            <button
              key={value}
              onClick={() => handleStatusChange(value)}
              disabled={statusLoading}
              className={`px-4 py-2 rounded-lg text-sm font-sans font-medium transition-all duration-150 border-2 ${
                currentStatus === value
                  ? 'border-mahogany-800 bg-mahogany-800 text-paper shadow-sm'
                  : 'border-mahogany-200 text-mahogany-600 hover:border-mahogany-400 hover:bg-mahogany-50'
              }`}
            >
              {statusLoading && currentStatus === value ? '…' : label}
            </button>
          ))}
          {currentStatus && (
            <button
              onClick={async () => {
                setStatusLoading(true)
                await supabase.from('user_books').delete().eq('id', userBook.id)
                setUserBook(null)
                setStatusLoading(false)
              }}
              disabled={statusLoading}
              className="px-4 py-2 rounded-lg text-sm font-sans font-medium text-mahogany-400 hover:text-red-600 hover:bg-red-50 transition-all border-2 border-transparent"
            >
              Remove
            </button>
          )}
        </div>
        {userBook?.updated_at && (
          <p className="text-xs text-mahogany-400 font-sans mt-3">Updated {timeAgo(userBook.updated_at)}</p>
        )}
      </div>

      {/* Summary section */}
      {currentStatus === 'completed' && (
        <div className="bg-white rounded-xl border border-mahogany-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-mahogany-700 font-semibold">My Summary</h2>
            <Button size="sm" variant="outline" onClick={() => setShowSummaryModal(true)}>
              {userBook?.summary ? 'Edit' : 'Write'} Summary
            </Button>
          </div>
          {userBook?.summary ? (
            <p className="font-serif text-mahogany-600 text-sm leading-relaxed whitespace-pre-wrap">
              {userBook.summary}
            </p>
          ) : (
            <p className="text-mahogany-400 font-sans text-sm italic">
              Share your thoughts about this book…
            </p>
          )}
        </div>
      )}

      {/* Summary Modal */}
      <Modal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title="Write Your Summary"
      >
        <div className="space-y-4">
          <p className="font-serif text-mahogany-600 text-sm italic">
            "{book.title}" — {book.author}
          </p>
          <Textarea
            label="Your thoughts and summary"
            placeholder="What did you think of this book? Summarize the key ideas or your personal reflections…"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={8}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowSummaryModal(false)}>Cancel</Button>
            <Button variant="amber" loading={summaryLoading} onClick={handleSaveSummary}>
              Save Summary
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
