import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const C = {
  navy: '#0E2436', blue: '#1C8FD6', green: '#1FA871',
  orange: '#F26F1F', gray: '#92A0AF', bg: '#F3F6FA',
  border: '#E8EDF3', tx: '#15212E', tx2: '#5A6B7B',
}

const s = StyleSheet.create({
  page:   { fontFamily: 'Helvetica', backgroundColor: '#fff', padding: 40, fontSize: 10, color: C.tx },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  logo:   { backgroundColor: C.blue, color: '#fff', fontSize: 14, fontFamily: 'Helvetica-Bold', padding: '6 10', borderRadius: 6 },
  title:  { fontSize: 20, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 4 },
  sub:    { fontSize: 10, color: C.tx2 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  kpi:    { flex: 1, backgroundColor: C.bg, borderRadius: 6, padding: 12 },
  kpiVal: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  kpiLbl: { fontSize: 8, color: C.tx2 },
  section:{ marginBottom: 20 },
  secHdr: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: C.navy, marginBottom: 8 },
  tHead:  { flexDirection: 'row', backgroundColor: C.bg, padding: '6 8', borderRadius: 4, marginBottom: 2 },
  tRow:   { flexDirection: 'row', padding: '5 8', borderBottomWidth: 1, borderBottomColor: C.border },
  tHd:    { fontSize: 8, color: C.gray, fontFamily: 'Helvetica-Bold' },
  tCell:  { fontSize: 9 },
  bar:    { height: 6, backgroundColor: C.blue, borderRadius: 3 },
  barBg:  { height: 6, backgroundColor: C.bg, borderRadius: 3, marginBottom: 6 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footTx: { fontSize: 8, color: C.gray },
})

function fmt(n: number) { return `$${Number(n).toFixed(0)}` }
function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface ReportData {
  mrr: number
  active_learners: number
  sessions_this_month: number
  outstanding_invoices: number
  csat: number
  months: Array<{ month: string; revenue: number; sessions: number }>
  planCounts: Record<string, number>
  atRisk: Array<{ name: string; flag: string; severity: string }>
  generatedAt?: string
}

export function ReportDocument({ data }: { data: ReportData }) {
  const months = data.months ?? []
  const totalRevenue = months.reduce((s, m) => s + (m.revenue ?? 0), 0)
  const totalSessions = months.reduce((s, m) => s + (m.sessions ?? 0), 0)
  const maxRevenue = Math.max(...months.map(m => m.revenue ?? 0), 1)

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.logo}>F→A</Text>
            <Text style={[s.sub, { marginTop: 4 }]}>F-to-A Tutoring  •  Cambridge Curriculum</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.title}>Performance Report</Text>
            <Text style={s.sub}>6-Month Overview  •  Generated {fmtDate(data.generatedAt ?? new Date().toISOString())}</Text>
          </View>
        </View>

        {/* KPI cards */}
        <View style={s.kpiRow}>
          {[
            { label: 'Monthly Revenue (MRR)', value: fmt(data.mrr), color: C.green },
            { label: 'Active Learners',        value: String(data.active_learners), color: C.blue },
            { label: 'Sessions (This Month)',  value: String(data.sessions_this_month), color: '#7A5AF8' },
            { label: 'CSAT Score',             value: `${data.csat ?? 0}%`, color: C.orange },
          ].map(k => (
            <View key={k.label} style={s.kpi}>
              <Text style={[s.kpiVal, { color: k.color }]}>{k.value}</Text>
              <Text style={s.kpiLbl}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Revenue chart (bar representation) */}
        <View style={s.section}>
          <Text style={s.secHdr}>Revenue — Last 6 Months</Text>
          {months.map(m => (
            <View key={m.month} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 9, color: C.tx2 }}>{m.month}</Text>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{fmt(m.revenue)}</Text>
              </View>
              <View style={s.barBg}>
                <View style={[s.bar, { width: `${Math.round(((m.revenue ?? 0) / maxRevenue) * 100)}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Summary stats */}
        <View style={s.section}>
          <Text style={s.secHdr}>6-Month Summary</Text>
          <View style={{ backgroundColor: C.bg, borderRadius: 6, padding: 14 }}>
            {[
              ['Total Revenue', fmt(totalRevenue)],
              ['Total Sessions', String(totalSessions)],
              ['Avg Revenue / Month', fmt(totalRevenue / Math.max(months.length, 1))],
              ['Avg Sessions / Month', String(Math.round(totalSessions / Math.max(months.length, 1)))],
              ['Outstanding Invoices', String(data.outstanding_invoices)],
            ].map(([label, value]) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: C.border }}>
                <Text style={{ color: C.tx2 }}>{label}</Text>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Learners by plan */}
        {Object.keys(data.planCounts ?? {}).length > 0 && (
          <View style={s.section}>
            <Text style={s.secHdr}>Learners by Plan</Text>
            <View style={s.tHead}>
              {['Plan', 'Count', 'Share'].map(h => <Text key={h} style={[s.tHd, { flex: 1 }]}>{h}</Text>)}
            </View>
            {Object.entries(data.planCounts ?? {}).map(([plan, count]) => {
              const total = Object.values(data.planCounts ?? {}).reduce((a, b) => a + b, 0)
              return (
                <View key={plan} style={s.tRow}>
                  <Text style={[s.tCell, { flex: 1, textTransform: 'capitalize' }]}>{plan}</Text>
                  <Text style={[s.tCell, { flex: 1 }]}>{count}</Text>
                  <Text style={[s.tCell, { flex: 1, color: C.tx2 }]}>{Math.round((count / total) * 100)}%</Text>
                </View>
              )
            })}
          </View>
        )}

        {/* At-risk learners */}
        {(data.atRisk ?? []).length > 0 && (
          <View style={s.section}>
            <Text style={s.secHdr}>At-Risk Learners</Text>
            <View style={s.tHead}>
              {['Learner', 'Flag', 'Severity'].map(h => <Text key={h} style={[s.tHd, { flex: 1 }]}>{h}</Text>)}
            </View>
            {(data.atRisk ?? []).map(r => (
              <View key={r.name} style={s.tRow}>
                <Text style={[s.tCell, { flex: 1 }]}>{r.name}</Text>
                <Text style={[s.tCell, { flex: 2, color: C.tx2 }]}>{r.flag}</Text>
                <Text style={[s.tCell, { flex: 1, color: r.severity === 'high' ? '#E0563B' : '#D4A017', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', fontSize: 8 }]}>{r.severity}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footTx}>F-to-A Tutoring • Cambridge Curriculum Specialists • Zimbabwe</Text>
          <Text style={s.footTx}>Confidential — Internal use only</Text>
        </View>
      </Page>
    </Document>
  )
}
