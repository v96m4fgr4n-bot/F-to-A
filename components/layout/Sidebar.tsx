'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Ic, type IconName } from '@/components/ui/Icon'

const NAV_SECTIONS: { label: string; items: { href: string; label: string; icon: IconName }[] }[] = [
  { label: 'OVERVIEW', items: [{ href: '/dashboard', label: 'Dashboard', icon: 'dash' }] },
  {
    label: 'STUDENTS',
    items: [
      { href: '/learners', label: 'Learners', icon: 'users' },
      { href: '/progress', label: 'Progress', icon: 'trend' },
      { href: '/schedule', label: 'Schedule', icon: 'cal' },
    ],
  },
  {
    label: 'STAFF',
    items: [
      { href: '/tutors', label: 'Tutors', icon: 'users' },
      { href: '/matching', label: 'Matching', icon: 'link' },
      { href: '/payroll', label: 'Payroll', icon: 'money' },
    ],
  },
  {
    label: 'BUSINESS',
    items: [
      { href: '/pipeline', label: 'Pipeline', icon: 'chart' },
      { href: '/finances', label: 'Finances', icon: 'money' },
      { href: '/accounts', label: 'Accounts', icon: 'book' },
      { href: '/discounts', label: 'Discounts', icon: 'tag' },
    ],
  },
  {
    label: 'COMMS',
    items: [
      { href: '/sessions', label: 'Sessions', icon: 'cal' },
      { href: '/broadcast', label: 'Broadcast', icon: 'bell' },
      { href: '/feedback', label: 'Feedback', icon: 'star' },
    ],
  },
  {
    label: 'ADMIN',
    items: [
      { href: '/contracts', label: 'Contracts', icon: 'shield' },
      { href: '/reports', label: 'Reports', icon: 'chart' },
      { href: '/audit', label: 'Audit log', icon: 'tasks' },
      { href: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

const NOTIFS: { icon: IconName; color: string; bg: string; text: string; time: string; unread: boolean }[] = [
  { icon: 'users', color: '#1FA871', bg: '#E8F5E9', text: 'New inquiry: Tatenda & Farai Makoni', time: '2h', unread: true },
  { icon: 'alert', color: '#E0563B', bg: '#FEE2E2', text: 'Invoice overdue: Kudakwashe Ndlovu ($240)', time: '5h', unread: true },
  { icon: 'users', color: '#1C8FD6', bg: '#EBF6FF', text: 'Tinashe cancelled session — Rufaro Gumbo', time: 'Yesterday', unread: false },
  { icon: 'money', color: '#7A5AF8', bg: '#F2EEFF', text: 'Payroll due: 3 tutors — $1,840 total', time: '2d', unread: false },
]

export function Sidebar() {
  const pathname = usePathname()
  const [showNotif, setShowNotif] = useState(false)
  return (
    <div className="sidebar">
      <div className="sb-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--blue)', color: '#fff', fontSize: 12, fontWeight: 800, display: 'grid', placeItems: 'center', letterSpacing: '-.02em' }}>
            F·A
          </div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '-.01em' }}>F to A Tutoring</div>
        </div>
      </div>
      <div className="sb-org">Admin portal v3</div>
      <nav className="sb-nav">
        {NAV_SECTIONS.map(sec => (
          <div key={sec.label}>
            <div className="sb-section">{sec.label}</div>
            {sec.items.map(n => {
              const active = pathname === n.href || pathname.startsWith(n.href + '/')
              return (
                <Link key={n.href} href={n.href} className={'sb-item ' + (active ? 'on' : '')} style={{ textDecoration: 'none' }}>
                  <Ic n={n.icon} s={17} />
                  {n.label}
                </Link>
              )
            })}
          </div>
        ))}
        <div className="sb-divider" />
      </nav>
      <div className="sb-bottom">
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <button className="sb-item" style={{ width: '100%' }} onClick={() => setShowNotif(v => !v)}>
            <Ic n="bell" s={17} /> Notifications
            <span style={{ marginLeft: 'auto', background: 'var(--red)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 20 }}>2</span>
          </button>
          {showNotif && (
            <div className="admin-notif-dropdown">
              <div className="an-head">
                Notifications{' '}
                <button style={{ fontSize: 11.5, color: 'var(--blue)', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'none' }} onClick={() => setShowNotif(false)}>
                  Close
                </button>
              </div>
              {NOTIFS.map((n, i) => (
                <div key={i} className={'an-item ' + (n.unread ? 'unread' : '')}>
                  <div className="an-icon" style={{ background: n.bg, color: n.color }}>
                    <Ic n={n.icon} s={15} />
                  </div>
                  <div>
                    <div className="an-text">{n.text}</div>
                    <div className="an-time">{n.time} ago</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="sb-user">
          <div className="sb-avatar">TN</div>
          <div>
            <div className="sb-uname">Takudzwa Nhema</div>
            <div className="sb-urole">Owner / Director</div>
          </div>
        </div>
      </div>
    </div>
  )
}
