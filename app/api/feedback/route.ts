export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const tutor_id = p.get('tutor_id')
    const flagged = p.get('flagged')

    let query = db
      .from('feedback')
      .select('*, learner:learners(id, name), tutor:tutors(id, name)')
      .order('submitted_at', { ascending: false })

    if (tutor_id) query = query.eq('tutor_id', tutor_id)
    if (flagged === 'true') query = query.eq('flagged', true)

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
      .from('feedback')
      .insert({ ...body, submitted_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
