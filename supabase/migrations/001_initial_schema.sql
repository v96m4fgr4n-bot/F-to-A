-- F-to-A Tutoring Admin Portal — full schema
-- Run this in the Supabase SQL Editor (or via supabase db push)

create table if not exists tutors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  email text unique,
  phone text,
  subjects text[],
  rate_per_session int default 15,
  joined_at date,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists learners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade int,
  subject text,
  tutor_id uuid references tutors(id),
  plan text check (plan in ('intensive','standard','starter','payg','inquiry')),
  mrr int default 0,
  status text check (status in ('active','paused','pending','churned')) default 'pending',
  progress int,
  enrolled_at date,
  parent_name text,
  parent_phone text,
  parent_email text,
  notes text,
  target_grade int,
  exam_date date,
  created_at timestamptz default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learners(id),
  tutor_id uuid references tutors(id),
  scheduled_at timestamptz not null,
  duration_mins int default 60,
  subject text,
  attendance text check (attendance in ('present','absent','late','cancelled')) default 'present',
  notes text,
  created_at timestamptz default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learners(id),
  description text,
  amount int,
  status text check (status in ('paid','due','overdue')) default 'due',
  invoice_date date,
  due_date date,
  reference text unique,
  created_at timestamptz default now()
);

create table if not exists ledger (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('income','expense')) not null,
  description text not null,
  category text,
  amount int not null,
  reference text,
  entry_date date not null,
  learner_id uuid references learners(id),
  tutor_id uuid references tutors(id),
  invoice_id uuid references invoices(id),
  created_at timestamptz default now()
);

create table if not exists payroll (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid references tutors(id),
  period_start date,
  period_end date,
  sessions_count int,
  rate int,
  bonus int default 0,
  gross int,
  status text check (status in ('due','paid')) default 'due',
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists pipeline (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learners(id),
  stage text check (stage in ('inquiry','matching','trial','active','churned')) default 'inquiry',
  parent_name text,
  parent_phone text,
  subjects text[],
  churn_reason text,
  lead_source text check (lead_source in ('WhatsApp','Instagram','Website','School','Referral','Other')),
  moved_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists pipeline_tasks (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid references pipeline(id) on delete cascade,
  description text not null,
  due_date date,
  completed boolean default false,
  created_at timestamptz default now()
);

create table if not exists broadcasts (
  id uuid primary key default gen_random_uuid(),
  channel text check (channel in ('whatsapp','email','both')),
  subject text,
  body text not null,
  recipient_filter text,
  sent_count int,
  sent_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists settings (
  key text primary key,
  value text
);

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learners(id) on delete cascade,
  date date not null,
  topic text,
  score int check (score between 0 and 100),
  target_score int,
  created_at timestamptz default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learners(id),
  tutor_id uuid references tutors(id),
  session_id uuid references sessions(id),
  rating int check (rating between 1 and 5),
  comment text,
  nps_score int check (nps_score between 0 and 10),
  flagged boolean default false,
  submitted_at timestamptz default now()
);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  entity_name text not null,
  entity_type text check (entity_type in ('learner','tutor','parent')),
  learner_id uuid references learners(id),
  tutor_id uuid references tutors(id),
  document_type text,
  file_url text,
  uploaded_at date,
  signed_at date,
  expires_at date,
  status text check (status in ('signed','pending','expired')) default 'pending',
  created_at timestamptz default now()
);

create table if not exists discounts (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learners(id) on delete cascade,
  type text check (type in ('Sibling','Scholarship','Referral','Staff','Other')),
  reason text,
  amount_usd int not null,
  status text check (status in ('active','expired','suspended')) default 'active',
  applied_from date,
  applied_to date,
  created_at timestamptz default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  entity_label text,
  field_changed text,
  old_value text,
  new_value text,
  category text check (category in ('learner','finance','staff','settings','comms')),
  created_at timestamptz default now()
);

-- Storage bucket for contracts (run separately if bucket API preferred)
insert into storage.buckets (id, name, public)
values ('fta-contracts', 'fta-contracts', false)
on conflict (id) do nothing;

-- RLS: service-role key bypasses RLS; enable it so anon key has no table access
alter table tutors enable row level security;
alter table learners enable row level security;
alter table sessions enable row level security;
alter table invoices enable row level security;
alter table ledger enable row level security;
alter table payroll enable row level security;
alter table pipeline enable row level security;
alter table pipeline_tasks enable row level security;
alter table broadcasts enable row level security;
alter table settings enable row level security;
alter table assessments enable row level security;
alter table feedback enable row level security;
alter table contracts enable row level security;
alter table discounts enable row level security;
alter table audit_log enable row level security;
