export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function POST(req: NextRequest, props: { params: Promise<{ learnerId: string }> }) {
  const params = await props.params;
  try {
    const body = await req.json()
    const { data, error } = await db
      .from('assessments')
      .insert({ ...body, learner_id: params.learnerId })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
