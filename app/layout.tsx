import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'F-to-A Tutoring CRM',
  description: 'Customer Relationship Management for tutoring business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" className="text-2xl font-bold">
              F-to-A CRM
            </a>
            <div className="space-x-6">
              <a href="/dashboard" className="hover:opacity-80">Dashboard</a>
              <a href="/students" className="hover:opacity-80">Students</a>
              <a href="/sessions" className="hover:opacity-80">Sessions</a>
              <a href="/billing" className="hover:opacity-80">Billing</a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
