export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const tutor_id = p.get('tutor_id')
    const learner_id = p.get('learner_id')

    let query = db
      .from('sessions')
      .select('*, learner:learners(id, name), tutor:tutors(id, name)')
      .order('scheduled_at', { ascending: false })

    if (tutor_id) query = query.eq('tutor_id', tutor_id)
    if (learner_id) query = query.eq('learner_id', learner_id)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ data: [], error: e.message }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data, error } = await db.from('sessions').insert(body).select().single()
    if (error) throw error
    await logAudit(db, {
      action: 'create',
      entityType: 'session',
      entityId: data?.id ?? null,
      entityLabel: data?.scheduled_at ?? null,
      category: 'learner',
    })
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
