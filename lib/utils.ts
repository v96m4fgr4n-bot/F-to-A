import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  })
}

export function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function avatarColor(name: string): string {
  const colors = [
    'bg-brand text-white', 'bg-orange text-white', 'bg-green text-white',
    'bg-purple text-white', 'bg-yellow text-white', 'bg-red text-white',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}
