export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { learner_id, tutor_id, inquiry_id } = await req.json()

    // Update learner's tutor
    if (learner_id && tutor_id) {
      const { error } = await db.from('learners').update({ tutor_id }).eq('id', learner_id)
      if (error) throw error
    }

    // Advance pipeline stage if inquiry provided
    if (inquiry_id) {
      await db.from('pipeline').update({ stage: 'trial_scheduled', moved_at: new Date().toISOString() }).eq('id', inquiry_id)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
