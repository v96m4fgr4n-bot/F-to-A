'use client'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Ic } from '@/components/ui/Icon'
import { formatDate } from '@/lib/utils'
import type { PipelineStage } from '@/types'

const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'inquiry', label: 'Inquiry', color: '#7A5AF8' },
  { key: 'matching', label: 'Matching', color: '#F26F1F' },
  { key: 'trial', label: 'Trial booked', color: '#1C8FD6' },
  { key: 'active', label: 'Active', color: '#1FA871' },
  { key: 'churned', label: 'Churned', color: '#E0563B' },
]

const SOURCE_COLORS: Record<string, { bg: string; color: string }> = {
  WhatsApp: { bg: '#DCF8E4', color: '#128C7E' },
  Instagram: { bg: '#FEE2E2', color: '#E0563B' },
  Website: { bg: '#EBF6FF', color: '#1C8FD6' },
  School: { bg: '#F2EEFF', color: '#7A5AF8' },
  Referral: { bg: '#FEF3C7', color: '#b45309' },
}

export default function PipelinePage() {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ parent_name: '', parent_phone: '', subjects: '' })
  const [churnModal, setChurnModal] = useState<{ id: string; stage: string } | null>(null)
  const [churnReason, setChurnReason] = useState('')
  const { show, ToastEl } = useToast()

  const load = () => {
    fetch('/api/pipeline').then(r => r.json()).then(r => { setCards(r.data ?? []); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const moveStage = async (id: string, stage: PipelineStage) => {
    if (stage === 'churned') { setChurnModal({ id, stage }); return }
    await fetch(`/api/pipeline/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage }) })
    load(); show(`Moved to ${stage}`)
  }

  const handleChurn = async () => {
    if (!churnModal) return
    await fetch(`/api/pipeline/${churnModal.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: 'churned', churn_reason: churnReason }) })
    setChurnModal(null); setChurnReason(''); load(); show('Moved to churned')
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/pipeline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean) }) })
    setShowModal(false); setForm({ parent_name: '', parent_phone: '', subjects: '' }); load(); show('Inquiry added')
  }

  const byStage = (stage: string) => cards.filter(c => c.stage === stage)

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <div className="page-title">Enrollment pipeline</div>
          <div className="page-sub">Track families from first inquiry to active learner</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm">Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Ic n="plus" s={14} /> Add inquiry</button>
        </div>
      </div>
      <div className="page-body">
        <div className="pipeline-board">
          {STAGES.map(col => {
            const colCards = byStage(col.key)
            return (
              <div className="pipeline-col" key={col.key}>
                <div className="pipeline-col-head">
                  <span className="pipeline-col-title" style={{ color: col.color }}>{col.label}</span>
                  <span className="pipeline-count">{colCards.length}</span>
                </div>
                {loading ? (
                  <div className="skeleton" style={{ height: 96, borderRadius: 11 }} />
                ) : colCards.map(card => (
                  <div className="pipeline-card" key={card.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                      <div className="pc-lname">{card.learner?.name ?? 'Prospective'}</div>
                      {card.source && (
                        <span className="src-badge" style={{ background: SOURCE_COLORS[card.source]?.bg ?? 'var(--bg)', color: SOURCE_COLORS[card.source]?.color ?? 'var(--text-2)' }}>
                          {card.source}
                        </span>
                      )}
                    </div>
                    <div className="pc-parent">{card.parent_name}</div>
                    <div className="pc-tags">{(card.subjects ?? []).map((s: string) => <span key={s} className="pc-tag">{s}</span>)}</div>
                    {card.churn_reason && <div style={{ fontSize: 11.5, color: 'var(--red)', fontWeight: 700, marginTop: 5 }}>Reason: {card.churn_reason}</div>}
                    <div className="pc-date">Added {formatDate(card.moved_at)}</div>
                    {col.key !== 'churned' && col.key !== 'active' && (
                      <select
                        style={{ marginTop: 8, width: '100%', fontSize: 11.5, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 7, fontFamily: 'var(--font)', color: 'var(--text-2)', cursor: 'pointer' }}
                        value={card.stage}
                        onChange={e => moveStage(card.id, e.target.value as PipelineStage)}>
                        {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    )}
                  </div>
                ))}
                <button className="pipeline-add-btn" onClick={() => setShowModal(true)}><Ic n="plus" s={13} /> Add</button>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Inquiry" size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Parent Name *</label>
            <input required value={form.parent_name} onChange={e => setForm(f => ({ ...f, parent_name: e.target.value }))} className="s-inp" /></div>
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Phone</label>
            <input value={form.parent_phone} onChange={e => setForm(f => ({ ...f, parent_phone: e.target.value }))} className="s-inp" /></div>
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Subjects (comma-separated)</label>
            <input value={form.subjects} onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))} placeholder="Maths, English" className="s-inp" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Add</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!churnModal} onClose={() => setChurnModal(null)} title="Churn Reason" size="sm">
        <div className="space-y-4">
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Why did this lead churn?</label>
            <textarea value={churnReason} onChange={e => setChurnReason(e.target.value)} rows={3} className="s-inp" style={{ resize: 'none' }} /></div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setChurnModal(null)} className="btn btn-ghost btn-sm">Cancel</button>
            <button onClick={handleChurn} className="btn btn-sm" style={{ background: 'var(--red)', color: '#fff' }}>Mark Churned</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
