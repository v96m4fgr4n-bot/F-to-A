'use client'
import { cn } from '@/lib/utils'

export function ProgressBar({ value, color, className }: { value: number; color?: string; className?: string }) {
  const pct = Math.min(100, Math.max(0, value))
  const fill = color ?? (pct >= 75 ? 'var(--green)' : pct >= 40 ? 'var(--blue)' : 'var(--orange)')
  return (
    <div className={cn('prog-wrap', className)}>
      <div className="prog-track">
        <div className="prog-fill" style={{ width: `${pct}%`, background: fill }} />
      </div>
      <span className="prog-val">{pct}%</span>
    </div>
  )
}
