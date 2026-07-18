'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'

const SUBJECTS = ['All', 'Maths', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography']
const TUTOR_COLORS = ['#1FA871', '#1C8FD6', '#7A5AF8', '#F26F1F', '#E0563B', '#D4A017']

const SOURCE_COLORS: Record<string, { bg: string; color: string }> = {
  WhatsApp: { bg: '#DCF8E4', color: '#128C7E' },
  Instagram: { bg: '#FEE2E2', color: '#E0563B' },
  Website: { bg: '#EBF6FF', color: '#1C8FD6' },
  School: { bg: '#F2EEFF', color: '#7A5AF8' },
  Referral: { bg: '#FEF3C7', color: '#b45309' },
}

export default function MatchingPage() {
  const [inquiries, setInquiries] = useState<any[]>([])
  const [tutors, setTutors] = useState<any[]>([])
  const [subject, setSubject] = useState('All')
  const [selected, setSelected] = useState<any>(null)
  const [assigning, setAssigning] = useState<string | null>(null)
  const { show, ToastEl } = useToast()

  useEffect(() => {
    fetch('/api/pipeline?stage=inquiry').then(r => r.json()).then(r => setInquiries(r.data ?? []))
  }, [])

  useEffect(() => {
    const url = selected
      ? `/api/matching?inquiry_id=${selected.id}&subject=${selected.subjects?.[0] ?? ''}`
      : '/api/matching'
    fetch(url).then(r => r.json()).then(r => setTutors(r.data ?? []))
  }, [selected])

  const filtered = subject === 'All' ? inquiries : inquiries.filter(i =>
    i.subjects?.some((s: string) => s.toLowerCase().includes(subject.toLowerCase()))
  )

  const assign = async (tutorId: string) => {
    if (!selected) return
    setAssigning(tutorId)
    const res = await fetch('/api/matching/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiry_id: selected.id, tutor_id: tutorId })
    })
    setAssigning(null)
    if (res.ok) {
      show('Tutor assigned successfully')
      setSelected(null)
      fetch('/api/pipeline?stage=inquiry').then(r => r.json()).then(r => setInquiries(r.data ?? []))
    } else show('Failed to assign tutor', 'error')
  }

  const matchPct = (t: any) => Math.min(Math.round(((t.match_score ?? 0) / 53) * 100), 100)

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <div className="page-title">Tutor matching</div>
          <div className="page-sub">Find the best tutor for each inquiry by subject, capacity and fit</div>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
          <div className="card">
            <div style={{ marginBottom: 14 }}><div className="card-title">Filter</div></div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Subject</div>
              <select className="s-inp" style={{ width: '100%' }} value={subject} onChange={e => setSubject(e.target.value)}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Open inquiries</div>
              {filtered.length === 0 && (
                <div style={{ color: 'var(--text-3)', fontSize: 12.5, padding: '10px 0' }}>No inquiries</div>
              )}
              {filtered.map(inq => (
                <div
                  key={inq.id}
                  onClick={() => setSelected(selected?.id === inq.id ? null : inq)}
                  style={{
                    padding: '9px 10px', borderRadius: 9,
                    background: selected?.id === inq.id ? 'var(--bg)' : 'transparent',
                    border: '1px solid ' + (selected?.id === inq.id ? 'var(--blue)' : 'var(--border)'),
                    marginBottom: 6, cursor: 'pointer', transition: '.12s',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{inq.parent_name}</div>
                    {inq.lead_source && (
                      <span className="src-badge" style={{ background: SOURCE_COLORS[inq.lead_source]?.bg ?? 'var(--bg)', color: SOURCE_COLORS[inq.lead_source]?.color ?? 'var(--text-2)' }}>
                        {inq.lead_source}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--blue)', marginTop: 2 }}>{(inq.subjects ?? []).join(', ') || '—'}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>{inq.parent_phone ?? ''}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selected && (
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>
                Showing matches for <strong style={{ color: 'var(--text)' }}>{selected.parent_name}</strong>
              </div>
            )}
            {!selected && (
              <div className="card" style={{ display: 'grid', placeItems: 'center', minHeight: 200, color: 'var(--text-3)', fontSize: 13 }}>
                Select an inquiry to see tutor matches
              </div>
            )}
            {selected && tutors.length === 0 && (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13, padding: 32 }}>No tutors available</div>
            )}
            {selected && tutors.map((t: any, idx: number) => {
              const pct = matchPct(t)
              const col = pct >= 85 ? 'var(--green)' : pct >= 70 ? 'var(--orange)' : 'var(--red)'
              const sel = selected.subjects?.[0]?.toLowerCase()
              return (
                <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="match-ring" style={{ background: col }}>{pct}%</div>
                  <div className="avatar" style={{ width: 46, height: 46, background: TUTOR_COLORS[idx % TUTOR_COLORS.length], fontSize: 14 }}>
                    {t.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{t.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 2 }}>{t.role ?? 'Tutor'}</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
                      {(t.subjects ?? []).map((s: string) => {
                        const hit = sel && s.toLowerCase().includes(sel)
                        return (
                          <span key={s} style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: hit ? 'var(--blue)' : 'var(--bg)', color: hit ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)' }}>
                            {s}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 8px' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>${t.rate_per_session}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase' }}>Rate</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 8px' }}>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{t.learner_count ?? 0}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase' }}>Learners</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => assign(t.id)} disabled={assigning === t.id} style={{ opacity: assigning === t.id ? .5 : 1 }}>
                    {assigning === t.id ? 'Assigning…' : 'Assign'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
