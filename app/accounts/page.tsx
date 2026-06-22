'use client'
import { useEffect, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency, formatDate } from '@/lib/utils'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AccountsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year] = useState(now.getFullYear())
  const [tab, setTab] = useState<'pl' | 'income' | 'expense' | 'tax'>('pl')
  const [ledger, setLedger] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState<'income' | 'expense' | null>(null)
  const [form, setForm] = useState({ description: '', category: '', amount: '', entry_date: '' })
  const { show, ToastEl } = useToast()

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

  const load = () => {
    fetch(`/api/accounts/ledger?month=${monthKey}`).then(r => r.json()).then(r => { setLedger(r.data ?? []); setLoading(false) })
  }
  useEffect(() => { load() }, [monthKey])

  const income = ledger.filter(e => e.type === 'income')
  const expenses = ledger.filter(e => e.type === 'expense')
  const totalIncome = income.reduce((s, e) => s + e.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const grossProfit = totalIncome - totalExpenses
  const netMargin = totalIncome ? Math.round((grossProfit / totalIncome) * 100) : 0

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const type = showModal
    await fetch('/api/accounts/ledger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, type, amount: Number(form.amount) }) })
    setShowModal(null); setForm({ description: '', category: '', amount: '', entry_date: '' }); load(); show('Entry added')
  }

  const exportCSV = (type: string) => {
    const data = type === 'all' ? ledger : ledger.filter(e => e.type === type)
    const headers = ['Date', 'Type', 'Description', 'Category', 'Amount', 'Reference']
    const rows = data.map(e => [e.entry_date, e.type, e.description, e.category ?? '', e.amount, e.reference ?? ''])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ledger-${monthKey}-${type}.csv`
    a.click()
  }

  const EntryTable = ({ entries }: { entries: any[] }) => (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border bg-bg">
          {['Date', 'Description', 'Category', 'Amount', 'Reference'].map(h => (
            <th key={h} className="text-left text-xs text-tx-3 font-600 px-4 py-3">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {entries.length === 0 ? (
          <tr><td colSpan={5} className="text-center text-tx-3 py-8">No entries</td></tr>
        ) : entries.map(e => (
          <tr key={e.id} className="border-b border-border/50 hover:bg-bg transition">
            <td className="px-4 py-3 font-mono text-xs text-tx-2">{formatDate(e.entry_date)}</td>
            <td className="px-4 py-3 text-tx font-500">{e.description}</td>
            <td className="px-4 py-3 text-tx-2">{e.category ?? '—'}</td>
            <td className={`px-4 py-3 font-mono font-700 ${e.type === 'income' ? 'text-green' : 'text-red'}`}>
              {e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount)}
            </td>
            <td className="px-4 py-3 font-mono text-xs text-tx-3">{e.reference ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div>
      {ToastEl}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Accounts</h1>
          <p className="text-tx-2 text-sm mt-1">P&L and ledger for {MONTHS[month]} {year}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV('income')} className="px-3 py-2 border border-border rounded-btn text-xs font-600 text-tx-2 hover:text-tx">Income CSV</button>
          <button onClick={() => exportCSV('expense')} className="px-3 py-2 border border-border rounded-btn text-xs font-600 text-tx-2 hover:text-tx">Expenses CSV</button>
          <button onClick={() => exportCSV('all')} className="px-3 py-2 bg-brand text-white rounded-btn text-xs font-600 hover:bg-brand-deep">Full Ledger CSV</button>
        </div>
      </div>

      {/* Month selector */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {MONTHS.slice(0, now.getMonth() + 1).map((m, i) => (
          <button key={m} onClick={() => setMonth(i)}
            className={`px-3 py-1.5 rounded-btn text-xs font-600 transition ${month === i ? 'bg-tx text-white' : 'bg-surface border border-border text-tx-2 hover:text-tx'}`}>
            {m}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        <KpiCard label="Total Income" value={formatCurrency(totalIncome)} accent="bg-green" />
        <KpiCard label="Total Expenses" value={formatCurrency(totalExpenses)} accent="bg-red" />
        <KpiCard label="Gross Profit" value={formatCurrency(grossProfit)} accent={grossProfit >= 0 ? 'bg-green' : 'bg-red'} />
        <KpiCard label="Net Margin" value={`${netMargin}%`} accent="bg-brand" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {[['pl', 'P&L Summary'], ['income', 'Income Ledger'], ['expense', 'Expense Ledger'], ['tax', 'Tax Summary']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as any)}
            className={`px-4 py-2 rounded-btn text-sm font-600 transition ${tab === k ? 'bg-tx text-white' : 'bg-surface border border-border text-tx-2 hover:text-tx'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-card border border-border overflow-hidden">
        {tab === 'income' && (
          <>
            <div className="flex justify-end p-4 border-b border-border">
              <button onClick={() => setShowModal('income')} className="px-3 py-1.5 bg-green text-white rounded-btn text-xs font-600">+ Add Income</button>
            </div>
            <EntryTable entries={income} />
          </>
        )}
        {tab === 'expense' && (
          <>
            <div className="flex justify-end p-4 border-b border-border">
              <button onClick={() => setShowModal('expense')} className="px-3 py-1.5 bg-red text-white rounded-btn text-xs font-600">+ Add Expense</button>
            </div>
            <EntryTable entries={expenses} />
          </>
        )}
        {tab === 'pl' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-700 text-tx mb-3">Income</h3>
              <div className="space-y-2">
                {income.map(e => (
                  <div key={e.id} className="flex justify-between text-sm py-1 border-b border-border/50">
                    <span className="text-tx-2">{e.description}</span>
                    <span className="font-mono font-600 text-green">+{formatCurrency(e.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-700 text-tx pt-1">
                  <span>Total Income</span><span className="font-mono text-green">{formatCurrency(totalIncome)}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-700 text-tx mb-3">Expenses</h3>
              <div className="space-y-2">
                {expenses.map(e => (
                  <div key={e.id} className="flex justify-between text-sm py-1 border-b border-border/50">
                    <span className="text-tx-2">{e.description}</span>
                    <span className="font-mono font-600 text-red">-{formatCurrency(e.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-700 text-tx pt-1">
                  <span>Total Expenses</span><span className="font-mono text-red">{formatCurrency(totalExpenses)}</span>
                </div>
              </div>
            </div>
            <div className="border-t-2 border-border pt-4 flex justify-between font-800 text-lg">
              <span className="text-tx">Gross Profit</span>
              <span className={`font-mono ${grossProfit >= 0 ? 'text-green' : 'text-red'}`}>{formatCurrency(grossProfit)}</span>
            </div>
          </div>
        )}
        {tab === 'tax' && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Gross Revenue', value: formatCurrency(totalIncome) },
                { label: 'VAT (14.5%)', value: formatCurrency(Math.round(totalIncome * 0.145)) },
                { label: 'Income Tax (25%)', value: formatCurrency(Math.round(grossProfit * 0.25)) },
                { label: 'Net After Tax', value: formatCurrency(Math.round(grossProfit * 0.75)) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-bg rounded-btn p-4">
                  <p className="text-xs text-tx-3 font-600 mb-1">{label}</p>
                  <p className="font-800 font-mono text-xl text-tx">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-tx-3">Estimates based on Zimbabwe tax rates. Consult a tax professional.</p>
          </div>
        )}
      </div>

      <Modal open={!!showModal} onClose={() => setShowModal(null)} title={showModal === 'income' ? 'Add Income Entry' : 'Add Expense Entry'} size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Description *</label>
            <input required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Category</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Amount ($) *</label>
              <input required type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
          </div>
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Date *</label>
            <input required type="date" value={form.entry_date} onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(null)} className="px-4 py-2 border border-border rounded-btn text-sm text-tx-2">Cancel</button>
            <button type="submit" className={`px-4 py-2 text-white rounded-btn text-sm font-600 ${showModal === 'income' ? 'bg-green' : 'bg-red'}`}>Add Entry</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
