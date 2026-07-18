'use client'
import { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/components/ui/Toast'

export default function BroadcastPage() {
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'both'>('whatsapp')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [filter, setFilter] = useState('active')
  const [recipients, setRecipients] = useState<any[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)
  const { show, ToastEl } = useToast()

  useEffect(() => {
    fetch(`/api/learners?status=${filter === 'all' ? '' : filter}&limit=100`).then(r => r.json()).then(r => {
      const list = r.data ?? []
      setRecipients(list)
      setSelected(new Set(list.map((l: any) => l.id)))
    })
  }, [filter])

  const toggleAll = () => {
    setSelected(selected.size === recipients.length ? new Set() : new Set(recipients.map(l => l.id)))
  }

  const toggle = (id: string) => {
    const s = new Set(selected)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }

  const send = async () => {
    if (!body.trim() || selected.size === 0) return
    setSending(true)
    await fetch('/api/broadcast', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, subject, body, recipient_count: selected.size, recipient_filter: filter })
    })
    setSending(false)
    show(`Sent to ${selected.size} recipients`)
    setBody('')
    setSubject('')
  }

  const preview = (name: string) => body.replace(/{name}/g, name.split(' ')[0])

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <div className="page-title">Broadcast</div>
          <div className="page-sub">Send a message to all families at once</div>
        </div>
      </div>
      <div className="page-body">
        <div className="broadcast-wrap">
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 14 }}><div className="card-title">Compose message</div></div>
              <div className="channel-toggle">
                {([['whatsapp', '📱 WhatsApp'], ['email', '✉️ Email'], ['both', 'Both']] as const).map(([id, label]) => (
                  <button key={id} className={'ch-btn ' + (channel === id ? 'on' : '')} onClick={() => setChannel(id)}>{label}</button>
                ))}
              </div>
              {(channel === 'email' || channel === 'both') && (
                <input className="broadcast-input" placeholder="Subject line…" value={subject} onChange={e => setSubject(e.target.value)} />
              )}
              <textarea
                className="broadcast-textarea"
                placeholder="Type your message here… Use {name} to personalise."
                value={body}
                onChange={e => setBody(e.target.value)}
              />
              {body && recipients.length > 0 && (
                <div style={{ background: 'var(--bg)', borderRadius: 11, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 4 }}>Preview (for {recipients[0]?.name})</div>
                  <div style={{ fontSize: 13.5 }}>{preview(recipients[0]?.name ?? 'Learner')}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => localStorage.setItem('draft', body)}>Save draft</button>
                <button className="btn btn-primary" onClick={send} disabled={sending || !body.trim() || selected.size === 0} style={{ opacity: sending || !body.trim() || selected.size === 0 ? .4 : 1 }}>
                  {sending ? 'Sending…' : `Send to ${selected.size} families →`}
                </button>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="card-title">Recipients · {selected.size}</div>
              <select
                style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', fontSize: 12.5, fontFamily: 'var(--font)', outline: 'none' }}
                value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">All families</option>
                <option value="active">Active only</option>
                <option value="paused">Paused</option>
                <option value="pending">Inquiries</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 9, borderBottom: '1px solid var(--border)' }}>
              <input type="checkbox" className="recip-check" checked={selected.size === recipients.length && recipients.length > 0} onChange={toggleAll} />
              <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>{selected.size} / {recipients.length} selected</span>
            </div>
            <div className="recipient-list">
              {recipients.map(l => (
                <label key={l.id} className="recip-row" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" className="recip-check" checked={selected.has(l.id)} onChange={() => toggle(l.id)} />
                  <Avatar name={l.name} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{l.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{channel === 'email' ? (l.parent_email ?? 'No email') : (l.parent_phone ?? 'No phone')}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 5, textTransform: 'capitalize' }}>{l.plan ?? 'inquiry'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
