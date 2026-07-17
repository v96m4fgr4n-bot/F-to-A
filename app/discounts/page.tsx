'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { formatDate, formatCurrency } from '@/lib/utils'

const DISCOUNT_TYPES = ['Sibling', 'Scholarship', 'Referral', 'Staff', 'Other']
const TYPE_COLORS: Record<string, string> = {
  Sibling: 'bg-purple/10 text-purple',
  Scholarship: 'bg-green/10 text-green',
  Referral: 'bg-blue/10 text-blue',
  Staff: 'bg-orange/10 text-orange',
  Other: 'bg-bg text-tx-2',
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
  const byType: Record<string, number> = {}
  active.forEach(d => { byType[d.type] = (byType[d.type] ?? 0) + 1 })

  return (
    <div>
      {ToastEl}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Discounts</h1>
          <p className="text-tx-2 text-sm mt-1">{active.length} active discounts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-brand text-white px-4 py-2 rounded-btn text-sm font-600 hover:bg-brand-deep transition">
          + Add Discount
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="bg-surface rounded-card border border-border p-5">
          <p className="text-xs text-tx-3 font-600 mb-1">Active Discounts</p>
          <p className="text-3xl font-800 text-green">{active.length}</p>
        </div>
        <div className="bg-surface rounded-card border border-border p-5">
          <p className="text-xs text-tx-3 font-600 mb-1">Monthly Savings</p>
          <p className="text-3xl font-800 text-red">{formatCurrency(totalSavings)}</p>
        </div>
        {DISCOUNT_TYPES.slice(0, 2).map(type => (
          <div key={type} className="bg-surface rounded-card border border-border p-5">
            <p className="text-xs text-tx-3 font-600 mb-1">{type}</p>
            <p className="text-3xl font-800 text-tx">{byType[type] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-5">
        {['all', ...DISCOUNT_TYPES].map(t => (
          <button key={t} onClick={() => handleTypeFilter(t)}
            className={`px-3 py-1.5 rounded-btn text-xs font-600 transition ${typeFilter === t ? 'bg-tx text-white' : 'bg-surface border border-border text-tx-2 hover:text-tx'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg">
              {['Learner', 'Type', 'Reason', 'Amount', 'From', 'To', 'Status', ''].map(h => (
                <th key={h} className="text-left text-xs text-tx-3 font-600 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-4"><TableSkeleton rows={5} cols={8} /></td></tr>
            ) : discounts.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-tx-3 py-10">No discounts found</td></tr>
            ) : discounts.map(d => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-bg transition">
                <td className="px-4 py-3 font-600 text-tx">{d.learner?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-600 ${TYPE_COLORS[d.type] ?? 'bg-bg text-tx-2'}`}>
                    {d.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-tx-2 max-w-[180px] truncate">{d.reason ?? '—'}</td>
                <td className="px-4 py-3 font-mono font-600 text-red">{d.amount_usd != null ? formatCurrency(d.amount_usd) : '—'}</td>
                <td className="px-4 py-3 text-tx-2 text-xs">{d.applied_from ? formatDate(d.applied_from) : '—'}</td>
                <td className="px-4 py-3 text-tx-2 text-xs">{d.applied_to ? formatDate(d.applied_to) : 'Ongoing'}</td>
                <td className="px-4 py-3"><Badge value={d.status} /></td>
                <td className="px-4 py-3">
                  {d.status === 'active' && (
                    <button onClick={() => handleDeactivate(d.id)}
                      className="text-xs px-2 py-1 rounded-btn border border-border text-tx-3 hover:text-red hover:border-red transition">
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Discount" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Learner *</label>
            <select required value={form.learner_id} onChange={e => setForm(f => ({ ...f, learner_id: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
              <option value="">Select learner…</option>
              {learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Type *</label>
              <select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
                {DISCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Amount (USD/mo) *</label>
              <input required type="number" min="0" step="0.01" value={form.amount_usd} onChange={e => setForm(f => ({ ...f, amount_usd: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Reason</label>
            <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Applies From</label>
              <input type="date" value={form.applied_from} onChange={e => setForm(f => ({ ...f, applied_from: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Applies To</label>
              <input type="date" value={form.applied_to} onChange={e => setForm(f => ({ ...f, applied_to: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-btn text-sm text-tx-2 hover:text-tx">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand text-white rounded-btn text-sm font-600 hover:bg-brand-deep">Add Discount</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
