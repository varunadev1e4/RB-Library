import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { Button, Input, Textarea, Select, Badge, Spinner } from '../../components/ui/index.jsx'
import Modal from '../../components/ui/Modal'
import { CATEGORIES, formatDate, timeAgo } from '../../lib/utils'

const TABS = [
  { key: 'analytics', label: '📊 Analytics'  },
  { key: 'books',     label: '📚 Books'      },
  { key: 'events',    label: '📅 Events'     },
  { key: 'wishlist',  label: '💌 Requests'   },
  { key: 'users',     label: '👥 Users'      },
]

// ─── Analytics Tab ────────────────────────────────────────────
function AnalyticsTab() {
  const [stats, setStats]     = useState(null)
  const [topBooks, setTopBooks] = useState([])
  const [monthly, setMonthly] = useState([])
  const [statusDist, setStatusDist] = useState([])
  const [loading, setLoading] = useState(true)

  const COLORS = ['#B8860B', '#7A8C6E', '#8B5E3C', '#4A3228', '#C9820A']

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [
      { count: totalBooks },
      { count: totalUsers },
      { count: totalCompleted },
      { count: totalEvents },
      { data: topBooksData },
      { data: signupData },
      { data: distData },
    ] = await Promise.all([
      supabase.from('books').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('user_books').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('analytics_top_books').select('*'),
      supabase.from('analytics_monthly_signups').select('*'),
      supabase.from('analytics_status_dist').select('*'),
    ])

    setStats({ totalBooks, totalUsers, totalCompleted, totalEvents })
    setTopBooks(topBooksData ?? [])
    setMonthly(signupData ?? [])
    setStatusDist((distData ?? []).map(d => ({
      name: d.status.replace('_', ' '),
      value: d.count,
    })))
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Books',    value: stats?.totalBooks ?? 0,     emoji: '📚' },
          { label: 'Members',        value: stats?.totalUsers ?? 0,     emoji: '👥' },
          { label: 'Books Finished', value: stats?.totalCompleted ?? 0, emoji: '✅' },
          { label: 'Events',         value: stats?.totalEvents ?? 0,    emoji: '📅' },
        ].map(({ label, value, emoji }) => (
          <div key={label} className="bg-white rounded-xl border border-mahogany-100 p-4 text-center">
            <div className="text-2xl mb-1">{emoji}</div>
            <div className="font-display text-mahogany-800 text-3xl font-bold">{value}</div>
            <div className="font-sans text-mahogany-500 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Status distribution */}
      <div className="bg-white rounded-xl border border-mahogany-100 p-5">
        <h3 className="font-display text-mahogany-700 font-semibold mb-4">Reading status distribution</h3>
        {statusDist.length === 0 ? (
          <p className="text-mahogany-400 font-sans text-sm text-center py-4">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={statusDist} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3EDE0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#8B5E3C' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#8B5E3C' }} />
              <Tooltip
                contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderRadius: 8, border: '1px solid #E8C9B5' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly signups */}
      <div className="bg-white rounded-xl border border-mahogany-100 p-5">
        <h3 className="font-display text-mahogany-700 font-semibold mb-4">New members (last 12 months)</h3>
        {monthly.length === 0 ? (
          <p className="text-mahogany-400 font-sans text-sm text-center py-4">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthly} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3EDE0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'DM Sans', fill: '#8B5E3C' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#8B5E3C' }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderRadius: 8, border: '1px solid #E8C9B5' }} />
              <Line type="monotone" dataKey="count" stroke="#B8860B" strokeWidth={2} dot={{ fill: '#B8860B', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top books */}
      <div className="bg-white rounded-xl border border-mahogany-100 p-5">
        <h3 className="font-display text-mahogany-700 font-semibold mb-4">Most completed books</h3>
        {topBooks.length === 0 ? (
          <p className="text-mahogany-400 font-sans text-sm text-center py-4">No completions yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(topBooks.length * 36, 180)}>
            <BarChart
              data={topBooks}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3EDE0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#8B5E3C' }} allowDecimals={false} />
              <YAxis
                type="category" dataKey="title" width={120}
                tick={{ fontSize: 10, fontFamily: 'DM Sans', fill: '#4A3228' }}
                tickFormatter={(v) => v.length > 18 ? v.slice(0, 17) + '…' : v}
              />
              <Tooltip
                contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderRadius: 8, border: '1px solid #E8C9B5' }}
                formatter={(v) => [`${v} completions`]}
              />
              <Bar dataKey="completed_count" fill="#B8860B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

// ─── Books Tab ────────────────────────────────────────────────
function BooksTab() {
  const [books, setBooks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', author: '', description: '', category: '', location_code: '' })
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')

  useEffect(() => { fetchBooks() }, [])

  const fetchBooks = async () => {
    setLoading(true)
    const { data } = await supabase.from('books').select('*').order('title')
    setBooks(data ?? [])
    setLoading(false)
  }

  const openNew  = () => { setEditing(null); setForm({ title: '', author: '', description: '', category: '', location_code: '' }); setShowModal(true) }
  const openEdit = (b)  => { setEditing(b); setForm({ title: b.title, author: b.author, description: b.description ?? '', category: b.category ?? '', location_code: b.location_code ?? '' }); setShowModal(true) }

  const handleSave = async () => {
    if (!form.title || !form.author) return
    setSaving(true)
    if (editing) { await supabase.from('books').update(form).eq('id', editing.id) }
    else          { await supabase.from('books').insert(form) }
    await fetchBooks(); setSaving(false); setShowModal(false)
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
          <Input label="Location Code" value={form.location_code} onChange={(e) => setForm((p) => ({ ...p, location_code: e.target.value.toUpperCase() }))} placeholder="e.g. A14" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="amber" loading={saving} onClick={handleSave}>{editing ? 'Save Changes' : 'Add Book'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Events Tab ───────────────────────────────────────────────
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
    setEvents(data ?? []); setLoading(false)
  }

  const openNew  = () => { setEditing(null); setForm({ title: '', description: '', date: '' }); setShowModal(true) }
  const openEdit = (ev) => { setEditing(ev); setForm({ title: ev.title, description: ev.description ?? '', date: ev.date?.slice(0, 16) ?? '' }); setShowModal(true) }

  const handleSave = async () => {
    if (!form.title || !form.date) return
    setSaving(true)
    if (editing) { await supabase.from('events').update(form).eq('id', editing.id) }
    else          { await supabase.from('events').insert({ ...form, created_by: profile.id }) }
    await fetchEvents(); setSaving(false); setShowModal(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button variant="amber" onClick={openNew}>+ Create Event</Button></div>
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
          <Input label="Title *" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Event name" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          <Input label="Date & Time *" type="datetime-local" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="amber" loading={saving} onClick={handleSave}>{editing ? 'Save Changes' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Wishlist Requests Tab ────────────────────────────────────
function WishlistTab() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('pending')
  const [adminNotes, setAdminNotes] = useState({})
  const [saving, setSaving]     = useState(null)

  useEffect(() => { fetchRequests() }, [])

  const fetchRequests = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('wishlist_requests')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })
    setRequests(data ?? [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    setSaving(id)
    const note = adminNotes[id] ?? ''
    await supabase.from('wishlist_requests').update({ status, admin_note: note, updated_at: new Date().toISOString() }).eq('id', id)
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status, admin_note: note } : r))
    setSaving(null)
  }

  const STATUS_CFG = {
    pending:  { label: 'Pending',  variant: 'amber' },
    approved: { label: 'Approved', variant: 'green' },
    declined: { label: 'Declined', variant: 'red'   },
  }

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 bg-paper-dark rounded-xl p-1">
        {['pending', 'approved', 'declined', 'all'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-sans font-medium transition-all capitalize ${filter === f ? 'bg-white text-mahogany-800 shadow-sm' : 'text-mahogany-500'}`}>
            {f} {f !== 'all' && <span className="ml-0.5">({requests.filter(r => r.status === f).length})</span>}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner /></div> : filtered.length === 0 ? (
        <p className="text-center text-mahogany-400 py-8 font-sans text-sm">No {filter === 'all' ? '' : filter} requests</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-mahogany-100 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-display text-mahogany-800 font-semibold">{r.title}</p>
                  {r.author && <p className="font-sans text-mahogany-500 text-sm italic">{r.author}</p>}
                  <p className="font-sans text-mahogany-400 text-xs mt-0.5">
                    Requested by @{r.profiles?.username} · {timeAgo(r.created_at)}
                  </p>
                  {r.note && <p className="font-serif text-mahogany-500 text-xs mt-1 italic">"{r.note}"</p>}
                </div>
                <Badge variant={STATUS_CFG[r.status]?.variant}>{STATUS_CFG[r.status]?.label}</Badge>
              </div>

              {r.status === 'pending' && (
                <div className="space-y-2 pt-2 border-t border-mahogany-100">
                  <Input
                    placeholder="Optional note to requester…"
                    value={adminNotes[r.id] ?? ''}
                    onChange={(e) => setAdminNotes((p) => ({ ...p, [r.id]: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="amber" loading={saving === r.id} onClick={() => updateStatus(r.id, 'approved')} className="flex-1">
                      ✅ Approve
                    </Button>
                    <Button size="sm" variant="danger" loading={saving === r.id} onClick={() => updateStatus(r.id, 'declined')} className="flex-1">
                      ✕ Decline
                    </Button>
                  </div>
                </div>
              )}
              {r.admin_note && r.status !== 'pending' && (
                <p className="text-xs font-sans text-mahogany-400 pt-1 border-t border-mahogany-50">
                  <span className="font-semibold">Your note:</span> {r.admin_note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────
function UsersTab() {
  const { profile: currentUser } = useAuthStore()
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])
  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    setUsers(data ?? []); setLoading(false)
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
              <Badge variant={u.role === 'admin' ? 'amber' : 'default'} className="capitalize">{u.role}</Badge>
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

// ─── Main AdminPanel ──────────────────────────────────────────
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('analytics')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-mahogany-800 text-3xl font-bold">Admin Panel</h1>
        <p className="text-mahogany-500 font-sans text-sm mt-1">Manage library content, requests, and users</p>
      </div>
      {/* Tab nav — scrollable on mobile */}
      <div className="flex gap-1 overflow-x-auto bg-paper-dark rounded-xl p-1 -mx-1">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-shrink-0 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-sans font-medium transition-all whitespace-nowrap ${
              activeTab === key ? 'bg-white text-mahogany-800 shadow-sm' : 'text-mahogany-500 hover:text-mahogany-700'
            }`}>
            {label}
          </button>
        ))}
      </div>
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'books'     && <BooksTab />}
      {activeTab === 'events'    && <EventsTab />}
      {activeTab === 'wishlist'  && <WishlistTab />}
      {activeTab === 'users'     && <UsersTab />}
    </div>
  )
}
