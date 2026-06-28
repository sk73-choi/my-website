import { motion } from 'framer-motion'
import { Download, Eye } from 'lucide-react'
import { formatDate } from '../lib/format'

// 파일 유형별 그라데이션 색상
const typeColor = {
  pdf: 'from-red-500 to-rose-500',
  pptx: 'from-orange-500 to-amber-500',
  ppt: 'from-orange-500 to-amber-500',
  xlsx: 'from-green-500 to-emerald-500',
  xls: 'from-green-500 to-emerald-500',
  docx: 'from-blue-500 to-sky-500',
  doc: 'from-blue-500 to-sky-500',
  md: 'from-violet-500 to-purple-500',
}

// 자료실 파일 카드: 유형 뱃지 + 제목/설명 + 메타 + 보기/다운로드 버튼
// onPreview 가 주어지고 PDF 인 경우 '보기' 버튼을 노출
function FileCard({ file, onPreview }) {
  const gradient = typeColor[file.type] ?? 'from-gray-500 to-gray-600'
  const canPreview = file.type === 'pdf' && typeof onPreview === 'function'

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}>
      <div className="glass flex h-full flex-col rounded-2xl p-5">
        <div className="flex items-start gap-4">
          {/* 유형 뱃지 */}
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white uppercase shadow-md ${gradient}`}
          >
            {file.type}
          </span>
          <div className="min-w-0 flex-grow">
            <h3 className="truncate font-semibold text-gray-900 dark:text-white">
              {file.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {file.category} · {file.size} · {formatDate(file.date)}
            </p>
          </div>
        </div>

        {file.desc && (
          <p className="mt-3 line-clamp-2 flex-grow text-sm text-gray-600 dark:text-gray-400">
            {file.desc}
          </p>
        )}

        {/* 보기(PDF) / 다운로드 버튼 */}
        <div className="mt-4 flex gap-2">
          {canPreview && (
            <button
              type="button"
              onClick={() => onPreview(file)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-transform hover:scale-[1.03]"
            >
              <Eye size={15} /> 보기
            </button>
          )}
          <a
            href={import.meta.env.BASE_URL.replace(/\/$/, '') + file.path}
            download
            className={[
              'inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:scale-[1.03]',
              canPreview
                ? 'glass text-gray-700 dark:text-gray-200'
                : 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20',
            ].join(' ')}
          >
            <Download size={15} /> 다운로드
          </a>
        </div>
      </div>
    </motion.div>
  )
}

export default FileCard
