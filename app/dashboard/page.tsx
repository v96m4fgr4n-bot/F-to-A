'use client'
import { useEffect, useState } from 'react'
import { Ic } from '@/components/ui/Icon'
import { formatCurrency, formatDate } from '@/lib/utils'

const PLAN_COLORS: Record<string, string> = {
  intensive: '#E0563B', standard: '#1C8FD6', starter: '#1FA871', payg: '#D4A017', inquiry: '#9AA7B8',
}
const PLAN_LABELS: Record<string, string> = {
  intensive: 'Intensive 3×/wk', standard: 'Standard 2×/wk', starter: 'Starter 1×/wk', payg: 'Pay-as-you-go', inquiry: 'Inquiry',
}
const SOURCE_COLORS: Record<string, string> = {
  'WhatsApp referral': '#25D366', WhatsApp: '#25D366', 'School partnership': 'var(--blue)', School: 'var(--blue)',
  Instagram: 'var(--orange)', 'Parent referral': 'var(--purple)', Referral: 'var(--purple)',
  'Website / organic': 'var(--text-3)', Website: 'var(--text-3)',
}

/* ---- Revenue line chart (design prototype) ---- */
function RevenueChart({ months }: { months: { month: string; revenue: number; sessions: number }[] }) {
  const d = months.length ? months : [{ month: '—', revenue: 0, sessions: 0 }]
  const maxR = Math.max(...d.map(x => x.revenue), 1)
  const maxS = Math.max(...d.map(x => x.sessions), 1)
  const w = 500, h = 160, pad = 20
  const xStep = d.length > 1 ? (w - pad * 2) / (d.length - 1) : 0
  const revPts = d.map((x, i) => `${pad + i * xStep},${h - pad - (x.revenue / maxR) * (h - pad * 2)}`).join(' ')
  const sesPts = d.map((x, i) => `${pad + i * xStep},${h - pad - (x.sessions / maxS) * (h - pad * 2)}`).join(' ')
  const revArea = `${pad},${h - pad} ` + revPts + ` ${pad + (d.length - 1) * xStep},${h - pad}`
  return (
    <div className="chart-panel">
      <div className="chart-head">
        <div><div className="card-title">Revenue vs. sessions</div><div className="card-sub">Monthly trend · last 6 months</div></div>
        <div className="legend">
          <span className="legend-item"><i style={{ background: 'var(--blue)' }}></i>Revenue</span>
          <span className="legend-item"><i style={{ background: 'var(--orange)' }}></i>Sessions</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 160, overflow: 'visible' }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--blue)" stopOpacity=".15" />
            <stop offset="100%" stopColor="var(--blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={revArea} fill="url(#revGrad)" />
        <polyline points={revPts} fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={sesPts} fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3" />
        {d.map((x, i) => {
          const cx = pad + i * xStep
          const cy = h - pad - (x.revenue / maxR) * (h - pad * 2)
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="4" fill="white" stroke="var(--blue)" strokeWidth="2" />
              <text x={cx} y={h - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#92A0AF">{x.month}</text>
              <text x={cx} y={cy - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--blue)">${(x.revenue / 1000).toFixed(1)}k</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ---- Plan donut (design prototype) ---- */
function PlanDonut({ planCounts }: { planCounts: Record<string, number> }) {
  const plans = Object.entries(planCounts).map(([id, count]) => ({
    id, count: Number(count), label: PLAN_LABELS[id] ?? id, color: PLAN_COLORS[id] ?? '#9AA7B8',
  }))
  const total = plans.reduce((s, p) => s + p.count, 0)
  let cum = 0
  const r = 50, cx = 70, cy = 70
  const circ = 2 * Math.PI * r
  return (
    <div className="chart-panel">
      <div className="chart-head"><div><div className="card-title">Learner plans</div><div className="card-sub">{total} total enrolled</div></div></div>
      <div className="plan-donut-wrap">
        <svg width={140} height={140} viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
          {total > 0 && plans.map((p, i) => {
            const pct = p.count / total
            const rot = cum * 360 - 90
            cum += pct
            return (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={p.color} strokeWidth={22}
                strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`} transform={`rotate(${rot} ${cx} ${cy})`} />
            )
          })}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--text)">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fontWeight="700" fill="#92A0AF">learners</text>
        </svg>
        <div className="plan-legend">
          {plans.map(p => (
            <div className="plan-legend-item" key={p.id}>
              <span className="plan-legend-dot" style={{ background: p.color }}></span>
              <span className="plan-legend-label">{p.label}</span>
              <span className="plan-legend-val">{p.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(r => { setData(r.data); setLoading(false) })
  }, [])

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">F to A Tutoring · Business overview</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm">Download report</button>
          <button className="btn btn-primary btn-sm"><Ic n="plus" s={14} /> Enrol learner</button>
        </div>
      </div>
      <div className="page-body">
        <div className="kpi-grid">
          {loading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-card" />)
          ) : (
            <>
              <div className="kpi-card blue">
                <div className="kpi-label">Monthly revenue</div>
                <div className="kpi-val">{formatCurrency(data?.mrr ?? 0)}</div>
                <div className="kpi-delta pos"><Ic n="up" s={13} />+4.3%<span className="kpi-delta-sub">vs last month</span></div>
              </div>
              <div className="kpi-card green">
                <div className="kpi-label">Active learners</div>
                <div className="kpi-val">{data?.active_learners ?? 0}</div>
                <div className="kpi-delta pos"><Ic n="up" s={13} />+4 this month</div>
              </div>
              <div className="kpi-card orange">
                <div className="kpi-label">Sessions this month</div>
                <div className="kpi-val">{data?.sessions_this_month ?? 0}</div>
                <div className="kpi-delta pos"><Ic n="up" s={13} />+11<span className="kpi-delta-sub">vs last month</span></div>
              </div>
              <div className="kpi-card purple">
                <div className="kpi-label">Outstanding invoices</div>
                <div className="kpi-val">{data?.outstanding_invoices ?? 0}</div>
                <div className="kpi-delta pos"><Ic n="up" s={13} />on track<span className="kpi-delta-sub">this month</span></div>
              </div>
            </>
          )}
        </div>

        <div className="charts-row">
          {loading ? (
            <>
              <div className="skeleton" style={{ height: 260, borderRadius: 14 }} />
              <div className="skeleton" style={{ height: 260, borderRadius: 14 }} />
            </>
          ) : (
            <>
              <RevenueChart months={data?.months ?? []} />
              <PlanDonut planCounts={data?.planCounts ?? {}} />
            </>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* At-risk learners */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div className="card-title" style={{ color: 'var(--red)' }}>At-risk learners</div>
                <div className="card-sub">Flagged for attention — action required</div>
              </div>
              {!loading && (data?.atRisk ?? []).length > 0 && (
                <span style={{ fontSize: 11.5, fontWeight: 700, background: '#FEE2E2', color: 'var(--red)', padding: '3px 10px', borderRadius: 7 }}>
                  {(data?.atRisk ?? []).length} flagged
                </span>
              )}
            </div>
            {loading ? <div className="skeleton h-32" /> : (data?.atRisk ?? []).length === 0 ? (
              <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>All learners on track</p>
            ) : (
              (data?.atRisk ?? []).map((r: any) => (
                <div key={r.learnerId} className="risk-row">
                  <div className="risk-dot" style={{ background: r.severity === 'high' ? 'var(--red)' : 'var(--orange)' }}></div>
                  <span style={{ fontWeight: 700, flex: 1, fontSize: 13 }}>{r.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 2 }}>{r.flag}</span>
                  <button className="btn btn-ghost btn-sm">Follow up</button>
                </div>
              ))
            )}
          </div>

          {/* Lead sources */}
          <div className="card">
            <div style={{ marginBottom: 14 }}>
              <div className="card-title">Lead sources</div>
              <div className="card-sub">Where inquiries are coming from</div>
            </div>
            {loading ? <div className="skeleton h-32" /> : (data?.leadSources ?? []).length === 0 ? (
              <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No pipeline data</p>
            ) : (
              (data?.leadSources ?? []).map((s: any) => (
                <div key={s.source} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                    <span>{s.source}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 800 }}>{s.count}</span>
                  </div>
                  <div className="prog-track"><div className="prog-fill" style={{ width: s.pct + '%', background: SOURCE_COLORS[s.source] ?? 'var(--blue)' }}></div></div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          {/* Outstanding invoices */}
          <div className="card">
            <div style={{ marginBottom: 16 }}><div className="card-title">Outstanding invoices</div></div>
            {loading ? <div className="skeleton h-32" /> : (data?.outstanding ?? []).length === 0 ? (
              <p style={{ color: 'var(--text-3)', fontSize: 13 }}>All caught up!</p>
            ) : (
              (data?.outstanding ?? []).map((inv: any) => (
                <div key={inv.id} className="invoice-row">
                  <div className="inv-icon"><Ic n="doc" s={16} /></div>
                  <div className="inv-main">
                    <div className="inv-name">{inv.learner?.name ?? '—'}</div>
                    <div className="inv-date">Due {formatDate(inv.due_date)}</div>
                  </div>
                  <div className="inv-amount">{formatCurrency(inv.amount)}</div>
                  <span className={'inv-badge ' + (inv.status === 'overdue' ? 'inv-overdue' : 'inv-due')}>{inv.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
