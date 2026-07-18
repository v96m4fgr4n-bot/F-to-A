export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json()
    const { data, error } = await db
      .from('pipeline')
      .update({ ...body, moved_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error
    await logAudit(db, {
      action: body.stage ? 'move stage' : 'update',
      entityType: 'pipeline',
      entityId: params.id,
      entityLabel: data?.name ?? null,
      fieldChanged: body.stage ? 'stage' : Object.keys(body).join(', ') || null,
      newValue: body.stage ?? null,
      category: 'learner',
    })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
