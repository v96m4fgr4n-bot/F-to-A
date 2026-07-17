export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const status = p.get('status')

    let query = db
      .from('contracts')
      .select('*, learner:learners(id, name), tutor:tutors(id, name)')
      .order('uploaded_at', { ascending: false })

    if (status && status !== 'all') query = query.eq('status', status)

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
      .from('contracts')
      .insert({ ...body, uploaded_at: new Date().toISOString(), status: body.status ?? 'pending' })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
