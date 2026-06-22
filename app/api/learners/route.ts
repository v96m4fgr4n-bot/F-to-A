import { NextRequest, NextResponse } from 'next/server'
import { LEARNERS, TUTORS } from '@/lib/data'

let learners = [...LEARNERS]

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search')?.toLowerCase()
  const status = req.nextUrl.searchParams.get('status')
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
  const limit = 20

  let results = learners.map(l => ({
    ...l,
    tutor: TUTORS.find(t => t.id === l.tutor_id)
  }))

  if (search) {
    results = results.filter(l =>
      l.name.toLowerCase().includes(search) ||
      l.subject?.toLowerCase().includes(search)
    )
  }
  if (status && status !== 'all') {
    results = results.filter(l => l.status === status)
  }

  const total = results.length
  const data = results.slice((page - 1) * limit, page * limit)
  return NextResponse.json({ data, total, page, limit, error: null })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const id = 'l' + Date.now()
  const newLearner = { id, created_at: new Date().toISOString(), mrr: 0, status: 'pending' as const, progress: 0, ...body }
  learners = [newLearner, ...learners]
  return NextResponse.json({ data: newLearner, error: null }, { status: 201 })
}
