// In-memory seed data used when Supabase env vars are not configured
// This lets the app work out of the box without a database

import type { Learner, Tutor, Session, Invoice, LedgerEntry, Payroll, Pipeline } from '@/types'

export const TUTORS: Tutor[] = [
  { id: 't1', name: 'Tinashe Maphosa', role: 'Senior Tutor', email: 'tinashe@ftoatutoring.net', phone: '+263771234567', subjects: ['Maths', 'Physics'], rate_per_session: 15, joined_at: '2024-01-10', active: true, created_at: '2024-01-10T00:00:00Z' },
  { id: 't2', name: 'Chiedza Moyo', role: 'Tutor', email: 'chiedza@ftoatutoring.net', phone: '+263772345678', subjects: ['English', 'History'], rate_per_session: 12, joined_at: '2024-02-15', active: true, created_at: '2024-02-15T00:00:00Z' },
  { id: 't3', name: 'Shamiso Dube', role: 'Tutor', email: 'shamiso@ftoatutoring.net', phone: '+263773456789', subjects: ['Chemistry', 'Biology'], rate_per_session: 12, joined_at: '2024-03-01', active: true, created_at: '2024-03-01T00:00:00Z' },
]

export const LEARNERS: Learner[] = [
  { id: 'l1', name: 'Takudzwa Zimba', grade: 10, subject: 'Maths', tutor_id: 't1', plan: 'intensive', mrr: 280, status: 'active', progress: 82, enrolled_at: '2024-09-01', parent_name: 'Grace Zimba', parent_phone: '+263771111111', parent_email: 'grace.zimba@gmail.com', notes: null, created_at: '2024-09-01T00:00:00Z', tutor: undefined },
  { id: 'l2', name: 'Rufaro Gumbo', grade: 9, subject: 'English', tutor_id: 't2', plan: 'standard', mrr: 180, status: 'active', progress: 67, enrolled_at: '2024-10-01', parent_name: 'Peter Gumbo', parent_phone: '+263772222222', parent_email: 'peter.gumbo@gmail.com', notes: null, created_at: '2024-10-01T00:00:00Z', tutor: undefined },
  { id: 'l3', name: 'Chido Mpofu', grade: 11, subject: 'Chemistry', tutor_id: 't3', plan: 'intensive', mrr: 280, status: 'active', progress: 91, enrolled_at: '2024-08-15', parent_name: 'Ruth Mpofu', parent_phone: '+263773333333', parent_email: 'ruth.mpofu@gmail.com', notes: null, created_at: '2024-08-15T00:00:00Z', tutor: undefined },
  { id: 'l4', name: 'Munashe Chirwa', grade: 8, subject: 'Physics', tutor_id: 't1', plan: 'standard', mrr: 180, status: 'paused', progress: 45, enrolled_at: '2024-11-01', parent_name: 'David Chirwa', parent_phone: '+263774444444', parent_email: 'david.chirwa@gmail.com', notes: null, created_at: '2024-11-01T00:00:00Z', tutor: undefined },
  { id: 'l5', name: 'Kudakwashe Ndlovu', grade: 12, subject: 'Maths', tutor_id: 't1', plan: 'intensive', mrr: 280, status: 'active', progress: 74, enrolled_at: '2024-07-01', parent_name: 'Jane Ndlovu', parent_phone: '+263775555555', parent_email: 'jane.ndlovu@gmail.com', notes: null, created_at: '2024-07-01T00:00:00Z', tutor: undefined },
  { id: 'l6', name: 'Nkosi Moyo', grade: 10, subject: 'Biology', tutor_id: 't3', plan: 'starter', mrr: 100, status: 'active', progress: 58, enrolled_at: '2025-01-10', parent_name: 'Sibo Moyo', parent_phone: '+263776666666', parent_email: 'sibo.moyo@gmail.com', notes: null, created_at: '2025-01-10T00:00:00Z', tutor: undefined },
  { id: 'l7', name: 'Ngonidzashe Sibanda', grade: 9, subject: 'History', tutor_id: 't2', plan: 'payg', mrr: 60, status: 'active', progress: 63, enrolled_at: '2025-02-01', parent_name: 'Aleck Sibanda', parent_phone: '+263777777777', parent_email: 'aleck.sibanda@gmail.com', notes: null, created_at: '2025-02-01T00:00:00Z', tutor: undefined },
  { id: 'l8', name: 'Ruvimbo Zvobgo', grade: 11, subject: 'English', tutor_id: 't2', plan: 'standard', mrr: 180, status: 'active', progress: 79, enrolled_at: '2024-12-01', parent_name: 'Mercy Zvobgo', parent_phone: '+263778888888', parent_email: 'mercy.zvobgo@gmail.com', notes: null, created_at: '2024-12-01T00:00:00Z', tutor: undefined },
  { id: 'l9', name: 'Tatenda Makoni', grade: 8, subject: 'Maths', tutor_id: 't1', plan: 'starter', mrr: 100, status: 'pending', progress: 30, enrolled_at: null, parent_name: 'Tafadzwa Makoni', parent_phone: '+263779999999', parent_email: 'tafadzwa.makoni@gmail.com', notes: null, created_at: '2025-03-01T00:00:00Z', tutor: undefined },
  { id: 'l10', name: 'Farai Makoni', grade: 12, subject: 'Chemistry', tutor_id: 't3', plan: 'intensive', mrr: 280, status: 'churned', progress: 20, enrolled_at: '2024-06-01', parent_name: 'Tafadzwa Makoni', parent_phone: '+263779999999', parent_email: 'tafadzwa.makoni@gmail.com', notes: 'Relocated to South Africa', created_at: '2024-06-01T00:00:00Z', tutor: undefined },
]

export const SESSIONS: Session[] = [
  { id: 's1', learner_id: 'l1', tutor_id: 't1', scheduled_at: '2026-06-20T09:00:00Z', duration_mins: 60, subject: 'Maths', attendance: 'present', notes: 'Covered quadratic equations', created_at: '2026-06-20T09:00:00Z' },
  { id: 's2', learner_id: 'l2', tutor_id: 't2', scheduled_at: '2026-06-20T10:00:00Z', duration_mins: 60, subject: 'English', attendance: 'present', notes: 'Essay writing practice', created_at: '2026-06-20T10:00:00Z' },
  { id: 's3', learner_id: 'l3', tutor_id: 't3', scheduled_at: '2026-06-19T14:00:00Z', duration_mins: 90, subject: 'Chemistry', attendance: 'present', notes: 'Organic chemistry reactions', created_at: '2026-06-19T14:00:00Z' },
  { id: 's4', learner_id: 'l4', tutor_id: 't1', scheduled_at: '2026-06-18T09:00:00Z', duration_mins: 60, subject: 'Physics', attendance: 'absent', notes: null, created_at: '2026-06-18T09:00:00Z' },
  { id: 's5', learner_id: 'l5', tutor_id: 't1', scheduled_at: '2026-06-18T11:00:00Z', duration_mins: 60, subject: 'Maths', attendance: 'present', notes: 'Calculus intro', created_at: '2026-06-18T11:00:00Z' },
  { id: 's6', learner_id: 'l6', tutor_id: 't3', scheduled_at: '2026-06-17T15:00:00Z', duration_mins: 60, subject: 'Biology', attendance: 'present', notes: 'Cell biology', created_at: '2026-06-17T15:00:00Z' },
  { id: 's7', learner_id: 'l7', tutor_id: 't2', scheduled_at: '2026-06-17T09:00:00Z', duration_mins: 60, subject: 'History', attendance: 'late', notes: 'Arrived 15 minutes late', created_at: '2026-06-17T09:00:00Z' },
  { id: 's8', learner_id: 'l8', tutor_id: 't2', scheduled_at: '2026-06-16T10:00:00Z', duration_mins: 60, subject: 'English', attendance: 'present', notes: 'Shakespeare analysis', created_at: '2026-06-16T10:00:00Z' },
  { id: 's9', learner_id: 'l1', tutor_id: 't1', scheduled_at: '2026-06-15T09:00:00Z', duration_mins: 60, subject: 'Maths', attendance: 'present', notes: null, created_at: '2026-06-15T09:00:00Z' },
  { id: 's10', learner_id: 'l3', tutor_id: 't3', scheduled_at: '2026-06-14T14:00:00Z', duration_mins: 60, subject: 'Chemistry', attendance: 'present', notes: null, created_at: '2026-06-14T14:00:00Z' },
  { id: 's11', learner_id: 'l5', tutor_id: 't1', scheduled_at: '2026-06-13T11:00:00Z', duration_mins: 60, subject: 'Maths', attendance: 'cancelled', notes: 'Public holiday', created_at: '2026-06-13T11:00:00Z' },
]

export const INVOICES: Invoice[] = [
  { id: 'inv1', learner_id: 'l1', description: 'June 2026 — Intensive Plan', amount: 280, status: 'paid', invoice_date: '2026-06-01', due_date: '2026-06-07', reference: 'INV-2026-001', created_at: '2026-06-01T00:00:00Z' },
  { id: 'inv2', learner_id: 'l2', description: 'June 2026 — Standard Plan', amount: 180, status: 'paid', invoice_date: '2026-06-01', due_date: '2026-06-07', reference: 'INV-2026-002', created_at: '2026-06-01T00:00:00Z' },
  { id: 'inv3', learner_id: 'l3', description: 'June 2026 — Intensive Plan', amount: 280, status: 'due', invoice_date: '2026-06-01', due_date: '2026-06-14', reference: 'INV-2026-003', created_at: '2026-06-01T00:00:00Z' },
  { id: 'inv4', learner_id: 'l5', description: 'June 2026 — Intensive Plan', amount: 280, status: 'paid', invoice_date: '2026-06-01', due_date: '2026-06-07', reference: 'INV-2026-004', created_at: '2026-06-01T00:00:00Z' },
  { id: 'inv5', learner_id: 'l6', description: 'June 2026 — Starter Plan', amount: 100, status: 'due', invoice_date: '2026-06-01', due_date: '2026-06-14', reference: 'INV-2026-005', created_at: '2026-06-01T00:00:00Z' },
  { id: 'inv6', learner_id: 'l7', description: 'June 2026 — PAYG (4 sessions)', amount: 60, status: 'overdue', invoice_date: '2026-05-31', due_date: '2026-06-07', reference: 'INV-2026-006', created_at: '2026-05-31T00:00:00Z' },
  { id: 'inv7', learner_id: 'l8', description: 'June 2026 — Standard Plan', amount: 180, status: 'paid', invoice_date: '2026-06-01', due_date: '2026-06-07', reference: 'INV-2026-007', created_at: '2026-06-01T00:00:00Z' },
  { id: 'inv8', learner_id: 'l4', description: 'May 2026 — Standard Plan', amount: 180, status: 'overdue', invoice_date: '2026-05-01', due_date: '2026-05-14', reference: 'INV-2026-008', created_at: '2026-05-01T00:00:00Z' },
]

export const LEDGER: LedgerEntry[] = [
  { id: 'led1', type: 'income', description: 'Payment — Takudzwa Zimba (Jun)', category: 'Tuition', amount: 280, reference: 'INV-2026-001', entry_date: '2026-06-03', learner_id: 'l1', tutor_id: null, invoice_id: 'inv1', created_at: '2026-06-03T00:00:00Z' },
  { id: 'led2', type: 'income', description: 'Payment — Rufaro Gumbo (Jun)', category: 'Tuition', amount: 180, reference: 'INV-2026-002', entry_date: '2026-06-04', learner_id: 'l2', tutor_id: null, invoice_id: 'inv2', created_at: '2026-06-04T00:00:00Z' },
  { id: 'led3', type: 'income', description: 'Payment — Kudakwashe Ndlovu (Jun)', category: 'Tuition', amount: 280, reference: 'INV-2026-004', entry_date: '2026-06-05', learner_id: 'l5', tutor_id: null, invoice_id: 'inv4', created_at: '2026-06-05T00:00:00Z' },
  { id: 'led4', type: 'income', description: 'Payment — Ruvimbo Zvobgo (Jun)', category: 'Tuition', amount: 180, reference: 'INV-2026-007', entry_date: '2026-06-06', learner_id: 'l8', tutor_id: null, invoice_id: 'inv7', created_at: '2026-06-06T00:00:00Z' },
  { id: 'led5', type: 'expense', description: 'Tutor payout — Tinashe Maphosa (May)', category: 'Payroll', amount: 210, reference: 'PAY-2026-05-T1', entry_date: '2026-06-01', learner_id: null, tutor_id: 't1', invoice_id: null, created_at: '2026-06-01T00:00:00Z' },
  { id: 'led6', type: 'expense', description: 'Tutor payout — Chiedza Moyo (May)', category: 'Payroll', amount: 132, reference: 'PAY-2026-05-T2', entry_date: '2026-06-01', learner_id: null, tutor_id: 't2', invoice_id: null, created_at: '2026-06-01T00:00:00Z' },
  { id: 'led7', type: 'expense', description: 'Tutor payout — Shamiso Dube (May)', category: 'Payroll', amount: 120, reference: 'PAY-2026-05-T3', entry_date: '2026-06-01', learner_id: null, tutor_id: 't3', invoice_id: null, created_at: '2026-06-01T00:00:00Z' },
  { id: 'led8', type: 'expense', description: 'Internet & Software subscriptions', category: 'Operations', amount: 45, reference: null, entry_date: '2026-06-02', learner_id: null, tutor_id: null, invoice_id: null, created_at: '2026-06-02T00:00:00Z' },
]

export const PAYROLL: Payroll[] = [
  { id: 'pay1', tutor_id: 't1', period_start: '2026-06-01', period_end: '2026-06-30', sessions_count: 14, rate: 15, bonus: 0, gross: 210, status: 'due', paid_at: null, created_at: '2026-06-01T00:00:00Z' },
  { id: 'pay2', tutor_id: 't2', period_start: '2026-06-01', period_end: '2026-06-30', sessions_count: 11, rate: 12, bonus: 0, gross: 132, status: 'due', paid_at: null, created_at: '2026-06-01T00:00:00Z' },
  { id: 'pay3', tutor_id: 't3', period_start: '2026-06-01', period_end: '2026-06-30', sessions_count: 10, rate: 12, bonus: 0, gross: 120, status: 'due', paid_at: null, created_at: '2026-06-01T00:00:00Z' },
]

export const PIPELINE: Pipeline[] = [
  { id: 'pipe1', learner_id: null, stage: 'inquiry', parent_name: 'Blessing Chikwanda', parent_phone: '+263771000001', subjects: ['Maths', 'Science'], churn_reason: null, moved_at: '2026-06-18T00:00:00Z', created_at: '2026-06-18T00:00:00Z' },
  { id: 'pipe2', learner_id: null, stage: 'inquiry', parent_name: 'Tapiwa Nyoni', parent_phone: '+263771000002', subjects: ['English'], churn_reason: null, moved_at: '2026-06-20T00:00:00Z', created_at: '2026-06-20T00:00:00Z' },
  { id: 'pipe3', learner_id: null, stage: 'matching', parent_name: 'Rudo Mutasa', parent_phone: '+263771000003', subjects: ['History', 'English'], churn_reason: null, moved_at: '2026-06-15T00:00:00Z', created_at: '2026-06-15T00:00:00Z' },
  { id: 'pipe4', learner_id: null, stage: 'matching', parent_name: 'Admire Chirinda', parent_phone: '+263771000004', subjects: ['Chemistry'], churn_reason: null, moved_at: '2026-06-16T00:00:00Z', created_at: '2026-06-16T00:00:00Z' },
  { id: 'pipe5', learner_id: null, stage: 'trial', parent_name: 'Lucia Zvinavashe', parent_phone: '+263771000005', subjects: ['Maths'], churn_reason: null, moved_at: '2026-06-10T00:00:00Z', created_at: '2026-06-10T00:00:00Z' },
  { id: 'pipe6', learner_id: null, stage: 'trial', parent_name: 'Simba Kachingwe', parent_phone: '+263771000006', subjects: ['Biology', 'Chemistry'], churn_reason: null, moved_at: '2026-06-12T00:00:00Z', created_at: '2026-06-12T00:00:00Z' },
  { id: 'pipe7', learner_id: 'l1', stage: 'active', parent_name: 'Grace Zimba', parent_phone: '+263771111111', subjects: ['Maths'], churn_reason: null, moved_at: '2024-09-01T00:00:00Z', created_at: '2024-09-01T00:00:00Z' },
  { id: 'pipe8', learner_id: null, stage: 'churned', parent_name: 'Tendai Bvute', parent_phone: '+263771000007', subjects: ['Physics'], churn_reason: 'Price too high', moved_at: '2026-05-01T00:00:00Z', created_at: '2026-04-01T00:00:00Z' },
  { id: 'pipe9', learner_id: 'l10', stage: 'churned', parent_name: 'Tafadzwa Makoni', parent_phone: '+263779999999', subjects: ['Chemistry'], churn_reason: 'Relocated', moved_at: '2026-06-01T00:00:00Z', created_at: '2024-06-01T00:00:00Z' },
]
