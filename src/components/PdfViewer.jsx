import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// pdf.js 워커 설정 (Vite 번들링)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const MIN_SCALE = 0.6
const MAX_SCALE = 2.4

// PDF 미리보기 (모달 내부에서 사용). file: { title, path } 형태
function PdfViewer({ file, onClose }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.1)
  const [error, setError] = useState(null)

  const fileUrl = import.meta.env.BASE_URL.replace(/\/$/, '') + file.path

  const goPrev = () => setPageNumber((p) => Math.max(1, p - 1))
  const goNext = () => setPageNumber((p) => Math.min(numPages ?? 1, p + 1))
  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, +(s + 0.2).toFixed(2)))
  const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, +(s - 0.2).toFixed(2)))

  return (
    <div className="flex h-full flex-col">
      {/* 툴바 (좁은 화면에서 컨트롤이 다음 줄로 줄바꿈) */}
      <div className="glass flex flex-wrap items-center justify-between gap-2 rounded-t-2xl px-3 py-2.5 sm:px-4 sm:py-3">
        <h3 className="min-w-[40%] flex-grow truncate text-sm font-semibold text-gray-900 dark:text-white">
          {file.title}
        </h3>

        <div className="flex items-center gap-1">
          {/* 페이지 이동 */}
          <button
            type="button"
            onClick={goPrev}
            disabled={pageNumber <= 1}
            className="rounded-full p-1.5 text-gray-600 hover:bg-white/50 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-white/10"
            aria-label="이전 페이지"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-16 text-center text-xs text-gray-600 tabular-nums dark:text-gray-300">
            {pageNumber} / {numPages ?? '–'}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={numPages != null && pageNumber >= numPages}
            className="rounded-full p-1.5 text-gray-600 hover:bg-white/50 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-white/10"
            aria-label="다음 페이지"
          >
            <ChevronRight size={18} />
          </button>

          {/* 확대/축소 */}
          <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-white/15" />
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            className="rounded-full p-1.5 text-gray-600 hover:bg-white/50 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-white/10"
            aria-label="축소"
          >
            <ZoomOut size={18} />
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            className="rounded-full p-1.5 text-gray-600 hover:bg-white/50 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-white/10"
            aria-label="확대"
          >
            <ZoomIn size={18} />
          </button>

          {/* 다운로드 / 닫기 */}
          <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-white/15" />
          <a
            href={fileUrl}
            download
            className="rounded-full p-1.5 text-gray-600 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-white/10"
            aria-label="다운로드"
          >
            <Download size={18} />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-600 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-white/10"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 문서 영역 */}
      <div className="flex-grow overflow-auto rounded-b-2xl bg-gray-100/60 p-4 dark:bg-black/30">
        {error ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-gray-500 dark:text-gray-400">
            PDF를 불러오지 못했습니다.
            <br />
            파일 경로를 확인해 주세요.
          </div>
        ) : (
          <div className="flex justify-center">
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages: n }) => {
                setNumPages(n)
                setError(null)
              }}
              onLoadError={(e) => setError(e)}
              loading={
                <div className="py-20 text-sm text-gray-500 dark:text-gray-400">
                  불러오는 중…
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                className="overflow-hidden rounded-lg shadow-lg"
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  )
}

export default PdfViewer
