'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

const CATEGORIES = ['all', 'learner', 'finance', 'staff', 'settings', 'comms']
const CAT_VARIANT: Record<string, any> = { learner: 'blue', finance: 'green', staff: 'purple', settings: 'default', comms: 'yellow' }

export default function AuditPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')

  const load = (cat: string) => {
    setLoading(true)
    const url = cat === 'all' ? '/api/audit' : `/api/audit?category=${cat}`
    fetch(url).then(r => r.json()).then(r => { setEntries(r.data ?? []); setLoading(false) })
  }

  useEffect(() => { load('all') }, [])

  const handleCat = (c: string) => { setCategory(c); load(c) }

  const exportCsv = () => {
    const url = category === 'all' ? '/api/audit/export' : `/api/audit/export?category=${category}`
    window.open(url, '_blank')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Audit Log</h1>
          <p className="text-tx-2 text-sm mt-1">{entries.length} entries</p>
        </div>
        <button onClick={exportCsv} className="border border-border text-tx-2 px-4 py-2 rounded-btn text-sm font-600 hover:text-tx hover:bg-bg transition">
          Export CSV
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => handleCat(c)}
            className={`px-3 py-1.5 rounded-btn text-xs font-600 capitalize transition ${category === c ? 'bg-tx text-white' : 'bg-surface border border-border text-tx-2 hover:text-tx'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Chronological feed */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        {loading ? (
          <div className="text-center text-tx-3 py-12 text-sm">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-tx-3 py-12 text-sm">No audit entries</div>
        ) : (
          <div className="divide-y divide-border/50">
            {entries.map(e => (
              <div key={e.id} className="px-5 py-4 hover:bg-bg transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-600 text-sm text-tx">{e.action}</span>
                      {e.entity_label && <span className="text-tx-2 text-sm">— {e.entity_label}</span>}
                      {e.category && <Badge variant={CAT_VARIANT[e.category] ?? 'default'} size="sm">{e.category}</Badge>}
                    </div>
                    {e.field_changed && (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-tx-3">Changed <span className="font-600 text-tx-2">{e.field_changed}</span></span>
                        {e.old_value && (
                          <span className="inline-flex items-center gap-1">
                            <span className="bg-red/10 text-red text-[11px] px-2 py-0.5 rounded font-500 line-through">{e.old_value}</span>
                            <span className="text-tx-3 text-xs">→</span>
                            <span className="bg-green/10 text-green text-[11px] px-2 py-0.5 rounded font-500">{e.new_value}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-tx-3 whitespace-nowrap mt-0.5">
                    {new Date(e.created_at).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
