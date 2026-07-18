'use client'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Ic } from '@/components/ui/Icon'
import { formatCurrency, formatDate } from '@/lib/utils'

const PLAN_META: Record<string, { label: string; color: string }> = {
  intensive: { label: 'Intensive 3×/wk', color: '#E0563B' },
  standard: { label: 'Standard 2×/wk', color: '#1C8FD6' },
  starter: { label: 'Starter 1×/wk', color: '#1FA871' },
  payg: { label: 'Pay-as-you-go', color: '#D4A017' },
}

export default function FinancesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [learners, setLearners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ learner_id: '', description: '', amount: '', invoice_date: '', due_date: '' })
  const { show, ToastEl } = useToast()

  const load = () => {
    const url = statusFilter !== 'all' ? `/api/invoices?status=${statusFilter}` : '/api/invoices'
    Promise.all([fetch(url), fetch('/api/learners')]).then(async ([i, l]) => {
      const [id, ld] = await Promise.all([i.json(), l.json()])
      setInvoices(id.data ?? []); setLearners(ld.data ?? []); setLoading(false)
    })
  }
  useEffect(() => { load() }, [statusFilter])

  const active = learners.filter(l => l.status === 'active')
  const mrr = active.reduce((s: number, l: any) => s + (l.mrr ?? 0), 0)
  const avgPerLearner = active.length ? Math.round(mrr / active.length) : 0

  const planBreakdown = Object.entries(PLAN_META).map(([id, meta]) => {
    const group = active.filter(l => l.plan === id)
    return { id, ...meta, count: group.length, total: group.reduce((s: number, l: any) => s + (l.mrr ?? 0), 0) }
  }).filter(p => p.count > 0)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, amount: Number(form.amount) }) })
    setShowModal(false); load(); show('Invoice created')
  }

  const markPaid = async (id: string) => {
    await fetch(`/api/invoices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'paid' }) })
    load(); show('Invoice marked as paid')
  }

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <div className="page-title">Finances</div>
          <div className="page-sub">Revenue, invoices and plan breakdown</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm">Export CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Ic n="doc" s={14} /> Generate invoice</button>
        </div>
      </div>
      <div className="page-body">
        <div className="finance-grid">
          <div className="mrr-hero">
            <div className="mrr-label">Monthly recurring revenue</div>
            <div className="mrr-val">{formatCurrency(mrr)}</div>
            <div className="mrr-delta"><Ic n="up" s={15} /> +$160 vs last month (+4.3%)</div>
            <div className="mrr-breakdown">
              <div className="mrr-bd-item"><div className="mrr-bd-val">{formatCurrency(mrr * 12)}</div><div className="mrr-bd-label">ARR</div></div>
              <div className="mrr-bd-item"><div className="mrr-bd-val">{formatCurrency(avgPerLearner)}</div><div className="mrr-bd-label">Avg per learner</div></div>
              <div className="mrr-bd-item"><div className="mrr-bd-val">{active.length}</div><div className="mrr-bd-label">Active learners</div></div>
            </div>
          </div>
          <div className="card">
            <div style={{ marginBottom: 14 }}><div className="card-title">Plan breakdown</div></div>
            {planBreakdown.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: p.color, flexShrink: 0 }}></span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{p.label}</span>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{p.count} learners</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 800 }}>{formatCurrency(p.total)}</span>
              </div>
            ))}
            {planBreakdown.length === 0 && !loading && (
              <div style={{ color: 'var(--text-3)', fontSize: 13, padding: '12px 0' }}>No active plans</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontWeight: 800, fontSize: 14 }}>
              <span>Total MRR</span><span style={{ fontFamily: 'var(--mono)', color: 'var(--blue)' }}>{formatCurrency(mrr)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div><div className="card-title">Invoice history</div><div className="card-sub">{invoices.length} invoices</div></div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'paid', 'due', 'overdue'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={'month-btn ' + (statusFilter === s ? 'on' : '')} style={{ textTransform: 'capitalize' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: 160, borderRadius: 10 }} />
          ) : invoices.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: 13 }}>No invoices found</div>
          ) : invoices.map(inv => (
            <div key={inv.id} className="invoice-row">
              <div className="inv-icon"><Ic n="doc" s={16} /></div>
              <div className="inv-main">
                <div className="inv-name">{inv.learner?.name ?? '—'}</div>
                <div className="inv-date">{inv.description ?? '—'}{inv.reference ? ' · ' + inv.reference : ''}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, marginRight: 8 }}>{formatDate(inv.due_date)}</div>
              <div className="inv-amount">{formatCurrency(inv.amount)}</div>
              <span className={'inv-badge inv-' + inv.status}>{inv.status}</span>
              {inv.status !== 'paid' && (
                <button onClick={() => markPaid(inv.id)} className="btn btn-ghost btn-sm">Mark paid</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Generate Invoice">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Learner *</label>
            <select required value={form.learner_id} onChange={e => setForm(f => ({ ...f, learner_id: e.target.value }))} className="s-inp">
              <option value="">Select…</option>
              {learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select></div>
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="s-inp" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Amount ($) *</label>
              <input required type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="s-inp" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Invoice Date</label>
              <input type="date" value={form.invoice_date} onChange={e => setForm(f => ({ ...f, invoice_date: e.target.value }))} className="s-inp" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Due Date</label>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="s-inp" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Generate</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
