import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import EventCard from '../components/events/EventCard'
import BookCard from '../components/books/BookCard'
import { Spinner } from '../components/ui/index.jsx'
import { isEventUpcoming, isEventPast } from '../lib/utils'
import { differenceInDays } from 'date-fns'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Home() {
  const { profile } = useAuthStore()
  const [events, setEvents]       = useState([])
  const [rsvps, setRsvps]         = useState({})
  const [rsvpCounts, setRsvpCounts] = useState({})
  const [newBooks, setNewBooks]   = useState([])
  const [leaders, setLeaders]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [eventsRes, booksRes, leadersRes] = await Promise.all([
      supabase.from('events').select('*').order('date', { ascending: false }),
      supabase.from('books').select('*').order('created_at', { ascending: false }).limit(8),
      supabase.from('leaderboard_all_time').select('*').limit(3),
    ])

    const eventsData = eventsRes.data ?? []
    setEvents(eventsData)
    setNewBooks((booksRes.data ?? []).filter(b =>
      b.created_at && differenceInDays(new Date(), new Date(b.created_at)) <= 30
    ))
    setLeaders(leadersRes.data ?? [])

    // User RSVPs
    if (profile?.id && eventsData.length) {
      const { data: myRsvps } = await supabase
        .from('event_rsvps').select('*').eq('user_id', profile.id)
      const rsvpMap = {}
      myRsvps?.forEach((r) => { rsvpMap[r.event_id] = r })
      setRsvps(rsvpMap)

      // RSVP counts
      const counts = {}
      await Promise.all(eventsData.map(async (ev) => {
        const { count } = await supabase
          .from('event_rsvps').select('*', { count: 'exact', head: true })
          .eq('event_id', ev.id).eq('status', 'going')
        counts[ev.id] = { going: count ?? 0 }
      }))
      setRsvpCounts(counts)
    }
    setLoading(false)
  }, [profile?.id])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleRsvp = async (eventId, status) => {
    if (!profile) return
    setRsvpLoading(true)
    const existing = rsvps[eventId]
    setRsvps((prev) => ({ ...prev, [eventId]: { ...(existing ?? {}), status } }))

    if (existing) {
      if (existing.status === status) {
        setRsvps((prev) => { const n = { ...prev }; delete n[eventId]; return n })
        if (status === 'going') setRsvpCounts((p) => ({ ...p, [eventId]: { going: Math.max(0, (p[eventId]?.going ?? 0) - 1) } }))
        await supabase.from('event_rsvps').delete().eq('id', existing.id)
      } else {
        const delta = status === 'going' ? 1 : -1
        setRsvpCounts((p) => ({ ...p, [eventId]: { going: Math.max(0, (p[eventId]?.going ?? 0) + delta) } }))
        await supabase.from('event_rsvps').update({ status }).eq('id', existing.id)
      }
    } else {
      if (status === 'going') setRsvpCounts((p) => ({ ...p, [eventId]: { going: (p[eventId]?.going ?? 0) + 1 } }))
      const { data } = await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: profile.id, status }).select().single()
      if (data) setRsvps((prev) => ({ ...prev, [eventId]: data }))
    }
    setRsvpLoading(false)
  }

  const upcoming = events.filter((e) => isEventUpcoming(e.date))
  const past      = events.filter((e) => isEventPast(e.date))

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div className="pb-4 border-b border-mahogany-100">
        <p className="font-sans text-mahogany-400 text-xs uppercase tracking-widest mb-1">Good day,</p>
        <h1 className="font-display text-mahogany-800 text-3xl font-bold">
          @{profile?.username}
          {profile?.role === 'admin' && (
            <span className="ml-2 text-xs font-sans font-normal bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full align-middle">Admin</span>
          )}
        </h1>
        <p className="font-serif text-mahogany-500 text-base mt-1 italic">What will you read today?</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          {/* ── New Arrivals ──────────────────────────────── */}
          {newBooks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-mahogany-700 text-xl font-semibold flex items-center gap-2">
                  <span>✨</span> New Arrivals
                </h2>
                <Link to="/search" className="text-amber-600 font-sans text-sm hover:underline">Browse all →</Link>
              </div>
              {/* Horizontal scroll on mobile */}
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0">
                {newBooks.map((book) => (
                  <div key={book.id} className="min-w-[260px] md:min-w-0">
                    <BookCard book={book} compact />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Mini Leaderboard ─────────────────────────── */}
          {leaders.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-mahogany-700 text-xl font-semibold flex items-center gap-2">
                  <span>🏆</span> Top Readers
                </h2>
                <Link to="/leaderboard" className="text-amber-600 font-sans text-sm hover:underline">Full leaderboard →</Link>
              </div>
              <div className="bg-white rounded-2xl border border-mahogany-100 overflow-hidden shadow-book">
                {leaders.map((row, i) => (
                  <div key={row.id}
                    className={`flex items-center gap-4 px-5 py-3 ${i < leaders.length - 1 ? 'border-b border-mahogany-50' : ''} ${row.id === profile?.id ? 'bg-amber-50' : ''}`}
                  >
                    <span className="text-xl w-6 text-center">{MEDALS[i]}</span>
                    <div className="w-8 h-8 rounded-full bg-mahogany-700 flex items-center justify-center">
                      <span className="text-paper font-display font-bold text-xs uppercase">{row.username?.[0]}</span>
                    </div>
                    <p className="flex-1 font-sans text-mahogany-700 font-medium text-sm">
                      @{row.username}
                      {row.id === profile?.id && <span className="text-amber-500 text-xs ml-1">(you)</span>}
                    </p>
                    <div className="text-right">
                      <p className="font-display text-mahogany-800 font-bold">{row.completed_count}</p>
                      <p className="font-sans text-mahogany-400 text-[10px]">books</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Upcoming Events ──────────────────────────── */}
          <section>
            <h2 className="font-display text-mahogany-700 text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📅</span> Upcoming Events
            </h2>
            {upcoming.length === 0 ? (
              <div className="rounded-xl border border-dashed border-mahogany-200 p-8 text-center">
                <p className="text-mahogany-400 font-serif italic text-sm">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((ev) => (
                  <EventCard key={ev.id} event={ev} rsvp={rsvps[ev.id]} rsvpCounts={rsvpCounts[ev.id]} onRsvp={handleRsvp} loading={rsvpLoading} />
                ))}
              </div>
            )}
          </section>

          {/* ── Past Events ──────────────────────────────── */}
          {past.length > 0 && (
            <section>
              <h2 className="font-display text-mahogany-500 text-lg font-semibold mb-3 flex items-center gap-2">
                <span>🕐</span> Past Events
              </h2>
              <div className="space-y-3">
                {past.map((ev) => (
                  <EventCard key={ev.id} event={ev} rsvp={rsvps[ev.id]} rsvpCounts={rsvpCounts[ev.id]} onRsvp={handleRsvp} loading={rsvpLoading} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
