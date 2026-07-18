import * as React from 'react'

export type IconName =
  | 'dash' | 'users' | 'chart' | 'money' | 'book' | 'settings' | 'up' | 'down'
  | 'plus' | 'search' | 'check' | 'alert' | 'doc' | 'link' | 'chevR' | 'logout'
  | 'cal' | 'bell' | 'tag' | 'trend' | 'shield' | 'star' | 'tasks'

export function Ic({ n, s = 18, c = 'currentColor' }: { n: IconName; s?: number; c?: string }) {
  const p = { fill: 'none', stroke: c, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const map: Record<IconName, React.ReactNode> = {
    dash: <><rect x="3" y="3" width="7" height="9" rx="1.5" {...p} /><rect x="14" y="3" width="7" height="5" rx="1.5" {...p} /><rect x="14" y="12" width="7" height="9" rx="1.5" {...p} /><rect x="3" y="16" width="7" height="5" rx="1.5" {...p} /></>,
    users: <><circle cx="9" cy="8" r="3" {...p} /><path d="M3.5 19a5.5 5.5 0 0111 0M16 6.5a3 3 0 010 5.8M21 19a5.2 5.2 0 00-3.5-4.6" {...p} /></>,
    chart: <><path d="M4 19V5M4 19h16M8 15v-3M12 15V8M16 15v-5M20 15V3" {...p} /></>,
    money: <><rect x="2" y="5" width="20" height="14" rx="2" {...p} /><path d="M2 10h20" {...p} /></>,
    book: <><path d="M5 4h11a2 2 0 012 2v13a1 1 0 01-1 1H6a2 2 0 01-2-2V4z" {...p} /><path d="M4 17a2 2 0 012-2h11" {...p} /></>,
    settings: <><circle cx="12" cy="12" r="3" {...p} /><path d="M12 2.5l1.3 2.2 2.5-.5.4 2.5 2.2 1.3-1.1 2.3 1.1 2.3-2.2 1.3-.4 2.5-2.5-.5L12 21.5l-1.3-2.2-2.5.5-.4-2.5L5.6 16l1.1-2.3L5.6 11.4l2.2-1.3.4-2.5 2.5.5L12 2.5z" {...p} /></>,
    up: <><path d="M12 19V5M6 11l6-6 6 6" {...p} /></>,
    down: <><path d="M12 5v14M6 13l6 6 6-6" {...p} /></>,
    plus: <><path d="M12 5v14M5 12h14" {...p} /></>,
    search: <><circle cx="11" cy="11" r="7" {...p} /><path d="M20 20l-3.5-3.5" {...p} /></>,
    check: <><path d="M5 12.5l4.5 4.5L19 7" {...p} /></>,
    alert: <><path d="M10.3 3.5l-7.5 13A1.5 1.5 0 004.1 19h15.8a1.5 1.5 0 001.3-2.5l-7.5-13a1.5 1.5 0 00-2.6 0z" {...p} /><path d="M12 9v4M12 17h.01" {...p} /></>,
    doc: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" {...p} /><path d="M14 2v6h6" {...p} /></>,
    link: <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" {...p} /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" {...p} /></>,
    chevR: <><path d="M9 6l6 6-6 6" {...p} /></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" {...p} /></>,
    cal: <><rect x="3" y="4" width="18" height="18" rx="2" {...p} /><path d="M16 2v4M8 2v4M3 10h18" {...p} /></>,
    bell: <><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" {...p} /><path d="M10 19a2 2 0 004 0" {...p} /></>,
    tag: <><path d="M20.6 11.6l-9-9A2 2 0 0010.2 2H4a2 2 0 00-2 2v6.2a2 2 0 00.6 1.4l9 9a2 2 0 002.8 0l6.2-6.2a2 2 0 000-2.8z" {...p} /><circle cx="7.5" cy="7.5" r="1" fill={c} stroke="none" /></>,
    trend: <><path d="M3 17l5-5 4 4 9-9" {...p} /><path d="M17 7h4v4" {...p} /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p} /></>,
    star: <><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.3l6.9-1z" {...p} /></>,
    tasks: <><rect x="9" y="3" width="13" height="4" rx="1.5" {...p} /><rect x="9" y="10" width="13" height="4" rx="1.5" {...p} /><rect x="9" y="17" width="13" height="4" rx="1.5" {...p} /><circle cx="4" cy="5" r="1.5" {...p} /><circle cx="4" cy="12" r="1.5" {...p} /><circle cx="4" cy="19" r="1.5" {...p} /></>,
  }
  return <svg viewBox="0 0 24 24" width={s} height={s}>{map[n]}</svg>
}
