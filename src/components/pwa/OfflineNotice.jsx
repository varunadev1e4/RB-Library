import { useEffect, useState } from 'react'

export default function OfflineNotice() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const on  = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online',  on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[70] flex justify-center px-4 py-2"
         style={{ paddingTop: 'calc(0.5rem + var(--sat))' }}>
      <div className="bg-mahogany-700 text-paper text-xs font-sans font-medium px-4 py-2 rounded-full shadow-warm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
        You're offline — showing cached content
      </div>
    </div>
  )
}
