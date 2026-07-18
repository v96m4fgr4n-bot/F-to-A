'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { Ic } from '@/components/ui/Icon'
import { formatDate, formatCurrency } from '@/lib/utils'

const DISCOUNT_TYPES = ['Sibling', 'Scholarship', 'Referral', 'Staff', 'Other']
const TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  Scholarship: { bg: '#F2EEFF', color: 'var(--purple)' },
  Sibling: { bg: '#EBF6FF', color: 'var(--blue)' },
  Referral: { bg: '#FEF3C7', color: '#b45309' },
  Staff: { bg: '#E8F5E9', color: 'var(--green)' },
  Other: { bg: 'var(--bg)', color: 'var(--text-2)' },
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [learners, setLearners] = useState<any[]>([])
  const [form, setForm] = useState({
    learner_id: '', type: 'Sibling', reason: '', amount_usd: '', status: 'active',
    applied_from: '', applied_to: ''
  })
  const { show, ToastEl } = useToast()

  const load = (t = typeFilter) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (t !== 'all') params.set('type', t)
    fetch(`/api/discounts?${params}`)
      .then(r => r.json())
      .then(r => { setDiscounts(r.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
    fetch('/api/learners').then(r => r.json()).then(r => setLearners(r.data ?? []))
  }, [])

  const handleTypeFilter = (t: string) => { setTypeFilter(t); load(t) }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount_usd: Number(form.amount_usd) })
    })
    if (res.ok) { setShowModal(false); load(); show('Discount added') }
    else show('Failed to add discount', 'error')
  }

  const handleDeactivate = async (id: string) => {
    const res = await fetch(`/api/discounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'inactive' })
    })
    if (res.ok) { load(); show('Discount deactivated') }
    else show('Failed', 'error')
  }

  const active = discounts.filter(d => d.status === 'active')
  const totalSavings = active.reduce((a, d) => a + (d.amount_usd ?? 0), 0)
  const scholarships = active.filter(d => d.type === 'Scholarship').length

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <div className="page-title">Discounts & scholarships</div>
          <div className="page-sub">{formatCurrency(totalSavings)}/mo applied across {active.length} active learners</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Ic n="plus" s={14} /> Add discount</button>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
          {([
            ['Active discounts', String(active.length), 'var(--green)'],
            ['Monthly value', formatCurrency(totalSavings), 'var(--orange)'],
            ['Scholarships', String(scholarships), 'var(--purple)'],
          ] as const).map(([l, v, c]) => (
            <div key={l} className="kpi-card blue" style={{ flex: 1 }}>
              <div className="kpi-label">{l}</div>
              <div className="kpi-val" style={{ fontSize: 28, color: c }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {['all', ...DISCOUNT_TYPES].map(t => (
            <button key={t} className={'month-btn ' + (typeFilter === t ? 'on' : '')} onClick={() => handleTypeFilter(t)} style={{ textTransform: t === 'all' ? 'capitalize' : undefined }}>
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>

        <div className="data-table">
          <div className="discount-head">
            <span>Learner</span><span>Type</span><span>Reason</span><span>Amount</span><span>Status</span><span>Since</span>
          </div>
          {loading ? (
            <div style={{ padding: 16 }}><TableSkeleton rows={5} cols={6} /></div>
          ) : discounts.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: 13 }}>No discounts found</div>
          ) : discounts.map(d => {
            const ts = TYPE_STYLES[d.type] ?? TYPE_STYLES.Other
            const inactive = d.status !== 'active'
            return (
              <div key={d.id} className="discount-row" style={{ opacity: inactive ? .55 : 1 }}>
                <span style={{ fontWeight: 700 }}>{d.learner?.name ?? '—'}</span>
                <span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: ts.bg, color: ts.color }}>{d.type}</span>
                </span>
                <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{d.reason ?? '—'}</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 800, color: 'var(--orange)' }}>
                  {d.amount_usd != null ? `${formatCurrency(d.amount_usd)}/mo` : '—'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Badge value={d.status} />
                  {d.status === 'active' && (
                    <button onClick={() => handleDeactivate(d.id)} title="Deactivate"
                      style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>
                      ✕
                    </button>
                  )}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
                  {d.applied_from ? formatDate(d.applied_from) : '—'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Discount" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Learner *</label>
            <select required value={form.learner_id} onChange={e => setForm(f => ({ ...f, learner_id: e.target.value }))} className="s-inp">
              <option value="">Select learner…</option>
              {learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Type *</label>
              <select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="s-inp">
                {DISCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Amount (USD/mo) *</label>
              <input required type="number" min="0" step="0.01" value={form.amount_usd} onChange={e => setForm(f => ({ ...f, amount_usd: e.target.value }))} className="s-inp" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Reason</label>
            <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="s-inp" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Applies From</label>
              <input type="date" value={form.applied_from} onChange={e => setForm(f => ({ ...f, applied_from: e.target.value }))} className="s-inp" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Applies To</label>
              <input type="date" value={form.applied_to} onChange={e => setForm(f => ({ ...f, applied_to: e.target.value }))} className="s-inp" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Add Discount</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
