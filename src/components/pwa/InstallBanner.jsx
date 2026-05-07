import { useEffect, useState } from 'react'

/**
 * Shows an "Add to Home Screen" banner on mobile browsers.
 * Uses the beforeinstallprompt event (Chrome/Android).
 * iOS users see a manual prompt since Apple doesn't support the event.
 */
export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Already installed as PWA?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Dismissed previously?
    if (sessionStorage.getItem('install-dismissed')) return

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    // Show iOS banner after 3s
    if (ios) setTimeout(() => setShow(true), 3000)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setIsInstalled(true)
      setDeferredPrompt(null)
    }
    setShow(false)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('install-dismissed', '1')
    setShow(false)
  }

  if (!show || isInstalled) return null

  return (
    <div className="install-banner fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-white rounded-2xl shadow-warm-lg border border-mahogany-200 p-4 flex items-start gap-3">
        <img src="/icon-72.png" alt="App icon" className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-display text-mahogany-800 font-semibold text-sm leading-tight">Add to Home Screen</p>
          {isIOS ? (
            <p className="font-sans text-mahogany-500 text-xs mt-1 leading-snug">
              Tap <span className="inline-block">⎋</span> then "Add to Home Screen" for the best experience.
            </p>
          ) : (
            <p className="font-sans text-mahogany-500 text-xs mt-1 leading-snug">
              Install Community Library for offline access and a better experience.
            </p>
          )}
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="mt-2 bg-mahogany-800 text-paper text-xs font-sans font-medium px-3 py-1.5 rounded-lg hover:bg-mahogany-700 transition-colors"
            >
              Install App
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-mahogany-300 hover:text-mahogany-600 transition-colors flex-shrink-0 -mt-1 -mr-1 p-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
