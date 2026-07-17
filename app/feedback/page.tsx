'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'

const STARS = [1,2,3,4,5]

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

  const avgRating = feedback.length ? (feedback.reduce((s, f) => s + (f.rating ?? 0), 0) / feedback.length).toFixed(1) : '—'
  const npsScores = feedback.filter(f => f.nps_score != null)
  const promoters = npsScores.filter(f => f.nps_score >= 9).length
  const detractors = npsScores.filter(f => f.nps_score <= 6).length
  const nps = npsScores.length ? Math.round(((promoters - detractors) / npsScores.length) * 100) : 0

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
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Feedback</h1>
          <p className="text-tx-2 text-sm mt-1">Ratings, NPS, and tutor CSAT</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand text-white px-4 py-2 rounded-btn text-sm font-600 hover:bg-brand-deep transition">
          Send Feedback Request
        </button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-card border border-border p-5 mb-5">
          <h2 className="text-sm font-700 text-tx mb-4">Send Feedback Request</h2>
          <form onSubmit={sendRequest} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-600 text-tx-2 mb-1">Parent Email *</label>
              <input required type="email" value={form.to_email} onChange={e => setForm(f => ({ ...f, to_email: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="parent@example.com" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-600 text-tx-2 mb-1">Learner Name *</label>
              <input required value={form.learner_name} onChange={e => setForm(f => ({ ...f, learner_name: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="e.g. Takudzwa Zimba" />
            </div>
            <button type="submit" className="bg-brand text-white px-4 py-2 rounded-btn text-sm font-600 hover:bg-brand-deep transition">Send</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-btn text-sm text-tx-2 hover:text-tx">Cancel</button>
          </form>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-surface rounded-card border border-border p-5">
          <p className="text-xs text-tx-3 font-600 mb-1">NPS Score</p>
          <p className={`text-3xl font-800 ${nps >= 50 ? 'text-green' : nps >= 0 ? 'text-yellow' : 'text-red'}`}>{nps}</p>
          <p className="text-xs text-tx-3 mt-1">{npsScores.length} responses</p>
        </div>
        <div className="bg-surface rounded-card border border-border p-5">
          <p className="text-xs text-tx-3 font-600 mb-1">Avg Rating</p>
          <p className="text-3xl font-800 text-brand">{avgRating}</p>
          <p className="text-xs text-tx-3 mt-1">out of 5 stars</p>
        </div>
        <div className="bg-surface rounded-card border border-border p-5">
          <p className="text-xs text-tx-3 font-600 mb-1">Total Responses</p>
          <p className="text-3xl font-800 text-tx">{feedback.length}</p>
          <p className="text-xs text-tx-3 mt-1">{feedback.filter(f => f.flagged).length} flagged</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* CSAT by tutor */}
        <div className="bg-surface rounded-card border border-border p-5">
          <h2 className="text-sm font-700 text-tx mb-4">CSAT by Tutor</h2>
          {tutorCsat.length === 0 ? (
            <p className="text-tx-3 text-sm">No data</p>
          ) : tutorCsat.map(t => (
            <div key={t.name} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-500 text-tx">{t.name}</span>
                <span className="text-xs font-700 text-brand">{t.avg.toFixed(1)}/5</span>
              </div>
              <div className="h-2 bg-bg rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${(t.avg / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Feedback log */}
        <div className="col-span-2 bg-surface rounded-card border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-bg">
            <h2 className="text-sm font-700 text-tx">Feedback Log</h2>
          </div>
          <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="text-center text-tx-3 py-12 text-sm">Loading…</div>
            ) : feedback.length === 0 ? (
              <div className="text-center text-tx-3 py-12 text-sm">No feedback yet</div>
            ) : feedback.map(f => (
              <div key={f.id} className={`p-4 ${f.flagged ? 'bg-red/5' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar name={f.learner?.name ?? 'U'} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-600 text-tx">{f.learner?.name ?? 'Unknown'}</span>
                        {f.tutor?.name && <span className="text-xs text-tx-3">• {f.tutor.name}</span>}
                      </div>
                      <div className="flex items-center gap-1 my-1">
                        {STARS.map(s => (
                          <span key={s} className={`text-sm ${s <= (f.rating ?? 0) ? 'text-yellow' : 'text-border'}`}>★</span>
                        ))}
                        {f.nps_score != null && <span className="text-xs text-tx-3 ml-2">NPS: {f.nps_score}</span>}
                      </div>
                      {f.comment && <p className="text-xs text-tx-2 mt-0.5">{f.comment}</p>}
                      <p className="text-[10px] text-tx-3 mt-1">{formatDate(f.submitted_at)}</p>
                    </div>
                  </div>
                  <button onClick={() => flag(f.id, f.flagged)}
                    className={`text-xs px-2 py-1 rounded-btn border transition ${f.flagged ? 'border-red text-red bg-red/5 hover:bg-red/10' : 'border-border text-tx-3 hover:text-red hover:border-red'}`}>
                    {f.flagged ? '⚑ Flagged' : '⚐ Flag'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
