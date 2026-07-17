export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await db
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return NextResponse.json({ data: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ data: [], error: e.message })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { channel, subject, message, recipients } = body as {
      channel: 'whatsapp' | 'email' | 'both'
      subject?: string
      message: string
      recipients: Array<{ name: string; phone?: string; email?: string }>
    }

    if (!recipients?.length) {
      return NextResponse.json({ error: 'No recipients' }, { status: 400 })
    }

    const errors: string[] = []
    let sent = 0

    // ── WhatsApp via Twilio ──────────────────────────────────────────────
    if (channel === 'whatsapp' || channel === 'both') {
      const sid = process.env.TWILIO_ACCOUNT_SID
      const token = process.env.TWILIO_AUTH_TOKEN
      const from = process.env.TWILIO_WHATSAPP_FROM

      if (sid && token && from) {
        const twilio = (await import('twilio')).default
        const client = twilio(sid, token)

        await Promise.allSettled(
          recipients
            .filter(r => r.phone)
            .map(r => {
              const body = message.replace(/\{name\}/g, r.name)
              return client.messages.create({
                from: `whatsapp:${from}`,
                to: `whatsapp:${r.phone}`,
                body,
              }).then(() => { sent++ }).catch(e => errors.push(`WA ${r.name}: ${e.message}`))
            })
        )
      } else {
        errors.push('Twilio env vars not configured')
      }
    }

    // ── Email via Resend ─────────────────────────────────────────────────
    if (channel === 'email' || channel === 'both') {
      const resendKey = process.env.RESEND_API_KEY

      if (resendKey) {
        const { Resend } = await import('resend')
        const resend = new Resend(resendKey)

        await Promise.allSettled(
          recipients
            .filter(r => r.email)
            .map(r => {
              const html = message.replace(/\{name\}/g, r.name).replace(/\n/g, '<br/>')
              return resend.emails.send({
                from: 'F-to-A Tutoring <admin@ftoatutoring.net>',
                to: r.email!,
                subject: subject ?? 'Message from F-to-A Tutoring',
                html,
              }).then(() => { sent++ }).catch(e => errors.push(`Email ${r.name}: ${e.message}`))
            })
        )
      } else {
        errors.push('Resend API key not configured')
      }
    }

    // Save to DB
    const { data: saved } = await db.from('broadcasts').insert({
      channel,
      subject: subject ?? null,
      body: message,
      recipient_filter: JSON.stringify(recipients.map(r => r.name)),
      sent_count: sent,
      sent_at: new Date().toISOString(),
    }).select().single()

    return NextResponse.json({
      data: saved,
      sent,
      errors: errors.length ? errors : undefined,
    }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
