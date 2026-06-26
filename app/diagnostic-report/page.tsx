'use client'
import { useState, useRef } from 'react'

type SubItem = { label: string; detail: string }
type ModuleItem = { label: string; detail: string; subItems?: SubItem[] }
type Module = { title: string; items: ModuleItem[] }
type Gap = { subject: string; challenge: string; context: string }
type Summary = { title: string; detail: string }
type LogisticStep = { label: string; detail: string }

interface ReportData {
  studentName: string
  level: string
  school: string
  consultationDate: string
  motivationRating: string
  motivationSignificance: string
  detailedHistory: string
  performanceGaps: Gap[]
  diagnosticSummary: Summary[]
  prognosis: string
  strategyName: string
  strategyIntro: string
  modules: Module[]
  logistics: LogisticStep[]
  nextSteps: LogisticStep[]
}

export default function DiagnosticReportPage() {
  const [notes, setNotes] = useState('')
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const reportRef = useRef<HTMLDivElement>(null)

  async function generate() {
    if (!notes.trim()) return
    setLoading(true)
    setError('')
    setReport(null)
    try {
      const res = await fetch('/api/diagnostic-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Generation failed')
      setReport(json.data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function printReport() {
    window.print()
  }

  return (
    <div>
      {/* Input panel — hidden on print */}
      <div className="print:hidden mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-800 text-tx">Diagnostic Report Generator</h1>
            <p className="text-tx-2 text-sm mt-1">Paste meeting notes to generate a comprehensive academic assessment</p>
          </div>
          {report && (
            <button
              onClick={printReport}
              className="px-4 py-2 bg-brand text-white rounded-btn text-sm font-600 hover:bg-brand/90"
            >
              Print / Save PDF
            </button>
          )}
        </div>

        <div className="bg-surface rounded-card border border-border p-5">
          <label className="block text-sm font-600 text-tx mb-2">Meeting Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Paste your Gemini / Google Meet notes here..."
            className="w-full h-64 text-sm font-mono bg-bg border border-border rounded-btn p-3 text-tx resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex justify-end mt-3">
            <button
              onClick={generate}
              disabled={loading || !notes.trim()}
              className="px-5 py-2 bg-brand text-white rounded-btn text-sm font-600 hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating…' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Report — visible always, printer-friendly */}
      {report && (
        <div ref={reportRef} className="bg-white text-black font-serif max-w-4xl mx-auto print:mx-0 print:max-w-none p-10 print:p-8 rounded-card border border-border print:border-0 print:shadow-none shadow-sm">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              {/* Hexagon logo mark */}
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="36,4 67,20 67,52 36,68 5,52 5,20" fill="#1a2744" stroke="#1a2744" strokeWidth="1"/>
                <polygon points="36,10 61,24 61,48 36,62 11,48 11,24" fill="none" stroke="#1C8FD6" strokeWidth="2"/>
                <circle cx="36" cy="38" r="10" fill="#F97316" opacity="0.9"/>
                <path d="M30 32 Q36 26 42 32 L42 38 Q36 32 30 38 Z" fill="white" opacity="0.7"/>
              </svg>
              <div>
                <div className="text-2xl font-black tracking-wide" style={{ color: '#1a2744' }}>
                  <span style={{ color: '#1a2744' }}>F TO A </span>
                  <span style={{ color: '#1C8FD6' }}>TUTORING</span>
                </div>
                <div className="text-xs tracking-[0.25em] font-semibold" style={{ color: '#1a2744' }}>
                  HELPING LEARNERS HELP THEMSELVES
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-center text-lg font-bold mb-1">
            Comprehensive Academic Assessment and Strategic Intervention Plan for {report.studentName}
          </h1>

          {/* Student Profile Table */}
          <h2 className="text-center font-bold underline mt-6 mb-3">Student Profile and Preliminary Assessment</h2>
          <table className="w-full border-collapse border border-black text-sm mb-6">
            <thead>
              <tr>
                <th className="border border-black px-4 py-2 font-bold text-center w-1/4">Field</th>
                <th className="border border-black px-4 py-2 font-bold text-center w-1/4">Detail</th>
                <th className="border border-black px-4 py-2 font-bold text-center w-1/2">Significance for Intervention</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-4 py-3 font-bold text-center">Name</td>
                <td className="border border-black px-4 py-3 text-center">{report.studentName}</td>
                <td className="border border-black px-4 py-3 text-center">The focus of this intensive intervention.</td>
              </tr>
              <tr>
                <td className="border border-black px-4 py-3 font-bold text-center">Level</td>
                <td className="border border-black px-4 py-3 text-center">{report.level}</td>
                <td className="border border-black px-4 py-3 text-center">Intervention is strategically placed at the start of the crucial A-Level journey.</td>
              </tr>
              <tr>
                <td className="border border-black px-4 py-3 font-bold text-center">School</td>
                <td className="border border-black px-4 py-3 text-center">{report.school}</td>
                <td className="border border-black px-4 py-3 text-center">Aligning intervention with school curriculum pace and requirements.</td>
              </tr>
              <tr>
                <td className="border border-black px-4 py-3 font-bold text-center">Consultation Date</td>
                <td className="border border-black px-4 py-3 text-center">{report.consultationDate}</td>
                <td className="border border-black px-4 py-3 text-center">Early identification allows for proactive gap bridging before high-stakes exams.</td>
              </tr>
              <tr>
                <td className="border border-black px-4 py-3 font-bold text-center">Academic Motivation</td>
                <td className="border border-black px-4 py-3 font-bold text-center">{report.motivationRating}</td>
                <td className="border border-black px-4 py-3 text-center">{report.motivationSignificance}</td>
              </tr>
            </tbody>
          </table>

          {/* Detailed History */}
          <h2 className="text-center font-bold underline mb-3">Detailed History and Academic Examination: Identifying Core Challenges</h2>
          {report.detailedHistory.split('\n').filter(Boolean).map((para, i) => (
            <p key={i} className="text-sm mb-3 text-center">{para}</p>
          ))}

          {/* Performance Gaps Table */}
          <h2 className="text-center font-bold underline mt-6 mb-3">Subject-Specific Performance Gaps</h2>
          <table className="w-full border-collapse border border-black text-sm mb-6">
            <thead>
              <tr>
                <th className="border border-black px-4 py-2 font-bold text-center w-1/4">Subject</th>
                <th className="border border-black px-4 py-2 font-bold text-center w-1/4">Core Challenge Identified</th>
                <th className="border border-black px-4 py-2 font-bold text-center w-1/2">Specific Symptoms &amp; Context</th>
              </tr>
            </thead>
            <tbody>
              {report.performanceGaps.map((gap, i) => (
                <tr key={i}>
                  <td className="border border-black px-4 py-3 font-bold text-center">{gap.subject}</td>
                  <td className="border border-black px-4 py-3 font-bold text-center">{gap.challenge}</td>
                  <td className="border border-black px-4 py-3 text-sm">{gap.context}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Diagnostic Summary */}
          <h2 className="text-center font-bold underline mt-6 mb-3">Comprehensive Diagnostic Summary: The Gaps Identified</h2>
          <p className="text-sm mb-3">The assessment reveals {report.diagnosticSummary.length} distinct type{report.diagnosticSummary.length !== 1 ? 's' : ''} of learning gaps:</p>
          <ol className="list-decimal pl-6 text-sm space-y-2 mb-4">
            {report.diagnosticSummary.map((item, i) => (
              <li key={i}>
                <span className="font-bold">{item.title}</span> {item.detail}
              </li>
            ))}
          </ol>
          <p className="text-sm mb-6">
            <span className="font-bold">{report.prognosis.split('.')[0]}.</span>
            {report.prognosis.slice(report.prognosis.indexOf('.') + 1)}
          </p>

          {/* Strategic Plan */}
          <h2 className="font-bold underline mt-6 mb-2">Strategic Plan of Action: {report.strategyName}</h2>
          <p className="text-sm mb-4 pl-4">{report.strategyIntro}</p>

          {report.modules.map((mod, mi) => (
            <div key={mi} className="mb-5">
              <h3 className="font-bold mb-2">{mod.title}</h3>
              <ul className="pl-5 space-y-3 text-sm list-disc">
                {mod.items.map((item, ii) => (
                  <li key={ii}>
                    <span className="font-bold">{item.label}:</span> {item.detail}
                    {item.subItems && item.subItems.length > 0 && (
                      <ul className="pl-6 mt-1 space-y-1 list-[circle]">
                        {item.subItems.map((sub, si) => (
                          <li key={si}>
                            <span className="font-bold">{sub.label}:</span> {sub.detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Logistics */}
          <h2 className="font-bold underline mt-6 mb-2">Logistics &amp; Scheduling Parameters</h2>
          <ul className="pl-5 space-y-2 text-sm list-disc mb-6">
            {report.logistics.map((item, i) => (
              <li key={i}>
                <span className="font-bold">{item.label}:</span> {item.detail}
              </li>
            ))}
          </ul>

          {/* Next Steps */}
          <h2 className="font-bold underline mt-6 mb-2">Follow-up and Next Steps: Activation Phase</h2>
          <ol className="pl-5 space-y-2 text-sm list-decimal">
            {report.nextSteps.map((step, i) => (
              <li key={i}>
                <span className="font-bold">{step.label}:</span> {step.detail}
              </li>
            ))}
          </ol>

        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
