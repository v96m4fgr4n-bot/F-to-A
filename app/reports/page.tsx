'use client'
import { useEffect, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { formatCurrency } from '@/lib/utils'

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
          <linearGradient id="repRevGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--blue)" stopOpacity=".15" />
            <stop offset="100%" stopColor="var(--blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={revArea} fill="url(#repRevGrad)" />
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

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(r => { setData(r.data); setLoading(false) })
  }, [])

  const months = data?.months ?? []
  const totalRevenue = months.reduce((s: number, m: any) => s + m.revenue, 0)
  const totalSessions = months.reduce((s: number, m: any) => s + m.sessions, 0)
  const maxSessions = Math.max(...months.map((m: any) => m.sessions), 1)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-sub">Business analytics · last 6 months</div>
        </div>
        <div className="page-actions">
          <select style={{ border: '1px solid var(--border)', borderRadius: 9, padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font)', outline: 'none' }}>
            <option>Last 6 months</option>
            <option>This year</option>
          </select>
          <a href="/api/reports/export" target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            Export PDF
          </a>
        </div>
      </div>
      <div className="page-body">
        <div className="kpi-grid">
          {loading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-card" />)
          ) : (
            <>
              <KpiCard label="Total revenue" value={formatCurrency(totalRevenue)} valueSize={28} delta="+22%" deltaUp deltaSub="vs prev period" />
              <KpiCard label="Sessions delivered" value={totalSessions} valueSize={28} delta="+18%" deltaUp deltaSub="vs prev period" />
              <KpiCard label="Active learners" value={data?.active_learners ?? 0} valueSize={28} delta="+43%" deltaUp deltaSub="vs prev period" />
              <KpiCard label="MRR" value={formatCurrency(data?.mrr ?? 0)} valueSize={28} delta="+4.3%" deltaUp deltaSub="vs prev period" />
            </>
          )}
        </div>

        <div className="charts-row" style={{ marginBottom: 16 }}>
          {loading ? (
            <>
              <div className="skeleton" style={{ height: 260, borderRadius: 14 }} />
              <div className="skeleton" style={{ height: 260, borderRadius: 14 }} />
            </>
          ) : (
            <>
              <RevenueChart months={months} />
              <div className="chart-panel">
                <div className="chart-head"><div><div className="card-title">Sessions by month</div><div className="card-sub">Delivery volume</div></div></div>
                <div className="vol-chart">
                  {months.map((m: any) => (
                    <div className="vol-col" key={m.month}>
                      <div className="vol-bars">
                        <div className="vol-bar revenue" style={{ height: (m.sessions / maxSessions * 100) + '%', width: 22, background: 'var(--green)' }}>
                          <span className="vol-num">{m.sessions}</span>
                        </div>
                      </div>
                      <span className="vol-day">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div style={{ marginBottom: 14 }}><div className="card-title">Monthly performance summary</div></div>
          {loading ? <div className="skeleton h-32" /> : (
            <div>
              <div className="dt-head" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', borderRadius: 10, border: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <span>Month</span><span>Revenue</span><span>Sessions</span><span>Avg per session</span>
              </div>
              {months.map((m: any) => (
                <div key={m.month} className="dt-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', cursor: 'default' }}>
                  <span style={{ fontWeight: 700 }}>{m.month}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 800, color: 'var(--green)' }}>{formatCurrency(m.revenue)}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{m.sessions}</span>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-2)' }}>{m.sessions ? formatCurrency(Math.round(m.revenue / m.sessions)) : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
