'use client'
import { useRef, useState } from 'react'
import { Ic } from '@/components/ui/Icon'

export function SearchBox({ placeholder = 'Search…', onSearch, className }: {
  placeholder?: string
  onSearch: (q: string) => void
  className?: string
}) {
  const [val, setVal] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setVal(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onSearch(v), 300)
  }

  return (
    <div className={`search-box ${className ?? ''}`}>
      <Ic n="search" s={16} />
      <input value={val} onChange={handleChange} placeholder={placeholder} />
    </div>
  )
}
