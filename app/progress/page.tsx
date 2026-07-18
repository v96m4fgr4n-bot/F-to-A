'use client'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { Ic } from '@/components/ui/Icon'
import { formatDate } from '@/lib/utils'

function ProgressChart({ data, target }: { data: { date: string; score: number }[]; target: number }) {
  if (data.length === 0) return (
    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No assessments logged yet</div>
  )
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
  const W = 480, H = 140, PL = 30, PB = 24, PT = 16, PR = 10
  const cW = W - PL - PR, cH = H - PB - PT
  const pts = sorted.map((a, i) => [PL + i * (cW / Math.max(sorted.length - 1, 1)), PT + cH - (a.score / 100) * cH])
  const polyPts = pts.map(p => p.join(',')).join(' ')
  const tgtY = PT + cH - (target / 100) * cH
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, overflow: 'visible' }}>
      <line x1={PL} y1={tgtY} x2={W - PR} y2={tgtY} stroke="var(--orange)" strokeWidth={1.5} strokeDasharray="5 3" opacity={.7} />
      <text x={W - PR + 4} y={tgtY + 4} fontSize={9} fill="var(--orange)" fontWeight={700}>{target}%</text>
      <polyline points={polyPts} fill="none" stroke="var(--blue)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={5} fill="white" stroke="var(--blue)" strokeWidth={2} />
          <text x={cx} y={H - 6} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--text-3)">
            {new Date(sorted[i].date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
          </text>
          <text x={cx} y={cy - 9} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--blue)">{sorted[i].score}%</text>
        </g>
      ))}
    </svg>
  )
}

export default function ProgressPage() {
  const [learners, setLearners] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [assessments, setAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ date: '', topic: '', score: '', target_score: '' })
  const { show, ToastEl } = useToast()

  useEffect(() => {
    fetch('/api/learners').then(r => r.json()).then(r => {
      const data = r.data ?? []
      setLearners(data)
      if (data.length > 0) {
        setSelectedId(data[0].id)
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    fetch(`/api/progress?learner_id=${selectedId}`)
      .then(r => r.json())
      .then(r => { setAssessments(r.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedId])

  const selectedLearner = learners.find(l => l.id === selectedId)
  const latest = assessments[0]?.score ?? 0
  const latestTarget = assessments[0]?.target_score ?? 0
  const trend = assessments.length >= 2 ? (assessments[0].score ?? 0) - (assessments[1].score ?? 0) : 0

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    const res = await fetch(`/api/progress/${selectedId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, score: Number(form.score), target_score: Number(form.target_score) })
    })
    if (res.ok) {
      setShowModal(false)
      setForm({ date: '', topic: '', score: '', target_score: '' })
      fetch(`/api/progress?learner_id=${selectedId}`).then(r => r.json()).then(r => setAssessments(r.data ?? []))
      show('Assessment added')
    } else show('Failed to add assessment', 'error')
  }

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <div className="page-title">Student progress</div>
          <div className="page-sub">Assessment history, grade targets and subject trends</div>
        </div>
        <div className="page-actions">
          <select
            style={{ border: '1px solid var(--border)', borderRadius: 9, padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font)', outline: 'none' }}
            value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            <option value="">Select learner…</option>
            {learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} disabled={!selectedId} style={{ opacity: selectedId ? 1 : .5 }}>
            <Ic n="plus" s={14} /> Add assessment
          </button>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
          {[
            ['Current score', assessments.length ? latest + '%' : '—', 'var(--blue)'],
            ['Target', latestTarget ? latestTarget + '%' : '—', 'var(--orange)'],
            ['Assessments', String(assessments.length), 'var(--purple)'],
            ['Trend', assessments.length >= 2 ? (trend >= 0 ? '+' : '') + trend + 'pts' : '—', trend >= 0 ? 'var(--green)' : 'var(--red)'],
          ].map(([l, v, c]) => (
            <div key={l} className="kpi-card blue" style={{ flex: 1 }}>
              <div className="kpi-label">{l}</div>
              <div className="kpi-val" style={{ fontSize: 26, color: c }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div className="card-title">{selectedLearner ? `${selectedLearner.name} — ${selectedLearner.subject ?? '—'}` : 'Select a learner'}</div>
              <div className="card-sub">{selectedLearner ? `Grade ${selectedLearner.grade ?? '—'}${latestTarget ? ` · Target: ${latestTarget}%` : ''}` : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>
                <i style={{ width: 24, height: 2, background: 'var(--blue)', display: 'block', borderRadius: 2 }}></i>Score
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>
                <i style={{ width: 20, height: 0, display: 'block', borderTop: '2px dashed var(--orange)' }}></i>Target
              </span>
            </div>
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: 140, borderRadius: 10 }} />
          ) : (
            <ProgressChart data={assessments.map(a => ({ date: a.date, score: a.score ?? 0 }))} target={latestTarget || 75} />
          )}
        </div>

        <div className="data-table">
          <div className="assess-head"><span>Date</span><span>Topic</span><span>Score</span><span>Target</span><span>Delta</span></div>
          {loading ? (
            <div style={{ padding: 16 }}><TableSkeleton rows={4} cols={5} /></div>
          ) : assessments.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: 13 }}>No assessments yet</div>
          ) : assessments.map((a, i) => {
            const prev = assessments[i + 1]?.score
            const d = prev !== undefined ? (a.score ?? 0) - prev : null
            const target = a.target_score ?? 0
            return (
              <div key={a.id ?? i} className="assess-row">
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)' }}>{formatDate(a.date)}</span>
                <span style={{ fontWeight: 700 }}>{a.topic ?? '—'}</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 15, color: target && (a.score ?? 0) >= target ? 'var(--green)' : 'var(--text)' }}>{a.score ?? '—'}%</span>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--orange)', fontWeight: 700 }}>{target ? target + '%' : '—'}</span>
                <span style={{ fontWeight: 700, color: d === null ? 'var(--text-3)' : d >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {d === null ? '—' : (d >= 0 ? '+' : '') + d + 'pts'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Assessment" size="sm">
        <form onSubmit={handleAddAssessment} className="space-y-4">
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Learner</label>
            <p className="text-sm font-600 text-tx">{selectedLearner?.name ?? '—'}</p>
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Date *</label>
            <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="s-inp" />
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Topic *</label>
            <input required value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} className="s-inp" placeholder="e.g. Algebra basics" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Score (%) *</label>
              <input required type="number" min="0" max="100" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} className="s-inp" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Target (%)</label>
              <input type="number" min="0" max="100" value={form.target_score} onChange={e => setForm(f => ({ ...f, target_score: e.target.value }))} className="s-inp" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Add</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
