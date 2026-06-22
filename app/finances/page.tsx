'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency, formatDate } from '@/lib/utils'

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

  const mrr = learners.filter(l => l.status === 'active').reduce((s: number, l: any) => s + l.mrr, 0)
  const outstanding = invoices.filter(i => i.status !== 'paid').reduce((s: number, i: any) => s + i.amount, 0)
  const collected = invoices.filter(i => i.status === 'paid').reduce((s: number, i: any) => s + i.amount, 0)

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
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Finances</h1>
          <p className="text-tx-2 text-sm mt-1">Invoice management & MRR tracking</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-brand text-white px-4 py-2 rounded-btn text-sm font-600 hover:bg-brand-deep transition">
          + Generate Invoice
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-7">
        <KpiCard label="Monthly Revenue (MRR)" value={formatCurrency(mrr)} accent="bg-green" />
        <KpiCard label="Collected This Month" value={formatCurrency(collected)} accent="bg-brand" />
        <KpiCard label="Outstanding" value={formatCurrency(outstanding)} accent="bg-red" />
      </div>

      <div className="flex gap-1 mb-4">
        {['all', 'paid', 'due', 'overdue'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-btn text-xs font-600 capitalize transition ${statusFilter === s ? 'bg-tx text-white' : 'bg-surface border border-border text-tx-2 hover:text-tx'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg">
              {['Reference', 'Learner', 'Description', 'Amount', 'Invoice Date', 'Due Date', 'Status', ''].map(h => (
                <th key={h} className="text-left text-xs text-tx-3 font-600 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-4"><TableSkeleton rows={5} cols={8} /></td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-tx-3 py-12">No invoices found</td></tr>
            ) : invoices.map(inv => (
              <tr key={inv.id} className="border-b border-border/50 hover:bg-bg transition">
                <td className="px-4 py-3 font-mono text-xs text-tx-2">{inv.reference}</td>
                <td className="px-4 py-3 font-500 text-tx">{inv.learner?.name ?? '—'}</td>
                <td className="px-4 py-3 text-tx-2 max-w-[200px] truncate">{inv.description ?? '—'}</td>
                <td className="px-4 py-3 font-mono font-700 text-tx">{formatCurrency(inv.amount)}</td>
                <td className="px-4 py-3 text-tx-2">{formatDate(inv.invoice_date)}</td>
                <td className="px-4 py-3 text-tx-2">{formatDate(inv.due_date)}</td>
                <td className="px-4 py-3"><Badge value={inv.status} /></td>
                <td className="px-4 py-3">
                  {inv.status !== 'paid' && (
                    <button onClick={() => markPaid(inv.id)} className="text-xs text-green font-600 hover:underline">Mark paid</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Generate Invoice">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Learner *</label>
            <select required value={form.learner_id} onChange={e => setForm(f => ({ ...f, learner_id: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
              <option value="">Select…</option>
              {learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select></div>
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Amount ($) *</label>
              <input required type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Invoice Date</label>
              <input type="date" value={form.invoice_date} onChange={e => setForm(f => ({ ...f, invoice_date: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Due Date</label>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-btn text-sm text-tx-2">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand text-white rounded-btn text-sm font-600">Generate</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
