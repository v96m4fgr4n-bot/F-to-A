'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) setError(err.message)
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center text-white font-800 text-xl mb-4">F→A</div>
          <h1 className="text-white text-2xl font-800">F-to-A Tutoring</h1>
          <p className="text-white/40 text-sm mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-card p-7 shadow-xl">
          <h2 className="text-tx font-700 text-lg mb-5">Sign in</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Email</label>
              <input
                type="email" required autoFocus
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@ftoatutoring.net"
                className="w-full border border-border rounded-btn px-3 py-2.5 text-sm focus:outline-none focus:border-brand transition"
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-tx-2 mb-1">Password</label>
              <input
                type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-border rounded-btn px-3 py-2.5 text-sm focus:outline-none focus:border-brand transition"
              />
            </div>
            {error && (
              <p className="text-red text-xs bg-red/10 border border-red/20 rounded-btn px-3 py-2">{error}</p>
            )}
            <button
              type="submit" disabled={loading}
              className="w-full bg-brand text-white py-2.5 rounded-btn text-sm font-600 hover:bg-brand-deep transition disabled:opacity-60 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-white/20 text-xs text-center mt-6">F-to-A Tutoring — Cambridge Curriculum, Zimbabwe</p>
      </div>
    </div>
  )
}
