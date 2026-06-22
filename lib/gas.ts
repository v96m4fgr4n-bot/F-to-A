// Google Apps Script API client
// Set NEXT_PUBLIC_GAS_URL in .env.local to your deployed Apps Script Web App URL
// Falls back to in-memory data if not configured

import { TUTORS, LEARNERS, SESSIONS, INVOICES, LEDGER, PAYROLL, PIPELINE } from '@/lib/data'

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL

if (!GAS_URL) {
  console.warn('[gas] Using in-memory fallback — set NEXT_PUBLIC_GAS_URL to use Google Sheets')
}

// In-memory storage for fallback mode
const fallbackStore: Record<string, any[]> = {
  tutors: JSON.parse(JSON.stringify(TUTORS)),
  learners: JSON.parse(JSON.stringify(LEARNERS)),
  sessions: JSON.parse(JSON.stringify(SESSIONS)),
  invoices: JSON.parse(JSON.stringify(INVOICES)),
  ledger: JSON.parse(JSON.stringify(LEDGER)),
  payroll: JSON.parse(JSON.stringify(PAYROLL)),
  pipeline: JSON.parse(JSON.stringify(PIPELINE)),
}

function generateId() {
  return Math.random().toString(36).substring(2, 11)
}

function fallbackGet(sheet: string, params: Record<string, string> = {}) {
  let data = fallbackStore[sheet] ?? []

  // Apply filters
  if (params.status) {
    data = data.filter((r: any) => r.status === params.status)
  }
  if (params.tutor_id) {
    data = data.filter((r: any) => r.tutor_id === params.tutor_id)
  }
  if (params.learner_id) {
    data = data.filter((r: any) => r.learner_id === params.learner_id)
  }
  if (params.type) {
    data = data.filter((r: any) => r.type === params.type)
  }
  if (params.month) {
    data = data.filter((r: any) => (r.entry_date || r.scheduled_at || '').startsWith(params.month))
  }
  if (params.search) {
    const q = params.search.toLowerCase()
    data = data.filter((r: any) => (r.name ?? '').toLowerCase().includes(q))
  }

  // Join learners with tutors
  if (sheet === 'learners') {
    data = data.map((l: any) => ({
      ...l,
      tutor: fallbackStore.tutors.find((t: any) => t.id === l.tutor_id) || null,
    }))
  }

  // Join sessions with learner + tutor
  if (sheet === 'sessions') {
    data = data.map((s: any) => ({
      ...s,
      learner: fallbackStore.learners.find((l: any) => l.id === s.learner_id) || null,
      tutor: fallbackStore.tutors.find((t: any) => t.id === s.tutor_id) || null,
    }))
  }

  // Join invoices with learner
  if (sheet === 'invoices') {
    data = data.map((i: any) => ({
      ...i,
      learner: fallbackStore.learners.find((l: any) => l.id === i.learner_id) || null,
    }))
  }

  // Join payroll with tutor
  if (sheet === 'payroll') {
    data = data.map((p: any) => ({
      ...p,
      tutor: fallbackStore.tutors.find((t: any) => t.id === p.tutor_id) || null,
    }))
  }

  return { data, error: null }
}

function fallbackPost(sheet: string, action: 'create' | 'update' | 'delete', payload: { id?: string; data?: any }) {
  const store = fallbackStore[sheet]
  if (!store) return { data: null, error: `Unknown sheet: ${sheet}` }

  if (action === 'create') {
    const newRow = { id: payload.data?.id || generateId(), ...payload.data, created_at: new Date().toISOString() }
    store.push(newRow)
    return { data: newRow, error: null }
  }

  if (action === 'update') {
    const idx = store.findIndex((r: any) => r.id === payload.id)
    if (idx === -1) return { data: null, error: `Not found: ${payload.id}` }
    store[idx] = { ...store[idx], ...payload.data }
    return { data: store[idx], error: null }
  }

  if (action === 'delete') {
    const idx = store.findIndex((r: any) => r.id === payload.id)
    if (idx === -1) return { data: null, error: `Not found: ${payload.id}` }
    const deleted = store.splice(idx, 1)[0]
    return { data: deleted, error: null }
  }

  return { data: null, error: 'Unknown action' }
}

export async function gasGet(sheet: string, params: Record<string, string> = {}) {
  if (!GAS_URL) {
    return fallbackGet(sheet, params)
  }

  const qs = new URLSearchParams({ sheet, ...params })
  const res = await fetch(`${GAS_URL}?${qs}`)
  return res.json()
}

export async function gasPost(sheet: string, action: 'create' | 'update' | 'delete', payload: { id?: string; data?: any }) {
  if (!GAS_URL) {
    return fallbackPost(sheet, action, payload)
  }

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // Apps Script requires text/plain for doPost
    body: JSON.stringify({ sheet, action, id: payload.id, data: payload.data }),
  })
  return res.json()
}
