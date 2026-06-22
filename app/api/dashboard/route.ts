import { NextResponse } from 'next/server'
import { LEARNERS, SESSIONS, INVOICES, LEDGER } from '@/lib/data'

export async function GET() {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const mrr = LEARNERS.filter(l => l.status === 'active').reduce((sum, l) => sum + l.mrr, 0)
  const active_learners = LEARNERS.filter(l => l.status === 'active').length
  const sessions_this_month = SESSIONS.filter(s => s.scheduled_at.startsWith(thisMonth)).length
  const outstanding_invoices = INVOICES.filter(i => i.status === 'due' || i.status === 'overdue').length

  // Last 6 months revenue
  const months: { month: string; revenue: number; sessions: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const revenue = LEDGER.filter(e => e.type === 'income' && e.entry_date.startsWith(key)).reduce((s, e) => s + e.amount, 0)
    const sess = SESSIONS.filter(s => s.scheduled_at.startsWith(key)).length
    months.push({ month: label, revenue, sessions: sess })
  }

  // Plan breakdown
  const planCounts: Record<string, number> = {}
  LEARNERS.filter(l => l.plan).forEach(l => {
    planCounts[l.plan!] = (planCounts[l.plan!] || 0) + 1
  })

  // Outstanding invoices detail
  const outstanding = INVOICES.filter(i => i.status === 'due' || i.status === 'overdue')
    .slice(0, 5)
    .map(inv => ({
      ...inv,
      learner: LEARNERS.find(l => l.id === inv.learner_id)
    }))

  return NextResponse.json({
    data: { mrr, active_learners, sessions_this_month, outstanding_invoices, months, planCounts, outstanding },
    error: null
  })
}
