'use client'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
}

export function Drawer({ open, onClose, title, children, width = 'w-[480px]' }: DrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-navy/30 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-surface h-full shadow-xl flex flex-col drawer-enter', width)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-700 text-tx">{title}</h2>
          <button onClick={onClose} className="text-tx-3 hover:text-tx transition text-lg">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}
