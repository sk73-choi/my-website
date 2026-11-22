import { useEffect, useState } from 'react'
import { Monitor, Tablet, Smartphone } from 'lucide-react'

// ───────────────────────────────────────────────────────────
// UI 데모 공용 유틸
// 주의: 데모는 블로그 본문(.prose-custom) 안에 렌더링되므로 p/ul/li/h*/a/img/code
// 태그를 쓰면 본문 스타일이 섞인다 → div/span/button 으로만 구성한다.
// ───────────────────────────────────────────────────────────

// ESC 키로 닫기
export function useEscape(active, onEsc) {
  useEffect(() => {
    if (!active) return
    const onKey = (e) => e.key === 'Escape' && onEsc()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, onEsc])
}

// 요소 바깥 클릭 감지(click-outside)
export function useClickOutside(ref, active, handler) {
  useEffect(() => {
    if (!active) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [ref, active, handler])
}

// 열려 있는 동안 뒤쪽 페이지 스크롤 잠금
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])
}

// 데모 외곽 프레임 (LIVE DEMO 라벨 + 사용 안내)
export function Frame({ hint, children, bodyClassName = 'p-4 sm:p-5' }) {
  return (
    <div className="ui-demo my-5 overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-sm dark:border-white/10 dark:bg-gray-900/60">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50/80 px-3 py-1.5 text-[11px] dark:border-white/10 dark:bg-white/5">
        <span className="flex items-center gap-1.5 font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          LIVE DEMO
        </span>
        {hint && <span className="text-gray-500 dark:text-gray-400">👉 {hint}</span>}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  )
}

// 화면 폭 전환기: 데스크톱/태블릿/모바일 폭으로 내부 박스를 줄여 반응형 동작을 시연.
// 내부는 Tailwind 컨테이너 쿼리(@container, @sm:, @lg:)로 "박스 폭" 기준 재배치.
// (실제 사이트에선 뷰포트 기준 미디어쿼리 sm:/md:/lg: 를 쓰면 된다)
const MODES = [
  { id: 'desktop', label: '데스크톱', range: '≥1024px', Icon: Monitor, width: '100%' },
  { id: 'tablet', label: '태블릿', range: '768~1023px', Icon: Tablet, width: '460px' },
  { id: 'mobile', label: '모바일', range: '≤767px', Icon: Smartphone, width: '300px' },
]

export function ViewportSwitch({ children }) {
  const [mode, setMode] = useState('desktop')
  const current = MODES.find((m) => m.id === mode)
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {MODES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            aria-pressed={mode === id}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              mode === id
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
        <span className="ml-1 text-xs text-gray-400">가정 폭: {current.range}</span>
      </div>
      <div
        className="@container mx-auto rounded-lg border border-dashed border-gray-300 p-2 transition-[max-width] duration-500 ease-out dark:border-white/15"
        style={{ maxWidth: current.width }}
      >
        {children}
      </div>
    </div>
  )
}
