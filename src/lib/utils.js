import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns'

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return format(new Date(dateStr), 'dd MMM yyyy')
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  return format(new Date(dateStr), 'dd MMM yyyy, h:mm a')
}

export const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

export const isEventUpcoming = (dateStr) => isFuture(new Date(dateStr))
export const isEventPast = (dateStr) => isPast(new Date(dateStr))

// Build a fake email from username for Supabase auth
export const toAuthEmail = (username) =>
  `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@community-library.local`

// Deterministic pastel colour from a string (for book spine colours)
export const stringToColor = (str = '') => {
  const palette = [
    '#C9820A', '#7A8C6E', '#6B4E3D', '#4A3228',
    '#8B5E3C', '#5E6F52', '#B87748', '#97B58B',
    '#D4A07A', '#92690A',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return palette[Math.abs(hash) % palette.length]
}

export const STATUS_LABELS = {
  to_read:   { label: 'To Read',    color: 'bg-amber-100 text-amber-800' },
  reading:   { label: 'Reading',    color: 'bg-sage-100 text-sage-800' },
  completed: { label: 'Completed',  color: 'bg-mahogany-100 text-mahogany-800' },
}

export const CATEGORIES = [
  'Fiction', 'Non-Fiction', 'Science', 'History', 'Philosophy',
  'Biography', 'Technology', 'Arts', 'Religion', 'Children', 'Other',
]
