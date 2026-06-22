import { NextRequest, NextResponse } from 'next/server'
import { PAYROLL, TUTORS } from '@/lib/data'

let payroll = [...PAYROLL]

export async function GET() {
  const data = payroll.map(p => ({
    ...p,
    tutor: TUTORS.find(t => t.id === p.tutor_id),
  }))
  return NextResponse.json({ data, error: null })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { id, all } = body

  if (all) {
    payroll = payroll.map(p =>
      p.status === 'due' ? { ...p, status: 'paid' as const, paid_at: new Date().toISOString() } : p
    )
  } else if (id) {
    const idx = payroll.findIndex(p => p.id === id)
    if (idx !== -1) payroll[idx] = { ...payroll[idx], status: 'paid', paid_at: new Date().toISOString() }
  }

  const data = payroll.map(p => ({ ...p, tutor: TUTORS.find(t => t.id === p.tutor_id) }))
  return NextResponse.json({ data, error: null })
}
