'use client'
import { useCallback, useState } from 'react'

export function SearchBox({ placeholder = 'Search…', onSearch, className }: {
  placeholder?: string
  onSearch: (q: string) => void
  className?: string
}) {
  const [val, setVal] = useState('')
  let timer: ReturnType<typeof setTimeout>

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setVal(v)
    clearTimeout(timer)
    timer = setTimeout(() => onSearch(v), 300)
  }

  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-3 text-sm">⌕</span>
      <input
        value={val}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-2 bg-surface border border-border rounded-btn text-sm text-tx placeholder:text-tx-3 focus:outline-none focus:border-brand"
      />
    </div>
  )
}
