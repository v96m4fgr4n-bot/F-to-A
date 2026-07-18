'use client'
import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'

export default function SettingsPage() {
  const [org, setOrg] = useState({
    name: 'F to A Tutoring', trading: 'F to A', email: 'admin@ftoatutoring.net',
    phone: '+263771234567', website: 'ftoatutoring.net', address: 'Harare, Zimbabwe',
    country: 'Zimbabwe', currency: 'USD', timezone: 'Africa/Harare (CAT)',
  })
  const [notifs, setNotifs] = useState({ new_enrolment: true, payment_received: true, session_reminder: false, overdue_invoice: true })
  const [saving, setSaving] = useState(false)
  const { show, ToastEl } = useToast()

  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    show('Settings saved')
  }

  const setField = (k: keyof typeof org) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setOrg(o => ({ ...o, [k]: e.target.value }))

  return (
    <div>
      {ToastEl}
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-sub">Organisation configuration for F to A Tutoring</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={save} disabled={saving} style={{ opacity: saving ? .5 : 1 }}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
      <div className="page-body">
        <div className="admin-settings-grid">
          <div className="card">
            <div style={{ marginBottom: 16 }}><div className="card-title">Organisation info</div></div>
            {([
              ['Business name', 'name'],
              ['Trading name', 'trading'],
              ['Contact email', 'email'],
              ['WhatsApp', 'phone'],
              ['Website', 'website'],
              ['Address', 'address'],
              ['Country', 'country'],
              ['Timezone', 'timezone'],
            ] as const).map(([label, key]) => (
              <div key={key} className="s-row">
                <span className="s-label">{label}</span>
                <input className="s-inp" value={org[key]} onChange={setField(key)} />
              </div>
            ))}
            <div className="s-row">
              <span className="s-label">Currency</span>
              <select className="s-inp" value={org.currency} onChange={setField('currency')}>
                <option value="USD">USD ($)</option>
                <option value="ZWL">ZWL</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div style={{ marginBottom: 16 }}><div className="card-title">Admin notifications</div></div>
              {([
                ['new_enrolment', 'New enrolment'],
                ['payment_received', 'Payment received'],
                ['session_reminder', 'Session reminders'],
                ['overdue_invoice', 'Overdue invoice alert'],
              ] as const).map(([key, label]) => (
                <div key={key} className="s-row">
                  <span className="s-label" style={{ fontSize: 12.5 }}>{label}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifs[key]}
                      onChange={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                      style={{ accentColor: 'var(--blue)', width: 15, height: 15 }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>Email + WhatsApp</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ marginBottom: 16 }}><div className="card-title">Integrations</div></div>
              {[['Supabase', 'Database', 'Connected'], ['Resend', 'Email', 'Configure'], ['Twilio', 'WhatsApp', 'Configure']].map(([name, type, status]) => (
                <div key={name} className="s-row" style={{ gridTemplateColumns: '1fr auto' }}>
                  <span>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 13.5 }}>{name}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--text-3)' }}>{type}</span>
                  </span>
                  <span className="pill" style={status === 'Connected'
                    ? { background: '#E8F5E9', color: 'var(--green)' }
                    : { background: '#FEF3C7', color: '#b45309' }}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
