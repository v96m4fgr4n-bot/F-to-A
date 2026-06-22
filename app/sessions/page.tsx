'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
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
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Sessions</h1>
          <p className="text-tx-2 text-sm mt-1">{sessions.length} sessions · {rate}% completion rate</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-brand text-white px-4 py-2 rounded-btn text-sm font-600 hover:bg-brand-deep transition">
          + Log Session
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <select value={tutorFilter} onChange={e => setTutorFilter(e.target.value)}
          className="border border-border rounded-btn px-3 py-2 text-sm text-tx focus:outline-none focus:border-brand">
          <option value="">All Tutors</option>
          {tutors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg">
              {['Date', 'Time', 'Student', 'Tutor', 'Subject', 'Duration', 'Attendance', 'Notes'].map(h => (
                <th key={h} className="text-left text-xs text-tx-3 font-600 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-4"><TableSkeleton rows={6} cols={8} /></td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-tx-3 py-12">No sessions logged yet</td></tr>
            ) : sessions.map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-bg transition">
                <td className="px-4 py-3 text-tx-2 font-mono text-xs">{formatDate(s.scheduled_at)}</td>
                <td className="px-4 py-3 text-tx-2 font-mono text-xs">{formatTime(s.scheduled_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={s.learner?.name ?? '?'} size="sm" />
                    <span className="font-500 text-tx">{s.learner?.name ?? '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-tx-2">{s.tutor?.name ?? '—'}</td>
                <td className="px-4 py-3 text-tx-2">{s.subject ?? '—'}</td>
                <td className="px-4 py-3 text-tx-2">{s.duration_mins}min</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleAttendance(s.id, s.attendance)} title="Click to toggle">
                    <Badge value={s.attendance} />
                  </button>
                </td>
                <td className="px-4 py-3 text-tx-2 text-xs max-w-[160px] truncate">{s.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Session">
        <form onSubmit={handleLog} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Learner *</label>
              <select required value={form.learner_id} onChange={e => setForm(f => ({ ...f, learner_id: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
                <option value="">Select…</option>
                {learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Tutor *</label>
              <select required value={form.tutor_id} onChange={e => setForm(f => ({ ...f, tutor_id: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
                <option value="">Select…</option>
                {tutors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Date & Time *</label>
              <input required type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Duration (mins)</label>
              <input type="number" value={form.duration_mins} onChange={e => setForm(f => ({ ...f, duration_mins: Number(e.target.value) }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Subject</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Attendance</label>
              <select value={form.attendance} onChange={e => setForm(f => ({ ...f, attendance: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
                {['present', 'absent', 'late', 'cancelled'].map(a => <option key={a} value={a}>{a}</option>)}
              </select></div>
          </div>
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand resize-none" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-btn text-sm text-tx-2">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand text-white rounded-btn text-sm font-600">Log Session</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
