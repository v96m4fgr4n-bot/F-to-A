'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Modal } from '@/components/ui/Modal'
import { Drawer } from '@/components/ui/Drawer'
import { SearchBox } from '@/components/ui/SearchBox'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Learner } from '@/types'

const STATUSES = ['all', 'active', 'paused', 'pending', 'churned']
const PLANS = ['intensive', 'standard', 'starter', 'payg', 'inquiry']
const MRR_MAP: Record<string, number> = { intensive: 280, standard: 180, starter: 100, payg: 60, inquiry: 0 }

export default function LearnersPage() {
  const [learners, setLearners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [drawer, setDrawer] = useState<any>(null)
  const [form, setForm] = useState({ name: '', grade: '', subject: '', plan: 'standard', parent_name: '', parent_phone: '', parent_email: '' })
  const { show, ToastEl } = useToast()

  const load = (q = search, s = status) => {
    setLoading(true)
    fetch(`/api/learners?search=${q}&status=${s}`).then(r => r.json()).then(r => {
      setLearners(r.data ?? [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const handleSearch = (q: string) => { setSearch(q); load(q, status) }
  const handleStatus = (s: string) => { setStatus(s); load(search, s) }

  const handleEnrol = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/learners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, grade: Number(form.grade), mrr: MRR_MAP[form.plan] ?? 0 })
    })
    if (res.ok) { setShowModal(false); load(); show('Learner enrolled successfully') }
    else show('Failed to enrol learner', 'error')
  }

  const handleUpdate = async (id: string, patch: any) => {
    const res = await fetch(`/api/learners/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch)
    })
    if (res.ok) { load(); show('Updated') }
  }

  return (
    <div>
      {ToastEl}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Learners</h1>
          <p className="text-tx-2 text-sm mt-1">{learners.length} learners total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-brand text-white px-4 py-2 rounded-btn text-sm font-600 hover:bg-brand-deep transition">
          + Enrol Learner
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <SearchBox placeholder="Search by name or subject…" onSearch={handleSearch} className="w-64" />
        <div className="flex gap-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => handleStatus(s)}
              className={`px-3 py-1.5 rounded-btn text-xs font-600 capitalize transition ${status === s ? 'bg-tx text-white' : 'bg-surface border border-border text-tx-2 hover:text-tx'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg">
              {['Learner', 'Grade', 'Subject', 'Tutor', 'Plan', 'Progress', 'MRR', 'Status'].map(h => (
                <th key={h} className="text-left text-xs text-tx-3 font-600 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-4"><TableSkeleton rows={6} cols={8} /></td></tr>
            ) : learners.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-tx-3 py-12">No learners found</td></tr>
            ) : (
              learners.map(l => (
                <tr key={l.id} onClick={() => setDrawer(l)} className="border-b border-border/50 hover:bg-bg transition cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={l.name} size="sm" />
                      <span className="font-600 text-tx">{l.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-tx-2">{l.grade ? `Grade ${l.grade}` : '—'}</td>
                  <td className="px-4 py-3 text-tx-2">{l.subject ?? '—'}</td>
                  <td className="px-4 py-3 text-tx-2">{l.tutor?.name ?? '—'}</td>
                  <td className="px-4 py-3"><Badge value={l.plan ?? 'inquiry'} /></td>
                  <td className="px-4 py-3 w-36"><ProgressBar value={l.progress ?? 0} /></td>
                  <td className="px-4 py-3 font-mono font-600 text-tx">{formatCurrency(l.mrr)}</td>
                  <td className="px-4 py-3"><Badge value={l.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Enrol modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Enrol Learner" size="md">
        <form onSubmit={handleEnrol} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Grade</label>
              <input type="number" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Subject</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Plan</label>
              <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
                {PLANS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Parent Name</label>
            <input value={form.parent_name} onChange={e => setForm(f => ({ ...f, parent_name: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Parent Phone</label>
              <input value={form.parent_phone} onChange={e => setForm(f => ({ ...f, parent_phone: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Parent Email</label>
              <input type="email" value={form.parent_email} onChange={e => setForm(f => ({ ...f, parent_email: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-btn text-sm text-tx-2 hover:text-tx">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand text-white rounded-btn text-sm font-600 hover:bg-brand-deep">Enrol</button>
          </div>
        </form>
      </Modal>

      {/* Learner drawer */}
      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.name ?? ''}>
        {drawer && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar name={drawer.name} size="lg" />
              <div>
                <p className="font-700 text-tx">{drawer.name}</p>
                <p className="text-tx-2 text-sm">{drawer.subject} · Grade {drawer.grade}</p>
                <div className="mt-1"><Badge value={drawer.status} /></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Plan', <Badge key="plan" value={drawer.plan ?? 'inquiry'} />],
                ['MRR', formatCurrency(drawer.mrr)],
                ['Tutor', drawer.tutor?.name ?? '—'],
                ['Enrolled', formatDate(drawer.enrolled_at)],
                ['Parent', drawer.parent_name ?? '—'],
                ['Phone', drawer.parent_phone ?? '—'],
                ['Email', drawer.parent_email ?? '—'],
              ].map(([label, val]) => (
                <div key={String(label)}>
                  <p className="text-xs text-tx-3 font-600 mb-0.5">{label}</p>
                  <p className="text-tx font-500">{val}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs text-tx-3 font-600 mb-1">Progress</p>
              <ProgressBar value={drawer.progress ?? 0} />
            </div>

            <div>
              <p className="text-xs text-tx-3 font-600 mb-2">Change Status</p>
              <div className="flex flex-wrap gap-1">
                {['active', 'paused', 'pending', 'churned'].map(s => (
                  <button key={s} onClick={() => { handleUpdate(drawer.id, { status: s }); setDrawer({ ...drawer, status: s }) }}
                    className={`px-3 py-1 rounded-full text-xs font-600 capitalize border transition ${drawer.status === s ? 'bg-tx text-white border-tx' : 'border-border text-tx-2 hover:text-tx'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {drawer.notes && (
              <div>
                <p className="text-xs text-tx-3 font-600 mb-1">Notes</p>
                <p className="text-sm text-tx-2 bg-bg rounded-btn p-3">{drawer.notes}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
