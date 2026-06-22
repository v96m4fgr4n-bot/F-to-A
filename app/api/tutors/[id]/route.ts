import { NextRequest, NextResponse } from 'next/server'
import { TUTORS } from '@/lib/data'

let tutors = [...TUTORS]

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const t = tutors.find(t => t.id === params.id)
  if (!t) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: t, error: null })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const idx = tutors.findIndex(t => t.id === params.id)
  if (idx === -1) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
  tutors[idx] = { ...tutors[idx], ...body }
  return NextResponse.json({ data: tutors[idx], error: null })
}
