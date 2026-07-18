export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { data, error } = await db.from('invoices').update(body).eq('id', params.id).select().single()
    if (error) throw error
    const fields = Object.keys(body)
    await logAudit(db, {
      action: 'update',
      entityType: 'invoice',
      entityId: params.id,
      entityLabel: data?.reference ?? null,
      fieldChanged: fields.length ? fields.join(', ') : null,
      newValue: fields.length === 1 ? body[fields[0]] : null,
      category: 'finance',
    })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
