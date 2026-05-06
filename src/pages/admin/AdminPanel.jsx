import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { Button, Input, Textarea, Select, Badge, Spinner } from '../../components/ui/index.jsx'
import Modal from '../../components/ui/Modal'
import { CATEGORIES, formatDate } from '../../lib/utils'

const TABS = [
  { key: 'books',  label: '📚 Books'  },
  { key: 'events', label: '📅 Events' },
  { key: 'users',  label: '👥 Users'  },
]

// ─── Books Tab ────────────────────────────────────────────────────
function BooksTab() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', author: '', description: '', category: '', location_code: '' })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchBooks() }, [])

  const fetchBooks = async () => {
    setLoading(true)
    const { data } = await supabase.from('books').select('*').order('title')
    setBooks(data ?? [])
    setLoading(false)
  }

  const openNew = () => {
    setEditing(null)
    setForm({ title: '', author: '', description: '', category: '', location_code: '' })
    setShowModal(true)
  }

  const openEdit = (book) => {
    setEditing(book)
    setForm({ title: book.title, author: book.author, description: book.description ?? '', category: book.category ?? '', location_code: book.location_code ?? '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.author) return
    setSaving(true)

    if (editing) {
      await supabase.from('books').update(form).eq('id', editing.id)
    } else {
      await supabase.from('books').insert(form)
    }

    await fetchBooks()
    setSaving(false)
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this book?')) return
    await supabase.from('books').delete().eq('id', id)
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-col sm:flex-row">
        <Input placeholder="Search books…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <Button variant="amber" onClick={openNew}>+ Add Book</Button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
        <div className="space-y-2">
          {filtered.map((book) => (
            <div key={book.id} className="bg-white rounded-xl border border-mahogany-100 p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-display text-mahogany-800 font-semibold truncate">{book.title}</p>
                <p className="font-sans text-mahogany-500 text-sm italic truncate">{book.author}</p>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {book.category && <Badge variant="default" className="text-[10px]">{book.category}</Badge>}
                  {book.location_code && <Badge variant="amber" className="text-[10px]">📍 {book.location_code}</Badge>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => openEdit(book)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(book.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-mahogany-400 py-8 font-sans text-sm">No books found</p>}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Book' : 'Add New Book'}>
        <div className="space-y-4">
          <Input label="Title *" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Book title" />
          <Input label="Author *" value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} placeholder="Author name" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description…" rows={3} />
          <Select label="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Location Code" value={form.location_code} onChange={(e) => setForm((p) => ({ ...p, location_code: e.target.value.toUpperCase() }))} placeholder="e.g. A14, B32" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="amber" loading={saving} onClick={handleSave}>
              {editing ? 'Save Changes' : 'Add Book'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Events Tab ───────────────────────────────────────────────────
function EventsTab() {
  const { profile } = useAuthStore()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', date: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    setLoading(true)
    const { data } = await supabase.from('events').select('*').order('date', { ascending: false })
    setEvents(data ?? [])
    setLoading(false)
  }

  const openNew = () => {
    setEditing(null)
    setForm({ title: '', description: '', date: '' })
    setShowModal(true)
  }

  const openEdit = (ev) => {
    setEditing(ev)
    setForm({ title: ev.title, description: ev.description ?? '', date: ev.date?.slice(0, 16) ?? '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.date) return
    setSaving(true)
    if (editing) {
      await supabase.from('events').update(form).eq('id', editing.id)
    } else {
      await supabase.from('events').insert({ ...form, created_by: profile.id })
    }
    await fetchEvents()
    setSaving(false)
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="amber" onClick={openNew}>+ Create Event</Button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
        <div className="space-y-2">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white rounded-xl border border-mahogany-100 p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-display text-mahogany-800 font-semibold">{ev.title}</p>
                <p className="font-sans text-mahogany-500 text-sm">{formatDate(ev.date)}</p>
                {ev.description && <p className="font-sans text-mahogany-400 text-xs mt-0.5 line-clamp-1">{ev.description}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => openEdit(ev)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(ev.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-center text-mahogany-400 py-8 font-sans text-sm">No events yet</p>}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Event' : 'Create Event'}>
        <div className="space-y-4">
          <Input label="Event Title *" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Event name" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the event…" rows={3} />
          <Input label="Date & Time *" type="datetime-local" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="amber" loading={saving} onClick={handleSave}>{editing ? 'Save Changes' : 'Create Event'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────
function UsersTab() {
  const { profile: currentUser } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    setUsers(data ?? [])
    setLoading(false)
  }

  const toggleRole = async (user) => {
    if (user.id === currentUser.id) return alert("You can't change your own role")
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', user.id)
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u))
  }

  return (
    <div className="space-y-2">
      {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
        users.map((u) => (
          <div key={u.id} className="bg-white rounded-xl border border-mahogany-100 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="font-display text-amber-800 font-bold uppercase text-sm">{u.username?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-mahogany-800 font-medium">@{u.username}</p>
              <p className="font-sans text-mahogany-400 text-xs">Joined {formatDate(u.created_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={u.role === 'admin' ? 'amber' : 'default'} className="capitalize">
                {u.role}
              </Badge>
              {u.id !== currentUser.id && (
                <Button size="sm" variant="outline" onClick={() => toggleRole(u)}>
                  {u.role === 'admin' ? 'Demote' : 'Promote'}
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Main AdminPanel ──────────────────────────────────────────────
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('books')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-mahogany-800 text-3xl font-bold">Admin Panel</h1>
        <p className="text-mahogany-500 font-sans text-sm mt-1">Manage library content and users</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-paper-dark rounded-xl p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-sans font-medium transition-all ${
              activeTab === key ? 'bg-white text-mahogany-800 shadow-sm' : 'text-mahogany-500 hover:text-mahogany-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'books'  && <BooksTab />}
      {activeTab === 'events' && <EventsTab />}
      {activeTab === 'users'  && <UsersTab />}
    </div>
  )
}
