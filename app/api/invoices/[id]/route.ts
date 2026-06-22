import { NextRequest, NextResponse } from 'next/server'
import { INVOICES } from '@/lib/data'

let invoices = [...INVOICES]

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const idx = invoices.findIndex(i => i.id === params.id)
  if (idx === -1) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 })
  invoices[idx] = { ...invoices[idx], ...body }
  return NextResponse.json({ data: invoices[idx], error: null })
}
