export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const learnerId = p.get('learner_id')

    let query = db
      .from('assessments')
      .select('*')
      .order('date', { ascending: false })

    if (learnerId) query = query.eq('learner_id', learnerId)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ data: [], error: e.message }, { status: 200 })
  }
}
