import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { Spinner } from '../components/ui/index.jsx'

const MEDALS = ['🥇', '🥈', '🥉']
const TABS   = [
  { key: 'all',     label: 'All Time',     view: 'leaderboard_all_time'  },
  { key: 'monthly', label: 'This Month',   view: 'leaderboard_monthly'   },
]

function RankBadge({ rank }) {
  if (rank <= 3) return <span className="text-2xl leading-none">{MEDALS[rank - 1]}</span>
  return (
    <div className="w-8 h-8 rounded-full bg-mahogany-100 flex items-center justify-center">
      <span className="font-display text-mahogany-600 font-bold text-sm">{rank}</span>
    </div>
  )
}

function XPBar({ xp, maxXp }) {
  const pct = maxXp > 0 ? Math.min((xp / maxXp) * 100, 100) : 0
  return (
    <div className="h-1.5 bg-mahogany-100 rounded-full overflow-hidden flex-1">
      <div
        className="h-full bg-amber-400 rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function Leaderboard() {
  const { profile } = useAuthStore()
  const [activeTab, setActiveTab] = useState('all')
  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    const view = TABS.find((t) => t.key === activeTab)?.view
    const { data } = await supabase.from(view).select('*').limit(50)
    setRows(data ?? [])
    setLoading(false)
  }

  const maxXp = rows[0]?.xp ?? 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-mahogany-800 text-3xl font-bold">Leaderboard</h1>
        <p className="text-mahogany-500 font-sans text-sm mt-1">Top readers in the community</p>
      </div>

      {/* Podium — top 3 */}
      {!loading && rows.length >= 3 && (
        <div className="bg-mahogany-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 text-9xl flex flex-wrap gap-8 items-center justify-center pointer-events-none select-none">
            {['📚','📚','📚','📚'].map((e, i) => <span key={i}>{e}</span>)}
          </div>
          <div className="relative z-10 flex items-end justify-center gap-3">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-mahogany-600 flex items-center justify-center">
                <span className="font-display text-paper font-bold text-lg uppercase">{rows[1]?.username?.[0]}</span>
              </div>
              <div className="bg-mahogany-600 rounded-xl p-3 text-center min-w-[80px]">
                <p className="text-paper font-sans text-xs truncate font-medium">@{rows[1]?.username}</p>
                <p className="text-amber-300 font-display text-lg font-bold">{rows[1]?.completed_count}</p>
                <p className="text-mahogany-400 text-[10px]">books</p>
              </div>
              <span className="text-2xl">🥈</span>
            </div>

            {/* 1st */}
            <div className="flex flex-col items-center gap-2 -mt-4">
              <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center ring-4 ring-amber-300/30">
                <span className="font-display text-mahogany-900 font-bold text-2xl uppercase">{rows[0]?.username?.[0]}</span>
              </div>
              <div className="bg-amber-500 rounded-xl p-4 text-center min-w-[90px]">
                <p className="text-mahogany-900 font-sans text-xs truncate font-semibold">@{rows[0]?.username}</p>
                <p className="text-mahogany-900 font-display text-2xl font-bold">{rows[0]?.completed_count}</p>
                <p className="text-mahogany-700 text-[10px]">books</p>
              </div>
              <span className="text-3xl">🥇</span>
            </div>

            {/* 3rd */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-mahogany-600 flex items-center justify-center">
                <span className="font-display text-paper font-bold text-lg uppercase">{rows[2]?.username?.[0]}</span>
              </div>
              <div className="bg-mahogany-600 rounded-xl p-3 text-center min-w-[80px]">
                <p className="text-paper font-sans text-xs truncate font-medium">@{rows[2]?.username}</p>
                <p className="text-amber-300 font-display text-lg font-bold">{rows[2]?.completed_count}</p>
                <p className="text-mahogany-400 text-[10px]">books</p>
              </div>
              <span className="text-2xl">🥉</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 bg-paper-dark rounded-xl p-1">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-sans font-medium transition-all ${
              activeTab === key ? 'bg-white text-mahogany-800 shadow-sm' : 'text-mahogany-500 hover:text-mahogany-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Full ranked list */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-mahogany-200 p-12 text-center">
          <p className="font-display text-mahogany-600 text-xl">No data yet</p>
          <p className="text-mahogany-400 font-sans text-sm mt-1">Start reading to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => {
            const isMe = row.id === profile?.id
            return (
              <div key={row.id}
                className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                  isMe
                    ? 'border-amber-300 bg-amber-50 shadow-sm'
                    : 'border-mahogany-100 bg-white hover:border-mahogany-200'
                }`}
              >
                <RankBadge rank={i + 1} />

                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: isMe ? '#B8860B' : '#4A3228' }}>
                  <span className={`font-display font-bold uppercase text-sm ${isMe ? 'text-white' : 'text-mahogany-200'}`}>
                    {row.username?.[0]}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-sans font-medium text-mahogany-800 truncate">
                      @{row.username}
                      {isMe && <span className="ml-1 text-amber-600 text-xs font-bold">(you)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <XPBar xp={row.xp} maxXp={maxXp} />
                    <span className="font-sans text-mahogany-400 text-xs whitespace-nowrap">{row.xp} XP</span>
                  </div>
                </div>

                <div className="flex gap-4 flex-shrink-0 text-right">
                  <div>
                    <p className="font-display text-mahogany-800 font-bold text-lg leading-none">{row.completed_count}</p>
                    <p className="font-sans text-mahogany-400 text-[10px]">books</p>
                  </div>
                  <div>
                    <p className="font-display text-mahogany-800 font-bold text-lg leading-none">{row.summary_count}</p>
                    <p className="font-sans text-mahogany-400 text-[10px]">notes</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
