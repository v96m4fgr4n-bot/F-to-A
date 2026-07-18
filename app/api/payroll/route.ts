export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

const PAYROLL_SELECT = '*, tutor:tutors(id, name, role, email)'

async function fetchPayroll() {
  const { data, error } = await db
    .from('payroll')
    .select(PAYROLL_SELECT)
    .order('period_end', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function GET() {
  try {
    const data = await fetchPayroll()
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ data: [], error: e.message }, { status: 200 })
  }
}

async function payEntry(entry: any, paidAt: string) {
  const { error } = await db
    .from('payroll')
    .update({ status: 'paid', paid_at: paidAt })
    .eq('id', entry.id)
  if (error) throw error

  const tutorName = entry.tutor?.name ?? 'Unknown tutor'
  const { error: ledgerError } = await db.from('ledger').insert({
    type: 'expense',
    category: 'Payroll',
    description: `Tutor payout — ${tutorName}`,
    amount: entry.gross ?? 0,
    entry_date: paidAt.slice(0, 10),
    tutor_id: entry.tutor_id ?? entry.tutor?.id ?? null,
  })
  if (ledgerError) throw ledgerError

  await logAudit(db, {
    action: 'pay',
    entityType: 'payroll',
    entityId: entry.id,
    entityLabel: tutorName,
    fieldChanged: 'status',
    oldValue: entry.status,
    newValue: 'paid',
    category: 'finance',
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, all } = body
    const paidAt = new Date().toISOString()

    const payroll = await fetchPayroll()

    if (all) {
      const dues = payroll.filter((p: any) => p.status === 'due')
      for (const p of dues) await payEntry(p, paidAt)
    } else if (id) {
      const entry = payroll.find((p: any) => p.id === id)
      if (entry) await payEntry(entry, paidAt)
    }

    const updated = await fetchPayroll()
    return NextResponse.json({ data: updated })
  } catch (e: any) {
    return NextResponse.json({ data: [], error: e.message }, { status: 200 })
  }
}
