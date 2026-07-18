export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await db.from('learners').select('*').eq('id', params.id).single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e.message }, { status: 200 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { data, error } = await db.from('learners').update(body).eq('id', params.id).select().single()
    if (error) throw error
    const fields = Object.keys(body)
    await logAudit(db, {
      action: 'update',
      entityType: 'learner',
      entityId: params.id,
      entityLabel: data?.name ?? null,
      fieldChanged: fields.length ? fields.join(', ') : null,
      newValue: fields.length === 1 ? body[fields[0]] : null,
      category: 'learner',
    })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await db.from('learners').delete().eq('id', params.id)
    if (error) throw error
    await logAudit(db, {
      action: 'delete',
      entityType: 'learner',
      entityId: params.id,
      category: 'learner',
    })
    return NextResponse.json({ data: { id: params.id } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
