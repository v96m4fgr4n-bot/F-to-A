'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { Ic } from '@/components/ui/Icon'
import { KpiCard } from '@/components/ui/KpiCard'
import { formatCurrency, formatDate } from '@/lib/utils'

const TUTOR_COLORS = ['#1FA871', '#1C8FD6', '#7A5AF8', '#F26F1F', '#E0563B', '#D4A017']

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
      <div className="page-header">
        <div>
          <div className="page-title">Payroll</div>
          <div className="page-sub">June 2026 · due Jul 1</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm">Export payslips</button>
          {payroll.some(p => p.status === 'due') && (
            <button className="btn btn-primary btn-sm" onClick={() => pay()}><Ic n="money" s={14} /> Pay all tutors</button>
          )}
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
          <KpiCard label="Total due" value={formatCurrency(totalDue)} valueSize={28} className="flex-1" />
          <KpiCard label="Sessions delivered" value={totalSessions} valueSize={28} className="flex-1" />
          <KpiCard label="Avg per tutor" value={formatCurrency(avgPerTutor)} valueSize={28} className="flex-1" />
        </div>

        <div className="payroll-grid">
          {loading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 14 }} />)
          ) : payroll.map((p, idx) => {
            const color = TUTOR_COLORS[idx % TUTOR_COLORS.length]
            const name = p.tutor?.name ?? '—'
            return (
              <div className="payroll-card" key={p.id}>
                <div className="payroll-card-head">
                  <div className="avatar" style={{ width: 44, height: 44, background: color, fontSize: 14 }}>
                    {name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div className="payroll-name">{name}</div>
                    <div className="payroll-role">{formatDate(p.period_start)} — {formatDate(p.period_end)}</div>
                  </div>
                </div>
                <div className="payroll-stats">
                  <div className="ps-item"><div className="ps-val">{p.sessions_count ?? 0}</div><div className="ps-label">Sessions</div></div>
                  <div className="ps-item"><div className="ps-val" style={{ color }}>{formatCurrency(p.gross ?? 0)}</div><div className="ps-label">Gross pay</div></div>
                </div>
                <div className="payout-row"><span className="s-label">Rate</span><span>${p.rate}/session</span></div>
                {(p.bonus ?? 0) > 0 && <div className="payout-row"><span className="s-label">Bonus</span><span style={{ color: 'var(--green)' }}>+{formatCurrency(p.bonus)}</span></div>}
                <div className="payout-row"><span className="s-label">Paid</span><span>{p.paid_at ? formatDate(p.paid_at) : '—'}</span></div>
                <div className="payout-row">
                  <span className="s-label">Status</span>
                  <span className={p.status === 'due' ? 'payout-status-due' : 'payout-status-paid'}>
                    {p.status === 'due' ? '⏱ Due Jul 1' : '✓ Paid'}
                  </span>
                </div>
                {p.status === 'due' ? (
                  <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }} onClick={() => pay(p.id)}>
                    Pay {formatCurrency(p.gross ?? 0)}
                  </button>
                ) : (
                  <a href={`/api/payroll/export?id=${p.id}`} target="_blank" rel="noreferrer"
                    className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 12, justifyContent: 'center', textDecoration: 'none' }}>
                    Export payslip PDF
                  </a>
                )}
                {p.status === 'due' && (
                  <a href={`/api/payroll/export?id=${p.id}`} target="_blank" rel="noreferrer"
                    className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8, justifyContent: 'center', textDecoration: 'none' }}>
                    Export payslip PDF
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
