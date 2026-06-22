'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Student {
  id: number
  name: string
  email: string
  phone: string
  grade: string
  subjects: string
  hourly_rate: number
}

interface Session {
  id: number
  date: string
  start_time: string
  end_time: string
  subject: string
  status: string
  notes: string
}

interface Payment {
  id: number
  amount: number
  date: string
  description: string
  status: string
}

interface ProgressNote {
  id: number
  content: string
  grade: string
  date: string
}

export default function StudentDetailPage() {
  const params = useParams()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([])
  const [activeTab, setActiveTab] = useState('sessions')

  useEffect(() => {
    const fetchData = async () => {
      const [studentRes, sessionsRes, paymentsRes, notesRes] = await Promise.all([
        fetch(`/api/students/${studentId}`),
        fetch(`/api/sessions?studentId=${studentId}`),
        fetch(`/api/payments?studentId=${studentId}`),
        fetch(`/api/progress-notes?studentId=${studentId}`),
      ])

      const studentData = await studentRes.json()
      const sessionsData = await sessionsRes.json()
      const paymentsData = await paymentsRes.json()
      const notesData = await notesRes.json()

      setStudent(studentData)
      setSessions(sessionsData)
      setPayments(paymentsData)
      setProgressNotes(notesData)
    }

    fetchData()
  }, [studentId])

  if (!student) return <p>Loading...</p>

  return (
    <div className="py-8">
      <Link href="/students" className="text-blue-600 hover:underline mb-4 block">
        ← Back to Students
      </Link>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h1 className="text-3xl font-bold mb-4">{student.name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="font-semibold">{student.email}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Phone</p>
            <p className="font-semibold">{student.phone}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Grade</p>
            <p className="font-semibold">{student.grade}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Subjects</p>
            <p className="font-semibold">{student.subjects}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Hourly Rate</p>
            <p className="font-semibold">${student.hourly_rate}/hr</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-6 py-4 ${activeTab === 'sessions' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
          >
            Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-4 ${activeTab === 'payments' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
          >
            Payments ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-4 ${activeTab === 'progress' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
          >
            Progress Notes ({progressNotes.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'sessions' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Sessions</h2>
              {sessions.length === 0 ? (
                <p className="text-gray-600">No sessions scheduled yet.</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="border rounded p-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">{session.date} {session.start_time} - {session.end_time}</p>
                          <p className="text-gray-600">{session.subject}</p>
                          <p className="text-sm text-gray-500">{session.notes}</p>
                        </div>
                        <span className={`px-3 py-1 rounded text-sm ${session.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Payments</h2>
              {payments.length === 0 ? (
                <p className="text-gray-600">No payments recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border rounded p-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                        <p className="text-gray-600 text-sm">{payment.date}</p>
                        <p className="text-gray-500 text-sm">{payment.description}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Progress Notes</h2>
              {progressNotes.length === 0 ? (
                <p className="text-gray-600">No progress notes yet.</p>
              ) : (
                <div className="space-y-4">
                  {progressNotes.map((note) => (
                    <div key={note.id} className="border rounded p-4">
                      <p className="font-semibold">{note.date}</p>
                      {note.grade && <p className="text-sm text-gray-600">Grade: {note.grade}</p>}
                      <p className="mt-2">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
