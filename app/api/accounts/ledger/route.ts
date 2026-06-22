import { NextRequest, NextResponse } from 'next/server'
import { LEDGER, LEARNERS, TUTORS } from '@/lib/data'

let ledger = [...LEDGER]

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type')
  const month = req.nextUrl.searchParams.get('month') // e.g. "2026-06"

  let results = ledger.map(e => ({
    ...e,
    learner: e.learner_id ? LEARNERS.find(l => l.id === e.learner_id) : null,
    tutor: e.tutor_id ? TUTORS.find(t => t.id === e.tutor_id) : null,
  }))

  if (type && type !== 'all') results = results.filter(e => e.type === type)
  if (month) results = results.filter(e => e.entry_date.startsWith(month))

  return NextResponse.json({ data: results, error: null })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const id = 'led' + Date.now()
  const entry = { id, created_at: new Date().toISOString(), learner_id: null, tutor_id: null, invoice_id: null, reference: null, category: null, ...body }
  ledger = [entry, ...ledger]
  return NextResponse.json({ data: entry, error: null }, { status: 201 })
}
