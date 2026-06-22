import { getDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get('studentId')
  const db = getDb()

  let query = 'SELECT * FROM sessions ORDER BY date DESC, start_time DESC'
  const params = []

  if (studentId) {
    query = 'SELECT * FROM sessions WHERE student_id = ? ORDER BY date DESC, start_time DESC'
    params.push(studentId)
  }

  const sessions = db.prepare(query).all(...params)
  db.close()
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = getDb()

  const stmt = db.prepare(`
    INSERT INTO sessions (student_id, date, start_time, end_time, subject, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    body.student_id,
    body.date,
    body.start_time,
    body.end_time,
    body.subject || null,
    body.status || 'scheduled',
    body.notes || null
  )

  db.close()
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 })
}
