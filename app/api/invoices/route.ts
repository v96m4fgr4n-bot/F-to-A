import { NextRequest, NextResponse } from 'next/server'
import { INVOICES, LEARNERS } from '@/lib/data'

let invoices = [...INVOICES]

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const learnerId = req.nextUrl.searchParams.get('learner_id')

  let results = invoices.map(inv => ({
    ...inv,
    learner: LEARNERS.find(l => l.id === inv.learner_id),
  }))

  if (status && status !== 'all') results = results.filter(i => i.status === status)
  if (learnerId) results = results.filter(i => i.learner_id === learnerId)

  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return NextResponse.json({ data: results, error: null })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const id = 'inv' + Date.now()
  const ref = 'INV-' + new Date().getFullYear() + '-' + String(invoices.length + 1).padStart(3, '0')
  const newInvoice = { id, reference: ref, status: 'due' as const, created_at: new Date().toISOString(), ...body }
  invoices = [newInvoice, ...invoices]
  return NextResponse.json({ data: newInvoice, error: null }, { status: 201 })
}
