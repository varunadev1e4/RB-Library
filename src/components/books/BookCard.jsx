import { Link } from 'react-router-dom'
import { stringToColor } from '../../lib/utils'
import { Badge } from '../ui/index.jsx'
import StarRating from './StarRating'
import { differenceInDays } from 'date-fns'

const STATUS_CONFIG = {
  to_read:   { label: 'To Read',   variant: 'to_read'   },
  reading:   { label: 'Reading',   variant: 'reading'   },
  completed: { label: 'Completed', variant: 'completed' },
}

export default function BookCard({ book, userBook, avgRating = null, compact = false }) {
  const spineColor = stringToColor(book.title)
  const status = userBook?.status
  const isNew = book.created_at
    ? differenceInDays(new Date(), new Date(book.created_at)) <= 30
    : false

  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex rounded-xl overflow-hidden shadow-book hover:shadow-book-lg transition-all duration-200 bg-white border border-mahogany-100 hover:border-mahogany-200 hover:-translate-y-0.5"
    >
      <div className="w-3 flex-shrink-0" style={{ backgroundColor: spineColor }} />
      <div
        className={`flex-shrink-0 flex items-center justify-center ${compact ? 'w-14 h-20' : 'w-16 h-24'}`}
        style={{ backgroundColor: spineColor + '33' }}
      >
        <span className="text-2xl opacity-60">📖</span>
      </div>
      <div className="flex-1 px-3 py-3 min-w-0">
        <div className="flex items-start gap-1.5 justify-between">
          <h3 className={`font-display text-mahogany-800 font-semibold leading-tight line-clamp-2 group-hover:text-amber-700 transition-colors flex-1 ${compact ? 'text-sm' : 'text-base'}`}>
            {book.title}
          </h3>
          {isNew && (
            <span className="flex-shrink-0 text-[10px] font-sans font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full leading-tight">
              New
            </span>
          )}
        </div>
        <p className="text-mahogany-500 font-sans text-xs mt-0.5 truncate italic">{book.author}</p>
        {avgRating?.avg_rating ? (
          <div className="mt-1.5">
            <StarRating
              value={Math.round(Number(avgRating.avg_rating))}
              size="sm"
              showCount
              count={avgRating.rating_count}
            />
          </div>
        ) : null}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {book.category && <Badge variant="default" className="text-[10px] py-0 px-2">{book.category}</Badge>}
          {status && <Badge variant={STATUS_CONFIG[status]?.variant} className="text-[10px] py-0 px-2">{STATUS_CONFIG[status]?.label}</Badge>}
        </div>
        {book.location_code && <p className="text-[10px] font-sans text-mahogany-400 mt-1">📍 Shelf {book.location_code}</p>}
      </div>
    </Link>
  )
}
