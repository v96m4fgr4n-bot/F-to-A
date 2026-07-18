export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const search = p.get('search')
    const status = p.get('status')

    let query = db.from('learners').select('*, tutor:tutors(id, name)').order('name', { ascending: true })

    if (search) query = query.or(`name.ilike.%${search}%,subject.ilike.%${search}%`)
    if (status && status !== 'all') query = query.eq('status', status)

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
    const { data, error } = await db.from('learners').insert(body).select().single()
    if (error) throw error
    await logAudit(db, {
      action: 'create',
      entityType: 'learner',
      entityId: data?.id ?? null,
      entityLabel: data?.name ?? null,
      category: 'learner',
    })
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
