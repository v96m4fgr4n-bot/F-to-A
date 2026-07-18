'use client'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Ic } from '@/components/ui/Icon'
import { formatCurrency, formatDate } from '@/lib/utils'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LEDGER_GRID = '110px 2.5fr .9fr 1fr .8fr'

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

  const Ledger = ({ entries, kind }: { entries: any[]; kind: 'income' | 'expense' }) => (
    <div className="data-table">
      <div className="ledger-head" style={{ gridTemplateColumns: LEDGER_GRID }}>
        <span>Date</span><span>Description</span><span>Category</span><span>Reference</span><span style={{ textAlign: 'right' }}>Amount</span>
      </div>
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px 0', fontSize: 13 }}>No entries</div>
      ) : entries.map(e => (
        <div key={e.id} className={`ledger-row ${kind === 'income' ? 'income-row' : 'expense-row'}`} style={{ gridTemplateColumns: LEDGER_GRID }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)' }}>{formatDate(e.entry_date)}</span>
          <span style={{ fontWeight: 700, fontSize: 13.5 }}>{e.description}</span>
          <span>
            <span style={{ fontSize: 11.5, fontWeight: 700, background: kind === 'income' ? '#E8F5E9' : '#FEE2E2', color: kind === 'income' ? 'var(--green)' : 'var(--red)', padding: '2px 8px', borderRadius: 5 }}>
              {e.category ?? '—'}
            </span>
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)' }}>{e.reference ?? '—'}</span>
          <span className={kind === 'income' ? 'ledger-amount-pos' : 'ledger-amount-neg'} style={{ textAlign: 'right' }}>
            {kind === 'income' ? '+' : '-'}{formatCurrency(e.amount)}
          </span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 18px', borderTop: '2px solid var(--border)', fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 16, color: kind === 'income' ? 'var(--green)' : 'var(--red)' }}>
        Total: {kind === 'income' ? '+' : '-'}{formatCurrency(kind === 'income' ? totalIncome : totalExpenses)}
      </div>
    </div>
  )

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-sub">Bookkeeping data for F to A Tutoring · {MONTHS[month]} {year}</p>
        </div>
        <div className="page-actions">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {MONTHS.slice(0, now.getMonth() + 1).map((m, i) => (
              <button key={m} className={'month-btn ' + (month === i ? 'on' : '')} onClick={() => setMonth(i)}>{m}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="page-body">

        {/* Export bar */}
        <div className="export-bar">
          <div className="export-bar-info">
            <div className="export-bar-title">📊 Accountant export — {MONTHS[month]} {year}</div>
            <div className="export-bar-sub">All ledger entries for your accountant or accounting software (Xero, QuickBooks, Sage, Pastel)</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => exportCSV('income')}><Ic n="doc" s={14} /> Income CSV</button>
          <button className="btn btn-ghost btn-sm" onClick={() => exportCSV('expense')}><Ic n="doc" s={14} /> Expenses CSV</button>
          <button className="btn btn-primary" onClick={() => exportCSV('all')}><Ic n="doc" s={15} /> Full ledger CSV</button>
        </div>

        {/* P&L strip */}
        <div className="acc-pl-grid">
          <div className="acc-pl-card" style={{ borderTop: '3px solid var(--green)' }}>
            <div className="acc-pl-label">Total income</div>
            <div className="acc-pl-val" style={{ color: 'var(--green)' }}>{formatCurrency(totalIncome)}</div>
            <div className="acc-pl-sub">{income.length} transactions</div>
          </div>
          <div className="acc-pl-card" style={{ borderTop: '3px solid var(--red)' }}>
            <div className="acc-pl-label">Total expenses</div>
            <div className="acc-pl-val" style={{ color: 'var(--red)' }}>{formatCurrency(totalExpenses)}</div>
            <div className="acc-pl-sub">{expenses.length} line items</div>
          </div>
          <div className="acc-pl-card" style={{ borderTop: '3px solid var(--blue)' }}>
            <div className="acc-pl-label">Gross profit</div>
            <div className="acc-pl-val" style={{ color: 'var(--blue)' }}>{formatCurrency(grossProfit)}</div>
            <div className="acc-pl-sub">{netMargin}% net margin</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="acc-tabs">
          {([['pl', 'P&L Summary'], ['income', 'Income ledger'], ['expense', 'Expense ledger'], ['tax', 'Tax summary']] as const).map(([id, label]) => (
            <button key={id} className={'acc-tab ' + (tab === id ? 'on' : '')} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {/* P&L summary */}
        {tab === 'pl' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <div style={{ marginBottom: 14 }}><div className="card-title">Income breakdown</div></div>
              {income.map(e => (
                <div key={e.id} className="tax-row">
                  <span className="tax-label">{e.description}</span>
                  <span style={{ fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--mono)' }}>+{formatCurrency(e.amount)}</span>
                </div>
              ))}
              {income.length === 0 && !loading && <div style={{ color: 'var(--text-3)', fontSize: 13, padding: '10px 0' }}>No income entries</div>}
              <div className="tax-row" style={{ fontWeight: 800, borderTop: '2px solid var(--border)', paddingTop: 10 }}>
                <span>Total income</span><span style={{ color: 'var(--green)', fontFamily: 'var(--mono)' }}>+{formatCurrency(totalIncome)}</span>
              </div>
            </div>
            <div className="card">
              <div style={{ marginBottom: 14 }}><div className="card-title">Expense breakdown</div></div>
              {expenses.map(e => (
                <div key={e.id} className="tax-row">
                  <span className="tax-label">{e.description}</span>
                  <span style={{ fontWeight: 800, color: 'var(--red)', fontFamily: 'var(--mono)' }}>-{formatCurrency(e.amount)}</span>
                </div>
              ))}
              {expenses.length === 0 && !loading && <div style={{ color: 'var(--text-3)', fontSize: 13, padding: '10px 0' }}>No expense entries</div>}
              <div className="tax-row" style={{ fontWeight: 800, borderTop: '2px solid var(--border)', paddingTop: 10 }}>
                <span>Total expenses</span><span style={{ color: 'var(--red)', fontFamily: 'var(--mono)' }}>-{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
            <div className="card" style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">Gross profit — {MONTHS[month]} {year}</span>
              <span style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 20, color: grossProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {grossProfit >= 0 ? '+' : ''}{formatCurrency(grossProfit)}
              </span>
            </div>
          </div>
        )}

        {/* Income ledger */}
        {tab === 'income' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal('income')}><Ic n="plus" s={13} /> Add income</button>
            </div>
            <Ledger entries={income} kind="income" />
          </div>
        )}

        {/* Expense ledger */}
        {tab === 'expense' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-sm" style={{ background: 'var(--red)', color: '#fff' }} onClick={() => setShowModal('expense')}><Ic n="plus" s={13} /> Add expense</button>
            </div>
            <Ledger entries={expenses} kind="expense" />
          </div>
        )}

        {/* Tax summary */}
        {tab === 'tax' && (
          <div className="tax-grid">
            <div className="tax-card">
              <div style={{ marginBottom: 14 }}><div className="card-title">VAT summary</div><div className="card-sub">Zimbabwe — 14.5% VAT</div></div>
              {[
                ['Gross taxable income', formatCurrency(totalIncome)],
                ['VAT collected (14.5%)', formatCurrency(Math.round(totalIncome * 0.145))],
                ['Filing period', `${MONTHS[month]} ${year}`],
              ].map(([l, v]) => (
                <div key={l} className="tax-row"><span className="tax-label">{l}</span><span className="tax-val">{v}</span></div>
              ))}
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF3C7', borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: '#b45309' }}>
                ⚠ Export full ledger to prepare your VAT return
              </div>
            </div>
            <div className="tax-card">
              <div style={{ marginBottom: 14 }}><div className="card-title">Income tax estimate</div><div className="card-sub">Annual tax provision</div></div>
              {[
                ['Gross profit (' + MONTHS[month] + ')', formatCurrency(grossProfit)],
                ['Estimated tax rate', '25%'],
                ['Income tax (25%)', formatCurrency(Math.round(grossProfit * 0.25))],
                ['Net after tax', formatCurrency(Math.round(grossProfit * 0.75))],
              ].map(([l, v]) => (
                <div key={l} className="tax-row"><span className="tax-label">{l}</span><span className="tax-val">{v}</span></div>
              ))}
              <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 12 }}>Estimates based on Zimbabwe tax rates. Consult a tax professional.</p>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!showModal} onClose={() => setShowModal(null)} title={showModal === 'income' ? 'Add Income Entry' : 'Add Expense Entry'} size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Description *</label>
            <input required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="s-inp" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Category</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="s-inp" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Amount ($) *</label>
              <input required type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="s-inp" /></div>
          </div>
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Date *</label>
            <input required type="date" value={form.entry_date} onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))} className="s-inp" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(null)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-sm" style={{ background: showModal === 'income' ? 'var(--green)' : 'var(--red)', color: '#fff' }}>Add Entry</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
