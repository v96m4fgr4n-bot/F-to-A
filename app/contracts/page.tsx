'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { Ic } from '@/components/ui/Icon'
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
      <div className="page-header">
        <div>
          <div className="page-title">Contracts</div>
          <div className="page-sub">Parent agreements, tutor contracts and consent forms</div>
        </div>
        <div className="page-actions">
          <select
            style={{ border: '1px solid var(--border)', borderRadius: 9, padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font)', outline: 'none', textTransform: 'capitalize' }}
            value={statusFilter} onChange={e => handleStatusFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm">Send e-sign request</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Ic n="plus" s={14} /> Upload document</button>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
          {([
            ['Signed', signed, 'var(--green)'],
            ['Pending', pending, 'var(--orange)'],
            ['Expired', expired, 'var(--red)'],
          ] as const).map(([l, v, c]) => (
            <div key={l} className="kpi-card blue" style={{ flex: 1 }}>
              <div className="kpi-label">{l}</div>
              <div className="kpi-val" style={{ fontSize: 28, color: c }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="data-table">
          <div className="contract-head">
            <span>Party</span><span>Document type</span><span>Uploaded</span><span>Expires</span><span>Status</span><span></span>
          </div>
          {loading ? (
            <div style={{ padding: 16 }}><TableSkeleton rows={5} cols={6} /></div>
          ) : contracts.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: 13 }}>No contracts found</div>
          ) : contracts.map(c => (
            <div key={c.id} className="contract-row">
              <span>
                <span style={{ display: 'block', fontWeight: 700 }}>{c.entity_name ?? c.learner?.name ?? c.tutor?.name ?? '—'}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--text-3)', textTransform: 'capitalize' }}>{c.entity_type}</span>
              </span>
              <span style={{ color: 'var(--text-2)', fontSize: 13 }}>
                {c.document_type ?? '—'}
                {c.file_url && (
                  <a href={c.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', fontSize: 12, fontWeight: 700, marginLeft: 6, textDecoration: 'none' }}>View ↗</a>
                )}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>{formatDate(c.uploaded_at)}</span>
              <span style={{ fontSize: 12, color: c.status === 'expired' ? 'var(--red)' : c.expires_at ? 'var(--text-2)' : 'var(--text-3)', fontWeight: c.status === 'expired' ? 700 : 400 }}>
                {c.expires_at ? formatDate(c.expires_at) : '—'}
              </span>
              <span><Badge value={c.status} /></span>
              <span style={{ display: 'flex', gap: 4 }}>
                {c.status === 'pending' && (
                  <>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--green)', borderColor: 'var(--green)' }}
                      onClick={() => handlePatch(c.id, { status: 'signed', signed_at: new Date().toISOString() })}>
                      Signed
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleSendEsign(c)}>E-Sign</button>
                  </>
                )}
                {c.status === 'signed' && (
                  <button className="btn btn-ghost btn-sm" onClick={() => handlePatch(c.id, { status: 'expired' })}>Expire</button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Upload Contract" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Entity Name *</label>
              <input required value={form.entity_name} onChange={e => setForm(f => ({ ...f, entity_name: e.target.value }))} className="s-inp" />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Entity Type</label>
              <select value={form.entity_type} onChange={e => setForm(f => ({ ...f, entity_type: e.target.value }))} className="s-inp">
                <option value="learner">Learner</option>
                <option value="tutor">Tutor</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          {form.entity_type === 'learner' && (
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Link to Learner</label>
              <select value={form.learner_id} onChange={e => setForm(f => ({ ...f, learner_id: e.target.value }))} className="s-inp">
                <option value="">— optional —</option>
                {learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          )}
          {form.entity_type === 'tutor' && (
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Link to Tutor</label>
              <select value={form.tutor_id} onChange={e => setForm(f => ({ ...f, tutor_id: e.target.value }))} className="s-inp">
                <option value="">— optional —</option>
                {tutors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Document Type</label>
            <select value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))} className="s-inp">
              {DOC_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">File URL (Supabase Storage)</label>
            <input value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://…" className="s-inp" />
          </div>
          <div>
            <label className="block text-xs font-600 text-tx-2 mb-1">Expiry Date</label>
            <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className="s-inp" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Upload</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
