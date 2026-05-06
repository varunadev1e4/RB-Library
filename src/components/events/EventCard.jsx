import { formatDateTime, isEventUpcoming } from '../../lib/utils'
import { Button, Badge } from '../ui/index.jsx'

export default function EventCard({ event, rsvp, rsvpCounts, onRsvp, loading }) {
  const upcoming = isEventUpcoming(event.date)
  const userStatus = rsvp?.status
  const goingCount = rsvpCounts?.going ?? 0

  return (
    <div className={`rounded-xl border p-5 transition-all duration-200 ${
      upcoming
        ? 'bg-white border-amber-200 shadow-book hover:shadow-book-lg'
        : 'bg-paper-dark border-mahogany-100 opacity-75'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant={upcoming ? 'amber' : 'default'}>
              {upcoming ? '📅 Upcoming' : '✓ Past'}
            </Badge>
          </div>
          <h3 className="font-display text-mahogany-800 font-semibold text-base leading-tight">
            {event.title}
          </h3>
          <p className="text-mahogany-500 font-sans text-sm mt-1">
            {formatDateTime(event.date)}
          </p>
          {event.description && (
            <p className="text-mahogany-600 font-serif text-sm mt-2 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-mahogany-100">
        <p className="text-xs font-sans text-mahogany-400">
          <span className="font-semibold text-mahogany-600">{goingCount}</span> going
        </p>

        {upcoming && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={userStatus === 'going' ? 'amber' : 'outline'}
              onClick={() => onRsvp(event.id, 'going')}
              disabled={loading}
            >
              ✓ Going
            </Button>
            <Button
              size="sm"
              variant={userStatus === 'not_going' ? 'secondary' : 'ghost'}
              onClick={() => onRsvp(event.id, 'not_going')}
              disabled={loading}
            >
              ✕ Not going
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
