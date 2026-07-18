'use client'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  if (isLogin) return <main className="h-screen overflow-y-auto">{children}</main>

  return (
    <div className="admin-app">
      <Sidebar />
      <main className="admin-main">{children}</main>
    </div>
  )
}
