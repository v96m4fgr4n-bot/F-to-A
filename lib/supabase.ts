import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const service = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !anon) {
  console.warn('[supabase] Missing env vars — NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required')
}

// Client-side (browser) — uses anon key, respects RLS. Cookie-based session
// storage so the auth middleware (createServerClient) can see the session.
export const supabase = createBrowserClient(url ?? 'https://placeholder.supabase.co', anon ?? 'placeholder')

// Server-side (API routes) — uses service role key, bypasses RLS
export const db = createClient(url ?? 'https://placeholder.supabase.co', service ?? anon ?? 'placeholder')
