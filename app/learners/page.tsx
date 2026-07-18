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
import { Ic } from '@/components/ui/Icon'
import { formatCurrency, formatDate } from '@/lib/utils'

const PLANS = ['intensive', 'standard', 'starter', 'payg', 'inquiry']
const MRR_MAP: Record<string, number> = { intensive: 280, standard: 180, starter: 100, payg: 60, inquiry: 0 }
const GRID = '2fr 1fr 1.2fr 1fr .9fr .7fr .6fr'

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

  const activeMrr = learners.filter(l => l.status === 'active').reduce((s, l) => s + (l.mrr ?? 0), 0)

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <div className="page-title">Learners</div>
          <div className="page-sub">{learners.length} shown · {formatCurrency(activeMrr)}/mo active revenue</div>
        </div>
        <div className="page-actions">
          <SearchBox placeholder="Search learners…" onSearch={handleSearch} />
          <select
            style={{ border: '1px solid var(--border)', borderRadius: 9, padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font)', outline: 'none' }}
            value={status} onChange={e => handleStatus(e.target.value)}>
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="pending">Pending</option>
            <option value="churned">Churned</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Ic n="plus" s={14} /> Enrol learner</button>
        </div>
      </div>
      <div className="page-body">
        <div className="data-table">
          <div className="dt-head" style={{ gridTemplateColumns: GRID }}>
            <span>Learner</span><span>Subject</span><span>Tutor</span><span>Plan</span><span>Progress</span><span>MRR</span><span>Status</span>
          </div>
          {loading ? (
            <div style={{ padding: 16 }}><TableSkeleton rows={6} cols={7} /></div>
          ) : learners.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '48px 0', fontSize: 13 }}>No learners found</div>
          ) : (
            learners.map(l => (
              <div key={l.id} className="dt-row" style={{ gridTemplateColumns: GRID }} onClick={() => setDrawer(l)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Avatar name={l.name} size="md" />
                  <span>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 13.5 }}>{l.name}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--text-3)' }}>{l.grade ? `Grade ${l.grade}` : '—'}</span>
                  </span>
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>{l.subject ?? '—'}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{l.tutor?.name ?? '—'}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--blue)', textTransform: 'capitalize' }}>{l.plan ?? 'inquiry'}</span>
                <span>
                  {l.progress != null
                    ? <ProgressBar value={l.progress} />
                    : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: (l.mrr ?? 0) > 0 ? 'var(--text)' : 'var(--text-3)' }}>
                  {(l.mrr ?? 0) > 0 ? formatCurrency(l.mrr) : '—'}
                </span>
                <span><Badge value={l.status} /></span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Enrol modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Enrol Learner" size="md">
        <form onSubmit={handleEnrol} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="s-inp" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Grade</label>
              <input type="number" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} className="s-inp" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Subject</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="s-inp" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Plan</label>
              <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} className="s-inp">
                {PLANS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Parent Name</label>
            <input value={form.parent_name} onChange={e => setForm(f => ({ ...f, parent_name: e.target.value }))} className="s-inp" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Parent Phone</label>
              <input value={form.parent_phone} onChange={e => setForm(f => ({ ...f, parent_phone: e.target.value }))} className="s-inp" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Parent Email</label>
              <input type="email" value={form.parent_email} onChange={e => setForm(f => ({ ...f, parent_email: e.target.value }))} className="s-inp" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Enrol</button>
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
