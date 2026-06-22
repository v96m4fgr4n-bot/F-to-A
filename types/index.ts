export type LearnerStatus = 'active' | 'paused' | 'pending' | 'churned'
export type LearnerPlan = 'intensive' | 'standard' | 'starter' | 'payg' | 'inquiry'
export type Attendance = 'present' | 'absent' | 'late' | 'cancelled'
export type InvoiceStatus = 'paid' | 'due' | 'overdue'
export type PayrollStatus = 'due' | 'paid'
export type PipelineStage = 'inquiry' | 'matching' | 'trial' | 'active' | 'churned'
export type LedgerType = 'income' | 'expense'
export type BroadcastChannel = 'whatsapp' | 'email' | 'both'

export interface Learner {
  id: string
  name: string
  grade: number | null
  subject: string | null
  tutor_id: string | null
  plan: LearnerPlan | null
  mrr: number
  status: LearnerStatus
  progress: number | null
  enrolled_at: string | null
  parent_name: string | null
  parent_phone: string | null
  parent_email: string | null
  notes: string | null
  created_at: string
  tutor?: Tutor
}

export interface Tutor {
  id: string
  name: string
  role: string | null
  email: string | null
  phone: string | null
  subjects: string[]
  rate_per_session: number
  joined_at: string | null
  active: boolean
  created_at: string
}

export interface Session {
  id: string
  learner_id: string
  tutor_id: string
  scheduled_at: string
  duration_mins: number
  subject: string | null
  attendance: Attendance
  notes: string | null
  created_at: string
  learner?: Learner
  tutor?: Tutor
}

export interface Invoice {
  id: string
  learner_id: string
  description: string | null
  amount: number
  status: InvoiceStatus
  invoice_date: string | null
  due_date: string | null
  reference: string | null
  created_at: string
  learner?: Learner
}

export interface LedgerEntry {
  id: string
  type: LedgerType
  description: string
  category: string | null
  amount: number
  reference: string | null
  entry_date: string
  learner_id: string | null
  tutor_id: string | null
  invoice_id: string | null
  created_at: string
}

export interface Payroll {
  id: string
  tutor_id: string
  period_start: string | null
  period_end: string | null
  sessions_count: number | null
  rate: number | null
  bonus: number
  gross: number | null
  status: PayrollStatus
  paid_at: string | null
  created_at: string
  tutor?: Tutor
}

export interface Pipeline {
  id: string
  learner_id: string | null
  stage: PipelineStage
  parent_name: string | null
  parent_phone: string | null
  subjects: string[]
  churn_reason: string | null
  moved_at: string
  created_at: string
  learner?: Learner
}

export interface Broadcast {
  id: string
  channel: BroadcastChannel
  subject: string | null
  body: string
  recipient_filter: string | null
  sent_count: number | null
  sent_at: string | null
  created_at: string
}

export interface Settings {
  key: string
  value: string
}

export interface DashboardKPIs {
  mrr: number
  active_learners: number
  sessions_this_month: number
  outstanding_invoices: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
