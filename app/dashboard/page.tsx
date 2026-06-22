'use client'
import { useEffect, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const PLAN_COLORS: Record<string, string> = {
  intensive: '#7A5AF8', standard: '#1C8FD6', starter: '#1FA871', payg: '#F26F1F', inquiry: '#D4A017'
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(r => { setData(r.data); setLoading(false) })
  }, [])

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-800 text-tx">Dashboard</h1>
        <p className="text-tx-2 text-sm mt-1">F-to-A Tutoring — June 2026 overview</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-7">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-card" />)
        ) : (
          <>
            <KpiCard label="Monthly Revenue (MRR)" value={formatCurrency(data?.mrr ?? 0)} accent="bg-green" deltaUp delta="12% vs last month" />
            <KpiCard label="Active Learners" value={data?.active_learners ?? 0} accent="bg-brand" />
            <KpiCard label="Sessions This Month" value={data?.sessions_this_month ?? 0} accent="bg-purple" />
            <KpiCard label="Outstanding Invoices" value={data?.outstanding_invoices ?? 0} accent="bg-red" />
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <div className="col-span-2 bg-surface rounded-card border border-border p-5">
          <h2 className="text-sm font-700 text-tx mb-4">Revenue & Sessions — Last 6 Months</h2>
          {loading ? <div className="skeleton h-48" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data?.months ?? []}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#92A0AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#92A0AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 9, border: '1px solid #E8EDF3', fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#1C8FD6" strokeWidth={2} dot={false} name="Revenue ($)" />
                <Line type="monotone" dataKey="sessions" stroke="#1FA871" strokeWidth={2} dot={false} name="Sessions" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-surface rounded-card border border-border p-5">
          <h2 className="text-sm font-700 text-tx mb-4">Learners by Plan</h2>
          {loading ? <div className="skeleton h-48" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={Object.entries(data?.planCounts ?? {}).map(([name, value]) => ({ name, value }))}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                  {Object.keys(data?.planCounts ?? {}).map((plan, i) => (
                    <Cell key={i} fill={PLAN_COLORS[plan] ?? '#92A0AF'} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-card border border-border p-5">
        <h2 className="text-sm font-700 text-tx mb-4">Outstanding Invoices</h2>
        {loading ? <TableSkeleton rows={3} cols={4} /> : (
          data?.outstanding?.length === 0 ? (
            <p className="text-tx-3 text-sm text-center py-6">No outstanding invoices 🎉</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Reference', 'Learner', 'Amount', 'Due', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs text-tx-3 font-600 pb-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.outstanding?.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-bg transition">
                    <td className="py-2.5 font-mono text-xs text-tx-2">{inv.reference}</td>
                    <td className="py-2.5 text-tx font-500">{inv.learner?.name ?? '—'}</td>
                    <td className="py-2.5 font-mono font-600 text-tx">{formatCurrency(inv.amount)}</td>
                    <td className="py-2.5 text-tx-2">{formatDate(inv.due_date)}</td>
                    <td className="py-2.5"><Badge value={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  )
}
