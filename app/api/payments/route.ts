import { getDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get('studentId')
  const db = getDb()

  let query = 'SELECT * FROM payments ORDER BY date DESC'
  const params = []

  if (studentId) {
    query = 'SELECT * FROM payments WHERE student_id = ? ORDER BY date DESC'
    params.push(studentId)
  }

  const payments = db.prepare(query).all(...params)
  db.close()
  return NextResponse.json(payments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = getDb()

  const stmt = db.prepare(`
    INSERT INTO payments (student_id, amount, date, description, status)
    VALUES (?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    body.student_id,
    body.amount,
    body.date,
    body.description || null,
    body.status || 'paid'
  )

  db.close()
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 })
}
