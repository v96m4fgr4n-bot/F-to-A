'use client'
import { initials, avatarColor, cn } from '@/lib/utils'

export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }
  return (
    <div className={cn('rounded-full flex items-center justify-center font-700 shrink-0', sizes[size], avatarColor(name), className)}>
      {initials(name)}
    </div>
  )
}
