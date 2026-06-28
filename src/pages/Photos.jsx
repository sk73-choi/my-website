import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  LayoutGrid,
  List,
  Film,
} from 'lucide-react'
import { getSortedPhotos, categories } from '../data/photos'
import { PageWrapper } from '../components/motion'
import Seo from '../components/Seo'

const ALL = '전체'
const base = import.meta.env.BASE_URL.replace(/\/$/, '')
const PER_PAGE = 8 // 페이지당 사진 수(그리드·목록 보기)

// 표시 방식: 전체(모두) / 그리드(8장) / 목록(8장)
const VIEWS = [
  { id: 'all', label: '전체', icon: Grid3x3 },
  { id: 'grid', label: '그리드', icon: LayoutGrid },
  { id: 'list', label: '목록', icon: List },
]

function Photos() {
  const [active, setActive] = useState(ALL)
  const [view, setView] = useState('all') // 표시 방식
  const [page, setPage] = useState(0) // 페이지(그리드·목록 보기)
  const [index, setIndex] = useState(-1) // 라이트박스 대상 인덱스(-1=닫힘)
  const all = getSortedPhotos()

  const tabs = [ALL, ...categories]
  const filtered = active === ALL ? all : all.filter((p) => p.category === active)

  // 카테고리별 사진 장수(탭 배지용)
  const counts = useMemo(() => {
    const map = { [ALL]: all.length }
    for (const p of all) map[p.category] = (map[p.category] || 0) + 1
    return map
  }, [all])

  // 페이지네이션(전체 보기는 페이지 없음)
  const paged =
    view === 'all'
      ? filtered
      : filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)
  const offset = view === 'all' ? 0 : page * PER_PAGE
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

  // 카테고리나 표시 방식이 바뀌면 첫 페이지로
  useEffect(() => {
    setPage(0)
  }, [active, view])

  const close = useCallback(() => setIndex(-1), [])
  const prev = useCallback(
    () => setIndex((i) => (i > 0 ? i - 1 : filtered.length - 1)),
    [filtered.length],
  )
  const nextImg = useCallback(
    () => setIndex((i) => (i < filtered.length - 1 ? i + 1 : 0)),
    [filtered.length],
  )

  // 라이트박스 키보드 조작
  useEffect(() => {
    if (index < 0) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') nextImg()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, close, prev, nextImg])

  const current = index >= 0 ? filtered[index] : null

  return (
    <PageWrapper>
      <Seo title="사진" description="여행·취미 등 사진 갤러리." path="/photos" />

      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-grad-rose">사진</span>
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          카테고리별 사진 갤러리입니다. 썸네일을 누르면 원본을 볼 수 있어요.
        </p>
      </header>

      {/* 카테고리 필터 (각 카테고리별 사진 장수 표시) */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Camera size={16} className="text-pink-400" />
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={[
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all',
              active === tab
                ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white shadow-md shadow-pink-500/30'
                : 'glass text-gray-600 hover:scale-105 dark:text-gray-300',
            ].join(' ')}
          >
            {tab}
            <span
              className={[
                'rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums',
                active === tab
                  ? 'bg-white/25 text-white'
                  : 'bg-black/5 text-gray-500 dark:bg-white/10 dark:text-gray-400',
              ].join(' ')}
            >
              {counts[tab] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* 표시 방식 선택: 전체 / 그리드(8장) / 목록(8장) */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">보기</span>
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            aria-pressed={view === id}
            className={[
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
              view === id
                ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white shadow-md shadow-pink-500/30'
                : 'glass text-gray-600 hover:scale-105 dark:text-gray-300',
            ].join(' ')}
          >
            <Icon size={15} />
            {label}
            {id !== 'all' && <span className="opacity-70">(8장)</span>}
          </button>
        ))}
      </div>

      {/* 사진 표시: 빈 상태 / 목록 보기 / 그리드(전체·8장) 보기 */}
      {filtered.length === 0 ? (
        <p className="glass rounded-2xl py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          아직 등록된 사진이 없습니다.
        </p>
      ) : view === 'list' ? (
        /* 목록 보기 (8장 단위) */
        <ul className="flex flex-col gap-2">
          {paged.map((photo, i) => (
            <motion.li
              key={photo.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <button
                type="button"
                onClick={() => setIndex(offset + i)}
                className="glass flex w-full items-center gap-4 rounded-2xl p-2 text-left transition-all hover:scale-[1.01]"
              >
                <img
                  src={base + photo.thumb}
                  alt={photo.title}
                  loading="lazy"
                  className={[
                    'h-16 w-16 flex-none rounded-xl object-cover',
                    photo.animated ? 'ring-2 ring-pink-500' : '',
                  ].join(' ')}
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-100">
                    <span className="truncate">{photo.title}</span>
                    {photo.animated && (
                      <span className="flex flex-none items-center gap-0.5 rounded-full bg-pink-500/15 px-1.5 py-0.5 text-[10px] font-bold text-pink-600 dark:text-pink-300">
                        <Film size={10} />
                        움직임
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {photo.category} · {photo.date}
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="flex-none text-gray-300 dark:text-gray-600"
                />
              </button>
            </motion.li>
          ))}
        </ul>
      ) : (
        /* 그리드 보기 (전체 또는 8장 단위) */
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {paged.map((photo, i) => (
            <motion.button
              key={photo.id}
              type="button"
              onClick={() => setIndex(offset + i)}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4 }}
              className={[
                'glass group relative aspect-square overflow-hidden rounded-2xl',
                // 움직이는 이미지는 분홍 테두리로 정적 이미지와 구분
                photo.animated
                  ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                  : '',
              ].join(' ')}
            >
              <img
                src={base + photo.thumb}
                alt={photo.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* 움직임 배지 */}
              {photo.animated && (
                <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-pink-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
                  <Film size={11} />
                  움직임
                </span>
              )}
              {photo.title && (
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-left text-xs font-medium text-white">
                  {photo.title}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* 페이지 넘김 (그리드·목록 8장 보기에서만) */}
      {view !== 'all' && filtered.length > PER_PAGE && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="glass flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300"
          >
            <ChevronLeft size={16} />
            이전
          </button>
          <span className="text-sm font-medium tabular-nums text-gray-500 dark:text-gray-400">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="glass flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300"
          >
            다음
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* 라이트박스 */}
      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            {/* 닫기 */}
            <button
              type="button"
              onClick={close}
              aria-label="닫기"
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X size={20} />
            </button>
            {/* 이전 */}
            {filtered.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                aria-label="이전"
                className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <motion.figure
              key={current.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] max-w-3xl"
            >
              <img
                src={base + current.src}
                alt={current.title}
                className="max-h-[80vh] w-auto rounded-lg object-contain"
              />
              <figcaption className="mt-2 text-center text-sm text-white/80">
                {current.title} · {current.category}
              </figcaption>
            </motion.figure>
            {/* 다음 */}
            {filtered.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  nextImg()
                }}
                aria-label="다음"
                className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}

export default Photos
