'use client'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Ic } from '@/components/ui/Icon'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TUTOR_COLORS = ['#1FA871', '#1C8FD6', '#7A5AF8', '#F26F1F', '#E0563B', '#D4A017']

function getMonday(d: Date) {
  const dt = new Date(d)
  const day = dt.getDay()
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1)
  dt.setDate(diff)
  dt.setHours(0, 0, 0, 0)
  return dt
}

function addDays(d: Date, n: number) {
  const dt = new Date(d)
  dt.setDate(dt.getDate() + n)
  return dt
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function fmtIso(d: Date) {
  return d.toISOString()
}

export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()))
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    learner_id: '', tutor_id: '', subject: '', scheduled_at: '', duration_mins: 60, notes: ''
  })
  const [learners, setLearners] = useState<any[]>([])
  const [tutors, setTutors] = useState<any[]>([])
  const { show, ToastEl } = useToast()

  const weekEnd = addDays(weekStart, 5)

  const load = (ws: Date) => {
    setLoading(true)
    const from = fmtIso(ws)
    const to = fmtIso(addDays(ws, 6))
    fetch(`/api/schedule?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(r => { setSessions(r.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load(weekStart) }, [])

  useEffect(() => {
    fetch('/api/learners').then(r => r.json()).then(r => setLearners(r.data ?? []))
    fetch('/api/tutors').then(r => r.json()).then(r => setTutors(r.data ?? []))
  }, [])

  const prevWeek = () => { const ws = addDays(weekStart, -7); setWeekStart(ws); load(ws) }
  const nextWeek = () => { const ws = addDays(weekStart, 7); setWeekStart(ws); load(ws) }

  // Stable tutor colour map from tutors list
  const tutorColor: Record<string, string> = {}
  tutors.forEach((t, i) => { tutorColor[t.id] = TUTOR_COLORS[i % TUTOR_COLORS.length] })

  // Sessions grouped by weekday (Mon=0)
  const byDay: Record<number, any[]> = {}
  sessions.forEach(s => {
    const dt = new Date(s.scheduled_at)
    const dayIdx = (dt.getDay() + 6) % 7
    if (dayIdx < 6) {
      if (!byDay[dayIdx]) byDay[dayIdx] = []
      byDay[dayIdx].push(s)
    }
  })
  Object.values(byDay).forEach(list => list.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()))

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) { setShowModal(false); load(weekStart); show('Session booked') }
    else show('Failed to book session', 'error')
  }

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <div className="page-title">Schedule</div>
          <div className="page-sub">Week of {fmtDate(weekStart)} – {fmtDate(weekEnd)} · {sessions.length} sessions logged</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={prevWeek}>Prev week</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { const ws = getMonday(new Date()); setWeekStart(ws); load(ws) }}>Today</button>
          <button className="btn btn-ghost btn-sm" onClick={nextWeek}>Next week</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Ic n="plus" s={14} /> Book session</button>
        </div>
      </div>
      <div className="page-body">
        {/* Tutor summary strip */}
        {tutors.length > 0 && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {tutors.slice(0, 4).map((t, i) => {
              const c = sessions.filter(s => s.tutor_id === t.id).length
              return (
                <div key={t.id} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 11, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ width: 38, height: 38, background: TUTOR_COLORS[i % TUTOR_COLORS.length], fontSize: 13 }}>
                    {t.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.name.split(' ')[0]}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{c} sessions this week</div>
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, background: '#E8F5E9', color: 'var(--green)', padding: '2px 9px', borderRadius: 6 }}>Available</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Week calendar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
          {DAYS.map((day, i) => {
            const dt = addDays(weekStart, i)
            const today = dt.toDateString() === new Date().toDateString()
            const ds = byDay[i] ?? []
            return (
              <div key={day} className="week-col" style={{ borderColor: today ? 'var(--blue)' : undefined }}>
                <div className="week-col-head" style={{ background: today ? 'var(--blue)' : undefined, color: today ? '#fff' : undefined }}>
                  <div style={{ fontSize: 10.5, opacity: .65, marginBottom: 1 }}>{day}</div>
                  <div>{fmtDate(dt)}</div>
                </div>
                <div className="week-col-body">
                  {loading && <div className="skeleton" style={{ height: 46, borderRadius: 7 }} />}
                  {!loading && ds.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 12, textAlign: 'center', paddingTop: 20 }}>No sessions</div>}
                  {!loading && ds.map((s, j) => {
                    const c = tutorColor[s.tutor_id] ?? '#888'
                    const time = new Date(s.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    return (
                      <div key={j} className="sesh-block" style={{ background: c + '18', borderLeftColor: c }} title={`${s.learner?.name} · ${s.subject} · ${s.tutor?.name}`}>
                        <div style={{ color: c, marginBottom: 2 }}>{time} · {s.duration_mins}m</div>
                        <div style={{ fontWeight: 800, fontSize: 12 }}>{s.learner?.name?.split(' ')[0] ?? '—'}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 1 }}>{s.subject}</div>
                      </div>
                    )
                  })}
                  <button className="pipeline-add-btn" style={{ marginTop: 4 }} onClick={() => setShowModal(true)}><Ic n="plus" s={11} /> Add</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Book Session Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Book Session" size="md">
        <form onSubmit={handleBook} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Learner *</label>
              <select required value={form.learner_id} onChange={e => setForm(f => ({ ...f, learner_id: e.target.value }))} className="s-inp">
                <option value="">Select learner…</option>
                {learners.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Tutor *</label>
              <select required value={form.tutor_id} onChange={e => setForm(f => ({ ...f, tutor_id: e.target.value }))} className="s-inp">
                <option value="">Select tutor…</option>
                {tutors.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Subject *</label>
              <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="s-inp" placeholder="e.g. Maths" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Duration (mins)</label>
              <input type="number" value={form.duration_mins} onChange={e => setForm(f => ({ ...f, duration_mins: Number(e.target.value) }))} className="s-inp" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Date & Time *</label>
            <input required type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} className="s-inp" />
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="s-inp" style={{ resize: 'none' }} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Book</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
