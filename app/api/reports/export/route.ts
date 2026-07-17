export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReportDocument } from '@/lib/pdf/report'
import { computeAtRiskLearners } from '@/lib/atRisk'
import React from 'react'

export async function GET() {
  try {
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const [learnersRes, sessionsRes, invoicesRes, ledgerRes, pipelineRes, feedbackRes] = await Promise.all([
      db.from('learners').select('id, name, status, plan, mrr'),
      db.from('sessions').select('id, scheduled_at'),
      db.from('invoices').select('id, status'),
      db.from('ledger').select('id, type, amount, entry_date'),
      db.from('pipeline').select('id, lead_source'),
      db.from('feedback').select('rating'),
    ])

    const learners = learnersRes.data ?? []
    const sessions = sessionsRes.data ?? []
    const invoices = invoicesRes.data ?? []
    const ledger = ledgerRes.data ?? []
    const feedback = feedbackRes.data ?? []

    const mrr = learners.filter(l => l.status === 'active').reduce((s, l) => s + Number(l.mrr || 0), 0)
    const active_learners = learners.filter(l => l.status === 'active').length
    const sessions_this_month = sessions.filter(s => (s.scheduled_at || '').startsWith(thisMonth)).length
    const outstanding_invoices = invoices.filter(i => i.status === 'due' || i.status === 'overdue').length
    const csat = feedback.length
      ? Math.round((feedback.reduce((s, f) => s + (f.rating ?? 0), 0) / feedback.length) * 20)
      : 0

    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      const revenue = ledger.filter(e => e.type === 'income' && (e.entry_date || '').startsWith(key)).reduce((s, e) => s + Number(e.amount || 0), 0)
      const sess = sessions.filter(s => (s.scheduled_at || '').startsWith(key)).length
      months.push({ month: label, revenue, sessions: sess })
    }

    const planCounts: Record<string, number> = {}
    learners.filter(l => l.plan).forEach(l => { planCounts[l.plan] = (planCounts[l.plan] || 0) + 1 })

    const atRisk = await computeAtRiskLearners(db)

    const buffer = await renderToBuffer(
      React.createElement(ReportDocument, {
        data: { mrr, active_learners, sessions_this_month, outstanding_invoices, csat, months, planCounts, atRisk, generatedAt: now.toISOString() }
      })
    )

    const label = now.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }).replace(' ', '_')

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fta_report_${label}.pdf"`,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
