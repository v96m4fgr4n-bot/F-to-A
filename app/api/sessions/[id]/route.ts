import { getDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb()
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(params.id)
  db.close()

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json(session)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const db = getDb()

  const stmt = db.prepare(`
    UPDATE sessions
    SET date = ?, start_time = ?, end_time = ?, subject = ?, status = ?, notes = ?
    WHERE id = ?
  `)

  stmt.run(
    body.date,
    body.start_time,
    body.end_time,
    body.subject || null,
    body.status || 'scheduled',
    body.notes || null,
    params.id
  )

  db.close()
  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb()
  db.prepare('DELETE FROM sessions WHERE id = ?').run(params.id)
  db.close()
  return NextResponse.json({ success: true })
}
