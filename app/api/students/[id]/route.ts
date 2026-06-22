import { getDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb()
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(params.id)
  db.close()

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  return NextResponse.json(student)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const db = getDb()

  const stmt = db.prepare(`
    UPDATE students
    SET name = ?, email = ?, phone = ?, grade = ?, subjects = ?, hourly_rate = ?
    WHERE id = ?
  `)

  stmt.run(
    body.name,
    body.email || null,
    body.phone || null,
    body.grade || null,
    body.subjects || null,
    body.hourly_rate || 50,
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
  db.prepare('DELETE FROM students WHERE id = ?').run(params.id)
  db.close()
  return NextResponse.json({ success: true })
}
