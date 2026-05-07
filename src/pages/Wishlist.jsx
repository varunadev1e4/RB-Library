import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { Button, Input, Textarea, Badge, Spinner } from '../components/ui/index.jsx'
import { timeAgo } from '../lib/utils'

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  variant: 'amber' },
  approved: { label: 'Approved', variant: 'green' },
  declined: { label: 'Declined', variant: 'red'   },
}

export default function Wishlist() {
  const { profile } = useAuthStore()
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [form, setForm] = useState({ title: '', author: '', note: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  useEffect(() => { fetchMyRequests() }, [])

  const fetchMyRequests = async () => {
    if (!profile?.id) return
    setLoading(true)
    const { data } = await supabase
      .from('wishlist_requests')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
    setRequests(data ?? [])
    setLoading(false)
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)

    const { data, error } = await supabase
      .from('wishlist_requests')
      .insert({ user_id: profile.id, ...form })
      .select()
      .single()

    if (!error && data) {
      setRequests((prev) => [data, ...prev])
      setForm({ title: '', author: '', note: '' })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-8 max-w-xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-mahogany-800 text-3xl font-bold">Request a Book</h1>
        <p className="text-mahogany-500 font-sans text-sm mt-1">
          Can't find a book in the library? Ask the admin to add it.
        </p>
      </div>

      {/* Request form */}
      <div className="bg-white rounded-2xl border border-mahogany-100 p-6 shadow-book">
        <h2 className="font-display text-mahogany-700 text-lg font-semibold mb-5">New Request</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Book Title *"
            placeholder="e.g. The Midnight Library"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            error={errors.title}
          />
          <Input
            label="Author"
            placeholder="e.g. Matt Haig"
            value={form.author}
            onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
          />
          <Textarea
            label="Why should we add it? (optional)"
            placeholder="A short note for the librarian…"
            value={form.note}
            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            rows={3}
          />

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 text-sm font-sans">✅ Request submitted! The admin will review it soon.</p>
            </div>
          )}

          <Button type="submit" variant="amber" size="lg" loading={saving} className="w-full">
            Submit Request
          </Button>
        </form>
      </div>

      {/* My requests */}
      <div>
        <h2 className="font-display text-mahogany-700 text-xl font-semibold mb-4">My Requests</h2>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : requests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-mahogany-200 p-8 text-center">
            <p className="text-mahogany-400 font-sans text-sm">You haven't made any requests yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-mahogany-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-mahogany-800 font-semibold">{r.title}</p>
                    {r.author && <p className="font-sans text-mahogany-500 text-sm italic">{r.author}</p>}
                    {r.note && (
                      <p className="font-sans text-mahogany-400 text-xs mt-1 line-clamp-2">"{r.note}"</p>
                    )}
                    <p className="text-mahogany-300 font-sans text-xs mt-1">{timeAgo(r.created_at)}</p>
                  </div>
                  <Badge variant={STATUS_CONFIG[r.status]?.variant ?? 'default'} className="flex-shrink-0">
                    {STATUS_CONFIG[r.status]?.label}
                  </Badge>
                </div>
                {r.admin_note && (
                  <div className="mt-3 pt-3 border-t border-mahogany-100">
                    <p className="font-sans text-mahogany-500 text-xs">
                      <span className="font-semibold">Admin note:</span> {r.admin_note}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
