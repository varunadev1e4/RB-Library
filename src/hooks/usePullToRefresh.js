import { useEffect, useRef, useState } from 'react'

/**
 * usePullToRefresh — triggers onRefresh when user pulls down on a mobile scroll container.
 * Returns { pulling, progress (0-1), refreshing }
 */
export function usePullToRefresh(onRefresh, { threshold = 80 } = {}) {
  const [state, setState] = useState({ pulling: false, progress: 0, refreshing: false })
  const startY = useRef(0)
  const pulling = useRef(false)

  useEffect(() => {
    const el = document.documentElement

    const onTouchStart = (e) => {
      if (el.scrollTop > 0) return
      startY.current = e.touches[0].clientY
      pulling.current = true
    }

    const onTouchMove = (e) => {
      if (!pulling.current) return
      const dy = e.touches[0].clientY - startY.current
      if (dy <= 0) { pulling.current = false; return }
      const progress = Math.min(dy / threshold, 1)
      setState({ pulling: true, progress, refreshing: false })
    }

    const onTouchEnd = async () => {
      if (!pulling.current) return
      pulling.current = false
      if (state.progress >= 1) {
        setState({ pulling: false, progress: 0, refreshing: true })
        await onRefresh()
        setState({ pulling: false, progress: 0, refreshing: false })
      } else {
        setState({ pulling: false, progress: 0, refreshing: false })
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })
    window.addEventListener('touchend',   onTouchEnd)

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('touchend',   onTouchEnd)
    }
  }, [onRefresh, state.progress, threshold])

  return state
}
