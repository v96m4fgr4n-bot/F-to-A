'use client'

import { useEffect, useState } from 'react'

interface Session {
  id: number
  student_id: number
  date: string
  start_time: string
  end_time: string
  subject: string
  status: string
  notes: string
}

interface Student {
  id: number
  name: string
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    student_id: '',
    date: '',
    start_time: '',
    end_time: '',
    subject: '',
    status: 'scheduled',
    notes: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const [sessionsRes, studentsRes] = await Promise.all([
        fetch('/api/sessions'),
        fetch('/api/students'),
      ])
      const sessionsData = await sessionsRes.json()
      const studentsData = await studentsRes.json()
      setSessions(sessionsData)
      setStudents(studentsData)
      setLoading(false)
    }
    fetchData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        student_id: parseInt(formData.student_id),
      }),
    })

    if (res.ok) {
      setFormData({
        student_id: '',
        date: '',
        start_time: '',
        end_time: '',
        subject: '',
        status: 'scheduled',
        notes: '',
      })
      setShowForm(false)
      const sessionsRes = await fetch('/api/sessions')
      setSessions(await sessionsRes.json())
    }
  }

  async function deleteSession(id: number) {
    if (confirm('Delete this session?')) {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
      setSessions(sessions.filter(s => s.id !== id))
    }
  }

  const getStudentName = (studentId: number) => {
    return students.find(s => s.id === studentId)?.name || 'Unknown'
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sessions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Schedule Session'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                required
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="border px-3 py-2 rounded"
              >
                <option value="">Select Student *</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="border px-3 py-2 rounded"
              />
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="border px-3 py-2 rounded"
              />
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="border px-3 py-2 rounded"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="border px-3 py-2 rounded"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border px-3 py-2 rounded w-full"
              rows={3}
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              Save Session
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{getStudentName(session.student_id)}</h3>
                  <p className="text-gray-600">{session.date} | {session.start_time} - {session.end_time}</p>
                  <p className="text-gray-600">{session.subject}</p>
                  {session.notes && <p className="text-gray-500 text-sm mt-2">{session.notes}</p>}
                </div>
                <div className="space-y-2 text-right">
                  <span className={`inline-block px-3 py-1 rounded text-sm ${session.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {session.status}
                  </span>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="block text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
