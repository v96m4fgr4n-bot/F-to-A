'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

const SUBJECTS = ['All', 'Maths', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography']

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

  return (
    <div>
      {ToastEl}
      <div className="mb-7">
        <h1 className="text-2xl font-800 text-tx">Matching</h1>
        <p className="text-tx-2 text-sm mt-1">Match inquiries with the best-fit tutor</p>
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Left: Inquiries */}
        <div className="col-span-2">
          <div className="bg-surface rounded-card border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-bg flex items-center justify-between">
              <h2 className="text-sm font-700 text-tx">Inquiries ({filtered.length})</h2>
              <select value={subject} onChange={e => setSubject(e.target.value)}
                className="border border-border rounded-btn px-2 py-1 text-xs focus:outline-none bg-surface">
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center text-tx-3 py-12 text-sm">No inquiries</div>
              ) : filtered.map(inq => (
                <div
                  key={inq.id}
                  onClick={() => setSelected(selected?.id === inq.id ? null : inq)}
                  className={`p-4 cursor-pointer transition hover:bg-bg ${selected?.id === inq.id ? 'bg-brand/5 border-l-2 border-brand' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-600 text-tx">{inq.parent_name}</p>
                      <p className="text-xs text-tx-2 mt-0.5">{inq.parent_phone}</p>
                      {inq.subjects?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {inq.subjects.map((s: string) => (
                            <span key={s} className="bg-brand/10 text-brand text-[10px] px-2 py-0.5 rounded-full font-600">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge variant="yellow" size="sm">{inq.lead_source}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tutor cards */}
        <div className="col-span-3">
          {!selected ? (
            <div className="bg-surface rounded-card border border-border flex items-center justify-center h-64 text-tx-3 text-sm">
              Select an inquiry to see tutor matches
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-tx-2">Matching tutors for</span>
                <span className="font-700 text-tx">{selected.parent_name}</span>
              </div>
              <div className="space-y-3">
                {tutors.length === 0 ? (
                  <div className="bg-surface rounded-card border border-border p-8 text-center text-tx-3 text-sm">No tutors available</div>
                ) : tutors.map((t: any) => (
                  <div key={t.id} className="bg-surface rounded-card border border-border p-4 flex items-center gap-4">
                    <Avatar name={t.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-600 text-tx text-sm">{t.name}</p>
                        <span className="text-xs text-tx-3">{t.role}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(t.subjects ?? []).map((s: string) => (
                          <span key={s} className="bg-bg text-tx-2 text-[10px] px-2 py-0.5 rounded-full border border-border font-500">{s}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-tx-3">
                        <span>Rate: ${t.rate_per_session}/session</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-2">
                        <span className="text-2xl font-800 text-brand">{t.match_score ?? 0}</span>
                        <span className="text-xs text-tx-3 ml-1">/ 53 pts</span>
                      </div>
                      <button
                        onClick={() => assign(t.id)}
                        disabled={assigning === t.id}
                        className="bg-brand text-white px-3 py-1.5 rounded-btn text-xs font-600 hover:bg-brand-deep transition disabled:opacity-50"
                      >
                        {assigning === t.id ? 'Assigning…' : 'Assign'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
