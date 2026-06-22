import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'F-to-A Admin Portal',
  description: 'F-to-A Tutoring — Internal Admin Portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-bg">
        <Sidebar />
        <main className="ml-[230px] min-h-screen p-8">
          {children}
        </main>
      </body>
    </html>
  )
}
