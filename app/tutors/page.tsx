'use client'
import { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Drawer } from '@/components/ui/Drawer'
import { useToast } from '@/components/ui/Toast'

export default function TutorsPage() {
  const [tutors, setTutors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [drawer, setDrawer] = useState<any>(null)
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', subjects: '', rate_per_session: 15 })
  const { show, ToastEl } = useToast()

  const load = () => {
    fetch('/api/tutors').then(r => r.json()).then(r => { setTutors(r.data ?? []); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/tutors', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean) })
    })
    setShowModal(false); load(); show('Tutor added')
  }

  return (
    <div>
      {ToastEl}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-800 text-tx">Tutors</h1>
          <p className="text-tx-2 text-sm mt-1">{tutors.length} tutors</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-brand text-white px-4 py-2 rounded-btn text-sm font-600 hover:bg-brand-deep transition">
          + Add Tutor
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-48 rounded-card" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {tutors.map(t => (
            <div key={t.id} onClick={() => setDrawer(t)}
              className="bg-surface rounded-card border border-border p-5 cursor-pointer hover:border-brand/30 hover:shadow-sm transition">
              <div className="flex items-start gap-3 mb-4">
                <Avatar name={t.name} size="lg" />
                <div>
                  <p className="font-700 text-tx">{t.name}</p>
                  <p className="text-tx-2 text-xs">{t.role ?? 'Tutor'}</p>
                  <Badge value={t.active ? 'active' : 'paused'} className="mt-1" />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-tx-3">Learners</span>
                  <span className="font-600 text-tx">{t.learner_count ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tx-3">Sessions</span>
                  <span className="font-600 text-tx">{t.session_count ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tx-3">Rate/session</span>
                  <span className="font-600 font-mono text-tx">${t.rate_per_session}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {(t.subjects ?? []).map((s: string) => (
                  <span key={s} className="px-2 py-0.5 bg-bg border border-border rounded-full text-xs text-tx-2">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table view */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg">
              {['Tutor', 'Role', 'Email', 'Phone', 'Rate', 'Learners', 'Sessions'].map(h => (
                <th key={h} className="text-left text-xs text-tx-3 font-600 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tutors.map(t => (
              <tr key={t.id} onClick={() => setDrawer(t)} className="border-b border-border/50 hover:bg-bg transition cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2"><Avatar name={t.name} size="sm" /><span className="font-600 text-tx">{t.name}</span></div>
                </td>
                <td className="px-4 py-3 text-tx-2">{t.role ?? '—'}</td>
                <td className="px-4 py-3 text-tx-2">{t.email ?? '—'}</td>
                <td className="px-4 py-3 text-tx-2">{t.phone ?? '—'}</td>
                <td className="px-4 py-3 font-mono font-600 text-tx">${t.rate_per_session}/session</td>
                <td className="px-4 py-3 text-tx">{t.learner_count ?? 0}</td>
                <td className="px-4 py-3 text-tx">{t.session_count ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Tutor">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Role</label>
              <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Subjects (comma-separated)</label>
              <input value={form.subjects} onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))}
                placeholder="Maths, Physics" className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Rate per session ($)</label>
              <input type="number" value={form.rate_per_session} onChange={e => setForm(f => ({ ...f, rate_per_session: Number(e.target.value) }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-btn text-sm text-tx-2">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand text-white rounded-btn text-sm font-600">Add Tutor</button>
          </div>
        </form>
      </Modal>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.name ?? ''}>
        {drawer && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={drawer.name} size="lg" />
              <div>
                <p className="font-700 text-tx">{drawer.name}</p>
                <p className="text-tx-2 text-sm">{drawer.role ?? 'Tutor'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Email', drawer.email ?? '—'], ['Phone', drawer.phone ?? '—'], ['Rate', `$${drawer.rate_per_session}/session`], ['Joined', drawer.joined_at ?? '—']].map(([l, v]) => (
                <div key={l}><p className="text-xs text-tx-3 font-600 mb-0.5">{l}</p><p className="text-tx font-500">{v}</p></div>
              ))}
            </div>
            <div>
              <p className="text-xs text-tx-3 font-600 mb-2">Subjects</p>
              <div className="flex flex-wrap gap-1">
                {(drawer.subjects ?? []).map((s: string) => <span key={s} className="px-2 py-0.5 bg-bg border border-border rounded-full text-xs text-tx-2">{s}</span>)}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
