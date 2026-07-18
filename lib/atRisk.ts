import type { SupabaseClient } from '@supabase/supabase-js'

export interface AtRiskLearner {
  learnerId: string
  name: string
  flag: string
  severity: 'high' | 'medium'
}

export async function computeAtRiskLearners(supabase: SupabaseClient): Promise<AtRiskLearner[]> {
  const results: AtRiskLearner[] = []

  const [{ data: learners }, { data: sessions }, { data: invoices }] = await Promise.all([
    supabase.from('learners').select('id, name, status').in('status', ['active', 'paused']),
    supabase.from('sessions').select('learner_id, scheduled_at, attendance').order('scheduled_at', { ascending: false }),
    supabase.from('invoices').select('learner_id, status, invoice_date').in('status', ['overdue', 'due']),
  ])

  if (!learners) return []

  const now = new Date()
  const cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Index sessions per learner (already ordered desc)
  const sessionsByLearner: Record<string, any[]> = {}
  for (const s of sessions ?? []) {
    if (!sessionsByLearner[s.learner_id]) sessionsByLearner[s.learner_id] = []
    sessionsByLearner[s.learner_id].push(s)
  }

  // Index invoices per learner
  const invoicesByLearner: Record<string, any[]> = {}
  for (const i of invoices ?? []) {
    if (!invoicesByLearner[i.learner_id]) invoicesByLearner[i.learner_id] = []
    invoicesByLearner[i.learner_id].push(i)
  }

  // Index future sessions per learner
  const futureSessions: Record<string, boolean> = {}
  for (const s of sessions ?? []) {
    if (new Date(s.scheduled_at) > now) futureSessions[s.learner_id] = true
  }

  for (const learner of learners) {
    const lSessions = sessionsByLearner[learner.id] ?? []
    const lInvoices = invoicesByLearner[learner.id] ?? []

    // Flag 1: last 2 sessions both absent
    const last2 = lSessions.slice(0, 2)
    if (last2.length === 2 && last2.every(s => s.attendance === 'absent')) {
      results.push({ learnerId: learner.id, name: learner.name, flag: '2 consecutive absences', severity: 'high' })
      continue
    }

    // Flag 2: overdue invoice older than 14 days
    const hasOverdue = lInvoices.some(i => i.status === 'overdue' && new Date(i.invoice_date) < cutoff)
    if (hasOverdue) {
      results.push({ learnerId: learner.id, name: learner.name, flag: 'Invoice overdue 14+ days', severity: 'high' })
      continue
    }

    // Flag 3: paused with no future session
    if (learner.status === 'paused' && !futureSessions[learner.id]) {
      results.push({ learnerId: learner.id, name: learner.name, flag: 'Paused — no session booked', severity: 'medium' })
    }
  }

  return results
}
