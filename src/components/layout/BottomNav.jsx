import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

const I = {
  home:        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9" /><path d="M9 21V12h6v9" /><path d="M3 12v9h18v-9" /></svg>,
  search:      <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>,
  book:        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>,
  trophy:      <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 000 5H6m12 0h1.5a2.5 2.5 0 000-5H18M8 21h8m-4-3v3M12 3v6m0 0a6 6 0 01-6-6h12a6 6 0 01-6 6z"/></svg>,
  user:        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  admin:       <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
}

export default function BottomNav() {
  const { profile } = useAuthStore()
  const isAdmin = profile?.role === 'admin'

  const items = [
    { to: '/',           label: 'Home',        icon: I.home,   exact: true },
    { to: '/search',     label: 'Search',      icon: I.search  },
    { to: '/my-books',   label: 'Books',       icon: I.book    },
    { to: '/leaderboard',label: 'Ranks',       icon: I.trophy  },
    ...(isAdmin
      ? [{ to: '/admin', label: 'Admin',        icon: I.admin   }]
      : [{ to: '/profile',label: 'Me',          icon: I.user    }]),
  ]

  return (
    <nav className="bottom-nav bg-mahogany-800 border-t border-mahogany-700 flex items-start justify-around px-1 pt-2">
      {items.map(({ to, label, icon, exact }) => (
        <NavLink key={to} to={to} end={exact}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 min-w-[3rem] px-2 py-1 rounded-xl transition-all duration-150 ${
              isActive ? 'text-amber-400' : 'text-mahogany-300 active:text-paper active:bg-mahogany-700'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`transition-transform duration-150 ${isActive ? 'scale-110' : 'scale-100'}`}>{icon}</span>
              <span className={`text-[10px] font-sans font-medium leading-none ${isActive ? 'text-amber-400' : 'text-mahogany-400'}`}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
