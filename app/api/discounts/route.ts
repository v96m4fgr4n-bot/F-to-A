export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const status = p.get('status')
    const type = p.get('type')

    let query = db
      .from('discounts')
      .select('*, learner:learners(id, name)')
      .order('applied_from', { ascending: false })

    if (status && status !== 'all') query = query.eq('status', status)
    if (type && type !== 'all') query = query.eq('type', type)

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
      .from('discounts')
      .insert({ ...body, status: body.status ?? 'active' })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
