import { NextRequest, NextResponse } from 'next/server'
import { gasGet, gasPost } from '@/lib/gas'

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const result = await gasGet('learners', {
    ...(p.get('search') ? { search: p.get('search')! } : {}),
    ...(p.get('status') ? { status: p.get('status')! } : {}),
  })
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await gasPost('learners', 'create', { data: body })
  return NextResponse.json(result, { status: 201 })
}
