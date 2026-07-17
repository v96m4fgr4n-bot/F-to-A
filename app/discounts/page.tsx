'use client'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { formatDate, formatCurrency } from '@/lib/utils'

const TYPE_VARIANT: Record<string, any> = { Sibling: 'blue', Scholarship: 'purple', Referral: 'green', Staff: 'yellow', Other: 'default' }
const STATUS_VARIANT: Record<string, any> = { active: 'green', expired: 'red', suspended: 'yellow' }

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [learners, setLearners] = useState<any[]>([])
  const [form, setForm] = useState({ learner_id: '', type: 'Sibling', reason: '', amount_usd: '', applied_from: '', applied_to: '' })
  const { show, ToastEl } = useToast()

  const load = () => {
    setLoading(true)
    fetch('/api/discounts').then(r => r.json()).then(r => { setDiscounts(r.data ?? []); setLoading(false) })
  }
  useEffect(() => {
    load()
    fetch('/api/learners').then(r => r.json()).then(r => setLearners(r.data ?? []))
  }, [])

  const active = discounts.filter(d => d.status === 'active')
  const totalUsd = active.reduce((s, d) => s + (d.amount_usd ?? 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/discounts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount_usd: Number(form.amount_usd) })
    })
    if (res.ok) { setShowModal(false); load(); show('Discount added') }
    else show('Failed to add discount', 'error')
  }

  const suspend = async (id: string, status: string) => {
    const next = status === 'active' ? 'suspended' : 'active'
    const res = await fetch(`/api/discounts/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next })
    })
    if (res.ok) { load(); show(`Discount ${next}`) }
  }

  return (
    <div>
      {ToastEl}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Discounts</h1>
          <p className="text-tx-2 text-sm mt-1">Learner fee reductions and scholarships</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-brand text-white px-4 py-2 rounded-btn text-sm font-600 hover:bg-brand-deep transition">
          + Add Discount
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-surface rounded-card border border-border p-5">
          <p className="text-xs text-tx-3 font-600 mb-1">Active Discounts</p>
          <p className="text-3xl font-800 text-green">{active.length}</p>
        </div>
        <div className="bg-surface rounded-card border border-border p-5">
          <p className="text-xs text-tx-3 font-600 mb-1">Total Monthly Reduction</p>
          <p className="text-3xl font-800 text-red">{formatCurrency(totalUsd)}</p>
        </div>
        <div className="bg-surface rounded-card border border-border p-5">
          <p className="text-xs text-tx-3 font-600 mb-1">All Discounts</p>
          <p className="text-3xl font-800 text-tx">{discounts.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg">
              {['Learner', 'Type', 'Reason', 'Amount', 'From', 'To', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs text-tx-3 font-600 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center text-tx-3 py-12">Loading…</td></tr>
            ) : discounts.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-tx-3 py-12">No discounts yet</td></tr>
            ) : discounts.map(d => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-bg transition">
                <td className="px-4 py-3 font-500 text-tx">{d.learner?.name ?? '—'}</td>
                <td className="px-4 py-3"><Badge variant={TYPE_VARIANT[d.type] ?? 'default'} size="sm">{d.type}</Badge></td>
                <td className="px-4 py-3 text-tx-2 max-w-[180px] truncate">{d.reason ?? '—'}</td>
                <td className="px-4 py-3 font-700 text-red">{formatCurrency(d.amount_usd)}</td>
                <td className="px-4 py-3 text-tx-2">{d.applied_from ? formatDate(d.applied_from) : '—'}</td>
                <td className="px-4 py-3 text-tx-2">{d.applied_to ? formatDate(d.applied_to) : '—'}</td>
                <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[d.status] ?? 'default'} size="sm">{d.status}</Badge></td>
                <td className="px-4 py-3">
                  <button onClick={() => suspend(d.id, d.status)}
                    className="text-xs text-tx-2 hover:text-brand transition">
                    {d.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Discount" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
                {['Sibling','Scholarship','Referral','Staff','Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Amount (USD/mo) *</label>
              <input required type="number" min="0" value={form.amount_usd} onChange={e => setForm(f => ({ ...f, amount_usd: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="e.g. 20" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Reason</label>
            <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" placeholder="Brief reason…" />
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
            <button type="submit" className="px-4 py-2 bg-brand text-white rounded-btn text-sm font-600 hover:bg-brand-deep">Add</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
