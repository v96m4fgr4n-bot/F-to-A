import { NextResponse } from 'next/server'
import { gasGet } from '@/lib/gas'

export async function GET() {
  const [learnersRes, sessionsRes, invoicesRes, ledgerRes] = await Promise.all([
    gasGet('learners'),
    gasGet('sessions'),
    gasGet('invoices'),
    gasGet('ledger'),
  ])

  const learners = learnersRes.data ?? []
  const sessions = sessionsRes.data ?? []
  const invoices = invoicesRes.data ?? []
  const ledger = ledgerRes.data ?? []

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const mrr = learners.filter((l: any) => l.status === 'active').reduce((s: number, l: any) => s + Number(l.mrr || 0), 0)
  const active_learners = learners.filter((l: any) => l.status === 'active').length
  const sessions_this_month = sessions.filter((s: any) => (s.scheduled_at || '').startsWith(thisMonth)).length
  const outstanding_invoices = invoices.filter((i: any) => i.status === 'due' || i.status === 'overdue').length

  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const revenue = ledger.filter((e: any) => e.type === 'income' && (e.entry_date || '').startsWith(key)).reduce((s: number, e: any) => s + Number(e.amount || 0), 0)
    const sess = sessions.filter((s: any) => (s.scheduled_at || '').startsWith(key)).length
    months.push({ month: label, revenue, sessions: sess })
  }

  const planCounts: Record<string, number> = {}
  learners.filter((l: any) => l.plan).forEach((l: any) => { planCounts[l.plan] = (planCounts[l.plan] || 0) + 1 })

  const learnerMap: Record<string, any> = {}
  learners.forEach((l: any) => learnerMap[l.id] = l)
  const outstanding = invoices
    .filter((i: any) => i.status === 'due' || i.status === 'overdue')
    .slice(0, 5)
    .map((i: any) => ({ ...i, learner: learnerMap[i.learner_id] || null }))

  return NextResponse.json({
    data: { mrr, active_learners, sessions_this_month, outstanding_invoices, months, planCounts, outstanding },
    error: null
  })
}
