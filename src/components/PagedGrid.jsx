import { Children, isValidElement, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Pagination from './Pagination'

// 블로그 본문의 이미지 그리드(<div class="mame-grid">)를 N개 단위 페이지로 나눠 보여준다.
// 현재 페이지는 URL(?p=3)에 보관 → 새로고침·뒤로가기·링크 공유 시에도 같은 페이지 유지.
function PagedGrid({ children, pageSize = 20, className = 'mame-grid' }) {
  const [params, setParams] = useSearchParams()
  const topRef = useRef(null)

  // 마크다운이 만든 줄바꿈 텍스트 노드는 제외하고 항목(figure)만 사용
  const items = Children.toArray(children).filter(isValidElement)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const requested = parseInt(params.get('p') ?? '1', 10)
  const page = Math.min(totalPages, Math.max(1, Number.isNaN(requested) ? 1 : requested))

  const start = (page - 1) * pageSize
  const slice = items.slice(start, start + pageSize)

  function go(next) {
    const p = Math.min(totalPages, Math.max(1, next))
    setParams(
      (prev) => {
        const q = new URLSearchParams(prev)
        if (p === 1) q.delete('p')
        else q.set('p', String(p))
        return q
      },
      { replace: true },
    )
    // 목록 맨 위로 부드럽게 이동 (고정 네비게이션 높이만큼 여백은 scroll-mt 로 확보)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={topRef} className="scroll-mt-24">
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>
          총 <b className="text-gray-800 dark:text-gray-100">{items.length}</b>개 ·{' '}
          {start + 1}–{Math.min(start + pageSize, items.length)}번째
        </span>
        <span className="tabular-nums">
          {page} / {totalPages} 페이지
        </span>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={go} />
      {/* key 로 페이지가 바뀔 때 이미지 lazy-load 를 새로 시작 */}
      <div key={page} className={className}>
        {slice}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={go} />
    </div>
  )
}

export default PagedGrid
