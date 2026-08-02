import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  LayoutGrid,
  List,
  Download,
  Eye,
} from 'lucide-react'
import { getSortedFiles, categories } from '../data/files'
import FileCard, { typeColor } from '../components/FileCard'
import PdfViewer from '../components/PdfViewer'
import SearchBar from '../components/SearchBar'
import { PageWrapper } from '../components/motion'
import Seo from '../components/Seo'
import { formatDate } from '../lib/format'

const ALL = '전체'
const base = import.meta.env.BASE_URL.replace(/\/$/, '')
const PER_PAGE = 8 // 페이지당 자료 수(그리드·목록 보기)

// 표시 방식: 전체(모두) / 그리드(8개) / 목록(8개)
const VIEWS = [
  { id: 'all', label: '전체', icon: Grid3x3 },
  { id: 'grid', label: '그리드', icon: LayoutGrid },
  { id: 'list', label: '목록', icon: List },
]

function Files() {
  const [activeCat, setActiveCat] = useState(ALL)
  const [query, setQuery] = useState('')
  const [view, setView] = useState('all') // 표시 방식
  const [page, setPage] = useState(0) // 페이지(그리드·목록 보기)
  const [previewFile, setPreviewFile] = useState(null)
  const allFiles = getSortedFiles()

  // 자료가 없어도 모든 카테고리를 탭으로 노출
  const tabs = [ALL, ...categories]

  // 카테고리별 자료 건수(탭 배지용 · 검색어와 무관한 전체 기준)
  const counts = useMemo(() => {
    const map = { [ALL]: allFiles.length }
    for (const f of allFiles) map[f.category] = (map[f.category] || 0) + 1
    return map
  }, [allFiles])

  // 카테고리 + 검색어(제목/설명)로 필터링
  const q = query.trim().toLowerCase()
  const filtered = allFiles.filter((f) => {
    const catOk = activeCat === ALL || f.category === activeCat
    const queryOk =
      !q || f.title.toLowerCase().includes(q) || (f.desc ?? '').toLowerCase().includes(q)
    return catOk && queryOk
  })

  // 페이지네이션(전체 보기는 페이지 없음)
  const paged = view === 'all' ? filtered : filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

  // 카테고리·검색어·표시 방식이 바뀌면 첫 페이지로
  useEffect(() => {
    setPage(0)
  }, [activeCat, q, view])

  return (
    <PageWrapper>
      <Seo title="자료실" description="PDF·문서·슬라이드 등 자료 모음." path="/files" />
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-gradient">자료실</span>
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          PDF, 문서, 슬라이드 등 자료를 모아둔 공간입니다.
        </p>
      </header>

      {/* 검색 */}
      <SearchBar value={query} onChange={setQuery} placeholder="이름·설명으로 검색…" />

      {/* 카테고리 필터 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FolderOpen size={16} className="text-gray-400" />
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveCat(tab)}
            className={[
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all',
              activeCat === tab
                ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'glass text-gray-600 hover:scale-105 dark:text-gray-300',
            ].join(' ')}
          >
            {tab}
            <span
              className={[
                'rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums',
                activeCat === tab
                  ? 'bg-white/25 text-white'
                  : 'bg-black/5 text-gray-500 dark:bg-white/10 dark:text-gray-400',
              ].join(' ')}
            >
              {counts[tab] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* 표시 방식 선택: 전체 / 그리드(8개) / 목록(8개) */}
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
                ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'glass text-gray-600 hover:scale-105 dark:text-gray-300',
            ].join(' ')}
          >
            <Icon size={15} />
            {label}
            {id !== 'all' && <span className="opacity-70">(8개)</span>}
          </button>
        ))}
      </div>

      {/* 자료 표시: 빈 상태 / 목록 보기 / 그리드(전체·8개) 보기 */}
      {filtered.length === 0 ? (
        <p className="glass rounded-2xl py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          조건에 맞는 자료가 없습니다.
        </p>
      ) : view === 'list' ? (
        /* 목록 보기 (8개 단위) */
        <ul className="flex flex-col gap-2">
          {paged.map((file, i) => {
            const gradient = typeColor[file.type] ?? 'from-gray-500 to-gray-600'
            const canPreview = file.type === 'pdf'
            return (
              <motion.li
                key={file.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="glass flex items-center gap-4 rounded-2xl p-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[10px] font-bold text-white uppercase shadow-md ${gradient}`}
                  >
                    {file.type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-800 dark:text-gray-100">
                      {file.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {file.category} · {file.size} · {formatDate(file.date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {canPreview && (
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        aria-label="보기"
                        className="rounded-full bg-indigo-500/10 p-2 text-indigo-600 hover:bg-indigo-500/20 dark:text-indigo-300"
                      >
                        <Eye size={15} />
                      </button>
                    )}
                    <a
                      href={base + file.path}
                      download
                      aria-label="다운로드"
                      className="rounded-full bg-fuchsia-500/10 p-2 text-fuchsia-600 hover:bg-fuchsia-500/20 dark:text-fuchsia-300"
                    >
                      <Download size={15} />
                    </a>
                  </div>
                </div>
              </motion.li>
            )
          })}
        </ul>
      ) : (
        /* 그리드 보기 (전체 또는 8개 단위) */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((file, i) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <FileCard file={file} onPreview={setPreviewFile} />
            </motion.div>
          ))}
        </div>
      )}

      {/* 페이지 넘김 (그리드·목록 8개 보기에서만) */}
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

      {/* PDF 미리보기 모달 */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewFile(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="h-[92vh] w-full max-w-4xl sm:h-[88vh]"
            >
              <PdfViewer file={previewFile} onClose={() => setPreviewFile(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}

export default Files
