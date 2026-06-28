import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen } from 'lucide-react'
import { getSortedFiles, categories } from '../data/files'
import FileCard from '../components/FileCard'
import PdfViewer from '../components/PdfViewer'
import SearchBar from '../components/SearchBar'
import { PageWrapper } from '../components/motion'
import Seo from '../components/Seo'

const ALL = '전체'

function Files() {
  const [activeCat, setActiveCat] = useState(ALL)
  const [query, setQuery] = useState('')
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
      <div className="mb-8 flex flex-wrap items-center gap-2">
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

      {/* 파일 그리드 */}
      {filtered.length === 0 ? (
        <p className="glass rounded-2xl py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          조건에 맞는 자료가 없습니다.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((file, i) => (
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
