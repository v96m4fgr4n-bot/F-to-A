export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const category = p.get('category')
    const limit = parseInt(p.get('limit') ?? '100')
    const offset = parseInt(p.get('offset') ?? '0')

    let query = db
      .from('audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== 'all') query = query.eq('category', category)

    const { data, error, count } = await query
    if (error) throw error
    return NextResponse.json({ data: data ?? [], count: count ?? 0 })
  } catch (e: any) {
    return NextResponse.json({ data: [], count: 0, error: e.message }, { status: 200 })
  }
}
