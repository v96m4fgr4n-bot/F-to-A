'use client'
import { cn } from '@/lib/utils'

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value))
  const color = pct >= 75 ? 'bg-green' : pct >= 40 ? 'bg-yellow' : 'bg-red'
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-tx-2 w-8">{pct}%</span>
    </div>
  )
}
