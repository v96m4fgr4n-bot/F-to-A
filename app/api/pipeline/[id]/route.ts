import { NextRequest, NextResponse } from 'next/server'
import { PIPELINE } from '@/lib/data'

let pipeline = [...PIPELINE]

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const idx = pipeline.findIndex(p => p.id === params.id)
  if (idx === -1) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
  pipeline[idx] = { ...pipeline[idx], ...body, moved_at: new Date().toISOString() }
  return NextResponse.json({ data: pipeline[idx], error: null })
}
