export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { gasGet, gasPost } from '@/lib/gas'

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const result = await gasGet('ledger', {
    ...(p.get('type') ? { type: p.get('type')! } : {}),
    ...(p.get('month') ? { month: p.get('month')! } : {}),
  })
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await gasPost('ledger', 'create', { data: body })
  return NextResponse.json(result, { status: 201 })
}
