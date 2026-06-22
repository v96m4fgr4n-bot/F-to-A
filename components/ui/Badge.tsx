'use client'
import { cn } from '@/lib/utils'

const variants: Record<string, string> = {
  active: 'bg-green/10 text-green',
  paused: 'bg-yellow/10 text-yellow',
  pending: 'bg-brand/10 text-brand',
  churned: 'bg-red/10 text-red',
  paid: 'bg-green/10 text-green',
  due: 'bg-yellow/10 text-yellow',
  overdue: 'bg-red/10 text-red',
  present: 'bg-green/10 text-green',
  absent: 'bg-red/10 text-red',
  late: 'bg-yellow/10 text-yellow',
  cancelled: 'bg-tx-3/10 text-tx-3',
  inquiry: 'bg-purple/10 text-purple',
  matching: 'bg-brand/10 text-brand',
  trial: 'bg-orange/10 text-orange',
  intensive: 'bg-purple/10 text-purple',
  standard: 'bg-brand/10 text-brand',
  starter: 'bg-green/10 text-green',
  payg: 'bg-orange/10 text-orange',
  whatsapp: 'bg-green/10 text-green',
  email: 'bg-brand/10 text-brand',
  both: 'bg-purple/10 text-purple',
}

export function Badge({ value, className }: { value: string; className?: string }) {
  const style = variants[value] ?? 'bg-tx-3/10 text-tx-3'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 capitalize', style, className)}>
      {value}
    </span>
  )
}
