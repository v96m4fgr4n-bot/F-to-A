import { NextRequest, NextResponse } from 'next/server'

let broadcasts: any[] = []

export async function GET() {
  return NextResponse.json({ data: broadcasts, error: null })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const id = 'bc' + Date.now()
  const entry = {
    id,
    created_at: new Date().toISOString(),
    sent_at: new Date().toISOString(),
    sent_count: body.recipient_count || 0,
    ...body,
  }
  broadcasts = [entry, ...broadcasts]
  return NextResponse.json({ data: entry, error: null }, { status: 201 })
}
