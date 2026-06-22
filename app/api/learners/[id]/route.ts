import { NextRequest, NextResponse } from 'next/server'
import { gasGet, gasPost } from '@/lib/gas'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const result = await gasGet('learners', { id: params.id })
  return NextResponse.json(result)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const result = await gasPost('learners', 'update', { id: params.id, data: body })
  return NextResponse.json(result)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const result = await gasPost('learners', 'delete', { id: params.id })
  return NextResponse.json(result)
}
