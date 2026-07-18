import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const db = createClient(url, key)

async function seed() {
  console.log('Seeding F-to-A database…')

  const { data: tutors } = await db.from('tutors').insert([
    { name: 'Tinashe Maphosa', role: 'Senior Tutor', email: 'tinashe@ftoatutoring.net', phone: '+263771000001', subjects: ['Maths','Physics','Further Maths'], rate_per_session: 15, joined_at: '2024-01-10', active: true },
    { name: 'Chiedza Moyo',    role: 'Tutor',        email: 'chiedza@ftoatutoring.net', phone: '+263771000002', subjects: ['English','History','Geography'],   rate_per_session: 15, joined_at: '2024-03-05', active: true },
    { name: 'Shamiso Dube',    role: 'Tutor',        email: 'shamiso@ftoatutoring.net', phone: '+263771000003', subjects: ['Biology','Chemistry','Maths'],     rate_per_session: 15, joined_at: '2024-06-01', active: true },
  ]).select()
  if (!tutors) { console.error('Tutor insert failed'); return }
  console.log('Tutors:', tutors.length)
  const [t1, t2, t3] = tutors

  const { data: learners } = await db.from('learners').insert([
    { name: 'Takudzwa Zimba',      grade: 11, subject: 'Maths',     tutor_id: t1.id, plan: 'intensive', mrr: 280, status: 'active',  progress: 78, enrolled_at: '2025-02-01', parent_name: 'Grace Zimba',        parent_phone: '+263771100001', parent_email: 'grace.zimba@gmail.com',        target_grade: 90, exam_date: '2026-11-15' },
    { name: 'Rufaro Gumbo',        grade: 10, subject: 'Physics',   tutor_id: t1.id, plan: 'standard',  mrr: 180, status: 'active',  progress: 62, enrolled_at: '2025-03-10', parent_name: 'David Gumbo',        parent_phone: '+263771100002', parent_email: 'david.gumbo@gmail.com',        target_grade: 75, exam_date: '2026-11-15' },
    { name: 'Chido Mpofu',         grade: 12, subject: 'Chemistry', tutor_id: t3.id, plan: 'intensive', mrr: 280, status: 'active',  progress: 85, enrolled_at: '2025-01-15', parent_name: 'Sunungurai Mpofu',   parent_phone: '+263771100003', parent_email: 'sunungurai.mpofu@gmail.com',   target_grade: 85, exam_date: '2026-06-10' },
    { name: 'Munashe Chirwa',      grade: 9,  subject: 'English',   tutor_id: t2.id, plan: 'starter',   mrr: 100, status: 'active',  progress: 55, enrolled_at: '2025-04-01', parent_name: 'Tafadzwa Chirwa',    parent_phone: '+263771100004', parent_email: 'tafadzwa.chirwa@gmail.com',    target_grade: 70, exam_date: '2026-11-15' },
    { name: 'Kudakwashe Ndlovu',   grade: 11, subject: 'Biology',   tutor_id: t3.id, plan: 'standard',  mrr: 180, status: 'active',  progress: 70, enrolled_at: '2025-02-20', parent_name: 'Nomsa Ndlovu',       parent_phone: '+263771100005', parent_email: 'nomsa.ndlovu@gmail.com',       target_grade: 80, exam_date: '2026-11-15' },
    { name: 'Nkosi Moyo',          grade: 10, subject: 'Maths',     tutor_id: t1.id, plan: 'payg',      mrr: 60,  status: 'paused',  progress: 40, enrolled_at: '2025-05-01', parent_name: 'Sibongile Moyo',     parent_phone: '+263771100006', parent_email: 'sibongile.moyo@gmail.com',     target_grade: 65, exam_date: '2026-11-15' },
    { name: 'Ngonidzashe Sibanda', grade: 12, subject: 'History',   tutor_id: t2.id, plan: 'standard',  mrr: 180, status: 'active',  progress: 88, enrolled_at: '2025-01-08', parent_name: 'Bekithemba Sibanda', parent_phone: '+263771100007', parent_email: 'bekithemba.sibanda@gmail.com', target_grade: 90, exam_date: '2026-06-10' },
    { name: 'Ruvimbo Zvobgo',      grade: 9,  subject: 'Geography', tutor_id: t2.id, plan: 'starter',   mrr: 100, status: 'active',  progress: 65, enrolled_at: '2025-03-25', parent_name: 'Tatenda Zvobgo',     parent_phone: '+263771100008', parent_email: 'tatenda.zvobgo@gmail.com',     target_grade: 75, exam_date: '2026-11-15' },
    { name: 'Tatenda Makoni',      grade: 11, subject: 'Chemistry', tutor_id: t3.id, plan: 'intensive', mrr: 280, status: 'active',  progress: 72, enrolled_at: '2025-02-14', parent_name: 'Farai Makoni Sr',    parent_phone: '+263771100009', parent_email: 'farai.makoni@gmail.com',       target_grade: 80, exam_date: '2026-11-15' },
    { name: 'Farai Makoni',        grade: 9,  subject: 'Maths',     tutor_id: t1.id, plan: 'starter',   mrr: 100, status: 'pending', progress: 30, enrolled_at: '2025-06-01', parent_name: 'Farai Makoni Sr',    parent_phone: '+263771100009', parent_email: 'farai.makoni@gmail.com',       target_grade: 65, exam_date: '2026-11-15' },
  ]).select()
  if (!learners) { console.error('Learner insert failed'); return }
  console.log('Learners:', learners.length)
  const [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10] = learners

  const { data: sessions } = await db.from('sessions').insert([
    { learner_id: l1.id, tutor_id: t1.id, scheduled_at: '2026-06-02T09:00:00Z', duration_mins: 60, subject: 'Maths',     attendance: 'present', notes: 'Covered quadratics' },
    { learner_id: l2.id, tutor_id: t1.id, scheduled_at: '2026-06-02T10:00:00Z', duration_mins: 60, subject: 'Physics',   attendance: 'present', notes: 'Kinematics revision' },
    { learner_id: l3.id, tutor_id: t3.id, scheduled_at: '2026-06-03T08:00:00Z', duration_mins: 90, subject: 'Chemistry', attendance: 'present', notes: 'Organic chemistry' },
    { learner_id: l4.id, tutor_id: t2.id, scheduled_at: '2026-06-03T11:00:00Z', duration_mins: 60, subject: 'English',   attendance: 'absent',  notes: '' },
    { learner_id: l5.id, tutor_id: t3.id, scheduled_at: '2026-06-04T09:00:00Z', duration_mins: 60, subject: 'Biology',   attendance: 'present', notes: 'Cell biology' },
    { learner_id: l6.id, tutor_id: t1.id, scheduled_at: '2026-06-04T10:00:00Z', duration_mins: 60, subject: 'Maths',     attendance: 'absent',  notes: 'Did not attend' },
    { learner_id: l7.id, tutor_id: t2.id, scheduled_at: '2026-06-05T08:00:00Z', duration_mins: 60, subject: 'History',   attendance: 'present', notes: 'Cold War essay' },
    { learner_id: l8.id, tutor_id: t2.id, scheduled_at: '2026-06-05T09:00:00Z', duration_mins: 60, subject: 'Geography', attendance: 'present', notes: 'Climate systems' },
    { learner_id: l9.id, tutor_id: t3.id, scheduled_at: '2026-06-06T08:00:00Z', duration_mins: 90, subject: 'Chemistry', attendance: 'late',    notes: 'Arrived 15 min late' },
    { learner_id: l1.id, tutor_id: t1.id, scheduled_at: '2026-06-09T09:00:00Z', duration_mins: 60, subject: 'Maths',     attendance: 'present', notes: 'Past paper practice' },
    { learner_id: l3.id, tutor_id: t3.id, scheduled_at: '2026-06-10T08:00:00Z', duration_mins: 90, subject: 'Chemistry', attendance: 'present', notes: 'Mock exam review' },
  ]).select()
  if (!sessions) { console.error('Sessions insert failed'); return }
  console.log('Sessions:', sessions.length)

  const { data: invoices } = await db.from('invoices').insert([
    { learner_id: l1.id, description: 'June 2026 — Intensive Plan', amount: 280, status: 'paid',    invoice_date: '2026-06-01', due_date: '2026-06-07', reference: 'INV-2026-001' },
    { learner_id: l2.id, description: 'June 2026 — Standard Plan',  amount: 180, status: 'paid',    invoice_date: '2026-06-01', due_date: '2026-06-07', reference: 'INV-2026-002' },
    { learner_id: l3.id, description: 'June 2026 — Intensive Plan', amount: 280, status: 'paid',    invoice_date: '2026-06-01', due_date: '2026-06-07', reference: 'INV-2026-003' },
    { learner_id: l4.id, description: 'June 2026 — Starter Plan',   amount: 100, status: 'due',     invoice_date: '2026-06-01', due_date: '2026-06-14', reference: 'INV-2026-004' },
    { learner_id: l5.id, description: 'June 2026 — Standard Plan',  amount: 180, status: 'due',     invoice_date: '2026-06-01', due_date: '2026-06-14', reference: 'INV-2026-005' },
    { learner_id: l6.id, description: 'May 2026  — PAYG Sessions',  amount: 45,  status: 'overdue', invoice_date: '2026-05-01', due_date: '2026-05-10', reference: 'INV-2026-006' },
    { learner_id: l7.id, description: 'June 2026 — Standard Plan',  amount: 180, status: 'paid',    invoice_date: '2026-06-01', due_date: '2026-06-07', reference: 'INV-2026-007' },
    { learner_id: l9.id, description: 'June 2026 — Intensive Plan', amount: 280, status: 'due',     invoice_date: '2026-06-01', due_date: '2026-06-21', reference: 'INV-2026-008' },
  ]).select()
  if (!invoices) { console.error('Invoices insert failed'); return }
  console.log('Invoices:', invoices.length)

  await db.from('ledger').insert([
    { type: 'income',  description: 'Intensive fee — Takudzwa Zimba',    category: 'Tuition',  amount: 280, entry_date: '2026-06-07', learner_id: l1.id, invoice_id: invoices[0].id },
    { type: 'income',  description: 'Standard fee — Rufaro Gumbo',       category: 'Tuition',  amount: 180, entry_date: '2026-06-07', learner_id: l2.id, invoice_id: invoices[1].id },
    { type: 'income',  description: 'Intensive fee — Chido Mpofu',       category: 'Tuition',  amount: 280, entry_date: '2026-06-07', learner_id: l3.id, invoice_id: invoices[2].id },
    { type: 'income',  description: 'Standard fee — Ngonidzashe Sibanda',category: 'Tuition',  amount: 180, entry_date: '2026-06-08', learner_id: l7.id, invoice_id: invoices[6].id },
    { type: 'expense', description: 'Tutor payout — Tinashe Maphosa',    category: 'Payroll',  amount: 120, entry_date: '2026-06-10', tutor_id: t1.id },
    { type: 'expense', description: 'Tutor payout — Chiedza Moyo',       category: 'Payroll',  amount: 90,  entry_date: '2026-06-10', tutor_id: t2.id },
    { type: 'expense', description: 'Zoom subscription',                 category: 'Software', amount: 15,  entry_date: '2026-06-01' },
    { type: 'expense', description: 'Google Workspace',                  category: 'Software', amount: 12,  entry_date: '2026-06-01' },
  ])
  console.log('Ledger: 8')

  await db.from('payroll').insert([
    { tutor_id: t1.id, period_start: '2026-06-01', period_end: '2026-06-30', sessions_count: 8, rate: 15, bonus: 0, gross: 120, status: 'due' },
    { tutor_id: t2.id, period_start: '2026-06-01', period_end: '2026-06-30', sessions_count: 6, rate: 15, bonus: 0, gross: 90,  status: 'due' },
    { tutor_id: t3.id, period_start: '2026-06-01', period_end: '2026-06-30', sessions_count: 5, rate: 15, bonus: 0, gross: 75,  status: 'due' },
  ])
  console.log('Payroll: 3')

  const { data: pipe } = await db.from('pipeline').insert([
    { stage: 'inquiry',  parent_name: 'Blessing Ncube',   parent_phone: '+263772200001', subjects: ['Maths','Physics'],      lead_source: 'WhatsApp',  moved_at: '2026-06-10T10:00:00Z' },
    { stage: 'inquiry',  parent_name: 'Patience Dlamini', parent_phone: '+263772200002', subjects: ['English'],              lead_source: 'Instagram', moved_at: '2026-06-11T09:00:00Z' },
    { stage: 'matching', parent_name: 'Taurai Choto',     parent_phone: '+263772200003', subjects: ['Chemistry','Biology'],  lead_source: 'Referral',  moved_at: '2026-06-08T14:00:00Z' },
    { stage: 'matching', parent_name: 'Annah Zindoga',    parent_phone: '+263772200004', subjects: ['History'],              lead_source: 'School',    moved_at: '2026-06-09T11:00:00Z' },
    { stage: 'trial',    parent_name: 'Lovemore Banda',   parent_phone: '+263772200005', subjects: ['Maths'],                lead_source: 'Website',   moved_at: '2026-06-05T08:00:00Z' },
    { stage: 'trial',    parent_name: 'Rumbidzai Chisi',  parent_phone: '+263772200006', subjects: ['Biology','Chemistry'],  lead_source: 'WhatsApp',  moved_at: '2026-06-06T10:00:00Z' },
    { stage: 'active',   parent_name: 'Simbarashe Nhamo', parent_phone: '+263772200007', subjects: ['Physics'],              lead_source: 'Referral',  moved_at: '2026-05-20T09:00:00Z', learner_id: l10.id },
    { stage: 'churned',  parent_name: 'Mavis Chigwanda',  parent_phone: '+263772200008', subjects: ['English'],              lead_source: 'Instagram', churn_reason: 'Moved schools', moved_at: '2026-04-15T12:00:00Z' },
    { stage: 'inquiry',  parent_name: 'Tichaona Mhuru',   parent_phone: '+263772200009', subjects: ['Maths','Geography'],    lead_source: 'Other',     moved_at: '2026-06-12T15:00:00Z' },
  ]).select()
  console.log('Pipeline:', pipe?.length)

  if (pipe) {
    await db.from('pipeline_tasks').insert([
      { pipeline_id: pipe[0].id, description: 'Send intake form',        due_date: '2026-06-13', completed: false },
      { pipeline_id: pipe[0].id, description: 'Schedule trial session',  due_date: '2026-06-15', completed: false },
      { pipeline_id: pipe[2].id, description: 'Match with Shamiso Dube', due_date: '2026-06-12', completed: true  },
      { pipeline_id: pipe[4].id, description: 'Confirm trial outcome',   due_date: '2026-06-10', completed: false },
    ])
    console.log('Pipeline tasks: 4')
  }

  const assessMonths = ['2026-02-15','2026-03-15','2026-04-15','2026-05-15','2026-06-15']
  const assessTopics = ['Mid-term Test','Unit Assessment','Mock Paper 1','Mock Paper 2','Trial Exam']
  const assessRows: any[] = []
  for (const { learner, scores, targets } of [
    { learner: l1, scores: [58,65,72,78,83], targets: [70,70,75,75,80] },
    { learner: l2, scores: [45,52,58,62,67], targets: [60,60,65,65,70] },
    { learner: l3, scores: [70,75,79,82,85], targets: [75,75,80,80,85] },
    { learner: l5, scores: [55,60,65,68,70], targets: [65,65,70,70,75] },
    { learner: l7, scores: [75,80,84,86,88], targets: [80,80,85,85,90] },
  ]) {
    scores.forEach((score, i) => assessRows.push({ learner_id: learner.id, date: assessMonths[i], topic: assessTopics[i], score, target_score: targets[i] }))
  }
  await db.from('assessments').insert(assessRows)
  console.log('Assessments:', assessRows.length)

  await db.from('feedback').insert([
    { learner_id: l1.id, tutor_id: t1.id, session_id: sessions[0].id, rating: 5, comment: 'Tinashe explains maths so clearly!', nps_score: 10, flagged: false, submitted_at: '2026-06-03T08:00:00Z' },
    { learner_id: l2.id, tutor_id: t1.id, session_id: sessions[1].id, rating: 4, comment: 'Good session, covered a lot.',         nps_score: 8,  flagged: false, submitted_at: '2026-06-03T09:00:00Z' },
    { learner_id: l3.id, tutor_id: t3.id, session_id: sessions[2].id, rating: 5, comment: 'Excellent chemistry tuition.',         nps_score: 9,  flagged: false, submitted_at: '2026-06-04T08:00:00Z' },
    { learner_id: l4.id, tutor_id: t2.id, session_id: sessions[3].id, rating: 3, comment: 'Session was okay but went off-topic.', nps_score: 6,  flagged: true,  submitted_at: '2026-06-04T10:00:00Z' },
    { learner_id: l5.id, tutor_id: t3.id, session_id: sessions[4].id, rating: 4, comment: 'Really helpful biology revision.',     nps_score: 9,  flagged: false, submitted_at: '2026-06-05T09:00:00Z' },
    { learner_id: l7.id, tutor_id: t2.id, session_id: sessions[6].id, rating: 5, comment: 'Best tutor for history!',              nps_score: 10, flagged: false, submitted_at: '2026-06-06T08:00:00Z' },
    { learner_id: l8.id, tutor_id: t2.id, session_id: sessions[7].id, rating: 4, comment: 'Good geography session.',              nps_score: 8,  flagged: false, submitted_at: '2026-06-06T10:00:00Z' },
    { learner_id: l9.id, tutor_id: t3.id, session_id: sessions[8].id, rating: 4, comment: 'Shamiso is very patient.',             nps_score: 9,  flagged: false, submitted_at: '2026-06-07T09:00:00Z' },
  ])
  console.log('Feedback: 8')

  await db.from('contracts').insert([
    { entity_name: 'Takudzwa Zimba',      entity_type: 'learner', learner_id: l1.id, document_type: 'Enrolment Agreement', uploaded_at: '2026-02-01', expires_at: '2027-02-01', status: 'signed',  signed_at: '2026-02-03' },
    { entity_name: 'Chido Mpofu',         entity_type: 'learner', learner_id: l3.id, document_type: 'Enrolment Agreement', uploaded_at: '2026-01-15', expires_at: '2027-01-15', status: 'signed',  signed_at: '2026-01-16' },
    { entity_name: 'Rufaro Gumbo',        entity_type: 'learner', learner_id: l2.id, document_type: 'Enrolment Agreement', uploaded_at: '2026-03-10', expires_at: '2027-03-10', status: 'signed',  signed_at: '2026-03-12' },
    { entity_name: 'Tinashe Maphosa',     entity_type: 'tutor',   tutor_id:  t1.id,  document_type: 'Tutor Contract',      uploaded_at: '2024-01-10', expires_at: '2026-01-10', status: 'expired', signed_at: '2024-01-11' },
    { entity_name: 'Chiedza Moyo',        entity_type: 'tutor',   tutor_id:  t2.id,  document_type: 'Tutor Contract',      uploaded_at: '2024-03-05', expires_at: '2026-03-05', status: 'expired', signed_at: '2024-03-06' },
    { entity_name: 'Shamiso Dube',        entity_type: 'tutor',   tutor_id:  t3.id,  document_type: 'Tutor Contract',      uploaded_at: '2024-06-01', expires_at: '2026-12-01', status: 'signed',  signed_at: '2024-06-02' },
    { entity_name: 'Munashe Chirwa',      entity_type: 'learner', learner_id: l4.id, document_type: 'Enrolment Agreement', uploaded_at: '2026-04-01', expires_at: '2027-04-01', status: 'pending' },
    { entity_name: 'Kudakwashe Ndlovu',   entity_type: 'learner', learner_id: l5.id, document_type: 'Enrolment Agreement', uploaded_at: '2026-02-20', expires_at: '2027-02-20', status: 'signed',  signed_at: '2026-02-22' },
  ])
  console.log('Contracts: 8')

  await db.from('discounts').insert([
    { learner_id: l4.id,  type: 'Scholarship', reason: 'Academic excellence bursary',             amount_usd: 30, status: 'active',    applied_from: '2026-04-01' },
    { learner_id: l8.id,  type: 'Sibling',     reason: 'Sibling of Tatenda Makoni',               amount_usd: 20, status: 'active',    applied_from: '2026-03-25' },
    { learner_id: l9.id,  type: 'Sibling',     reason: 'Sibling of Farai Makoni',                 amount_usd: 20, status: 'active',    applied_from: '2026-02-14' },
    { learner_id: l2.id,  type: 'Referral',    reason: 'Referred by Zimba family',                amount_usd: 15, status: 'active',    applied_from: '2026-03-10', applied_to: '2026-09-10' },
    { learner_id: l6.id,  type: 'Other',       reason: 'Financial hardship — approved by director',amount_usd: 25, status: 'suspended', applied_from: '2026-05-01' },
    { learner_id: l10.id, type: 'Staff',       reason: 'Director family discount',                amount_usd: 50, status: 'active',    applied_from: '2026-06-01' },
  ])
  console.log('Discounts: 6')

  await db.from('audit_log').insert([
    { action: 'create', entity_type: 'learner',   entity_label: 'Takudzwa Zimba',              category: 'learner',  created_at: '2026-02-01T08:00:00Z' },
    { action: 'create', entity_type: 'learner',   entity_label: 'Chido Mpofu',                 category: 'learner',  created_at: '2026-01-15T09:00:00Z' },
    { action: 'update', entity_type: 'learner',   entity_label: 'Nkosi Moyo',                  category: 'learner',  field_changed: 'status',           old_value: 'active', new_value: 'paused',        created_at: '2026-06-01T10:00:00Z' },
    { action: 'create', entity_type: 'invoice',   entity_label: 'INV-2026-001',                category: 'finance',  created_at: '2026-06-01T08:00:00Z' },
    { action: 'update', entity_type: 'invoice',   entity_label: 'INV-2026-001',                category: 'finance',  field_changed: 'status',           old_value: 'due',    new_value: 'paid',          created_at: '2026-06-07T14:00:00Z' },
    { action: 'create', entity_type: 'tutor',     entity_label: 'Shamiso Dube',                category: 'staff',    created_at: '2024-06-01T09:00:00Z' },
    { action: 'update', entity_type: 'tutor',     entity_label: 'Tinashe Maphosa',             category: 'staff',    field_changed: 'rate_per_session', old_value: '12',     new_value: '15',            created_at: '2025-01-10T11:00:00Z' },
    { action: 'send',   entity_type: 'broadcast', entity_label: 'June newsletter',             category: 'comms',    created_at: '2026-06-01T07:00:00Z' },
    { action: 'update', entity_type: 'settings',  entity_label: 'org_name',                    category: 'settings', field_changed: 'org_name',         old_value: 'FtoA Tutoring', new_value: 'F-to-A Tutoring', created_at: '2025-12-01T08:00:00Z' },
    { action: 'create', entity_type: 'contract',  entity_label: 'Rufaro Gumbo',                category: 'learner',  created_at: '2026-03-10T10:00:00Z' },
    { action: 'assign', entity_type: 'learner',   entity_label: 'Kudakwashe Ndlovu',           category: 'learner',  field_changed: 'tutor_id',         old_value: null,     new_value: 'Shamiso Dube',  created_at: '2026-02-21T09:00:00Z' },
    { action: 'create', entity_type: 'discount',  entity_label: 'Scholarship — Munashe Chirwa',category: 'finance',  created_at: '2026-04-01T11:00:00Z' },
  ])
  console.log('Audit log: 12')

  await db.from('settings').upsert([
    { key: 'org_name',        value: 'F-to-A Tutoring' },
    { key: 'org_email',       value: 'admin@ftoatutoring.net' },
    { key: 'org_phone',       value: '+263771000000' },
    { key: 'org_country',     value: 'Zimbabwe' },
    { key: 'currency',        value: 'USD' },
    { key: 'vat_rate',        value: '14.5' },
    { key: 'income_tax_rate', value: '25' },
    { key: 'notify_overdue',  value: 'true' },
    { key: 'notify_absence',  value: 'true' },
  ])
  console.log('Settings: 9')
  console.log('\nSeed complete!')
}

seed().catch(console.error)
