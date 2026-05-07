import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('[PWA] Service worker registered:', r)
    },
    onRegisterError(err) {
      console.log('[PWA] Service worker registration error:', err)
    },
  })

  if (!needRefresh) return null

  return (
    <div className="install-banner fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-mahogany-800 text-paper rounded-2xl shadow-warm-lg px-5 py-4 flex items-center gap-4 border border-mahogany-600">
        <div className="text-2xl flex-shrink-0">🔄</div>
        <div className="flex-1 min-w-0">
          <p className="font-sans font-semibold text-sm leading-tight">Update available</p>
          <p className="font-sans text-mahogany-300 text-xs mt-0.5">A new version of the app is ready.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setNeedRefresh(false)}
            className="text-mahogany-400 hover:text-mahogany-200 text-xs font-sans transition-colors px-2 py-1"
          >
            Later
          </button>
          <button
            onClick={() => updateServiceWorker(true)}
            className="bg-amber-500 text-mahogany-900 text-xs font-sans font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-400 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
}
