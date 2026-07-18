'use client'
import { cn } from '@/lib/utils'

/* Design pill styles: 11.5px/700, padding 3px 9px, radius 6px */
const styles: Record<string, { bg: string; color: string }> = {
  active: { bg: '#E8F5E9', color: 'var(--green)' },
  paused: { bg: '#FEF3C7', color: '#b45309' },
  pending: { bg: '#F2EEFF', color: 'var(--purple)' },
  churned: { bg: '#FEE2E2', color: 'var(--red)' },
  signed: { bg: '#E8F5E9', color: 'var(--green)' },
  expired: { bg: '#FEF3C7', color: '#b45309' },
  paid: { bg: '#E8F5E9', color: 'var(--green)' },
  due: { bg: '#FEF3C7', color: '#b45309' },
  overdue: { bg: '#FEE2E2', color: 'var(--red)' },
  present: { bg: '#E8F5E9', color: 'var(--green)' },
  absent: { bg: '#FEE2E2', color: 'var(--red)' },
  late: { bg: '#FEF3C7', color: '#b45309' },
  cancelled: { bg: 'var(--bg)', color: 'var(--text-3)' },
  inquiry: { bg: '#F2EEFF', color: 'var(--purple)' },
  matching: { bg: '#FEF3C7', color: '#b45309' },
  trial: { bg: '#EBF6FF', color: 'var(--blue)' },
  intensive: { bg: '#FEE2E2', color: 'var(--red)' },
  standard: { bg: '#EBF6FF', color: 'var(--blue)' },
  starter: { bg: '#E8F5E9', color: 'var(--green)' },
  payg: { bg: '#FEF3C7', color: '#b45309' },
  whatsapp: { bg: '#DCF8E4', color: '#128C7E' },
  email: { bg: '#EBF6FF', color: 'var(--blue)' },
  both: { bg: '#F2EEFF', color: 'var(--purple)' },
}

export function Badge({ value, size, className }: { value: string; size?: 'sm' | 'md'; className?: string }) {
  const s = styles[value] ?? { bg: 'var(--bg)', color: 'var(--text-2)' }
  return (
    <span className={cn('pill capitalize', className)} style={{ background: s.bg, color: s.color, ...(size === 'sm' ? { fontSize: 10.5, padding: '2px 7px' } : {}) }}>
      {value}
    </span>
  )
}
