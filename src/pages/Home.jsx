import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import EventCard from '../components/events/EventCard'
import { Spinner } from '../components/ui/index.jsx'
import { isEventUpcoming } from '../lib/utils'

export default function Home() {
  const { profile } = useAuthStore()
  const [events, setEvents] = useState([])
  const [rsvps, setRsvps] = useState({})        // { eventId: { status } }
  const [rsvpCounts, setRsvpCounts] = useState({}) // { eventId: { going: N } }
  const [loading, setLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)

    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })

    if (!eventsData) { setLoading(false); return }
    setEvents(eventsData)

    // Fetch user's RSVPs
    if (profile?.id) {
      const { data: myRsvps } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('user_id', profile.id)

      const rsvpMap = {}
      myRsvps?.forEach((r) => { rsvpMap[r.event_id] = r })
      setRsvps(rsvpMap)
    }

    // Fetch going counts for all events
    const counts = {}
    for (const ev of eventsData) {
      const { count } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', ev.id)
        .eq('status', 'going')
      counts[ev.id] = { going: count ?? 0 }
    }
    setRsvpCounts(counts)
    setLoading(false)
  }

  const handleRsvp = async (eventId, status) => {
    if (!profile) return
    setRsvpLoading(true)

    const existing = rsvps[eventId]

    // Optimistic update
    setRsvps((prev) => ({ ...prev, [eventId]: { ...existing, status } }))
    const prevCount = rsvpCounts[eventId]?.going ?? 0

    if (existing) {
      // Toggle: if same status, remove RSVP
      if (existing.status === status) {
        setRsvps((prev) => { const n = { ...prev }; delete n[eventId]; return n })
        if (status === 'going') setRsvpCounts((p) => ({ ...p, [eventId]: { going: Math.max(0, prevCount - 1) } }))

        await supabase.from('event_rsvps').delete().eq('id', existing.id)
      } else {
        const newGoing = status === 'going' ? prevCount + 1 : prevCount - 1
        setRsvpCounts((p) => ({ ...p, [eventId]: { going: Math.max(0, newGoing) } }))
        await supabase.from('event_rsvps').update({ status }).eq('id', existing.id)
      }
    } else {
      if (status === 'going') setRsvpCounts((p) => ({ ...p, [eventId]: { going: prevCount + 1 } }))
      const { data } = await supabase.from('event_rsvps').insert({
        event_id: eventId, user_id: profile.id, status
      }).select().single()
      if (data) setRsvps((prev) => ({ ...prev, [eventId]: data }))
    }

    setRsvpLoading(false)
  }

  const upcoming = events.filter((e) => isEventUpcoming(e.date))
  const past = events.filter((e) => !isEventUpcoming(e.date))

  return (
    <div className="space-y-8">
      {/* Greeting header */}
      <div className="pb-4 border-b border-mahogany-100">
        <p className="font-sans text-mahogany-400 text-sm uppercase tracking-widest mb-1">Good day,</p>
        <h1 className="font-display text-mahogany-800 text-3xl font-bold">
          @{profile?.username}
          {profile?.role === 'admin' && (
            <span className="ml-2 text-sm font-sans font-normal bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full align-middle">Admin</span>
          )}
        </h1>
        <p className="font-serif text-mahogany-500 text-base mt-1 italic">What will you read today?</p>
      </div>

      {/* Upcoming events */}
      <section>
        <h2 className="font-display text-mahogany-700 text-xl font-semibold mb-4 flex items-center gap-2">
          <span>📅</span> Upcoming Events
        </h2>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-mahogany-200 p-8 text-center">
            <p className="text-mahogany-400 font-serif italic text-sm">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                rsvp={rsvps[ev.id]}
                rsvpCounts={rsvpCounts[ev.id]}
                onRsvp={handleRsvp}
                loading={rsvpLoading}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past events */}
      {past.length > 0 && (
        <section>
          <h2 className="font-display text-mahogany-500 text-lg font-semibold mb-3 flex items-center gap-2">
            <span>🕐</span> Past Events
          </h2>
          <div className="space-y-3">
            {past.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                rsvp={rsvps[ev.id]}
                rsvpCounts={rsvpCounts[ev.id]}
                onRsvp={handleRsvp}
                loading={rsvpLoading}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
