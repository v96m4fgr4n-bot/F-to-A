'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'

const CATEGORIES = ['all', 'learner', 'finance', 'staff', 'settings', 'comms']

const CAT_COLORS: Record<string, string> = {
  learner: 'bg-blue/10 text-blue',
  finance: 'bg-green/10 text-green',
  staff: 'bg-purple/10 text-purple',
  settings: 'bg-yellow/10 text-yellow',
  comms: 'bg-orange/10 text-orange',
}

function ValueChip({ label, value, variant }: { label: string; value: string; variant: 'old' | 'new' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-600 ${variant === 'old' ? 'bg-red/10 text-red line-through' : 'bg-green/10 text-green'}`}>
      {label}: {value}
    </span>
  )
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
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Audit Log</h1>
          <p className="text-tx-2 text-sm mt-1">{total.toLocaleString()} total events</p>
        </div>
        <button onClick={handleExportCSV} className="bg-brand text-white px-4 py-2 rounded-btn text-sm font-600 hover:bg-brand-deep transition">
          Export CSV
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => handleCategory(cat)}
            className={`px-3 py-1.5 rounded-btn text-xs font-600 capitalize transition ${category === cat ? 'bg-tx text-white' : 'bg-surface border border-border text-tx-2 hover:text-tx'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {loading && entries.length === 0 ? (
          <div className="bg-surface rounded-card border border-border p-8 text-center text-tx-3 text-sm">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="bg-surface rounded-card border border-border p-12 text-center text-tx-3 text-sm">No audit events found</div>
        ) : entries.map((e, i) => (
          <div key={e.id ?? i} className="bg-surface rounded-card border border-border px-5 py-3.5 flex items-start gap-4">
            {/* Timeline dot */}
            <div className="flex flex-col items-center mt-1 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-border mt-1" />
              {i < entries.length - 1 && <div className="w-px flex-1 bg-border/40 mt-1 min-h-[12px]" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <span className="text-sm font-600 text-tx">{actionVerb(e.action)}</span>
                  {' '}
                  <span className="text-sm text-tx-2">{e.entity_label ?? e.entity_type ?? ''}</span>
                  {e.entity_type && (
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-700 uppercase ${CAT_COLORS[e.category] ?? CAT_COLORS[e.entity_type] ?? 'bg-bg text-tx-3'}`}>
                      {e.category ?? e.entity_type}
                    </span>
                  )}
                </div>
                <span className="text-xs text-tx-3 flex-shrink-0">{fmtTime(e.created_at)}</span>
              </div>

              {/* Field change chips */}
              {e.field_changed && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs text-tx-3">{e.field_changed}:</span>
                  {e.old_value && <ValueChip label="was" value={e.old_value} variant="old" />}
                  {e.new_value && <ValueChip label="now" value={e.new_value} variant="new" />}
                </div>
              )}

              {e.user_id && (
                <p className="text-[11px] text-tx-3 mt-1">by {e.user_id}</p>
              )}
            </div>
          </div>
        ))}

        {/* Load more */}
        {entries.length < total && (
          <button onClick={handleLoadMore} disabled={loading}
            className="w-full py-3 text-sm text-tx-2 border border-border rounded-card bg-surface hover:bg-bg transition disabled:opacity-50">
            {loading ? 'Loading…' : `Load more (${total - entries.length} remaining)`}
          </button>
        )}
      </div>
    </div>
  )
}
