import { NextRequest, NextResponse } from 'next/server'
import { gasPost } from '@/lib/gas'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const result = await gasPost('sessions', 'update', { id: params.id, data: body })
  return NextResponse.json(result)
}
