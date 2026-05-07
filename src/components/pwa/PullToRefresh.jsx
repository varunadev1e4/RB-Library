/**
 * Wraps content with a visual pull-to-refresh indicator.
 * Pass pulling/progress/refreshing from usePullToRefresh.
 */
export default function PullToRefresh({ pulling, progress, refreshing, children }) {
  const show = pulling || refreshing

  return (
    <div className="relative">
      {/* Indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 transition-all duration-200"
        style={{
          top: show ? `${Math.max(0, (progress ?? 0) * 48 - 24)}px` : '-32px',
          opacity: show ? 1 : 0,
        }}
      >
        <div className={`w-8 h-8 rounded-full bg-mahogany-800 shadow-warm flex items-center justify-center ${refreshing ? 'ptr-spinner' : ''}`}
          style={{ transform: `rotate(${(progress ?? 0) * 360}deg)` }}
        >
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      <div style={{ transform: show ? `translateY(${(progress ?? 0) * 48}px)` : undefined, transition: pulling ? 'none' : 'transform 0.2s ease' }}>
        {children}
      </div>
    </div>
  )
}
