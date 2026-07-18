export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const from = p.get('from')
    const to = p.get('to')

    let query = db
      .from('sessions')
      .select('*, learner:learners(id, name), tutor:tutors(id, name)')
      .order('scheduled_at', { ascending: true })

    if (from) query = query.gte('scheduled_at', from)
    if (to) query = query.lte('scheduled_at', to)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ data: [], error: e.message }, { status: 200 })
  }
}
