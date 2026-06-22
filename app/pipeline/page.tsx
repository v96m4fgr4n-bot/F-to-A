'use client'
import { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import type { PipelineStage } from '@/types'

const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'inquiry', label: 'Inquiry', color: 'border-purple' },
  { key: 'matching', label: 'Matching', color: 'border-brand' },
  { key: 'trial', label: 'Trial Booked', color: 'border-orange' },
  { key: 'active', label: 'Active', color: 'border-green' },
  { key: 'churned', label: 'Churned', color: 'border-red' },
]

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
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Pipeline</h1>
          <p className="text-tx-2 text-sm mt-1">{cards.length} total leads</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-brand text-white px-4 py-2 rounded-btn text-sm font-600 hover:bg-brand-deep transition">
          + Add Inquiry
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(({ key, label, color }) => (
          <div key={key} className="flex-shrink-0 w-60">
            <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${color}`}>
              <span className="text-sm font-700 text-tx">{label}</span>
              <span className="text-xs font-600 text-tx-2">{byStage(key).length}</span>
            </div>
            <div className="space-y-2">
              {loading ? (
                <div className="skeleton h-24 rounded-card" />
              ) : byStage(key).length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-card p-4 text-center text-tx-3 text-xs">Empty</div>
              ) : byStage(key).map(card => (
                <div key={card.id} className="bg-surface rounded-card border border-border p-3 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar name={card.parent_name ?? 'Unknown'} size="sm" />
                    <div>
                      <p className="font-600 text-tx text-xs">{card.learner?.name ?? 'Prospective'}</p>
                      <p className="text-tx-3 text-[11px]">{card.parent_name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(card.subjects ?? []).map((s: string) => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 bg-bg border border-border rounded-full text-tx-2">{s}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-tx-3 mb-2">{formatDate(card.moved_at)}</p>
                  {card.churn_reason && <p className="text-[10px] text-red">{card.churn_reason}</p>}
                  <select
                    value={card.stage}
                    onChange={e => moveStage(card.id, e.target.value as PipelineStage)}
                    className="w-full mt-1 border border-border rounded px-2 py-1 text-[11px] text-tx focus:outline-none focus:border-brand">
                    {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Inquiry" size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Parent Name *</label>
            <input required value={form.parent_name} onChange={e => setForm(f => ({ ...f, parent_name: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Phone</label>
            <input value={form.parent_phone} onChange={e => setForm(f => ({ ...f, parent_phone: e.target.value }))}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Subjects (comma-separated)</label>
            <input value={form.subjects} onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))}
              placeholder="Maths, English" className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-btn text-sm text-tx-2">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand text-white rounded-btn text-sm font-600">Add</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!churnModal} onClose={() => setChurnModal(null)} title="Churn Reason" size="sm">
        <div className="space-y-4">
          <div><label className="block text-xs font-600 text-tx-2 mb-1">Why did this lead churn?</label>
            <textarea value={churnReason} onChange={e => setChurnReason(e.target.value)} rows={3}
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand resize-none" /></div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setChurnModal(null)} className="px-4 py-2 border border-border rounded-btn text-sm text-tx-2">Cancel</button>
            <button onClick={handleChurn} className="px-4 py-2 bg-red text-white rounded-btn text-sm font-600">Mark Churned</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
