'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'

const CATEGORIES = ['all', 'learner', 'finance', 'staff', 'settings', 'comms']

const CAT_COLORS: Record<string, string> = {
  learner: 'var(--blue)',
  finance: 'var(--green)',
  staff: 'var(--purple)',
  settings: 'var(--orange)',
  comms: '#25D366',
}

export default function AuditPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [offset, setOffset] = useState(0)
  const { show, ToastEl } = useToast()
  const LIMIT = 50

  const load = (cat = category, off = 0) => {
    setLoading(true)
    fetch(`/api/audit?category=${cat}&limit=${LIMIT}&offset=${off}`)
      .then(r => r.json())
      .then(r => {
        if (off === 0) setEntries(r.data ?? [])
        else setEntries(prev => [...prev, ...(r.data ?? [])])
        setTotal(r.count ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCategory = (cat: string) => {
    setCategory(cat)
    setOffset(0)
    load(cat, 0)
  }

  const handleLoadMore = () => {
    const newOffset = offset + LIMIT
    setOffset(newOffset)
    load(category, newOffset)
  }

  const handleExportCSV = () => {
    const url = `/api/audit/export?category=${category}`
    window.open(url, '_blank')
    show('CSV export started')
  }

  const fmtTime = (ts: string) => {
    if (!ts) return '—'
    const d = new Date(ts)
    return d.toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const actionVerb = (action: string) => {
    const map: Record<string, string> = {
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted',
      login: 'Logged in',
      assign: 'Assigned',
      send: 'Sent',
    }
    return map[action] ?? action
  }

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <div className="page-title">Audit log</div>
          <div className="page-sub">Complete change history — every admin action recorded · {total.toLocaleString()} events</div>
        </div>
        <div className="page-actions">
          <select
            style={{ border: '1px solid var(--border)', borderRadius: 9, padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font)', outline: 'none', textTransform: 'capitalize' }}
            value={category} onChange={e => handleCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={handleExportCSV}>Export log</button>
        </div>
      </div>
      <div className="page-body">
        <div className="card">
          {loading && entries.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px 0', fontSize: 13 }}>Loading…</div>
          ) : entries.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '48px 0', fontSize: 13 }}>No audit events found</div>
          ) : entries.map((e, i) => (
            <div key={e.id ?? i} className="audit-item">
              <div className="audit-dot" style={{ background: CAT_COLORS[e.category] ?? CAT_COLORS[e.entity_type] ?? 'var(--text-3)' }}></div>
              <div style={{ flex: 1 }}>
                <div className="audit-chips">
                  {e.user_id && (
                    <span style={{ fontSize: 11.5, fontWeight: 800, background: 'var(--bg)', padding: '1px 7px', borderRadius: 5, color: 'var(--text-2)' }}>
                      {String(e.user_id).slice(0, 8)}
                    </span>
                  )}
                  <span style={{ fontWeight: 700 }}>{actionVerb(e.action)}</span>
                  <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{e.entity_label ?? e.entity_type ?? ''}</span>
                  {e.field_changed && (
                    <>
                      <span style={{ color: 'var(--text-3)' }}>·</span>
                      <span style={{ color: 'var(--text-2)', fontSize: 12.5 }}>{e.field_changed}:</span>
                    </>
                  )}
                  {e.old_value && <span className="chip-old">{e.old_value}</span>}
                  {e.old_value && e.new_value && <span style={{ color: 'var(--text-3)' }}>→</span>}
                  {e.new_value && <span className="chip-new">{e.new_value}</span>}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3, fontWeight: 600 }}>{fmtTime(e.created_at)}</div>
              </div>
            </div>
          ))}

          {entries.length < total && (
            <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={handleLoadMore} disabled={loading}>
              {loading ? 'Loading…' : `Load more (${total - entries.length} remaining)`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
