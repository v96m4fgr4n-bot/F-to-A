export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { gasGet, gasPost } from '@/lib/gas'

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const result = await gasGet('invoices', {
    ...(p.get('status') ? { status: p.get('status')! } : {}),
    ...(p.get('learner_id') ? { learner_id: p.get('learner_id')! } : {}),
  })
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const ref = 'INV-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-4)
  const result = await gasPost('invoices', 'create', { data: { reference: ref, status: 'due', ...body } })
  return NextResponse.json(result, { status: 201 })
}
