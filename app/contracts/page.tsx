'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'

const STATUSES = ['all', 'signed', 'pending', 'expired']
const DOC_TYPES = ['Enrolment Agreement', 'Tutoring Contract', 'NDA', 'Payment Agreement', 'Other']

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [learners, setLearners] = useState<any[]>([])
  const [tutors, setTutors] = useState<any[]>([])
  const [form, setForm] = useState({
    entity_name: '', entity_type: 'learner', learner_id: '', tutor_id: '',
    document_type: 'Enrolment Agreement', file_url: '', expires_at: ''
  })
  const { show, ToastEl } = useToast()

  const load = (s = statusFilter) => {
    setLoading(true)
    fetch(`/api/contracts?status=${s}`)
      .then(r => r.json())
      .then(r => { setContracts(r.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
    fetch('/api/learners').then(r => r.json()).then(r => setLearners(r.data ?? []))
    fetch('/api/tutors').then(r => r.json()).then(r => setTutors(r.data ?? []))
  }, [])

  const handleStatusFilter = (s: string) => { setStatusFilter(s); load(s) }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) { setShowModal(false); load(); show('Contract created') }
    else show('Failed to create contract', 'error')
  }

  const handlePatch = async (id: string, patch: any) => {
    const res = await fetch(`/api/contracts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    })
    if (res.ok) { load(); show('Updated') }
    else show('Failed to update', 'error')
  }

  const handleSendEsign = (contract: any) => {
    show(`E-sign request sent to ${contract.entity_name}`)
  }

  const signed = contracts.filter(c => c.status === 'signed').length
  const pending = contracts.filter(c => c.status === 'pending').length
  const expired = contracts.filter(c => c.status === 'expired').length

  return (
    <div>
      {ToastEl}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Contracts</h1>
          <p className="text-tx-2 text-sm mt-1">{contracts.length} total contracts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-brand text-white px-4 py-2 rounded-btn text-sm font-600 hover:bg-brand-deep transition">
          + Upload Contract
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Signed', value: signed, color: 'text-green' },
          { label: 'Pending', value: pending, color: 'text-yellow' },
          { label: 'Expired', value: expired, color: 'text-red' },
        ].map(k => (
          <div key={k.label} className="bg-surface rounded-card border border-border p-5">
            <p className="text-xs text-tx-3 font-600 mb-1">{k.label}</p>
            <p className={`text-3xl font-800 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-5">
        {STATUSES.map(s => (
          <button key={s} onClick={() => handleStatusFilter(s)}
            className={`px-3 py-1.5 rounded-btn text-xs font-600 capitalize transition ${statusFilter === s ? 'bg-tx text-white' : 'bg-surface border border-border text-tx-2 hover:text-tx'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg">
              {['Entity', 'Type', 'Document', 'Uploaded', 'Expires', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs text-tx-3 font-600 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-4"><TableSkeleton rows={5} cols={7} /></td></tr>
            ) : contracts.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-tx-3 py-10">No contracts found</td></tr>
            ) : contracts.map(c => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-bg transition">
                <td className="px-4 py-3">
                  <p className="font-600 text-tx">{c.entity_name ?? c.learner?.name ?? c.tutor?.name ?? '—'}</p>
                  <p className="text-tx-3 text-xs capitalize">{c.entity_type}</p>
                </td>
                <td className="px-4 py-3 text-tx-2 text-xs">{c.document_type ?? '—'}</td>
                <td className="px-4 py-3">
                  {c.file_url ? (
                    <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="text-brand text-xs font-600 hover:underline">View ↗</a>
                  ) : <span className="text-tx-3 text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-tx-2 text-xs">{formatDate(c.uploaded_at)}</td>
                <td className="px-4 py-3 text-tx-2 text-xs">{c.expires_at ? formatDate(c.expires_at) : '—'}</td>
                <td className="px-4 py-3"><Badge value={c.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {c.status === 'pending' && (
                      <>
                        <button onClick={() => handlePatch(c.id, { status: 'signed', signed_at: new Date().toISOString() })}
                          className="text-xs px-2 py-1 rounded-btn border border-green text-green hover:bg-green/10 transition">
                          Signed
                        </button>
                        <button onClick={() => handleSendEsign(c)}
                          className="text-xs px-2 py-1 rounded-btn border border-border text-tx-2 hover:text-tx transition">
                          E-Sign
                        </button>
                      </>
                    )}
                    {c.status === 'signed' && (
                      <button onClick={() => handlePatch(c.id, { status: 'expired' })}
                        className="text-xs px-2 py-1 rounded-btn border border-border text-tx-3 hover:text-red hover:border-red transition">
                        Expire
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Upload Contract" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Entity Name *</label>
              <input required value={form.entity_name} onChange={e => setForm(f => ({ ...f, entity_name: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Entity Type</label>
              <select value={form.entity_type} onChange={e => setForm(f => ({ ...f, entity_type: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
                <option value="learner">Learner</option>
                <option value="tutor">Tutor</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          {form.entity_type === 'learner' && (
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Link to Learner</label>
              <select value={form.learner_id} onChange={e => setForm(f => ({ ...f, learner_id: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
                <option value="">— optional —</option>
                {learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          )}
          {form.entity_type === 'tutor' && (
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Link to Tutor</label>
              <select value={form.tutor_id} onChange={e => setForm(f => ({ ...f, tutor_id: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
                <option value="">— optional —</option>
                {tutors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Document Type</label>
            <select value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
              {DOC_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">File URL (Supabase Storage)</label>
            <input value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))}
              placeholder="https://…"
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Expiry Date</label>
            <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-btn text-sm text-tx-2 hover:text-tx">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand text-white rounded-btn text-sm font-600 hover:bg-brand-deep">Upload</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
