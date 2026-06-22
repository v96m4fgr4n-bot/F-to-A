import { NextRequest, NextResponse } from 'next/server'
import { LEARNERS, TUTORS } from '@/lib/data'

let learners = [...LEARNERS]

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const learner = learners.find(l => l.id === params.id)
  if (!learner) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: { ...learner, tutor: TUTORS.find(t => t.id === learner.tutor_id) }, error: null })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const idx = learners.findIndex(l => l.id === params.id)
  if (idx === -1) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
  learners[idx] = { ...learners[idx], ...body }
  return NextResponse.json({ data: learners[idx], error: null })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  learners = learners.filter(l => l.id !== params.id)
  return NextResponse.json({ data: null, error: null })
}
