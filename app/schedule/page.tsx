'use client'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8am - 7pm

const TUTOR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-400',
  'bg-pink-500', 'bg-teal-500', 'bg-yellow-500', 'bg-red-500',
]

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
  const [tutorColorMap, setTutorColorMap] = useState<Record<string, string>>({})
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
      .then(r => {
        const data = r.data ?? []
        setSessions(data)
        // Build tutor colour map
        const map: Record<string, string> = {}
        let idx = 0
        data.forEach((s: any) => {
          if (s.tutor_id && !map[s.tutor_id]) {
            map[s.tutor_id] = TUTOR_COLORS[idx % TUTOR_COLORS.length]
            idx++
          }
        })
        setTutorColorMap(map)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load(weekStart) }, [])

  useEffect(() => {
    fetch('/api/learners').then(r => r.json()).then(r => setLearners(r.data ?? []))
    fetch('/api/tutors').then(r => r.json()).then(r => setTutors(r.data ?? []))
  }, [])

  const prevWeek = () => { const ws = addDays(weekStart, -7); setWeekStart(ws); load(ws) }
  const nextWeek = () => { const ws = addDays(weekStart, 7); setWeekStart(ws); load(ws) }

  // Map sessions to day/hour slots
  const sessionsBySlot: Record<string, any[]> = {}
  sessions.forEach(s => {
    const dt = new Date(s.scheduled_at)
    const dayIdx = ((dt.getDay() + 6) % 7) // Mon=0
    const hour = dt.getHours()
    if (dayIdx < 6) {
      const key = `${dayIdx}-${hour}`
      if (!sessionsBySlot[key]) sessionsBySlot[key] = []
      sessionsBySlot[key].push(s)
    }
  })

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
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Schedule</h1>
          <p className="text-tx-2 text-sm mt-1">{fmtDate(weekStart)} – {fmtDate(weekEnd)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button onClick={prevWeek} className="px-3 py-2 border border-border rounded-btn text-sm text-tx-2 hover:text-tx hover:bg-bg transition">← Prev</button>
            <button onClick={() => { const ws = getMonday(new Date()); setWeekStart(ws); load(ws) }} className="px-3 py-2 border border-border rounded-btn text-sm text-tx-2 hover:text-tx hover:bg-bg transition">Today</button>
            <button onClick={nextWeek} className="px-3 py-2 border border-border rounded-btn text-sm text-tx-2 hover:text-tx hover:bg-bg transition">Next →</button>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-brand text-white px-4 py-2 rounded-btn text-sm font-600 hover:bg-brand-deep transition">
            + Book Session
          </button>
        </div>
      </div>

      {/* Legend */}
      {Object.keys(tutorColorMap).length > 0 && (
        <div className="flex gap-3 flex-wrap mb-4">
          {sessions.filter((s, i, arr) => arr.findIndex(x => x.tutor_id === s.tutor_id) === i).map(s => (
            <div key={s.tutor_id} className="flex items-center gap-1.5 text-xs text-tx-2">
              <span className={`w-3 h-3 rounded-full ${tutorColorMap[s.tutor_id] ?? 'bg-gray-400'}`} />
              {s.tutor?.name ?? 'Unknown'}
            </div>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        {/* Day headers */}
        <div className="grid border-b border-border" style={{ gridTemplateColumns: '60px repeat(6, 1fr)' }}>
          <div className="bg-bg border-r border-border" />
          {DAYS.map((day, i) => {
            const dt = addDays(weekStart, i)
            const isToday = dt.toDateString() === new Date().toDateString()
            return (
              <div key={day} className={`bg-bg px-3 py-2.5 border-r border-border last:border-r-0 text-center ${i < 5 ? '' : ''}`}>
                <p className={`text-xs font-700 ${isToday ? 'text-brand' : 'text-tx-2'}`}>{day}</p>
                <p className={`text-sm font-600 ${isToday ? 'text-brand' : 'text-tx'}`}>{dt.getDate()}</p>
              </div>
            )
          })}
        </div>

        {/* Time slots */}
        <div className="overflow-y-auto max-h-[600px]">
          {HOURS.map(hour => (
            <div key={hour} className="grid border-b border-border/50 last:border-b-0" style={{ gridTemplateColumns: '60px repeat(6, 1fr)', minHeight: '64px' }}>
              <div className="bg-bg border-r border-border px-2 py-1 text-right">
                <span className="text-[11px] text-tx-3">{hour}:00</span>
              </div>
              {DAYS.map((_, dayIdx) => {
                const key = `${dayIdx}-${hour}`
                const slotSessions = sessionsBySlot[key] ?? []
                return (
                  <div key={dayIdx} className="border-r border-border/50 last:border-r-0 p-1 relative min-h-[64px]">
                    {slotSessions.map(s => (
                      <div
                        key={s.id}
                        className={`${tutorColorMap[s.tutor_id] ?? 'bg-gray-400'} bg-opacity-20 border-l-2 ${tutorColorMap[s.tutor_id]?.replace('bg-', 'border-') ?? 'border-gray-400'} rounded p-1 mb-1 cursor-pointer hover:bg-opacity-30 transition`}
                        title={`${s.learner?.name} • ${s.subject} • ${s.tutor?.name}`}
                      >
                        <p className="text-[11px] font-600 text-tx leading-tight truncate">{s.learner?.name ?? 'Unknown'}</p>
                        <p className="text-[10px] text-tx-2 truncate">{s.subject}</p>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center text-tx-3 py-8 text-sm">Loading sessions…</div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="text-center text-tx-3 py-8 text-sm">No sessions this week</div>
      )}

      {/* Book Session Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Book Session" size="md">
        <form onSubmit={handleBook} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Learner *</label>
              <select required value={form.learner_id} onChange={e => setForm(f => ({ ...f, learner_id: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
                <option value="">Select learner…</option>
                {learners.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Tutor *</label>
              <select required value={form.tutor_id} onChange={e => setForm(f => ({ ...f, tutor_id: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
                <option value="">Select tutor…</option>
                {tutors.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Subject *</label>
              <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="e.g. Maths" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Duration (mins)</label>
              <input type="number" value={form.duration_mins} onChange={e => setForm(f => ({ ...f, duration_mins: Number(e.target.value) }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Date & Time *</label>
            <input required type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-btn text-sm text-tx-2 hover:text-tx">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand text-white rounded-btn text-sm font-600 hover:bg-brand-deep">Book</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
