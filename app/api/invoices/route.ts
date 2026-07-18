export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const status = p.get('status')
    const learner_id = p.get('learner_id')

    let query = db
      .from('invoices')
      .select('*, learner:learners(id, name)')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') query = query.eq('status', status)
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
    const ref = 'INV-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-4)
    const { data, error } = await db
      .from('invoices')
      .insert({ reference: ref, status: 'due', ...body })
      .select()
      .single()
    if (error) throw error
    await logAudit(db, {
      action: 'create',
      entityType: 'invoice',
      entityId: data?.id ?? null,
      entityLabel: data?.reference ?? null,
      newValue: data?.amount,
      category: 'finance',
    })
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
