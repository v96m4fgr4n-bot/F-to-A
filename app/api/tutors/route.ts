import { NextRequest, NextResponse } from 'next/server'
import { gasGet, gasPost } from '@/lib/gas'

export async function GET() {
  const result = await gasGet('tutors')
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await gasPost('tutors', 'create', { data: body })
  return NextResponse.json(result, { status: 201 })
}
