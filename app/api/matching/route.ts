export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const inquiryId = p.get('inquiry_id')
    const subject = p.get('subject')

    // Get inquiry details if id provided
    let inquirySubjects: string[] = []
    if (inquiryId) {
      const { data: inquiry } = await db.from('pipeline').select('subjects').eq('id', inquiryId).single()
      if (inquiry?.subjects) {
        inquirySubjects = Array.isArray(inquiry.subjects) ? inquiry.subjects : [inquiry.subjects]
      }
    } else if (subject) {
      inquirySubjects = [subject]
    }

    // Get active tutors with capacity info
    const { data: tutors, error } = await db
      .from('tutors')
      .select('*, learner_count:learners(count)')
      .eq('active', true)

    if (error) throw error

    // Get pipeline inquiries
    const { data: inquiries } = await db
      .from('pipeline')
      .select('id, parent_name, subjects, stage, moved_at, learner_id')
      .in('stage', ['inquiry', 'trial_scheduled', 'trial_done'])
      .order('moved_at', { ascending: false })

    // Score tutors
    const scored = (tutors ?? []).map((t: any) => {
      const tutorSubjects: string[] = Array.isArray(t.subjects) ? t.subjects : (t.subjects ? [t.subjects] : [])
      const overlap = inquirySubjects.filter(s => tutorSubjects.some((ts: string) => ts.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ts.toLowerCase()))).length
      const subjectScore = overlap > 0 ? 35 : 0
      const csatScore = t.csat ? Math.min(8, Math.round((t.csat / 5) * 8)) : 4
      const learnerCount = t.learner_count?.[0]?.count ?? 0
      const capacityScore = learnerCount < 5 ? 10 : learnerCount < 8 ? 5 : 0
      const matchScore = subjectScore + csatScore + capacityScore
      return { ...t, match_score: matchScore, learner_count: learnerCount }
    }).sort((a: any, b: any) => b.match_score - a.match_score)

    return NextResponse.json({ tutors: scored, inquiries: inquiries ?? [] })
  } catch (e: any) {
    return NextResponse.json({ tutors: [], inquiries: [], error: e.message }, { status: 200 })
  }
}
