import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Monitor, RotateCcw, Smartphone } from 'lucide-react'
import { Frame } from './shared'

// 종합 프롬프트 데모 페이지(/demo/*)를 블로그 본문에 iframe 으로 미리보기.
// 데스크톱: 1280px 화면을 박스 폭에 맞게 축소(scale) / 모바일: 375px 실제 크기
const DEVICES = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 700 },
}

function PagePreview({ path, title }) {
  const boxRef = useRef(null)
  const [device, setDevice] = useState('desktop')
  const [boxW, setBoxW] = useState(640)
  const [reloadKey, setReloadKey] = useState(0)
  const src = `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width))
    ro.observe(boxRef.current)
    return () => ro.disconnect()
  }, [])

  const d = DEVICES[device]
  const scale = Math.min(1, boxW / d.width)

  return (
    <Frame hint="미리보기 안에서 직접 스크롤·클릭해 보세요" bodyClassName="p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {[
          ['desktop', '데스크톱', Monitor],
          ['mobile', '모바일', Smartphone],
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setDevice(id)}
            aria-pressed={device === id}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              device === id ? 'bg-emerald-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          aria-label="미리보기 새로고침"
          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <RotateCcw size={13} />
        </button>
        <button
          type="button"
          onClick={() => window.open(src, '_blank', 'noopener')}
          className="ml-auto inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
        >
          <ExternalLink size={13} /> 새 창에서 전체 화면으로
        </button>
      </div>

      <div ref={boxRef} className="w-full">
        <div
          className="mx-auto overflow-hidden rounded-lg border border-gray-300 bg-white shadow-inner dark:border-white/15"
          style={{ width: d.width * scale, height: d.height * scale }}
        >
          <iframe
            key={`${device}-${reloadKey}`}
            src={src}
            title={title}
            loading="lazy"
            className="origin-top-left border-0"
            style={{ width: d.width, height: d.height, transform: `scale(${scale})` }}
          />
        </div>
      </div>
      <div className="mt-2 text-center text-[11px] text-gray-400">
        {device === 'desktop' ? `1280×800 화면을 ${Math.round(scale * 100)}% 로 축소해 표시` : '375px 모바일 화면'} · 미리보기에선
        컴포넌트 이름표(분홍)가 켜져 있습니다
      </div>
    </Frame>
  )
}

export function LandingPagePreview() {
  return <PagePreview path="/demo/landing" title="SaaS 랜딩 페이지 데모" />
}

export function DashboardPagePreview() {
  return <PagePreview path="/demo/dashboard" title="데이터 분석 대시보드 데모" />
}
