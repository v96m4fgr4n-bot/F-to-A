import { NextRequest, NextResponse } from 'next/server'
import { PIPELINE, LEARNERS } from '@/lib/data'

let pipeline = [...PIPELINE]

export async function GET() {
  const results = pipeline.map(p => ({
    ...p,
    learner: p.learner_id ? LEARNERS.find(l => l.id === p.learner_id) : null,
  }))
  return NextResponse.json({ data: results, error: null })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const id = 'pipe' + Date.now()
  const entry = { id, stage: 'inquiry' as const, moved_at: new Date().toISOString(), created_at: new Date().toISOString(), learner_id: null, churn_reason: null, subjects: [], ...body }
  pipeline = [entry, ...pipeline]
  return NextResponse.json({ data: entry, error: null }, { status: 201 })
}
