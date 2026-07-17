import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

const C = {
  navy: '#0E2436', blue: '#1C8FD6', green: '#1FA871',
  orange: '#F26F1F', red: '#E0563B', gray: '#92A0AF',
  bg: '#F3F6FA', border: '#E8EDF3', tx: '#15212E', tx2: '#5A6B7B',
}

const s = StyleSheet.create({
  page:    { fontFamily: 'Helvetica', backgroundColor: '#fff', padding: 40, fontSize: 10, color: C.tx },
  header:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  logo:    { backgroundColor: C.blue, color: '#fff', fontSize: 14, fontFamily: 'Helvetica-Bold', padding: '6 10', borderRadius: 6 },
  org:     { fontSize: 9, color: C.tx2, marginTop: 4 },
  badge:   { backgroundColor: C.green, color: '#fff', fontSize: 8, fontFamily: 'Helvetica-Bold', padding: '3 8', borderRadius: 4, alignSelf: 'flex-start' },
  title:   { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 4 },
  period:  { fontSize: 10, color: C.tx2 },
  divider: { borderBottomWidth: 1, borderBottomColor: C.border, marginVertical: 16 },
  row:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rowBg:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: 8, backgroundColor: C.bg, borderRadius: 4, marginBottom: 2 },
  label:   { color: C.tx2 },
  value:   { fontFamily: 'Helvetica-Bold' },
  totalBox:{ backgroundColor: C.navy, borderRadius: 6, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  totalLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
  totalAmt:   { color: '#fff', fontSize: 18, fontFamily: 'Helvetica-Bold' },
  footer:  { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footTx:  { fontSize: 8, color: C.gray },
})

interface PayslipData {
  tutor: { name: string; email?: string; role?: string }
  period_start: string
  period_end: string
  sessions_count: number
  rate: number
  bonus: number
  gross: number
  status: string
  paid_at?: string
}

function fmt(n: number) { return `$${n.toFixed(2)}` }
function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function PayslipDocument({ data }: { data: PayslipData }) {
  const { tutor, period_start, period_end, sessions_count, rate, bonus, gross, status, paid_at } = data
  const sessionTotal = sessions_count * rate

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.logo}>F→A</Text>
            <Text style={s.org}>F-to-A Tutoring  •  admin@ftoatutoring.net</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.title}>Payslip</Text>
            <Text style={s.period}>{fmtDate(period_start)} – {fmtDate(period_end)}</Text>
            <View style={{ marginTop: 6 }}>
              <Text style={[s.badge, { backgroundColor: status === 'paid' ? C.green : C.orange }]}>
                {status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Tutor info */}
        <View style={{ backgroundColor: C.bg, borderRadius: 6, padding: 14, marginBottom: 20 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 13, marginBottom: 4 }}>{tutor.name}</Text>
          {tutor.role && <Text style={{ color: C.tx2, marginBottom: 2 }}>{tutor.role}</Text>}
          {tutor.email && <Text style={{ color: C.tx2 }}>{tutor.email}</Text>}
        </View>

        {/* Earnings breakdown */}
        <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, marginBottom: 8, color: C.navy }}>Earnings Breakdown</Text>
        <View style={s.rowBg}>
          <Text style={s.label}>Sessions delivered</Text>
          <Text style={s.value}>{sessions_count}</Text>
        </View>
        <View style={s.rowBg}>
          <Text style={s.label}>Rate per session</Text>
          <Text style={s.value}>{fmt(rate)}</Text>
        </View>
        <View style={s.rowBg}>
          <Text style={s.label}>Session earnings ({sessions_count} × {fmt(rate)})</Text>
          <Text style={s.value}>{fmt(sessionTotal)}</Text>
        </View>
        {bonus > 0 && (
          <View style={s.rowBg}>
            <Text style={s.label}>Bonus</Text>
            <Text style={[s.value, { color: C.green }]}>{fmt(bonus)}</Text>
          </View>
        )}

        <View style={s.divider} />

        {/* Total */}
        <View style={s.totalBox}>
          <View>
            <Text style={s.totalLabel}>GROSS PAY</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 8, marginTop: 2 }}>
              Period: {fmtDate(period_start)} – {fmtDate(period_end)}
            </Text>
          </View>
          <Text style={s.totalAmt}>{fmt(gross)}</Text>
        </View>

        {/* Payment info */}
        {paid_at && (
          <View style={[s.row, { marginTop: 12 }]}>
            <Text style={s.label}>Payment date</Text>
            <Text style={s.value}>{fmtDate(paid_at)}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footTx}>F-to-A Tutoring • Cambridge Curriculum Specialists • Zimbabwe</Text>
          <Text style={s.footTx}>Generated {new Date().toLocaleDateString('en-AU')}</Text>
        </View>
      </Page>
    </Document>
  )
}
