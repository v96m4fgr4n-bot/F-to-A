// F-to-A Tutoring — Google Apps Script Backend
// Deploy as: Web App → Execute as Me → Anyone can access
// Paste your Spreadsheet ID in SPREADSHEET_ID below

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'

const SHEETS = {
  tutors: 'Tutors',
  learners: 'Learners',
  sessions: 'Sessions',
  invoices: 'Invoices',
  ledger: 'Ledger',
  payroll: 'Payroll',
  pipeline: 'Pipeline',
  broadcasts: 'Broadcasts',
  settings: 'Settings',
}

// ── Entry points ──────────────────────────────────────────────

function doGet(e) {
  // If sheet param provided → API mode (for external callers)
  if (e && e.parameter && e.parameter.sheet) {
    try {
      const sheet = (e.parameter.sheet || '').toLowerCase()
      const id = e.parameter.id
      const params = e.parameter
      if (!SHEETS[sheet]) return json({ error: 'Unknown sheet: ' + sheet })
      const data = id ? getById(sheet, id) : getAll(sheet, params)
      return json({ data, error: null })
    } catch (err) {
      return json({ data: null, error: err.message })
    }
  }
  // Otherwise serve the HTML admin portal
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('F→A Tutoring Admin')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
}

// ── Functions callable via google.script.run ──────────────────

function serverGet(sheet, filters) {
  try {
    const data = getAll(sheet, filters || {})
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

function serverCreate(sheet, payload) {
  try {
    const data = createRow(sheet, payload)
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

function serverUpdate(sheet, id, payload) {
  try {
    const data = updateRow(sheet, id, payload)
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

function serverDelete(sheet, id) {
  try {
    const data = deleteRow(sheet, id)
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

function serverDashboard() {
  try {
    const learners = sheetToObjects(getSheet('learners'))
    const sessions = sheetToObjects(getSheet('sessions'))
    const invoices = sheetToObjects(getSheet('invoices'))
    const ledger    = sheetToObjects(getSheet('ledger'))
    const now = new Date()
    const thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
    const mrr = learners.filter(l => l.status === 'active').reduce((s, l) => s + Number(l.mrr || 0), 0)
    const active_learners = learners.filter(l => l.status === 'active').length
    const sessions_this_month = sessions.filter(s => (s.scheduled_at || '').startsWith(thisMonth)).length
    const outstanding_invoices = invoices.filter(i => i.status === 'due' || i.status === 'overdue').length
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      const revenue = ledger.filter(e => e.type === 'income' && (e.entry_date || '').startsWith(key)).reduce((s, e) => s + Number(e.amount || 0), 0)
      const sess = sessions.filter(s => (s.scheduled_at || '').startsWith(key)).length
      months.push({ month: label, revenue, sessions: sess })
    }
    const planCounts = {}
    learners.filter(l => l.plan).forEach(l => { planCounts[l.plan] = (planCounts[l.plan] || 0) + 1 })
    const learnerMap = {}
    learners.forEach(l => learnerMap[l.id] = l)
    const outstanding = invoices.filter(i => i.status === 'due' || i.status === 'overdue').slice(0, 5).map(i => ({ ...i, learner: learnerMap[i.learner_id] || null }))
    return { data: { mrr, active_learners, sessions_this_month, outstanding_invoices, months, planCounts, outstanding }, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents)
    const { sheet, action, id, data: payload } = body

    if (!SHEETS[sheet]) return json({ error: 'Unknown sheet: ' + sheet })

    let result
    if (action === 'create') result = createRow(sheet, payload)
    else if (action === 'update') result = updateRow(sheet, id, payload)
    else if (action === 'delete') result = deleteRow(sheet, id)
    else return json({ error: 'Unknown action: ' + action })

    return json({ data: result, error: null })
  } catch (err) {
    return json({ data: null, error: err.message })
  }
}

// ── CRUD helpers ─────────────────────────────────────────────

function getAll(sheetName, params) {
  const ws = getSheet(sheetName)
  const rows = sheetToObjects(ws)

  let results = rows

  // Filter support
  if (params.status && params.status !== 'all') {
    results = results.filter(r => r.status === params.status)
  }
  if (params.tutor_id) {
    results = results.filter(r => r.tutor_id === params.tutor_id)
  }
  if (params.learner_id) {
    results = results.filter(r => r.learner_id === params.learner_id)
  }
  if (params.type && params.type !== 'all') {
    results = results.filter(r => r.type === params.type)
  }
  if (params.month) {
    results = results.filter(r => (r.entry_date || r.scheduled_at || '').startsWith(params.month))
  }
  if (params.search) {
    const q = params.search.toLowerCase()
    results = results.filter(r =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.subject || '').toLowerCase().includes(q)
    )
  }

  // Join tutor name into learners
  if (sheetName === 'learners') {
    const tutors = sheetToObjects(getSheet('tutors'))
    const tutorMap = {}
    tutors.forEach(t => tutorMap[t.id] = t)
    results = results.map(l => ({ ...l, tutor: tutorMap[l.tutor_id] || null }))
  }

  // Join learner + tutor into sessions
  if (sheetName === 'sessions') {
    const learners = sheetToObjects(getSheet('learners'))
    const tutors = sheetToObjects(getSheet('tutors'))
    const learnerMap = {}, tutorMap = {}
    learners.forEach(l => learnerMap[l.id] = l)
    tutors.forEach(t => tutorMap[t.id] = t)
    results = results.map(s => ({ ...s, learner: learnerMap[s.learner_id] || null, tutor: tutorMap[s.tutor_id] || null }))
    results.sort((a, b) => (b.scheduled_at || '').localeCompare(a.scheduled_at || ''))
  }

  // Join learner into invoices
  if (sheetName === 'invoices') {
    const learners = sheetToObjects(getSheet('learners'))
    const learnerMap = {}
    learners.forEach(l => learnerMap[l.id] = l)
    results = results.map(i => ({ ...i, learner: learnerMap[i.learner_id] || null }))
    results.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  }

  // Join tutor into payroll
  if (sheetName === 'payroll') {
    const tutors = sheetToObjects(getSheet('tutors'))
    const tutorMap = {}
    tutors.forEach(t => tutorMap[t.id] = t)
    results = results.map(p => ({ ...p, tutor: tutorMap[p.tutor_id] || null }))
  }

  return results
}

function getById(sheetName, id) {
  const rows = sheetToObjects(getSheet(sheetName))
  return rows.find(r => r.id === id) || null
}

function createRow(sheetName, payload) {
  const ws = getSheet(sheetName)
  const headers = getHeaders(ws)
  const id = payload.id || Utilities.getUuid()
  const now = new Date().toISOString()

  const row = headers.map(h => {
    if (h === 'id') return id
    if (h === 'created_at' && !payload[h]) return now
    const val = payload[h]
    if (val === undefined || val === null) return ''
    if (Array.isArray(val)) return val.join(',')
    return val
  })

  ws.appendRow(row)
  return { id, ...payload, created_at: payload.created_at || now }
}

function updateRow(sheetName, id, payload) {
  const ws = getSheet(sheetName)
  const headers = getHeaders(ws)
  const data = ws.getDataRange().getValues()

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      headers.forEach((h, j) => {
        if (h !== 'id' && h !== 'created_at' && payload[h] !== undefined) {
          let val = payload[h]
          if (Array.isArray(val)) val = val.join(',')
          ws.getRange(i + 1, j + 1).setValue(val === null ? '' : val)
        }
      })
      return { id, ...payload }
    }
  }
  throw new Error('Row not found: ' + id)
}

function deleteRow(sheetName, id) {
  const ws = getSheet(sheetName)
  const data = ws.getDataRange().getValues()
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      ws.deleteRow(i + 1)
      return { id }
    }
  }
  throw new Error('Row not found: ' + id)
}

// ── Dashboard aggregation ────────────────────────────────────

function getDashboard() {
  const learners = sheetToObjects(getSheet('learners'))
  const sessions = sheetToObjects(getSheet('sessions'))
  const invoices = sheetToObjects(getSheet('invoices'))
  const ledger = sheetToObjects(getSheet('ledger'))

  const now = new Date()
  const thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')

  const mrr = learners.filter(l => l.status === 'active').reduce((s, l) => s + Number(l.mrr || 0), 0)
  const active_learners = learners.filter(l => l.status === 'active').length
  const sessions_this_month = sessions.filter(s => (s.scheduled_at || '').startsWith(thisMonth)).length
  const outstanding_invoices = invoices.filter(i => i.status === 'due' || i.status === 'overdue').length

  // Last 6 months
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const revenue = ledger.filter(e => e.type === 'income' && (e.entry_date || '').startsWith(key)).reduce((s, e) => s + Number(e.amount || 0), 0)
    const sess = sessions.filter(s => (s.scheduled_at || '').startsWith(key)).length
    months.push({ month: label, revenue, sessions: sess })
  }

  // Plan breakdown
  const planCounts = {}
  learners.filter(l => l.plan).forEach(l => { planCounts[l.plan] = (planCounts[l.plan] || 0) + 1 })

  // Outstanding invoices detail
  const learnerMap = {}
  learners.forEach(l => learnerMap[l.id] = l)
  const outstanding = invoices
    .filter(i => i.status === 'due' || i.status === 'overdue')
    .slice(0, 5)
    .map(i => ({ ...i, learner: learnerMap[i.learner_id] || null }))

  return json({ data: { mrr, active_learners, sessions_this_month, outstanding_invoices, months, planCounts, outstanding }, error: null })
}

// ── Sheet helpers ────────────────────────────────────────────

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheetName = SHEETS[name] || name
  let ws = ss.getSheetByName(sheetName)
  if (!ws) ws = createSheetWithHeaders(ss, sheetName, name)
  return ws
}

function getHeaders(ws) {
  return ws.getRange(1, 1, 1, ws.getLastColumn()).getValues()[0].map(String)
}

function sheetToObjects(ws) {
  const data = ws.getDataRange().getValues()
  if (data.length < 2) return []
  const headers = data[0].map(String)
  return data.slice(1).map(row => {
    const obj = {}
    headers.forEach((h, i) => {
      let val = row[i]
      if (val instanceof Date) val = val.toISOString()
      // Restore comma-separated arrays
      if (['subjects'].includes(h) && typeof val === 'string' && val.includes(',')) {
        val = val.split(',').map(s => s.trim()).filter(Boolean)
      }
      obj[h] = val === '' ? null : val
    })
    return obj
  })
}

function createSheetWithHeaders(ss, sheetName, key) {
  const ws = ss.insertSheet(sheetName)
  const headerMap = {
    Tutors:     ['id','name','role','email','phone','subjects','rate_per_session','joined_at','active','created_at'],
    Learners:   ['id','name','grade','subject','tutor_id','plan','mrr','status','progress','enrolled_at','parent_name','parent_phone','parent_email','notes','created_at'],
    Sessions:   ['id','learner_id','tutor_id','scheduled_at','duration_mins','subject','attendance','notes','created_at'],
    Invoices:   ['id','learner_id','description','amount','status','invoice_date','due_date','reference','created_at'],
    Ledger:     ['id','type','description','category','amount','reference','entry_date','learner_id','tutor_id','invoice_id','created_at'],
    Payroll:    ['id','tutor_id','period_start','period_end','sessions_count','rate','bonus','gross','status','paid_at','created_at'],
    Pipeline:   ['id','learner_id','stage','parent_name','parent_phone','subjects','churn_reason','moved_at','created_at'],
    Broadcasts: ['id','channel','subject','body','recipient_filter','sent_count','sent_at','created_at'],
    Settings:   ['key','value'],
  }
  const headers = headerMap[sheetName] || ['id', 'created_at']
  ws.getRange(1, 1, 1, headers.length).setValues([headers])
  ws.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0E2436').setFontColor('#ffffff')
  ws.setFrozenRows(1)
  return ws
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}

// ── Setup: run once to create all sheets ─────────────────────

function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  Object.values(SHEETS).forEach(name => {
    if (!ss.getSheetByName(name)) {
      createSheetWithHeaders(ss, name, name.toLowerCase())
      Logger.log('Created sheet: ' + name)
    }
  })
  Logger.log('Setup complete!')
}

// ── Seed: run once to populate sample data ───────────────────

function seedData() {
  const now = new Date().toISOString()
  const tutors = [
    { id: 't1', name: 'Tinashe Maphosa', role: 'Senior Tutor', email: 'tinashe@ftoatutoring.net', phone: '+263771234567', subjects: 'Maths,Physics', rate_per_session: 15, joined_at: '2024-01-10', active: true, created_at: now },
    { id: 't2', name: 'Chiedza Moyo', role: 'Tutor', email: 'chiedza@ftoatutoring.net', phone: '+263772345678', subjects: 'English,History', rate_per_session: 12, joined_at: '2024-02-15', active: true, created_at: now },
    { id: 't3', name: 'Shamiso Dube', role: 'Tutor', email: 'shamiso@ftoatutoring.net', phone: '+263773456789', subjects: 'Chemistry,Biology', rate_per_session: 12, joined_at: '2024-03-01', active: true, created_at: now },
  ]
  tutors.forEach(t => createRow('tutors', t))

  const learners = [
    { id: 'l1', name: 'Takudzwa Zimba', grade: 10, subject: 'Maths', tutor_id: 't1', plan: 'intensive', mrr: 280, status: 'active', progress: 82, enrolled_at: '2024-09-01', parent_name: 'Grace Zimba', parent_phone: '+263771111111', parent_email: 'grace.zimba@gmail.com', created_at: now },
    { id: 'l2', name: 'Rufaro Gumbo', grade: 9, subject: 'English', tutor_id: 't2', plan: 'standard', mrr: 180, status: 'active', progress: 67, enrolled_at: '2024-10-01', parent_name: 'Peter Gumbo', parent_phone: '+263772222222', parent_email: 'peter.gumbo@gmail.com', created_at: now },
    { id: 'l3', name: 'Chido Mpofu', grade: 11, subject: 'Chemistry', tutor_id: 't3', plan: 'intensive', mrr: 280, status: 'active', progress: 91, enrolled_at: '2024-08-15', parent_name: 'Ruth Mpofu', parent_phone: '+263773333333', parent_email: 'ruth.mpofu@gmail.com', created_at: now },
    { id: 'l4', name: 'Munashe Chirwa', grade: 8, subject: 'Physics', tutor_id: 't1', plan: 'standard', mrr: 180, status: 'paused', progress: 45, enrolled_at: '2024-11-01', parent_name: 'David Chirwa', parent_phone: '+263774444444', parent_email: 'david.chirwa@gmail.com', created_at: now },
    { id: 'l5', name: 'Kudakwashe Ndlovu', grade: 12, subject: 'Maths', tutor_id: 't1', plan: 'intensive', mrr: 280, status: 'active', progress: 74, enrolled_at: '2024-07-01', parent_name: 'Jane Ndlovu', parent_phone: '+263775555555', parent_email: 'jane.ndlovu@gmail.com', created_at: now },
    { id: 'l6', name: 'Nkosi Moyo', grade: 10, subject: 'Biology', tutor_id: 't3', plan: 'starter', mrr: 100, status: 'active', progress: 58, enrolled_at: '2025-01-10', parent_name: 'Sibo Moyo', parent_phone: '+263776666666', parent_email: 'sibo.moyo@gmail.com', created_at: now },
    { id: 'l7', name: 'Ngonidzashe Sibanda', grade: 9, subject: 'History', tutor_id: 't2', plan: 'payg', mrr: 60, status: 'active', progress: 63, enrolled_at: '2025-02-01', parent_name: 'Aleck Sibanda', parent_phone: '+263777777777', parent_email: 'aleck.sibanda@gmail.com', created_at: now },
    { id: 'l8', name: 'Ruvimbo Zvobgo', grade: 11, subject: 'English', tutor_id: 't2', plan: 'standard', mrr: 180, status: 'active', progress: 79, enrolled_at: '2024-12-01', parent_name: 'Mercy Zvobgo', parent_phone: '+263778888888', parent_email: 'mercy.zvobgo@gmail.com', created_at: now },
    { id: 'l9', name: 'Tatenda Makoni', grade: 8, subject: 'Maths', tutor_id: 't1', plan: 'starter', mrr: 100, status: 'pending', progress: 30, parent_name: 'Tafadzwa Makoni', parent_phone: '+263779999999', parent_email: 'tafadzwa.makoni@gmail.com', created_at: now },
    { id: 'l10', name: 'Farai Makoni', grade: 12, subject: 'Chemistry', tutor_id: 't3', plan: 'intensive', mrr: 280, status: 'churned', progress: 20, enrolled_at: '2024-06-01', parent_name: 'Tafadzwa Makoni', parent_phone: '+263779999999', parent_email: 'tafadzwa.makoni@gmail.com', notes: 'Relocated to South Africa', created_at: now },
  ]
  learners.forEach(l => createRow('learners', l))
  Logger.log('Seed complete!')
}
