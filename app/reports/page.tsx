'use client'
import { useEffect, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(r => { setData(r.data); setLoading(false) })
  }, [])

  const months = data?.months ?? []
  const totalRevenue = months.reduce((s: number, m: any) => s + m.revenue, 0)
  const totalSessions = months.reduce((s: number, m: any) => s + m.sessions, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Reports</h1>
          <p className="text-tx-2 text-sm mt-1">6-month aggregate performance</p>
        </div>
        <a
          href="/api/reports/export"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-brand text-white rounded-btn text-sm font-600 hover:bg-brand-deep transition"
        >
          Export PDF
        </a>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-7">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-card" />)
        ) : (
          <>
            <KpiCard label="Total Revenue (6mo)" value={formatCurrency(totalRevenue)} accent="bg-green" />
            <KpiCard label="Sessions Delivered" value={totalSessions} accent="bg-brand" />
            <KpiCard label="Active Learners" value={data?.active_learners ?? 0} accent="bg-purple" />
            <KpiCard label="MRR" value={formatCurrency(data?.mrr ?? 0)} accent="bg-orange" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="bg-surface rounded-card border border-border p-5">
          <h2 className="text-sm font-700 text-tx mb-4">Revenue Trend</h2>
          {loading ? <div className="skeleton h-48" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={months}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#92A0AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#92A0AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 9, border: '1px solid #E8EDF3', fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#1FA871" strokeWidth={2} dot={false} name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-surface rounded-card border border-border p-5">
          <h2 className="text-sm font-700 text-tx mb-4">Sessions by Month</h2>
          {loading ? <div className="skeleton h-48" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={months}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#92A0AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#92A0AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 9, border: '1px solid #E8EDF3', fontSize: 12 }} />
                <Bar dataKey="sessions" fill="#1C8FD6" radius={[4, 4, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-card border border-border p-5">
        <h2 className="text-sm font-700 text-tx mb-4">Monthly Performance Summary</h2>
        {loading ? <div className="skeleton h-32" /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Month', 'Revenue', 'Sessions', 'Avg per Session'].map(h => (
                  <th key={h} className="text-left text-xs text-tx-3 font-600 pb-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((m: any) => (
                <tr key={m.month} className="border-b border-border/50">
                  <td className="py-2.5 font-500 text-tx">{m.month}</td>
                  <td className="py-2.5 font-mono font-600 text-green">{formatCurrency(m.revenue)}</td>
                  <td className="py-2.5 font-mono text-tx">{m.sessions}</td>
                  <td className="py-2.5 font-mono text-tx-2">{m.sessions ? formatCurrency(Math.round(m.revenue / m.sessions)) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
