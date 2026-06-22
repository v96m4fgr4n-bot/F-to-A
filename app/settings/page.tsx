'use client'
import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'

export default function SettingsPage() {
  const [org, setOrg] = useState({ name: 'F-to-A Tutoring', email: 'admin@ftoatutoring.net', phone: '+263771234567', address: 'Harare, Zimbabwe', currency: 'USD' })
  const [notifs, setNotifs] = useState({ new_enrolment: true, payment_received: true, session_reminder: false, overdue_invoice: true })
  const [saving, setSaving] = useState(false)
  const { show, ToastEl } = useToast()

  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    show('Settings saved')
  }

  return (
    <div>
      {ToastEl}
      <div className="mb-7">
        <h1 className="text-2xl font-800 text-tx">Settings</h1>
        <p className="text-tx-2 text-sm mt-1">Organisation and notification configuration</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Organisation */}
        <div className="bg-surface rounded-card border border-border p-6">
          <h2 className="font-700 text-tx mb-5">Organisation Info</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-600 text-tx-2 mb-1">Business Name</label>
                <input value={org.name} onChange={e => setOrg(o => ({ ...o, name: e.target.value }))}
                  className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
              <div><label className="block text-xs font-600 text-tx-2 mb-1">Email</label>
                <input value={org.email} onChange={e => setOrg(o => ({ ...o, email: e.target.value }))}
                  className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-600 text-tx-2 mb-1">Phone</label>
                <input value={org.phone} onChange={e => setOrg(o => ({ ...o, phone: e.target.value }))}
                  className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
              <div><label className="block text-xs font-600 text-tx-2 mb-1">Currency</label>
                <select value={org.currency} onChange={e => setOrg(o => ({ ...o, currency: e.target.value }))}
                  className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand">
                  <option value="USD">USD ($)</option>
                  <option value="ZWL">ZWL</option>
                </select></div>
            </div>
            <div><label className="block text-xs font-600 text-tx-2 mb-1">Address</label>
              <input value={org.address} onChange={e => setOrg(o => ({ ...o, address: e.target.value }))}
                className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand" /></div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface rounded-card border border-border p-6">
          <h2 className="font-700 text-tx mb-5">Notifications</h2>
          <div className="space-y-3">
            {[
              ['new_enrolment', 'New enrolment'],
              ['payment_received', 'Payment received'],
              ['session_reminder', 'Session reminders'],
              ['overdue_invoice', 'Overdue invoice alert'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between cursor-pointer py-2 border-b border-border/50">
                <span className="text-sm text-tx">{label}</span>
                <button
                  onClick={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${notifs[key as keyof typeof notifs] ? 'bg-brand' : 'bg-border2'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifs[key as keyof typeof notifs] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>
            ))}
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-surface rounded-card border border-border p-6">
          <h2 className="font-700 text-tx mb-5">Integrations</h2>
          <div className="space-y-3 text-sm">
            {[['Supabase', 'Database', 'Connected'], ['Resend', 'Email', 'Configure'], ['Twilio', 'WhatsApp', 'Configure']].map(([name, type, status]) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <p className="font-600 text-tx">{name}</p>
                  <p className="text-tx-3 text-xs">{type}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-600 ${status === 'Connected' ? 'bg-green/10 text-green' : 'bg-yellow/10 text-yellow'}`}>{status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-brand text-white rounded-btn font-600 hover:bg-brand-deep disabled:opacity-50 transition">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
