'use client'
import { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Drawer } from '@/components/ui/Drawer'
import { useToast } from '@/components/ui/Toast'
import { Ic } from '@/components/ui/Icon'

const TUTOR_COLORS = ['#1FA871', '#1C8FD6', '#7A5AF8', '#F26F1F', '#E0563B', '#D4A017']
const GRID = '2fr 1fr 1fr 1fr 1fr'

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

  const totalAssignments = tutors.reduce((s, t) => s + (t.learner_count ?? 0), 0)

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <div className="page-title">Tutors</div>
          <div className="page-sub">{tutors.length} active tutors · {totalAssignments} total learner assignments</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Ic n="plus" s={14} /> Add tutor</button>
        </div>
      </div>
      <div className="page-body">
        {loading ? (
          <div className="tutor-grid">
            {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 14 }} />)}
          </div>
        ) : (
          <div className="tutor-grid">
            {tutors.map((t, idx) => {
              const color = TUTOR_COLORS[idx % TUTOR_COLORS.length]
              return (
                <div className="tutor-card" key={t.id} onClick={() => setDrawer(t)} style={{ cursor: 'pointer' }}>
                  <div className="tutor-card-head">
                    <div className="avatar" style={{ width: 52, height: 52, background: color, fontSize: 16 }}>
                      {t.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <div className="tutor-name">{t.name}</div>
                      <div className="tutor-role">{t.role ?? 'Tutor'}</div>
                      <div className="stars">{'★★★★★'} <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 700 }}>{t.active ? 'Active' : 'Paused'}</span></div>
                    </div>
                  </div>
                  <div className="tutor-stats">
                    <div className="ts-item"><div className="ts-val" style={{ color }}>{t.learner_count ?? 0}</div><div className="ts-label">Learners</div></div>
                    <div className="ts-item"><div className="ts-val">{t.session_count ?? 0}</div><div className="ts-label">Sessions/mo</div></div>
                    <div className="ts-item"><div className="ts-val" style={{ color: 'var(--green)' }}>${t.rate_per_session}</div><div className="ts-label">Per session</div></div>
                    <div className="ts-item"><div className="ts-val">{(t.subjects ?? []).length}</div><div className="ts-label">Subjects</div></div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    {(t.subjects ?? []).map((s: string) => (
                      <span key={s} style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, background: 'var(--bg)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 6, marginRight: 5, marginBottom: 4, color: 'var(--text-2)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="data-table">
          <div className="dt-head" style={{ gridTemplateColumns: GRID }}>
            <span>Tutor</span><span>Learners</span><span>Sessions / mo</span><span>Rate</span><span>Contact</span>
          </div>
          {tutors.map((t, idx) => (
            <div key={t.id} className="dt-row" style={{ gridTemplateColumns: GRID }} onClick={() => setDrawer(t)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div className="avatar" style={{ width: 36, height: 36, background: TUTOR_COLORS[idx % TUTOR_COLORS.length], fontSize: 13 }}>
                  {t.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <span>
                  <span style={{ display: 'block', fontWeight: 700 }}>{t.name}</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--text-3)' }}>{t.role ?? 'Tutor'}</span>
                </span>
              </span>
              <span style={{ fontWeight: 700 }}>{t.learner_count ?? 0}</span>
              <span style={{ fontWeight: 700 }}>{t.session_count ?? 0}</span>
              <span style={{ fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--mono)' }}>${t.rate_per_session}</span>
              <span style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.email ?? t.phone ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Tutor">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="s-inp" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Role</label>
              <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="s-inp" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="s-inp" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="s-inp" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Subjects (comma-separated)</label>
              <input value={form.subjects} onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))} placeholder="Maths, Physics" className="s-inp" /></div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Rate per session ($)</label>
              <input type="number" value={form.rate_per_session} onChange={e => setForm(f => ({ ...f, rate_per_session: Number(e.target.value) }))} className="s-inp" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Add Tutor</button>
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
                {(drawer.subjects ?? []).map((s: string) => <span key={s} className="pc-tag">{s}</span>)}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
