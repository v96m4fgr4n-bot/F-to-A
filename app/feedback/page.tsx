'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'

const TUTOR_COLORS = ['#1FA871', '#1C8FD6', '#7A5AF8', '#F26F1F', '#E0563B', '#D4A017']
const GRID = '90px 1.5fr 1.3fr 100px 2fr 90px'

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ to_email: '', learner_name: '' })
  const { show, ToastEl } = useToast()

  const load = () => {
    setLoading(true)
    fetch('/api/feedback').then(r => r.json()).then(r => { setFeedback(r.data ?? []); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const flag = async (id: string, flagged: boolean) => {
    const res = await fetch(`/api/feedback/${id}/flag`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flagged: !flagged }) })
    if (res.ok) { load(); show(flagged ? 'Unflagged' : 'Flagged') }
  }

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'request', ...form }) })
    if (res.ok) { setShowForm(false); show('Feedback request sent') }
    else show('Failed to send', 'error')
  }

  const npsScores = feedback.filter(f => f.nps_score != null)
  const promoters = npsScores.filter(f => f.nps_score >= 9).length
  const detractors = npsScores.filter(f => f.nps_score <= 6).length
  const nps = npsScores.length ? Math.round(((promoters - detractors) / npsScores.length) * 100) : 0
  const npsColor = nps >= 70 ? 'var(--green)' : nps >= 50 ? 'var(--orange)' : 'var(--red)'
  const npsLabel = nps >= 70 ? 'World-class (70+)' : nps >= 50 ? 'Good (50+)' : 'Needs attention'

  // CSAT by tutor
  const tutorMap: Record<string, { name: string; total: number; count: number }> = {}
  feedback.forEach(f => {
    if (f.tutor?.name) {
      if (!tutorMap[f.tutor_id]) tutorMap[f.tutor_id] = { name: f.tutor.name, total: 0, count: 0 }
      tutorMap[f.tutor_id].total += f.rating ?? 0
      tutorMap[f.tutor_id].count++
    }
  })
  const tutorCsat = Object.values(tutorMap).map(t => ({ ...t, avg: t.total / t.count })).sort((a, b) => b.avg - a.avg)

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <div className="page-title">Feedback & NPS</div>
          <div className="page-sub">Family satisfaction, session ratings and tutor performance</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(!showForm)}>Send feedback form</button>
          <button className="btn btn-primary btn-sm">Export report</button>
        </div>
      </div>
      <div className="page-body">
        {showForm && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 14 }}><div className="card-title">Send feedback request</div></div>
            <form onSubmit={sendRequest} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label className="block text-xs font-600 text-tx-2 mb-1">Parent Email *</label>
                <input required type="email" value={form.to_email} onChange={e => setForm(f => ({ ...f, to_email: e.target.value }))} className="s-inp" placeholder="parent@example.com" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="block text-xs font-600 text-tx-2 mb-1">Learner Name *</label>
                <input required value={form.learner_name} onChange={e => setForm(f => ({ ...f, learner_name: e.target.value }))} className="s-inp" placeholder="e.g. Takudzwa Zimba" />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Send</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">Cancel</button>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, marginBottom: 16 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>Net promoter score</div>
            <div style={{ fontSize: 70, fontWeight: 800, color: npsColor, lineHeight: 1 }}>{nps}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 8, fontWeight: 600 }}>{npsLabel}</div>
            <div style={{ display: 'flex', gap: 3, marginTop: 16, height: 8, borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ flex: 2, background: '#FEE2E2' }}></div>
              <div style={{ flex: 2, background: '#FEF3C7' }}></div>
              <div style={{ flex: 3, background: '#DCFCE7' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: 'var(--text-3)', marginTop: 4, fontWeight: 700 }}>
              <span>Detractors</span><span>Passives</span><span>Promoters</span>
            </div>
          </div>
          <div className="card">
            <div style={{ marginBottom: 14 }}><div className="card-title">CSAT by tutor</div></div>
            {tutorCsat.length === 0 ? (
              <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No data</p>
            ) : tutorCsat.map((t, i) => {
              const color = TUTOR_COLORS[i % TUTOR_COLORS.length]
              const pct = Math.round((t.avg / 5) * 100)
              return (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="avatar" style={{ width: 36, height: 36, background: color, fontSize: 12 }}>
                    {t.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 13.5 }}>{t.name}</span>
                  <div className="prog-wrap" style={{ flex: 1.5 }}>
                    <div className="prog-track"><div className="prog-fill" style={{ width: pct + '%', background: color }}></div></div>
                    <span className="prog-val" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="stars" style={{ fontSize: 12 }}>{'★'.repeat(Math.round(t.avg))}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="data-table">
          <div className="dt-head" style={{ gridTemplateColumns: GRID }}>
            <span>Date</span><span>Learner</span><span>Tutor</span><span>Rating</span><span>Comment</span><span></span>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: 13 }}>Loading…</div>
          ) : feedback.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: 13 }}>No feedback yet</div>
          ) : feedback.map(f => (
            <div key={f.id} className="dt-row" style={{ gridTemplateColumns: GRID, background: f.flagged ? '#FEF2F2' : undefined }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>{formatDate(f.submitted_at)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <Avatar name={f.learner?.name ?? 'U'} size="sm" />
                {f.learner?.name ?? 'Unknown'}
              </span>
              <span style={{ color: 'var(--text-2)' }}>{f.tutor?.name?.split(' ')[0] ?? '—'}</span>
              <span style={{ color: 'var(--yellow)' }}>
                {'★'.repeat(f.rating ?? 0)}
                <span style={{ color: 'var(--border-2)' }}>{'★'.repeat(Math.max(0, 5 - (f.rating ?? 0)))}</span>
              </span>
              <span style={{ fontSize: 12.5, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.comment ?? '—'}{f.nps_score != null ? ` · NPS ${f.nps_score}` : ''}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => flag(f.id, f.flagged)} style={f.flagged ? { color: 'var(--red)', borderColor: 'var(--red)' } : undefined}>
                {f.flagged ? 'Flagged' : 'Flag'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
