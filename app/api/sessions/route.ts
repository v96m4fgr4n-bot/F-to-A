export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { gasGet, gasPost } from '@/lib/gas'

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const result = await gasGet('sessions', {
    ...(p.get('tutor_id') ? { tutor_id: p.get('tutor_id')! } : {}),
    ...(p.get('learner_id') ? { learner_id: p.get('learner_id')! } : {}),
  })
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await gasPost('sessions', 'create', { data: body })
  return NextResponse.json(result, { status: 201 })
}
