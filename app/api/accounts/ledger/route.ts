export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const type = p.get('type')
    const month = p.get('month') // YYYY-MM

    let query = db.from('ledger').select('*').order('entry_date', { ascending: false })

    if (type && type !== 'all') query = query.eq('type', type)
    if (month) {
      const [y, m] = month.split('-').map(Number)
      const start = `${month}-01`
      const next = `${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, '0')}-01`
      query = query.gte('entry_date', start).lt('entry_date', next)
    }

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
    const { data, error } = await db.from('ledger').insert(body).select().single()
    if (error) throw error
    await logAudit(db, {
      action: 'create',
      entityType: 'ledger',
      entityId: data?.id ?? null,
      entityLabel: data?.description ?? null,
      newValue: data?.amount,
      category: 'finance',
    })
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
