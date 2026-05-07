import { useState } from 'react'

/**
 * StarRating — interactive or display-only star rating.
 *
 * Props:
 *  value      (number|null) — current rating (1-5)
 *  onChange   (fn)          — called with new rating; omit for read-only
 *  size       'sm'|'md'|'lg'
 *  showCount  (bool)        — show (N) count label
 *  count      (number)      — rating count to display
 */
export default function StarRating({
  value = null,
  onChange,
  size = 'md',
  showCount = false,
  count = 0,
}) {
  const [hovered, setHovered] = useState(null)
  const readOnly = !onChange

  const sizes = { sm: 14, md: 18, lg: 24 }
  const px = sizes[size]

  const filled  = '#B8860B'
  const empty   = 'currentColor'
  const display = hovered ?? value ?? 0

  return (
    <div className="flex items-center gap-1" role={readOnly ? 'img' : 'group'} aria-label={`${value ?? 0} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= display
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange && onChange(star === value ? null : star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(null)}
            className={`transition-transform ${!readOnly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'} disabled:cursor-default`}
            style={{ lineHeight: 1, background: 'none', border: 'none', padding: 0 }}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <svg
              width={px} height={px}
              viewBox="0 0 24 24"
              fill={isActive ? filled : 'none'}
              stroke={isActive ? filled : '#C9A96E'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        )
      })}

      {showCount && count > 0 && (
        <span className="font-sans text-mahogany-400 ml-1" style={{ fontSize: px * 0.78 }}>
          ({count})
        </span>
      )}
      {showCount && !value && !count && (
        <span className="font-sans text-mahogany-300" style={{ fontSize: px * 0.78 }}>No ratings yet</span>
      )}
    </div>
  )
}
