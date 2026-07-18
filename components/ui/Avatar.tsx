'use client'
import { initials, avatarColor, cn } from '@/lib/utils'

const SIZES = { sm: { w: 28, f: 10 }, md: { w: 36, f: 13 }, lg: { w: 52, f: 16 } }

export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = SIZES[size]
  return (
    <div className={cn('avatar', avatarColor(name), className)} style={{ width: s.w, height: s.w, fontSize: s.f }}>
      {initials(name)}
    </div>
  )
}
