// Google Apps Script API client
// Set NEXT_PUBLIC_GAS_URL in .env.local to your deployed Apps Script Web App URL

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL

if (!GAS_URL) {
  console.warn('[gas] Missing NEXT_PUBLIC_GAS_URL — set this to your Apps Script Web App URL')
}

export async function gasGet(sheet: string, params: Record<string, string> = {}) {
  if (!GAS_URL) throw new Error('NEXT_PUBLIC_GAS_URL not configured')
  const qs = new URLSearchParams({ sheet, ...params })
  const res = await fetch(`${GAS_URL}?${qs}`)
  return res.json()
}

export async function gasPost(sheet: string, action: 'create' | 'update' | 'delete', payload: { id?: string; data?: any }) {
  if (!GAS_URL) throw new Error('NEXT_PUBLIC_GAS_URL not configured')
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // Apps Script requires text/plain for doPost
    body: JSON.stringify({ sheet, action, id: payload.id, data: payload.data }),
  })
  return res.json()
}
