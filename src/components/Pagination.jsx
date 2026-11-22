import { ChevronLeft, ChevronRight } from 'lucide-react'

// 현재 페이지 주변만 보여주는 번호 목록: [1, '…', 4, 5, 6, '…', 30]
function pageItems(current, total, around = 2) {
  const set = new Set([1, total])
  for (let i = current - around; i <= current + around; i++) {
    if (i >= 1 && i <= total) set.add(i)
  }
  const sorted = [...set].sort((a, b) => a - b)
  const items = []
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) items.push('…')
    items.push(n)
  })
  return items
}

// 페이지 번호 내비게이션 (page 는 1부터 시작)
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const btn =
    'glass flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-medium tabular-nums text-gray-600 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 dark:text-gray-300'

  return (
    <nav aria-label="페이지 이동" className="my-4 flex flex-wrap items-center justify-center gap-1.5">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className={btn} aria-label="이전 페이지">
        <ChevronLeft size={16} />
      </button>
      {pageItems(page, totalPages).map((it, i) =>
        it === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-gray-400" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={it}
            type="button"
            onClick={() => onChange(it)}
            aria-current={it === page ? 'page' : undefined}
            className={
              it === page
                ? 'flex h-9 min-w-9 items-center justify-center rounded-full bg-gradient-to-r from-lime-500 to-teal-600 px-2 text-sm font-bold tabular-nums text-white shadow-md shadow-emerald-500/30'
                : btn
            }
          >
            {it}
          </button>
        ),
      )}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} className={btn} aria-label="다음 페이지">
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}

export default Pagination
