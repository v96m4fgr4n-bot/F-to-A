export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    const stage = req.nextUrl.searchParams.get('stage')

    let query = db
      .from('pipeline')
      .select('*, tasks:pipeline_tasks(*)')
      .order('moved_at', { ascending: false })

    if (stage && stage !== 'all') query = query.eq('stage', stage)

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
    const { data, error } = await db
      .from('pipeline')
      .insert({ stage: 'inquiry', moved_at: new Date().toISOString(), ...body })
      .select()
      .single()
    if (error) throw error
    await logAudit(db, {
      action: 'create',
      entityType: 'pipeline',
      entityId: data?.id ?? null,
      entityLabel: data?.name ?? null,
      newValue: data?.stage,
      category: 'learner',
    })
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
