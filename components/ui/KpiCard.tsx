'use client'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  delta?: string
  deltaUp?: boolean
  accent?: string
  icon?: React.ReactNode
  className?: string
}

export function KpiCard({ label, value, delta, deltaUp, accent = 'bg-brand', icon, className }: KpiCardProps) {
  return (
    <div className={cn('bg-surface rounded-card border border-border p-5 flex flex-col gap-3', className)}>
      <div className={cn('w-1 h-8 rounded-full self-start', accent)} />
      <div>
        <p className="text-tx-2 text-xs font-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-800 text-tx font-mono">{value}</p>
        {delta && (
          <p className={cn('text-xs mt-1 font-500', deltaUp ? 'text-green' : 'text-red')}>
            {deltaUp ? '↑' : '↓'} {delta}
          </p>
        )}
      </div>
    </div>
  )
}
