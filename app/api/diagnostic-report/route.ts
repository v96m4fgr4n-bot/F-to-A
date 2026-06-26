export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an expert academic consultant for F TO A Tutoring. Your task is to convert raw diagnostic session meeting notes into a structured JSON report. Extract and elaborate on the information in the notes to produce a professional, comprehensive academic assessment.

Return ONLY valid JSON matching this exact schema — no markdown, no extra text:

{
  "studentName": "string",
  "level": "string",
  "school": "string",
  "consultationDate": "string",
  "motivationRating": "string (e.g. 'Rated 9 out of 10 (Excellent)')",
  "motivationSignificance": "string — why this motivation level matters for the intervention",
  "detailedHistory": "string — 2-3 paragraph narrative about the student's background, why they sought support, and the overall academic context. Write in third person.",
  "performanceGaps": [
    {
      "subject": "string — subject name and syllabus code if mentioned",
      "challenge": "string — bold headline for the core challenge",
      "context": "string — detailed explanation of the specific symptoms and context"
    }
  ],
  "diagnosticSummary": [
    {
      "title": "string — bold label e.g. 'Computer Science: The Logical Translation Gap.'",
      "detail": "string — explanation of this gap"
    }
  ],
  "prognosis": "string — 2-3 sentences on prognosis and confidence level starting with 'Prognosis and Confidence Level: Excellent.' or appropriate level",
  "strategyName": "string — name of the strategic plan e.g. 'The AS Level Precision Strategy (AS-LPS)'",
  "strategyIntro": "string — 1-2 sentence intro to the strategy",
  "modules": [
    {
      "title": "string — module title e.g. 'Module 1: Computer Science Logic Mastery (Addressing Logical Translation & Exam Literacy)'",
      "items": [
        {
          "label": "string — bold item label",
          "detail": "string — item description",
          "subItems": [
            { "label": "string — bold sub-label", "detail": "string — sub-item detail" }
          ]
        }
      ]
    }
  ],
  "logistics": [
    { "label": "string — bold label", "detail": "string — detail" }
  ],
  "nextSteps": [
    { "label": "string — bold label", "detail": "string — detail" }
  ]
}`

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json()
    if (!notes || typeof notes !== 'string') {
      return NextResponse.json({ error: 'notes field required' }, { status: 400 })
    }

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Convert these meeting notes into the structured report JSON:\n\n${notes}` }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const data = JSON.parse(text)
    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('diagnostic-report error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
