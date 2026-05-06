import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { Badge, Spinner } from '../components/ui/index.jsx'
import { formatDate } from '../lib/utils'

export default function Profile() {
  const { profile, logout } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ to_read: 0, reading: 0, completed: 0, summaries: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    if (!profile?.id) return

    const { data } = await supabase
      .from('user_books')
      .select('status, summary')
      .eq('user_id', profile.id)

    const s = { to_read: 0, reading: 0, completed: 0, summaries: 0 }
    data?.forEach((ub) => {
      if (s[ub.status] !== undefined) s[ub.status]++
      if (ub.summary) s.summaries++
    })
    setStats(s)
    setLoading(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const total = stats.to_read + stats.reading + stats.completed

  return (
    <div className="space-y-6 max-w-lg">
      {/* Profile card */}
      <div className="bg-mahogany-800 rounded-2xl p-6 text-paper relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-full opacity-10 -translate-y-8 translate-x-8" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center mb-4">
            <span className="text-mahogany-900 text-2xl font-display font-bold uppercase">
              {profile?.username?.[0]}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold">@{profile?.username}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={profile?.role === 'admin' ? 'amber' : 'default'} className="capitalize">
              {profile?.role === 'admin' ? '⭐ Admin' : '👤 Member'}
            </Badge>
            {profile?.created_at && (
              <span className="text-mahogany-300 font-sans text-xs">
                Joined {formatDate(profile.created_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Books',  value: total,           emoji: '📚' },
              { label: 'Completed',    value: stats.completed, emoji: '✅' },
              { label: 'Reading Now',  value: stats.reading,   emoji: '📖' },
              { label: 'Summaries',    value: stats.summaries, emoji: '📝' },
            ].map(({ label, value, emoji }) => (
              <div key={label} className="bg-white rounded-xl border border-mahogany-100 p-4 flex items-center gap-3">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="font-display text-mahogany-800 text-2xl font-bold leading-none">{value}</p>
                  <p className="font-sans text-mahogany-500 text-xs mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reading progress bar */}
          {total > 0 && (
            <div className="bg-white rounded-xl border border-mahogany-100 p-5">
              <h2 className="font-display text-mahogany-700 font-semibold mb-3">Reading Progress</h2>
              <div className="space-y-2">
                {[
                  { key: 'completed', label: 'Completed', color: 'bg-green-500' },
                  { key: 'reading',   label: 'Reading',   color: 'bg-amber-500' },
                  { key: 'to_read',   label: 'To Read',   color: 'bg-mahogany-200' },
                ].map(({ key, label, color }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="font-sans text-mahogany-600 text-xs w-20">{label}</span>
                    <div className="flex-1 h-2 bg-mahogany-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${total > 0 ? (stats[key] / total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="font-sans text-mahogany-500 text-xs w-4 text-right">{stats[key]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="bg-white rounded-xl border border-mahogany-100 p-4 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-sans text-sm font-medium transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  )
}
