'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/learners', label: 'Learners', icon: '🎓' },
  { href: '/tutors', label: 'Tutors', icon: '👤' },
  { href: '/sessions', label: 'Sessions', icon: '📅' },
  { href: '/pipeline', label: 'Pipeline', icon: '⬡' },
  { href: '/finances', label: 'Finances', icon: '💳' },
  { href: '/payroll', label: 'Payroll', icon: '💰' },
  { href: '/accounts', label: 'Accounts', icon: '📊' },
  { href: '/broadcast', label: 'Broadcast', icon: '📣' },
  { href: '/reports', label: 'Reports', icon: '📈' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="fixed top-0 left-0 h-screen w-[230px] bg-navy flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-800 text-sm">F→A</div>
          <div>
            <p className="text-white font-700 text-sm leading-tight">F-to-A</p>
            <p className="text-white/40 text-[10px] leading-tight">Tutoring Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-5 py-2.5 mx-2 rounded-btn text-sm font-500 transition-all',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              )}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand/30 flex items-center justify-center text-white text-xs font-600">AD</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-600 truncate">Admin</p>
            <p className="text-white/40 text-[10px] truncate">admin@ftoatutoring.net</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
