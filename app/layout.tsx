import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: 'F-to-A Admin Portal',
  description: 'F-to-A Tutoring — Internal Admin Portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-bg">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
