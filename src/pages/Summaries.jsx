import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { Spinner } from '../components/ui/index.jsx'
import Modal from '../components/ui/Modal'
import { Textarea, Button } from '../components/ui/index.jsx'
import { timeAgo, stringToColor } from '../lib/utils'

export default function Summaries() {
  const { profile } = useAuthStore()
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // userBook being edited
  const [editText, setEditText] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    fetchSummaries()
  }, [])

  const fetchSummaries = async () => {
    if (!profile?.id) return
    setLoading(true)

    const { data } = await supabase
      .from('user_books')
      .select('*, books(*)')
      .eq('user_id', profile.id)
      .eq('status', 'completed')
      .not('summary', 'is', null)
      .neq('summary', '')
      .order('updated_at', { ascending: false })

    setSummaries(data ?? [])
    setLoading(false)
  }

  const openEdit = (ub) => {
    setEditing(ub)
    setEditText(ub.summary ?? '')
  }

  const handleSave = async () => {
    if (!editing) return
    setSaveLoading(true)
    await supabase.from('user_books').update({ summary: editText }).eq('id', editing.id)
    setSummaries((prev) => prev.map((s) => s.id === editing.id ? { ...s, summary: editText } : s))
    setSaveLoading(false)
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-mahogany-800 text-3xl font-bold">My Summaries</h1>
        <p className="text-mahogany-500 font-sans text-sm mt-1">Your personal book notes and reflections</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : summaries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-mahogany-200 p-12 text-center">
          <div className="text-4xl mb-3">📝</div>
          <p className="font-display text-mahogany-600 text-xl">No summaries yet</p>
          <p className="text-mahogany-400 font-sans text-sm mt-1">
            Mark a book as completed and write a summary to see it here
          </p>
          <Link to="/search" className="inline-block mt-4 text-amber-600 font-sans text-sm hover:underline">
            Browse the library →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((ub) => {
            const spineColor = stringToColor(ub.books?.title ?? '')
            return (
              <article
                key={ub.id}
                className="bg-white rounded-xl border border-mahogany-100 overflow-hidden shadow-book hover:shadow-book-lg transition-all"
              >
                {/* Colored top bar */}
                <div className="h-1.5" style={{ backgroundColor: spineColor }} />

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Mini book icon */}
                    <div
                      className="w-10 h-14 rounded flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: spineColor + '30' }}
                    >
                      <span className="text-xl">📖</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/books/${ub.book_id}`}
                        className="font-display text-mahogany-800 font-semibold text-lg hover:text-amber-700 transition-colors leading-tight block"
                      >
                        {ub.books?.title}
                      </Link>
                      <p className="text-mahogany-500 font-sans text-sm italic">{ub.books?.author}</p>
                      <p className="text-mahogany-400 font-sans text-xs mt-0.5">
                        Updated {timeAgo(ub.updated_at)}
                      </p>
                    </div>

                    <button
                      onClick={() => openEdit(ub)}
                      className="flex-shrink-0 text-mahogany-400 hover:text-mahogany-700 transition-colors p-1"
                      title="Edit summary"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                  </div>

                  <blockquote className="mt-4 pl-4 border-l-2 border-amber-300">
                    <p className="font-serif text-mahogany-600 text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap">
                      {ub.summary}
                    </p>
                  </blockquote>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Edit modal */}
      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Summary"
      >
        {editing && (
          <div className="space-y-4">
            <p className="font-serif text-mahogany-600 text-sm italic">
              "{editing.books?.title}" — {editing.books?.author}
            </p>
            <Textarea
              label="Your summary"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={8}
              placeholder="Your thoughts…"
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button variant="amber" loading={saveLoading} onClick={handleSave}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
