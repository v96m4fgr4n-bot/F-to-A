'use client'
import { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { show, ToastEl } = useToast()

  const load = () => {
    fetch('/api/payroll').then(r => r.json()).then(r => { setPayroll(r.data ?? []); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const pay = async (id?: string) => {
    const body = id ? { id } : { all: true }
    await fetch('/api/payroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    load(); show(id ? 'Tutor paid' : 'All tutors paid')
  }

  const totalDue = payroll.filter(p => p.status === 'due').reduce((s, p) => s + (p.gross ?? 0), 0)
  const totalSessions = payroll.reduce((s, p) => s + (p.sessions_count ?? 0), 0)
  const avgPerTutor = payroll.length ? Math.round(payroll.reduce((s, p) => s + (p.gross ?? 0), 0) / payroll.length) : 0

  return (
    <div>
      {ToastEl}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Payroll</h1>
          <p className="text-tx-2 text-sm mt-1">June 2026 payout period</p>
        </div>
        {payroll.some(p => p.status === 'due') && (
          <button onClick={() => pay()} className="bg-green text-white px-4 py-2 rounded-btn text-sm font-600 hover:opacity-90 transition">
            Pay All Tutors
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-7">
        <KpiCard label="Total Due" value={formatCurrency(totalDue)} accent="bg-orange" />
        <KpiCard label="Sessions Delivered" value={totalSessions} accent="bg-brand" />
        <KpiCard label="Avg per Tutor" value={formatCurrency(avgPerTutor)} accent="bg-purple" />
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-card" />)
        ) : payroll.map(p => (
          <div key={p.id} className="bg-surface rounded-card border border-border p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={p.tutor?.name ?? 'T'} size="lg" />
              <div>
                <p className="font-700 text-tx">{p.tutor?.name ?? '—'}</p>
                <p className="text-tx-2 text-xs">{formatDate(p.period_start)} — {formatDate(p.period_end)}</p>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <div className="text-center">
                <p className="text-tx-3 text-xs">Sessions</p>
                <p className="font-700 font-mono text-tx">{p.sessions_count ?? 0}</p>
              </div>
              <div className="text-center">
                <p className="text-tx-3 text-xs">Rate</p>
                <p className="font-700 font-mono text-tx">${p.rate}/session</p>
              </div>
              <div className="text-center">
                <p className="text-tx-3 text-xs">Bonus</p>
                <p className="font-700 font-mono text-tx">{formatCurrency(p.bonus ?? 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-tx-3 text-xs">Gross</p>
                <p className="font-800 font-mono text-xl text-tx">{formatCurrency(p.gross ?? 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-tx-3 text-xs mb-1">Status</p>
                <Badge value={p.status} />
              </div>
              {p.status === 'due' ? (
                <button onClick={() => pay(p.id)} className="px-4 py-2 bg-green text-white rounded-btn text-sm font-600 hover:opacity-90">
                  Pay {p.tutor?.name?.split(' ')[0]}
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-tx-3 text-xs">Paid</p>
                  <p className="text-xs text-tx-2">{formatDate(p.paid_at)}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
