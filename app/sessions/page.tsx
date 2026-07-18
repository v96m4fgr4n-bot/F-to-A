'use client'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { Ic } from '@/components/ui/Icon'
import { formatDate, formatTime } from '@/lib/utils'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [tutors, setTutors] = useState<any[]>([])
  const [learners, setLearners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tutorFilter, setTutorFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ learner_id: '', tutor_id: '', scheduled_at: '', duration_mins: 60, subject: '', attendance: 'present', notes: '' })
  const { show, ToastEl } = useToast()

  const load = () => {
    const url = tutorFilter ? `/api/sessions?tutor_id=${tutorFilter}` : '/api/sessions'
    Promise.all([fetch(url), fetch('/api/tutors'), fetch('/api/learners')]).then(async ([s, t, l]) => {
      const [sd, td, ld] = await Promise.all([s.json(), t.json(), l.json()])
      setSessions(sd.data ?? []); setTutors(td.data ?? []); setLearners(ld.data ?? [])
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [tutorFilter])

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowModal(false); load(); show('Session logged')
  }

  const toggleAttendance = async (id: string, current: string) => {
    const next: Record<string, string> = { present: 'absent', absent: 'late', late: 'cancelled', cancelled: 'present' }
    await fetch(`/api/sessions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attendance: next[current] }) })
    load()
  }

  const present = sessions.filter(s => s.attendance === 'present').length
  const rate = sessions.length ? Math.round((present / sessions.length) * 100) : 0

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <div className="page-title">Session log</div>
          <div className="page-sub">{sessions.length} sessions · {present} completed · {rate}% completion rate</div>
        </div>
        <div className="page-actions">
          <select
            style={{ border: '1px solid var(--border)', borderRadius: 9, padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font)', outline: 'none' }}
            value={tutorFilter} onChange={e => setTutorFilter(e.target.value)}>
            <option value="">All tutors</option>
            {tutors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm">Export CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Ic n="plus" s={14} /> Log session</button>
        </div>
      </div>
      <div className="page-body">
        <div className="data-table">
          <div className="sessions-log-head">
            <span>Date</span><span>Student</span><span>Tutor</span><span>Subject</span><span>Duration</span><span>Attendance</span><span>Notes</span>
          </div>
          {loading ? (
            <div style={{ padding: 16 }}><TableSkeleton rows={6} cols={7} /></div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '48px 0', fontSize: 13 }}>No sessions logged yet</div>
          ) : sessions.map(s => (
            <div key={s.id} className="sessions-log-row">
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-2)' }}>
                {formatDate(s.scheduled_at)}
                <span style={{ display: 'block', color: 'var(--text-3)' }}>{formatTime(s.scheduled_at)}</span>
              </span>
              <span style={{ fontWeight: 700 }}>{s.learner?.name ?? '—'}</span>
              <span style={{ color: 'var(--text-2)' }}>{s.tutor?.name?.split(' ')[0] ?? '—'}</span>
              <span style={{ color: 'var(--text-2)', fontSize: 12.5 }}>{s.subject ?? '—'}</span>
              <span style={{ fontWeight: 600 }}>{s.duration_mins}m</span>
              <span>
                <button className={'att-' + s.attendance} onClick={() => toggleAttendance(s.id, s.attendance)} title="Click to toggle" style={{ fontSize: 13 }}>
                  {String(s.attendance ?? '').charAt(0).toUpperCase() + String(s.attendance ?? '').slice(1)}
                </button>
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.notes ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Session">
        <form onSubmit={handleLog} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Learner *</label>
              <select required value={form.learner_id} onChange={e => setForm(f => ({ ...f, learner_id: e.target.value }))} className="s-inp">
                <option value="">Select…</option>
                {learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Tutor *</label>
              <select required value={form.tutor_id} onChange={e => setForm(f => ({ ...f, tutor_id: e.target.value }))} className="s-inp">
                <option value="">Select…</option>
                {tutors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Date & Time *</label>
              <input required type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} className="s-inp" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Duration (mins)</label>
              <input type="number" value={form.duration_mins} onChange={e => setForm(f => ({ ...f, duration_mins: Number(e.target.value) }))} className="s-inp" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Subject</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="s-inp" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Attendance</label>
              <select value={form.attendance} onChange={e => setForm(f => ({ ...f, attendance: e.target.value }))} className="s-inp">
                {['present', 'absent', 'late', 'cancelled'].map(a => <option key={a} value={a}>{a}</option>)}
              </select></div>
          </div>
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="s-inp" style={{ resize: 'none' }} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Log Session</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
