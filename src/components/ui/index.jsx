// Button component
export function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, className = '', ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-sans font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1'

  const variants = {
    primary:   'bg-mahogany-800 text-paper hover:bg-mahogany-700 focus:ring-mahogany-600',
    secondary: 'bg-paper-dark text-mahogany-800 hover:bg-mahogany-100 border border-mahogany-200 focus:ring-mahogany-400',
    amber:     'bg-amber-500 text-mahogany-900 hover:bg-amber-400 focus:ring-amber-400',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost:     'text-mahogany-600 hover:bg-mahogany-100 hover:text-mahogany-800 focus:ring-mahogany-400',
    outline:   'border border-mahogany-300 text-mahogany-700 hover:bg-mahogany-50 focus:ring-mahogany-400',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

// Input component
export function Input({
  label, error, hint, className = '', ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium font-sans text-mahogany-700">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 rounded-lg border text-mahogany-800 font-sans text-sm
          bg-white placeholder-mahogany-300
          border-mahogany-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200
          transition-all duration-150 outline-none
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
      {hint && !error && <p className="text-xs text-mahogany-400 font-sans">{hint}</p>}
    </div>
  )
}

// Textarea
export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium font-sans text-mahogany-700">{label}</label>}
      <textarea
        className={`
          w-full px-4 py-2.5 rounded-lg border text-mahogany-800 font-sans text-sm
          bg-white placeholder-mahogany-300 resize-none
          border-mahogany-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200
          transition-all duration-150 outline-none
          ${error ? 'border-red-400' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

// Select
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium font-sans text-mahogany-700">{label}</label>}
      <select
        className={`
          w-full px-4 py-2.5 rounded-lg border text-mahogany-800 font-sans text-sm
          bg-white border-mahogany-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200
          transition-all duration-150 outline-none ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

// Badge component
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default:   'bg-mahogany-100 text-mahogany-700',
    amber:     'bg-amber-100 text-amber-800',
    sage:      'bg-sage-100 text-sage-700',
    green:     'bg-green-100 text-green-700',
    red:       'bg-red-100 text-red-700',
    to_read:   'bg-amber-100 text-amber-800',
    reading:   'bg-sage-100 text-sage-700',
    completed: 'bg-green-100 text-green-800',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-medium ${variants[variant] ?? variants.default} ${className}`}>
      {children}
    </span>
  )
}

// Spinner
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <svg className={`animate-spin text-amber-500 ${sizes[size]} ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// Default export for Spinner (used in App.jsx)
export default Spinner
