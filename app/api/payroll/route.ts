import { NextRequest, NextResponse } from 'next/server'
import { gasGet, gasPost } from '@/lib/gas'

export async function GET() {
  const result = await gasGet('payroll')
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { id, all } = body

  const payrollRes = await gasGet('payroll')
  const payroll = payrollRes.data ?? []

  if (all) {
    const dues = payroll.filter((p: any) => p.status === 'due')
    await Promise.all(dues.map((p: any) =>
      gasPost('payroll', 'update', { id: p.id, data: { status: 'paid', paid_at: new Date().toISOString() } })
    ))
  } else if (id) {
    await gasPost('payroll', 'update', { id, data: { status: 'paid', paid_at: new Date().toISOString() } })
  }

  const updated = await gasGet('payroll')
  return NextResponse.json(updated)
}
