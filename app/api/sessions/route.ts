import { NextRequest, NextResponse } from 'next/server'
import { SESSIONS, LEARNERS, TUTORS } from '@/lib/data'

let sessions = [...SESSIONS]

export async function GET(req: NextRequest) {
  const tutorId = req.nextUrl.searchParams.get('tutor_id')
  const learnerId = req.nextUrl.searchParams.get('learner_id')

  let results = sessions.map(s => ({
    ...s,
    learner: LEARNERS.find(l => l.id === s.learner_id),
    tutor: TUTORS.find(t => t.id === s.tutor_id),
  }))

  if (tutorId) results = results.filter(s => s.tutor_id === tutorId)
  if (learnerId) results = results.filter(s => s.learner_id === learnerId)

  results.sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
  return NextResponse.json({ data: results, error: null })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const id = 's' + Date.now()
  const newSession = { id, created_at: new Date().toISOString(), attendance: 'present' as const, duration_mins: 60, ...body }
  sessions = [newSession, ...sessions]
  return NextResponse.json({ data: newSession, error: null }, { status: 201 })
}
