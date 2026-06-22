import { getDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get('studentId')
  const db = getDb()

  let query = 'SELECT * FROM progress_notes ORDER BY date DESC'
  const params = []

  if (studentId) {
    query = 'SELECT * FROM progress_notes WHERE student_id = ? ORDER BY date DESC'
    params.push(studentId)
  }

  const notes = db.prepare(query).all(...params)
  db.close()
  return NextResponse.json(notes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = getDb()

  const stmt = db.prepare(`
    INSERT INTO progress_notes (student_id, content, grade, date)
    VALUES (?, ?, ?, ?)
  `)

  const result = stmt.run(
    body.student_id,
    body.content,
    body.grade || null,
    body.date
  )

  db.close()
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 })
}
