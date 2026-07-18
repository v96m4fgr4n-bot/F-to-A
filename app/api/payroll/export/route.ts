export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { renderToBuffer } from '@react-pdf/renderer'
import { PayslipDocument } from '@/lib/pdf/payslip'
import React from 'react'

export async function GET(req: NextRequest) {
  try {
    const payrollId = req.nextUrl.searchParams.get('id')
    if (!payrollId) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { data: payroll, error } = await db
      .from('payroll')
      .select('*, tutor:tutors(id, name, email, role)')
      .eq('id', payrollId)
      .single()

    if (error || !payroll) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const buffer = await renderToBuffer(
      React.createElement(PayslipDocument, { data: payroll }) as any
    )

    const tutorName = payroll.tutor?.name?.replace(/\s+/g, '_') ?? 'tutor'
    const period = payroll.period_start?.slice(0, 7) ?? 'period'

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="payslip_${tutorName}_${period}.pdf"`,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
