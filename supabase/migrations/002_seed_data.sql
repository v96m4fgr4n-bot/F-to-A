-- F-to-A Tutoring — seed data
-- Run this in the Supabase SQL Editor AFTER 001_initial_schema.sql
-- Safe to re-run: it deletes any existing rows in these tables first (fixed UUIDs, idempotent)

begin;

delete from pipeline_tasks;
delete from audit_log;
delete from discounts;
delete from contracts;
delete from feedback;
delete from assessments;
delete from pipeline;
delete from payroll;
delete from ledger;
delete from invoices;
delete from sessions;
delete from learners;
delete from tutors;
delete from settings;

-- ── Tutors ──────────────────────────────────────────────────────────────
insert into tutors (id, name, role, email, phone, subjects, rate_per_session, joined_at, active) values
('fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', 'Tinashe Maphosa', 'Senior Tutor', 'tinashe@ftoatutoring.net', '+263771000001', array['Maths','Physics','Further Maths'], 15, '2024-01-10', true),
('59f31499-50b2-4242-b341-24f80607c896', 'Chiedza Moyo',    'Tutor',        'chiedza@ftoatutoring.net', '+263771000002', array['English','History','Geography'], 15, '2024-03-05', true),
('57c09654-2baa-4562-a775-9151c587faec', 'Shamiso Dube',    'Tutor',        'shamiso@ftoatutoring.net', '+263771000003', array['Biology','Chemistry','Maths'], 15, '2024-06-01', true);

-- ── Learners ────────────────────────────────────────────────────────────
insert into learners (id, name, grade, subject, tutor_id, plan, mrr, status, progress, enrolled_at, parent_name, parent_phone, parent_email, target_grade, exam_date) values
('4f569ed5-7be7-455c-b259-e1bcb2b613d9', 'Takudzwa Zimba',      11, 'Maths',     'fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', 'intensive', 280, 'active',  78, '2025-02-01', 'Grace Zimba',        '+263771100001', 'grace.zimba@gmail.com',        90, '2026-11-15'),
('fbf74a46-bc67-4842-ab17-761026cb0ef2', 'Rufaro Gumbo',        10, 'Physics',   'fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', 'standard',  180, 'active',  62, '2025-03-10', 'David Gumbo',        '+263771100002', 'david.gumbo@gmail.com',        75, '2026-11-15'),
('4675fc12-15d8-43ad-b6c8-df5f0b8bad71', 'Chido Mpofu',         12, 'Chemistry', '57c09654-2baa-4562-a775-9151c587faec', 'intensive', 280, 'active',  85, '2025-01-15', 'Sunungurai Mpofu',   '+263771100003', 'sunungurai.mpofu@gmail.com',   85, '2026-06-10'),
('a57fe8ea-6cda-4d29-a616-2910ba817b3d', 'Munashe Chirwa',       9, 'English',   '59f31499-50b2-4242-b341-24f80607c896', 'starter',   100, 'active',  55, '2025-04-01', 'Tafadzwa Chirwa',    '+263771100004', 'tafadzwa.chirwa@gmail.com',    70, '2026-11-15'),
('e4805f3a-5f5e-4133-b98b-d2a3c619d696', 'Kudakwashe Ndlovu',   11, 'Biology',   '57c09654-2baa-4562-a775-9151c587faec', 'standard',  180, 'active',  70, '2025-02-20', 'Nomsa Ndlovu',       '+263771100005', 'nomsa.ndlovu@gmail.com',       80, '2026-11-15'),
('04088b17-7311-499e-9dcf-ba996822b8bf', 'Nkosi Moyo',          10, 'Maths',     'fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', 'payg',      60,  'paused',  40, '2025-05-01', 'Sibongile Moyo',     '+263771100006', 'sibongile.moyo@gmail.com',     65, '2026-11-15'),
('8148eaaf-a86e-45c4-96f9-0f8e4f166435', 'Ngonidzashe Sibanda', 12, 'History',   '59f31499-50b2-4242-b341-24f80607c896', 'standard',  180, 'active',  88, '2025-01-08', 'Bekithemba Sibanda', '+263771100007', 'bekithemba.sibanda@gmail.com', 90, '2026-06-10'),
('5030c1e2-f8b7-4111-af80-2687fbed6a6b', 'Ruvimbo Zvobgo',       9, 'Geography', '59f31499-50b2-4242-b341-24f80607c896', 'starter',   100, 'active',  65, '2025-03-25', 'Tatenda Zvobgo',     '+263771100008', 'tatenda.zvobgo@gmail.com',     75, '2026-11-15'),
('1d61937e-da91-4b4e-924d-e3c9bfe1b512', 'Tatenda Makoni',      11, 'Chemistry', '57c09654-2baa-4562-a775-9151c587faec', 'intensive', 280, 'active',  72, '2025-02-14', 'Farai Makoni Sr',    '+263771100009', 'farai.makoni@gmail.com',       80, '2026-11-15'),
('20cb4495-659e-4832-bdf5-215c18e40706', 'Farai Makoni',         9, 'Maths',     'fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', 'starter',   100, 'pending', 30, '2025-06-01', 'Farai Makoni Sr',    '+263771100009', 'farai.makoni@gmail.com',       65, '2026-11-15');

-- ── Sessions ────────────────────────────────────────────────────────────
insert into sessions (id, learner_id, tutor_id, scheduled_at, duration_mins, subject, attendance, notes) values
('a7f2ef55-2cdc-4da0-9847-760d382a9b93', '4f569ed5-7be7-455c-b259-e1bcb2b613d9', 'fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', '2026-06-02T09:00:00Z', 60, 'Maths',     'present', 'Covered quadratics'),
('323f405a-b544-40b2-96ad-c1bcdbeaaffc', 'fbf74a46-bc67-4842-ab17-761026cb0ef2', 'fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', '2026-06-02T10:00:00Z', 60, 'Physics',   'present', 'Kinematics revision'),
('ed094e85-34f9-408f-b531-ebe6d898aadd', '4675fc12-15d8-43ad-b6c8-df5f0b8bad71', '57c09654-2baa-4562-a775-9151c587faec', '2026-06-03T08:00:00Z', 90, 'Chemistry', 'present', 'Organic chemistry'),
('78aad043-972b-47ff-93ed-4234bcb5341e', 'a57fe8ea-6cda-4d29-a616-2910ba817b3d', '59f31499-50b2-4242-b341-24f80607c896', '2026-06-03T11:00:00Z', 60, 'English',   'absent',  ''),
('1357af91-3aa1-4c1a-9494-740ea1536850', 'e4805f3a-5f5e-4133-b98b-d2a3c619d696', '57c09654-2baa-4562-a775-9151c587faec', '2026-06-04T09:00:00Z', 60, 'Biology',   'present', 'Cell biology'),
('4df06aa6-28b7-4aaa-a651-4fad0666cd3d', '04088b17-7311-499e-9dcf-ba996822b8bf', 'fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', '2026-06-04T10:00:00Z', 60, 'Maths',     'absent',  'Did not attend'),
('5a571474-652d-4137-8beb-a6ffe690c4a5', '8148eaaf-a86e-45c4-96f9-0f8e4f166435', '59f31499-50b2-4242-b341-24f80607c896', '2026-06-05T08:00:00Z', 60, 'History',   'present', 'Cold War essay'),
('fac09240-4f84-4b8a-849c-0a0b8e522a30', '5030c1e2-f8b7-4111-af80-2687fbed6a6b', '59f31499-50b2-4242-b341-24f80607c896', '2026-06-05T09:00:00Z', 60, 'Geography', 'present', 'Climate systems'),
('d351927a-f25a-455d-9066-2d86498b6f1f', '1d61937e-da91-4b4e-924d-e3c9bfe1b512', '57c09654-2baa-4562-a775-9151c587faec', '2026-06-06T08:00:00Z', 90, 'Chemistry', 'late',    'Arrived 15 min late'),
('c2c00b89-c592-49f3-abb5-ecbb9dec7cd4', '4f569ed5-7be7-455c-b259-e1bcb2b613d9', 'fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', '2026-06-09T09:00:00Z', 60, 'Maths',     'present', 'Past paper practice'),
('849b2c19-228c-4426-9e9c-e419486b61fd', '4675fc12-15d8-43ad-b6c8-df5f0b8bad71', '57c09654-2baa-4562-a775-9151c587faec', '2026-06-10T08:00:00Z', 90, 'Chemistry', 'present', 'Mock exam review');

-- ── Invoices ────────────────────────────────────────────────────────────
insert into invoices (id, learner_id, description, amount, status, invoice_date, due_date, reference) values
('8a7fa6ac-5189-4383-9fd6-9e559547c0e2', '4f569ed5-7be7-455c-b259-e1bcb2b613d9', 'June 2026 — Intensive Plan', 280, 'paid',    '2026-06-01', '2026-06-07', 'INV-2026-001'),
('3fc6c500-36f7-475b-8ba4-acf71449d4bc', 'fbf74a46-bc67-4842-ab17-761026cb0ef2', 'June 2026 — Standard Plan',  180, 'paid',    '2026-06-01', '2026-06-07', 'INV-2026-002'),
('46c96ee2-dd48-4adf-ad76-648a8d50c778', '4675fc12-15d8-43ad-b6c8-df5f0b8bad71', 'June 2026 — Intensive Plan', 280, 'paid',    '2026-06-01', '2026-06-07', 'INV-2026-003'),
('6ac210d2-0a8c-41d7-b302-5ba21093bae6', 'a57fe8ea-6cda-4d29-a616-2910ba817b3d', 'June 2026 — Starter Plan',   100, 'due',     '2026-06-01', '2026-06-14', 'INV-2026-004'),
('a47f4fab-de51-41dd-b6c9-7ca0a8064333', 'e4805f3a-5f5e-4133-b98b-d2a3c619d696', 'June 2026 — Standard Plan',  180, 'due',     '2026-06-01', '2026-06-14', 'INV-2026-005'),
('a16b53a6-425f-45ab-b79c-40b446c16d55', '04088b17-7311-499e-9dcf-ba996822b8bf', 'May 2026 — PAYG Sessions',   45,  'overdue', '2026-05-01', '2026-05-10', 'INV-2026-006'),
('669d2021-a28f-45b9-abb2-f427d52f7049', '8148eaaf-a86e-45c4-96f9-0f8e4f166435', 'June 2026 — Standard Plan',  180, 'paid',    '2026-06-01', '2026-06-07', 'INV-2026-007'),
('af87b427-a157-49ee-92ae-240fe45c5363', '1d61937e-da91-4b4e-924d-e3c9bfe1b512', 'June 2026 — Intensive Plan', 280, 'due',     '2026-06-01', '2026-06-21', 'INV-2026-008');

-- ── Ledger ──────────────────────────────────────────────────────────────
insert into ledger (type, description, category, amount, entry_date, learner_id, tutor_id, invoice_id) values
('income',  'Intensive fee — Takudzwa Zimba',     'Tuition', 280, '2026-06-07', '4f569ed5-7be7-455c-b259-e1bcb2b613d9', null, '8a7fa6ac-5189-4383-9fd6-9e559547c0e2'),
('income',  'Standard fee — Rufaro Gumbo',        'Tuition', 180, '2026-06-07', 'fbf74a46-bc67-4842-ab17-761026cb0ef2', null, '3fc6c500-36f7-475b-8ba4-acf71449d4bc'),
('income',  'Intensive fee — Chido Mpofu',        'Tuition', 280, '2026-06-07', '4675fc12-15d8-43ad-b6c8-df5f0b8bad71', null, '46c96ee2-dd48-4adf-ad76-648a8d50c778'),
('income',  'Standard fee — Ngonidzashe Sibanda', 'Tuition', 180, '2026-06-08', '8148eaaf-a86e-45c4-96f9-0f8e4f166435', null, '669d2021-a28f-45b9-abb2-f427d52f7049'),
('expense', 'Tutor payout — Tinashe Maphosa',     'Payroll', 120, '2026-06-10', null, 'fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', null),
('expense', 'Tutor payout — Chiedza Moyo',        'Payroll', 90,  '2026-06-10', null, '59f31499-50b2-4242-b341-24f80607c896', null),
('expense', 'Zoom subscription',                   'Software', 15, '2026-06-01', null, null, null),
('expense', 'Google Workspace',                    'Software', 12, '2026-06-01', null, null, null);

-- ── Payroll ─────────────────────────────────────────────────────────────
insert into payroll (tutor_id, period_start, period_end, sessions_count, rate, bonus, gross, status) values
('fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', '2026-06-01', '2026-06-30', 8, 15, 0, 120, 'due'),
('59f31499-50b2-4242-b341-24f80607c896', '2026-06-01', '2026-06-30', 6, 15, 0, 90,  'due'),
('57c09654-2baa-4562-a775-9151c587faec', '2026-06-01', '2026-06-30', 5, 15, 0, 75,  'due');

-- ── Pipeline ────────────────────────────────────────────────────────────
insert into pipeline (id, stage, parent_name, parent_phone, subjects, lead_source, churn_reason, moved_at, learner_id) values
('b67933b1-134a-4287-8e8d-1c580647784a', 'inquiry',  'Blessing Ncube',   '+263772200001', array['Maths','Physics'],     'WhatsApp',  null,             '2026-06-10T10:00:00Z', null),
('292ef55f-1163-4a7e-8e6d-ef8897cc0e45', 'inquiry',  'Patience Dlamini', '+263772200002', array['English'],             'Instagram', null,             '2026-06-11T09:00:00Z', null),
('2a22c004-34ea-45bb-9403-6383723ceb61', 'matching', 'Taurai Choto',     '+263772200003', array['Chemistry','Biology'], 'Referral',  null,             '2026-06-08T14:00:00Z', null),
('e5532052-b216-451e-aa77-c921a92897c3', 'matching', 'Annah Zindoga',    '+263772200004', array['History'],             'School',    null,             '2026-06-09T11:00:00Z', null),
('b93955e9-4825-4cc2-baa9-8bfaf9440289', 'trial',    'Lovemore Banda',   '+263772200005', array['Maths'],               'Website',   null,             '2026-06-05T08:00:00Z', null),
('eec96668-95e3-4a06-99e4-de0bfdc051b3', 'trial',    'Rumbidzai Chisi',  '+263772200006', array['Biology','Chemistry'], 'WhatsApp',  null,             '2026-06-06T10:00:00Z', null),
('8d33a734-e018-4cd3-9f24-3592fee8892c', 'active',   'Simbarashe Nhamo', '+263772200007', array['Physics'],             'Referral',  null,             '2026-05-20T09:00:00Z', '20cb4495-659e-4832-bdf5-215c18e40706'),
('9fda47de-28bb-41ec-a8ba-c1aa8d57c94f', 'churned',  'Mavis Chigwanda',  '+263772200008', array['English'],             'Instagram', 'Moved schools',  '2026-04-15T12:00:00Z', null),
('393e7442-92ee-402f-bc6b-098e8d299c26', 'inquiry',  'Tichaona Mhuru',   '+263772200009', array['Maths','Geography'],   'Other',     null,             '2026-06-12T15:00:00Z', null);

-- ── Pipeline tasks ──────────────────────────────────────────────────────
insert into pipeline_tasks (pipeline_id, description, due_date, completed) values
('b67933b1-134a-4287-8e8d-1c580647784a', 'Send intake form',        '2026-06-13', false),
('b67933b1-134a-4287-8e8d-1c580647784a', 'Schedule trial session',  '2026-06-15', false),
('2a22c004-34ea-45bb-9403-6383723ceb61', 'Match with Shamiso Dube', '2026-06-12', true),
('b93955e9-4825-4cc2-baa9-8bfaf9440289', 'Confirm trial outcome',   '2026-06-10', false);

-- ── Assessments ─────────────────────────────────────────────────────────
insert into assessments (learner_id, date, topic, score, target_score) values
('4f569ed5-7be7-455c-b259-e1bcb2b613d9', '2026-02-15', 'Mid-term Test',   58, 70),
('4f569ed5-7be7-455c-b259-e1bcb2b613d9', '2026-03-15', 'Unit Assessment', 65, 70),
('4f569ed5-7be7-455c-b259-e1bcb2b613d9', '2026-04-15', 'Mock Paper 1',    72, 75),
('4f569ed5-7be7-455c-b259-e1bcb2b613d9', '2026-05-15', 'Mock Paper 2',    78, 75),
('4f569ed5-7be7-455c-b259-e1bcb2b613d9', '2026-06-15', 'Trial Exam',      83, 80),
('fbf74a46-bc67-4842-ab17-761026cb0ef2', '2026-02-15', 'Mid-term Test',   45, 60),
('fbf74a46-bc67-4842-ab17-761026cb0ef2', '2026-03-15', 'Unit Assessment', 52, 60),
('fbf74a46-bc67-4842-ab17-761026cb0ef2', '2026-04-15', 'Mock Paper 1',    58, 65),
('fbf74a46-bc67-4842-ab17-761026cb0ef2', '2026-05-15', 'Mock Paper 2',    62, 65),
('fbf74a46-bc67-4842-ab17-761026cb0ef2', '2026-06-15', 'Trial Exam',      67, 70),
('4675fc12-15d8-43ad-b6c8-df5f0b8bad71', '2026-02-15', 'Mid-term Test',   70, 75),
('4675fc12-15d8-43ad-b6c8-df5f0b8bad71', '2026-03-15', 'Unit Assessment', 75, 75),
('4675fc12-15d8-43ad-b6c8-df5f0b8bad71', '2026-04-15', 'Mock Paper 1',    79, 80),
('4675fc12-15d8-43ad-b6c8-df5f0b8bad71', '2026-05-15', 'Mock Paper 2',    82, 80),
('4675fc12-15d8-43ad-b6c8-df5f0b8bad71', '2026-06-15', 'Trial Exam',      85, 85),
('e4805f3a-5f5e-4133-b98b-d2a3c619d696', '2026-02-15', 'Mid-term Test',   55, 65),
('e4805f3a-5f5e-4133-b98b-d2a3c619d696', '2026-03-15', 'Unit Assessment', 60, 65),
('e4805f3a-5f5e-4133-b98b-d2a3c619d696', '2026-04-15', 'Mock Paper 1',    65, 70),
('e4805f3a-5f5e-4133-b98b-d2a3c619d696', '2026-05-15', 'Mock Paper 2',    68, 70),
('e4805f3a-5f5e-4133-b98b-d2a3c619d696', '2026-06-15', 'Trial Exam',      70, 75),
('8148eaaf-a86e-45c4-96f9-0f8e4f166435', '2026-02-15', 'Mid-term Test',   75, 80),
('8148eaaf-a86e-45c4-96f9-0f8e4f166435', '2026-03-15', 'Unit Assessment', 80, 80),
('8148eaaf-a86e-45c4-96f9-0f8e4f166435', '2026-04-15', 'Mock Paper 1',    84, 85),
('8148eaaf-a86e-45c4-96f9-0f8e4f166435', '2026-05-15', 'Mock Paper 2',    86, 85),
('8148eaaf-a86e-45c4-96f9-0f8e4f166435', '2026-06-15', 'Trial Exam',      88, 90);

-- ── Feedback ────────────────────────────────────────────────────────────
insert into feedback (learner_id, tutor_id, session_id, rating, comment, nps_score, flagged, submitted_at) values
('4f569ed5-7be7-455c-b259-e1bcb2b613d9', 'fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', 'a7f2ef55-2cdc-4da0-9847-760d382a9b93', 5, 'Tinashe explains maths so clearly!',      10, false, '2026-06-03T08:00:00Z'),
('fbf74a46-bc67-4842-ab17-761026cb0ef2', 'fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', '323f405a-b544-40b2-96ad-c1bcdbeaaffc', 4, 'Good session, covered a lot.',            8,  false, '2026-06-03T09:00:00Z'),
('4675fc12-15d8-43ad-b6c8-df5f0b8bad71', '57c09654-2baa-4562-a775-9151c587faec', 'ed094e85-34f9-408f-b531-ebe6d898aadd', 5, 'Excellent chemistry tuition.',            9,  false, '2026-06-04T08:00:00Z'),
('a57fe8ea-6cda-4d29-a616-2910ba817b3d', '59f31499-50b2-4242-b341-24f80607c896', '78aad043-972b-47ff-93ed-4234bcb5341e', 3, 'Session was okay but went off-topic.',    6,  true,  '2026-06-04T10:00:00Z'),
('e4805f3a-5f5e-4133-b98b-d2a3c619d696', '57c09654-2baa-4562-a775-9151c587faec', '1357af91-3aa1-4c1a-9494-740ea1536850', 4, 'Really helpful biology revision.',        9,  false, '2026-06-05T09:00:00Z'),
('8148eaaf-a86e-45c4-96f9-0f8e4f166435', '59f31499-50b2-4242-b341-24f80607c896', '5a571474-652d-4137-8beb-a6ffe690c4a5', 5, 'Best tutor for history!',                 10, false, '2026-06-06T08:00:00Z'),
('5030c1e2-f8b7-4111-af80-2687fbed6a6b', '59f31499-50b2-4242-b341-24f80607c896', 'fac09240-4f84-4b8a-849c-0a0b8e522a30', 4, 'Good geography session.',                 8,  false, '2026-06-06T10:00:00Z'),
('1d61937e-da91-4b4e-924d-e3c9bfe1b512', '57c09654-2baa-4562-a775-9151c587faec', 'd351927a-f25a-455d-9066-2d86498b6f1f', 4, 'Shamiso is very patient.',                9,  false, '2026-06-07T09:00:00Z');

-- ── Contracts ───────────────────────────────────────────────────────────
insert into contracts (entity_name, entity_type, learner_id, tutor_id, document_type, uploaded_at, expires_at, status, signed_at) values
('Takudzwa Zimba',    'learner', '4f569ed5-7be7-455c-b259-e1bcb2b613d9', null, 'Enrolment Agreement', '2026-02-01', '2027-02-01', 'signed',  '2026-02-03'),
('Chido Mpofu',       'learner', '4675fc12-15d8-43ad-b6c8-df5f0b8bad71', null, 'Enrolment Agreement', '2026-01-15', '2027-01-15', 'signed',  '2026-01-16'),
('Rufaro Gumbo',      'learner', 'fbf74a46-bc67-4842-ab17-761026cb0ef2', null, 'Enrolment Agreement', '2026-03-10', '2027-03-10', 'signed',  '2026-03-12'),
('Tinashe Maphosa',   'tutor',   null, 'fb094b6c-85d4-44cf-8bad-fdb2b931ccf5', 'Tutor Contract',      '2024-01-10', '2026-01-10', 'expired', '2024-01-11'),
('Chiedza Moyo',      'tutor',   null, '59f31499-50b2-4242-b341-24f80607c896', 'Tutor Contract',      '2024-03-05', '2026-03-05', 'expired', '2024-03-06'),
('Shamiso Dube',      'tutor',   null, '57c09654-2baa-4562-a775-9151c587faec', 'Tutor Contract',      '2024-06-01', '2026-12-01', 'signed',  '2024-06-02'),
('Munashe Chirwa',    'learner', 'a57fe8ea-6cda-4d29-a616-2910ba817b3d', null, 'Enrolment Agreement', '2026-04-01', '2027-04-01', 'pending', null),
('Kudakwashe Ndlovu', 'learner', 'e4805f3a-5f5e-4133-b98b-d2a3c619d696', null, 'Enrolment Agreement', '2026-02-20', '2027-02-20', 'signed',  '2026-02-22');

-- ── Discounts ───────────────────────────────────────────────────────────
insert into discounts (learner_id, type, reason, amount_usd, status, applied_from, applied_to) values
('a57fe8ea-6cda-4d29-a616-2910ba817b3d', 'Scholarship', 'Academic excellence bursary',              30, 'active',    '2026-04-01', null),
('5030c1e2-f8b7-4111-af80-2687fbed6a6b', 'Sibling',     'Sibling of Tatenda Makoni',                20, 'active',    '2026-03-25', null),
('1d61937e-da91-4b4e-924d-e3c9bfe1b512', 'Sibling',     'Sibling of Farai Makoni',                  20, 'active',    '2026-02-14', null),
('fbf74a46-bc67-4842-ab17-761026cb0ef2', 'Referral',    'Referred by Zimba family',                 15, 'active',    '2026-03-10', '2026-09-10'),
('04088b17-7311-499e-9dcf-ba996822b8bf', 'Other',       'Financial hardship — approved by director', 25, 'suspended', '2026-05-01', null),
('20cb4495-659e-4832-bdf5-215c18e40706', 'Staff',       'Director family discount',                 50, 'active',    '2026-06-01', null);

-- ── Audit log ───────────────────────────────────────────────────────────
insert into audit_log (action, entity_type, entity_label, category, field_changed, old_value, new_value, created_at) values
('create', 'learner',   'Takudzwa Zimba',               'learner',  null,               null,                 null,                          '2026-02-01T08:00:00Z'),
('create', 'learner',   'Chido Mpofu',                  'learner',  null,               null,                 null,                          '2026-01-15T09:00:00Z'),
('update', 'learner',   'Nkosi Moyo',                   'learner',  'status',           'active',             'paused',                      '2026-06-01T10:00:00Z'),
('create', 'invoice',   'INV-2026-001',                 'finance',  null,               null,                 null,                          '2026-06-01T08:00:00Z'),
('update', 'invoice',   'INV-2026-001',                 'finance',  'status',           'due',                'paid',                        '2026-06-07T14:00:00Z'),
('create', 'tutor',     'Shamiso Dube',                 'staff',    null,               null,                 null,                          '2024-06-01T09:00:00Z'),
('update', 'tutor',     'Tinashe Maphosa',              'staff',    'rate_per_session', '12',                 '15',                          '2025-01-10T11:00:00Z'),
('send',   'broadcast', 'June newsletter',              'comms',    null,               null,                 null,                          '2026-06-01T07:00:00Z'),
('update', 'settings',  'org_name',                     'settings', 'org_name',         'FtoA Tutoring',      'F-to-A Tutoring',             '2025-12-01T08:00:00Z'),
('create', 'contract',  'Rufaro Gumbo',                 'learner',  null,               null,                 null,                          '2026-03-10T10:00:00Z'),
('assign', 'learner',   'Kudakwashe Ndlovu',            'learner',  'tutor_id',         null,                 'Shamiso Dube',                '2026-02-21T09:00:00Z'),
('create', 'discount',  'Scholarship — Munashe Chirwa', 'finance',  null,               null,                 null,                          '2026-04-01T11:00:00Z');

-- ── Settings ────────────────────────────────────────────────────────────
insert into settings (key, value) values
('org_name',        'F-to-A Tutoring'),
('org_email',       'admin@ftoatutoring.net'),
('org_phone',       '+263771000000'),
('org_country',     'Zimbabwe'),
('currency',        'USD'),
('vat_rate',        '14.5'),
('income_tax_rate', '25'),
('notify_overdue',  'true'),
('notify_absence',  'true');

commit;

-- Sanity check — should print 3, 10, 11, 8, 8, 3, 9, 4, 25, 8, 8, 6, 12, 9
select
  (select count(*) from tutors)        as tutors,
  (select count(*) from learners)      as learners,
  (select count(*) from sessions)      as sessions,
  (select count(*) from invoices)      as invoices,
  (select count(*) from ledger)        as ledger,
  (select count(*) from payroll)       as payroll,
  (select count(*) from pipeline)      as pipeline,
  (select count(*) from pipeline_tasks) as pipeline_tasks,
  (select count(*) from assessments)   as assessments,
  (select count(*) from feedback)      as feedback,
  (select count(*) from contracts)     as contracts,
  (select count(*) from discounts)     as discounts,
  (select count(*) from audit_log)     as audit_log,
  (select count(*) from settings)      as settings;
