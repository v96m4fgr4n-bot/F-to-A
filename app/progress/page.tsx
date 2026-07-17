'use client'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'

function LineChart({ data, target }: { data: { date: string; score: number }[]; target: number }) {
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-full text-tx-3 text-sm">No assessment data yet</div>
  )
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
  const W = 600, H = 180, PAD = 40
  const scores = sorted.map(d => d.score)
  const min = Math.max(0, Math.min(...scores, target) - 10)
  const max = Math.min(100, Math.max(...scores, target) + 10)
  const xScale = (i: number) => PAD + (i / Math.max(sorted.length - 1, 1)) * (W - PAD * 2)
  const yScale = (v: number) => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2)

  const points = sorted.map((d, i) => `${xScale(i)},${yScale(d.score)}`).join(' ')
  const targetY = yScale(target)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].filter(v => v >= min && v <= max).map(v => (
        <g key={v}>
          <line x1={PAD} y1={yScale(v)} x2={W - PAD} y2={yScale(v)} stroke="#E8EDF3" strokeWidth="1" />
          <text x={PAD - 6} y={yScale(v) + 4} textAnchor="end" fontSize="10" fill="#9AA3B0">{v}</text>
        </g>
      ))}
      {/* Target dashed line */}
      <line x1={PAD} y1={targetY} x2={W - PAD} y2={targetY} stroke="#1C8FD6" strokeWidth="1.5" strokeDasharray="6,4" />
      <text x={W - PAD + 4} y={targetY + 4} fontSize="10" fill="#1C8FD6">Target</text>
      {/* Score line */}
      <polyline points={points} fill="none" stroke="#1FA871" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Dots */}
      {sorted.map((d, i) => (
        <g key={i}>
          <circle cx={xScale(i)} cy={yScale(d.score)} r="4" fill="#1FA871" stroke="white" strokeWidth="2" />
          <text x={xScale(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#9AA3B0">
            {new Date(d.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
          </text>
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
  const avgScore = assessments.length > 0 ? Math.round(assessments.reduce((a, b) => a + (b.score ?? 0), 0) / assessments.length) : 0
  const latestTarget = assessments[0]?.target_score ?? 0
  const trend = assessments.length >= 2 ? (assessments[0].score ?? 0) - (assessments[assessments.length - 1].score ?? 0) : 0

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
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Progress</h1>
          <p className="text-tx-2 text-sm mt-1">Track learner assessment scores over time</p>
        </div>
        <button onClick={() => setShowModal(true)} disabled={!selectedId}
          className="bg-brand text-white px-4 py-2 rounded-btn text-sm font-600 hover:bg-brand-deep transition disabled:opacity-50">
          + Add Assessment
        </button>
      </div>

      {/* Learner selector */}
      <div className="mb-5">
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
          className="border border-border rounded-btn px-3 py-2 text-sm text-tx focus:outline-none focus:border-brand w-64">
          <option value="">Select learner…</option>
          {learners.map(l => <option key={l.id} value={l.id}>{l.name} · {l.subject}</option>)}
        </select>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Sessions', value: assessments.length, color: 'text-tx' },
          { label: 'Avg Score', value: assessments.length > 0 ? `${avgScore}%` : '—', color: avgScore >= 70 ? 'text-green' : 'text-red' },
          { label: 'Target Score', value: latestTarget ? `${latestTarget}%` : '—', color: 'text-blue' },
          { label: 'Trend', value: assessments.length >= 2 ? `${trend >= 0 ? '+' : ''}${trend}pts` : '—', color: trend >= 0 ? 'text-green' : 'text-red' },
        ].map(k => (
          <div key={k.label} className="bg-surface rounded-card border border-border p-5">
            <p className="text-xs text-tx-3 font-600 mb-1">{k.label}</p>
            <p className={`text-2xl font-800 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-surface rounded-card border border-border p-5 mb-5">
        <p className="text-sm font-700 text-tx mb-3">Score Over Time</p>
        <div className="h-[180px]">
          <LineChart
            data={assessments.map(a => ({ date: a.date, score: a.score ?? 0 }))}
            target={latestTarget ?? 75}
          />
        </div>
      </div>

      {/* Assessment history table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-bg">
          <p className="text-sm font-700 text-tx">Assessment History</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg">
              {['Date', 'Topic', 'Score', 'Target', 'vs Target'].map(h => (
                <th key={h} className="text-left text-xs text-tx-3 font-600 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4"><TableSkeleton rows={4} cols={5} /></td></tr>
            ) : assessments.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-tx-3 py-10">No assessments yet</td></tr>
            ) : assessments.map(a => {
              const diff = (a.score ?? 0) - (a.target_score ?? 0)
              return (
                <tr key={a.id} className="border-b border-border/50 hover:bg-bg transition">
                  <td className="px-4 py-3 text-tx-2">{formatDate(a.date)}</td>
                  <td className="px-4 py-3 font-600 text-tx">{a.topic ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`font-800 ${(a.score ?? 0) >= 70 ? 'text-green' : 'text-red'}`}>{a.score ?? '—'}%</span>
                  </td>
                  <td className="px-4 py-3 text-tx-2">{a.target_score ?? '—'}%</td>
                  <td className="px-4 py-3">
                    {a.target_score ? (
                      <span className={`text-xs font-700 px-2 py-0.5 rounded-full ${diff >= 0 ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
                        {diff >= 0 ? '+' : ''}{diff}pts
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add Assessment Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Assessment" size="sm">
        <form onSubmit={handleAddAssessment} className="space-y-4">
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Learner</label>
            <p className="text-sm font-600 text-tx">{selectedLearner?.name ?? '—'}</p>
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Date *</label>
            <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Topic *</label>
            <input required value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="e.g. Algebra basics" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Score (%) *</label>
              <input required type="number" min="0" max="100" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Target (%)</label>
              <input type="number" min="0" max="100" value={form.target_score} onChange={e => setForm(f => ({ ...f, target_score: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-btn text-sm text-tx-2 hover:text-tx">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand text-white rounded-btn text-sm font-600 hover:bg-brand-deep">Add</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
