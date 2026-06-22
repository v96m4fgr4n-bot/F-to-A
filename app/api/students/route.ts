import { getDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const db = getDb()
  const students = db.prepare('SELECT * FROM students ORDER BY name').all()
  db.close()
  return NextResponse.json(students)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = getDb()

  const stmt = db.prepare(`
    INSERT INTO students (name, email, phone, grade, subjects, hourly_rate)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    body.name,
    body.email || null,
    body.phone || null,
    body.grade || null,
    body.subjects || null,
    body.hourly_rate || 50
  )

  db.close()
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 })
}
