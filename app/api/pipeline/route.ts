import { NextRequest, NextResponse } from 'next/server'
import { gasGet, gasPost } from '@/lib/gas'

export async function GET() {
  const result = await gasGet('pipeline')
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await gasPost('pipeline', 'create', { data: { stage: 'inquiry', moved_at: new Date().toISOString(), ...body } })
  return NextResponse.json(result, { status: 201 })
}
