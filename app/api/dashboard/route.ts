export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { computeAtRiskLearners } from '@/lib/atRisk'

export async function GET() {
  try {
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const [learnersRes, sessionsRes, invoicesRes, ledgerRes, pipelineRes, feedbackRes] = await Promise.all([
      db.from('learners').select('id, name, status, plan, mrr, tutor_id'),
      db.from('sessions').select('id, learner_id, tutor_id, scheduled_at, attendance'),
      db.from('invoices').select('id, learner_id, status, amount, invoice_date, due_date, reference, learner:learners(id, name)').order('created_at', { ascending: false }),
      db.from('ledger').select('id, type, amount, entry_date'),
      db.from('pipeline').select('id, stage, lead_source'),
      db.from('feedback').select('rating'),
    ])

    const learners = learnersRes.data ?? []
    const sessions = sessionsRes.data ?? []
    const invoices = invoicesRes.data ?? []
    const ledger = ledgerRes.data ?? []
    const pipeline = pipelineRes.data ?? []
    const feedback = feedbackRes.data ?? []

    const mrr = learners.filter(l => l.status === 'active').reduce((s, l) => s + Number(l.mrr || 0), 0)
    const active_learners = learners.filter(l => l.status === 'active').length
    const sessions_this_month = sessions.filter(s => (s.scheduled_at || '').startsWith(thisMonth)).length
    const outstanding_invoices = invoices.filter(i => i.status === 'due' || i.status === 'overdue').length

    // 6-month chart
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      const revenue = ledger.filter(e => e.type === 'income' && (e.entry_date || '').startsWith(key)).reduce((s, e) => s + Number(e.amount || 0), 0)
      const sess = sessions.filter(s => (s.scheduled_at || '').startsWith(key)).length
      months.push({ month: label, revenue, sessions: sess })
    }

    // Plan donut
    const planCounts: Record<string, number> = {}
    learners.filter(l => l.plan).forEach(l => { planCounts[l.plan] = (planCounts[l.plan] || 0) + 1 })

    // Outstanding invoices widget
    const learnerMap: Record<string, any> = {}
    learners.forEach(l => { learnerMap[l.id] = l })
    const outstanding = invoices
      .filter(i => i.status === 'due' || i.status === 'overdue')
      .slice(0, 5)
      .map(i => ({ ...i, learner: learnerMap[i.learner_id] || null }))

    // At-risk learners
    const atRisk = await computeAtRiskLearners(db)

    // Lead sources widget
    const leadSourceCounts: Record<string, number> = {}
    pipeline.forEach(p => {
      const src = p.lead_source || 'Other'
      leadSourceCounts[src] = (leadSourceCounts[src] || 0) + 1
    })
    const totalLeads = pipeline.length || 1
    const leadSources = Object.entries(leadSourceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({ source, count, pct: Math.round((count / totalLeads) * 100) }))

    // CSAT
    const csat = feedback.length
      ? Math.round((feedback.reduce((s, f) => s + (f.rating ?? 0), 0) / feedback.length) * 20)
      : 0

    return NextResponse.json({
      data: { mrr, active_learners, sessions_this_month, outstanding_invoices, csat, months, planCounts, outstanding, atRisk, leadSources },
      error: null,
    })
  } catch (e: any) {
    return NextResponse.json({ data: null, error: e.message }, { status: 200 })
  }
}
