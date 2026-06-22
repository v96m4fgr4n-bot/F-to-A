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
      <div className="mb-7">
        <h1 className="text-2xl font-800 text-tx">Broadcast</h1>
        <p className="text-tx-2 text-sm mt-1">Send WhatsApp or email messages to learners</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Composer */}
        <div className="col-span-2 space-y-5">
          {/* Channel */}
          <div className="bg-surface rounded-card border border-border p-5">
            <p className="text-xs font-700 text-tx-2 uppercase tracking-wide mb-3">Channel</p>
            <div className="flex gap-2">
              {(['whatsapp', 'email', 'both'] as const).map(c => (
                <button key={c} onClick={() => setChannel(c)}
                  className={`px-4 py-2 rounded-btn text-sm font-600 capitalize border transition ${channel === c ? 'bg-brand text-white border-brand' : 'border-border text-tx-2 hover:text-tx'}`}>
                  {c === 'whatsapp' ? '💬 WhatsApp' : c === 'email' ? '✉️ Email' : '📣 Both'}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="bg-surface rounded-card border border-border p-5 space-y-4">
            {(channel === 'email' || channel === 'both') && (
              <div><label className="block text-xs font-600 text-tx-2 mb-1">Subject</label>
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
            )}
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Message Body</label>
              <p className="text-[11px] text-tx-3 mb-2">Use <code className="bg-bg px-1 rounded">{'{name}'}</code> to personalise</p>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder="Hi {name}, …"
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand resize-none" />
            </div>
            {body && recipients.length > 0 && (
              <div className="bg-bg rounded-btn p-3">
                <p className="text-xs font-600 text-tx-2 mb-1">Preview (for {recipients[0]?.name})</p>
                <p className="text-sm text-tx">{preview(recipients[0]?.name ?? 'Learner')}</p>
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <button onClick={() => localStorage.setItem('draft', body)} className="text-sm text-tx-3 hover:text-tx">Save draft</button>
              <button onClick={send} disabled={sending || !body.trim() || selected.size === 0}
                className="px-5 py-2 bg-brand text-white rounded-btn text-sm font-600 hover:bg-brand-deep disabled:opacity-40 transition">
                {sending ? 'Sending…' : `Send to ${selected.size} recipients`}
              </button>
            </div>
          </div>
        </div>

        {/* Recipients */}
        <div className="bg-surface rounded-card border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-700 text-tx-2 uppercase tracking-wide">Recipients</p>
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="border border-border rounded px-2 py-1 text-xs text-tx focus:outline-none">
              {['active', 'paused', 'pending', 'all'].map(f => <option key={f} value={f} className="capitalize">{f}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
            <input type="checkbox" checked={selected.size === recipients.length && recipients.length > 0} onChange={toggleAll} className="rounded" />
            <span className="text-xs text-tx-2">{selected.size} / {recipients.length} selected</span>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recipients.map(l => (
              <label key={l.id} className="flex items-center gap-2 cursor-pointer hover:bg-bg p-1.5 rounded-btn">
                <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} className="rounded" />
                <Avatar name={l.name} size="sm" />
                <div>
                  <p className="text-xs font-600 text-tx">{l.name}</p>
                  <p className="text-[10px] text-tx-3">{l.parent_phone ?? 'No phone'}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
