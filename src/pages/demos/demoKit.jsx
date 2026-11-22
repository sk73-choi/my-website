import { createContext, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Tag } from 'lucide-react'

// ───────────────────────────────────────────────────────────
// 종합 프롬프트 데모 페이지 공용 키트
// - Term: "[스티키 헤더]" 같은 컴포넌트 이름표(토글로 표시/숨김)
// - DemoToolbar: 이름표 토글 + 블로그로 돌아가기(iframe 안에서는 숨김)
// ───────────────────────────────────────────────────────────

export const BLOG_POST_PATH = '/blog/vibe-coder-web-ui-components'

const LabelCtx = createContext(false)

export function LabelProvider({ value, children }) {
  return <LabelCtx.Provider value={value}>{children}</LabelCtx.Provider>
}

// 부모 요소(relative) 좌상단에 붙는 이름표
export function Term({ children, className = '' }) {
  const show = useContext(LabelCtx)
  if (!show) return null
  return (
    <span
      className={`pointer-events-none absolute top-1 left-1 z-[60] rounded bg-fuchsia-600 px-1.5 py-0.5 font-mono text-[10px] leading-none font-bold whitespace-nowrap text-white shadow ${className}`}
    >
      [{children}]
    </span>
  )
}

// 블로그 글에 iframe 으로 임베드된 경우인지
const inIframe = typeof window !== 'undefined' && window.self !== window.top

// 데모 페이지는 라이트 테마 고정: 사이트가 다크 모드여도 머무는 동안만 .dark 해제
export function useForceLight() {
  useEffect(() => {
    const root = document.documentElement
    const wasDark = root.classList.contains('dark')
    root.classList.remove('dark')
    return () => {
      if (wasDark) root.classList.add('dark')
    }
  }, [])
}

export function useLabels() {
  useForceLight()
  // 임베드 미리보기에서는 기본으로 이름표를 켜 둔다
  return useState(inIframe)
}

export function DemoToolbar({ labels, setLabels }) {
  return (
    <div className="fixed bottom-4 left-4 z-[90] flex items-center gap-2">
      {!inIframe && (
        <Link
          to={BLOG_POST_PATH}
          className="inline-flex items-center gap-1 rounded-full bg-gray-900/90 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur hover:bg-gray-900"
        >
          <ArrowLeft size={14} /> 블로그 글로
        </Link>
      )}
      <button
        type="button"
        onClick={() => setLabels((v) => !v)}
        aria-pressed={labels}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur transition-colors ${
          labels ? 'bg-fuchsia-600 text-white' : 'bg-white/90 text-gray-700 ring-1 ring-gray-200 hover:bg-white'
        }`}
      >
        <Tag size={14} /> 컴포넌트 이름 {labels ? 'ON' : 'OFF'}
      </button>
    </div>
  )
}
