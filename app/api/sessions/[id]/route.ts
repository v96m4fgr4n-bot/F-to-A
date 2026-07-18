export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json()
    const { data, error } = await db.from('sessions').update(body).eq('id', params.id).select().single()
    if (error) throw error
    const fields = Object.keys(body)
    await logAudit(db, {
      action: 'update',
      entityType: 'session',
      entityId: params.id,
      fieldChanged: fields.length ? fields.join(', ') : null,
      newValue: fields.length === 1 ? body[fields[0]] : null,
      category: 'learner',
    })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
