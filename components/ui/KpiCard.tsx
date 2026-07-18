'use client'
import { cn } from '@/lib/utils'
import { Ic } from '@/components/ui/Icon'

type KpiColor = 'blue' | 'green' | 'orange' | 'purple'

interface KpiCardProps {
  label: string
  value: string | number
  delta?: string
  deltaUp?: boolean
  deltaSub?: string
  /** 3px colored top-border variant, per design */
  color?: KpiColor
  /** legacy prop — maps old accent utility classes to a top-border color */
  accent?: string
  valueSize?: number
  valueColor?: string
  className?: string
}

const ACCENT_MAP: Record<string, KpiColor> = {
  'bg-brand': 'blue',
  'bg-green': 'green',
  'bg-orange': 'orange',
  'bg-purple': 'purple',
  'bg-red': 'orange',
  'bg-yellow': 'orange',
}

export function KpiCard({ label, value, delta, deltaUp = true, deltaSub, color, accent, valueSize, valueColor, className }: KpiCardProps) {
  const variant: KpiColor = color ?? (accent ? ACCENT_MAP[accent] ?? 'blue' : 'blue')
  return (
    <div className={cn('kpi-card', variant, className)}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-val" style={{ fontSize: valueSize, color: valueColor }}>{value}</div>
      {delta && (
        <div className={cn('kpi-delta', deltaUp ? 'pos' : 'neg')}>
          <Ic n={deltaUp ? 'up' : 'down'} s={13} />
          {delta}
          {deltaSub && <span className="kpi-delta-sub">{deltaSub}</span>}
        </div>
      )}
    </div>
  )
}
