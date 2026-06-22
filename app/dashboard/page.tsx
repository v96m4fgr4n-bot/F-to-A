'use client'

import { useEffect, useState } from 'react'

interface DashboardStats {
  totalStudents: number
  totalSessions: number
  totalRevenue: number
  upcomingSessions: any[]
  recentPayments: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const [studentsRes, sessionsRes, paymentsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/sessions'),
        fetch('/api/payments'),
      ])

      const students = await studentsRes.json()
      const sessions = await sessionsRes.json()
      const payments = await paymentsRes.json()

      const today = new Date().toISOString().split('T')[0]
      const upcomingSessions = sessions
        .filter((s: any) => s.date >= today && s.status !== 'cancelled')
        .sort((a: any, b: any) => a.date.localeCompare(b.date))
        .slice(0, 5)

      const totalRevenue = payments.reduce((sum: number, p: any) => sum + p.amount, 0)

      const recentPayments = payments
        .sort((a: any, b: any) => b.date.localeCompare(a.date))
        .slice(0, 5)

      setStats({
        totalStudents: students.length,
        totalSessions: sessions.length,
        totalRevenue,
        upcomingSessions,
        recentPayments,
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading) return <p>Loading dashboard...</p>
  if (!stats) return <p>No data available</p>

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm mb-2">Total Students</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm mb-2">Total Sessions</h3>
          <p className="text-4xl font-bold text-green-600">{stats.totalSessions}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm mb-2">Total Revenue</h3>
          <p className="text-4xl font-bold text-purple-600">${stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
          {stats.upcomingSessions.length === 0 ? (
            <p className="text-gray-600">No upcoming sessions</p>
          ) : (
            <div className="space-y-4">
              {stats.upcomingSessions.map((session: any) => (
                <div key={session.id} className="border rounded p-4">
                  <p className="font-semibold">{session.date} at {session.start_time}</p>
                  <p className="text-gray-600 text-sm">{session.subject}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
          {stats.recentPayments.length === 0 ? (
            <p className="text-gray-600">No payments recorded</p>
          ) : (
            <div className="space-y-4">
              {stats.recentPayments.map((payment: any) => (
                <div key={payment.id} className="border rounded p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                    <p className="text-gray-600 text-sm">{payment.date}</p>
                  </div>
                  <span className="text-green-600 font-semibold">{payment.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
