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

      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* At-risk widget */}
        <div className="bg-surface rounded-card border border-border p-5">
          <h2 className="text-sm font-700 text-tx mb-4">At-Risk Learners</h2>
          {loading ? <div className="skeleton h-32" /> : (
            (data?.atRisk ?? []).length === 0 ? (
              <p className="text-tx-3 text-sm text-center py-6">All learners on track</p>
            ) : (
              <div className="space-y-2">
                {(data?.atRisk ?? []).map((r: any) => (
                  <div key={r.learnerId} className={`flex items-start gap-2 p-2.5 rounded-btn border ${r.severity === 'high' ? 'bg-red/5 border-red/20' : 'bg-yellow/5 border-yellow/20'}`}>
                    <span className={`mt-0.5 text-xs ${r.severity === 'high' ? 'text-red' : 'text-yellow'}`}>⚠</span>
                    <div>
                      <p className="text-xs font-600 text-tx">{r.name}</p>
                      <p className="text-[11px] text-tx-3 mt-0.5">{r.flag}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Lead sources widget */}
        <div className="bg-surface rounded-card border border-border p-5">
          <h2 className="text-sm font-700 text-tx mb-4">Lead Sources</h2>
          {loading ? <div className="skeleton h-32" /> : (
            (data?.leadSources ?? []).length === 0 ? (
              <p className="text-tx-3 text-sm text-center py-6">No pipeline data</p>
            ) : (
              <div className="space-y-3">
                {(data?.leadSources ?? []).map((s: any) => (
                  <div key={s.source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-500 text-tx">{s.source}</span>
                      <span className="text-xs text-tx-3">{s.count} ({s.pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Outstanding invoices */}
        <div className="bg-surface rounded-card border border-border p-5">
          <h2 className="text-sm font-700 text-tx mb-4">Outstanding Invoices</h2>
          {loading ? <div className="skeleton h-32" /> : (
            data?.outstanding?.length === 0 ? (
              <p className="text-tx-3 text-sm text-center py-6">None outstanding</p>
            ) : (
              <div className="space-y-2">
                {data?.outstanding?.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-xs font-600 text-tx">{inv.learner?.name ?? '—'}</p>
                      <p className="text-[11px] text-tx-3">{formatDate(inv.due_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-700 text-tx">{formatCurrency(inv.amount)}</p>
                      <Badge value={inv.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
