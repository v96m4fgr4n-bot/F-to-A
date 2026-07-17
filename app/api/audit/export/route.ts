export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const category = p.get('category')

    let query = db
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })

    if (category && category !== 'all') query = query.eq('category', category)

    const { data, error } = await query
    if (error) throw error

    const rows = data ?? []
    const headers = ['id', 'created_at', 'user_id', 'action', 'entity_type', 'entity_id', 'entity_label', 'field_changed', 'old_value', 'new_value', 'category']
    const csv = [
      headers.join(','),
      ...rows.map((r: any) => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
