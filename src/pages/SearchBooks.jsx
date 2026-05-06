import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import BookCard from '../components/books/BookCard'
import { Input, Spinner, Badge } from '../components/ui/index.jsx'
import { CATEGORIES } from '../lib/utils'

export default function SearchBooks() {
  const { profile } = useAuthStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [books, setBooks] = useState([])
  const [userBooks, setUserBooks] = useState({}) // { bookId: userBook }
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Load all books initially
  useEffect(() => {
    fetchBooks()
  }, [])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchBooks(), 400)
    return () => clearTimeout(t)
  }, [query, category])

  const fetchBooks = async () => {
    setLoading(true)
    let q = supabase.from('books').select('*').order('title')

    if (query.trim()) {
      q = q.or(`title.ilike.%${query}%,author.ilike.%${query}%`)
    }
    if (category) {
      q = q.eq('category', category)
    }

    const { data } = await q.limit(50)
    setBooks(data ?? [])
    setSearched(true)

    // Fetch user's book statuses
    if (profile?.id && data?.length) {
      const bookIds = data.map((b) => b.id)
      const { data: ub } = await supabase
        .from('user_books')
        .select('*')
        .eq('user_id', profile.id)
        .in('book_id', bookIds)

      const ubMap = {}
      ub?.forEach((r) => { ubMap[r.book_id] = r })
      setUserBooks(ubMap)
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-mahogany-800 text-3xl font-bold">Search Books</h1>
        <p className="text-mahogany-500 font-sans text-sm mt-1">Find books in the library collection</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search by title or author…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategory('')}
          className={`px-3 py-1 rounded-full text-xs font-sans font-medium transition-all ${
            !category ? 'bg-mahogany-800 text-paper' : 'bg-paper-dark text-mahogany-600 hover:bg-mahogany-100'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat === category ? '' : cat)}
            className={`px-3 py-1 rounded-full text-xs font-sans font-medium transition-all ${
              category === cat ? 'bg-mahogany-800 text-paper' : 'bg-paper-dark text-mahogany-600 hover:bg-mahogany-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : books.length === 0 && searched ? (
        <div className="rounded-xl border border-dashed border-mahogany-200 p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-display text-mahogany-600 text-xl">No books found</p>
          <p className="text-mahogany-400 font-sans text-sm mt-1">Try a different search term or category</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              userBook={userBooks[book.id]}
            />
          ))}
        </div>
      )}

      {books.length > 0 && (
        <p className="text-center text-mahogany-400 font-sans text-xs pb-4">
          Showing {books.length} book{books.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
