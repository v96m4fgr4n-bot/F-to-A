export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { gasGet, gasPost } from '@/lib/gas'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const result = await gasGet('tutors', { id: params.id })
  return NextResponse.json(result)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const result = await gasPost('tutors', 'update', { id: params.id, data: body })
  return NextResponse.json(result)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const result = await gasPost('tutors', 'delete', { id: params.id })
  return NextResponse.json(result)
}
