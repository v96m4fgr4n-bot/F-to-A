import { NextRequest, NextResponse } from 'next/server'
import { TUTORS, SESSIONS, LEARNERS } from '@/lib/data'

let tutors = [...TUTORS]

export async function GET() {
  const enriched = tutors.map(t => ({
    ...t,
    learner_count: LEARNERS.filter(l => l.tutor_id === t.id && l.status === 'active').length,
    session_count: SESSIONS.filter(s => s.tutor_id === t.id).length,
  }))
  return NextResponse.json({ data: enriched, error: null })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const id = 't' + Date.now()
  const newTutor = { id, created_at: new Date().toISOString(), active: true, subjects: [], rate_per_session: 15, ...body }
  tutors = [newTutor, ...tutors]
  return NextResponse.json({ data: newTutor, error: null }, { status: 201 })
}
