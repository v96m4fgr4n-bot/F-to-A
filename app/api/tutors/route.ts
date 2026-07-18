export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

export async function GET() {
  try {
    const { data, error } = await db.from('tutors').select('*').order('name', { ascending: true })
    if (error) throw error
    return NextResponse.json({ data: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ data: [], error: e.message }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data, error } = await db.from('tutors').insert(body).select().single()
    if (error) throw error
    await logAudit(db, {
      action: 'create',
      entityType: 'tutor',
      entityId: data?.id ?? null,
      entityLabel: data?.name ?? null,
      category: 'staff',
    })
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
