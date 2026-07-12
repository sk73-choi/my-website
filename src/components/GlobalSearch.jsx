import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, FileText, FolderOpen, Star, ExternalLink } from 'lucide-react'
import { getSortedPosts } from '../data/posts'
import { getSortedFiles } from '../data/files'
import { links as bookmarkLinks, hostOf, faviconOf } from '../data/bookmarks'

const LIMIT = 6

// 통합 검색 오버레이. 블로그/자료실/즐겨찾기를 한 번에 검색.
function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')

  // 열릴 때 입력 초기화 + 포커스
  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  // Esc 로 닫기
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const q = query.trim().toLowerCase()

  const posts = useMemo(
    () =>
      !q
        ? []
        : getSortedPosts()
            .filter(
              (p) =>
                p.title.toLowerCase().includes(q) ||
                p.tags.some((t) => t.toLowerCase().includes(q)),
            )
            .slice(0, LIMIT),
    [q],
  )
  const files = useMemo(
    () =>
      !q
        ? []
        : getSortedFiles()
            .filter(
              (f) =>
                f.title.toLowerCase().includes(q) ||
                (f.desc ?? '').toLowerCase().includes(q),
            )
            .slice(0, LIMIT),
    [q],
  )
  const marks = useMemo(
    () =>
      !q
        ? []
        : bookmarkLinks
            .filter(
              (l) =>
                l.title.toLowerCase().includes(q) ||
                (l.desc ?? '').toLowerCase().includes(q) ||
                l.url.toLowerCase().includes(q),
            )
            .slice(0, LIMIT),
    [q],
  )

  const empty = q && posts.length === 0 && files.length === 0 && marks.length === 0
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')

  function goPost(slug) {
    onClose()
    navigate(`/blog/${slug}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/40 px-4 pt-20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="glass mx-auto max-w-xl overflow-hidden rounded-2xl"
          >
            {/* 입력 */}
            <div className="flex items-center gap-2 border-b border-gray-200/60 px-4 dark:border-white/10">
              <Search size={18} className="shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="블로그 · 자료실 · 즐겨찾기 통합 검색…"
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-400 dark:text-white"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="rounded-full p-1 text-gray-400 hover:bg-gray-200/60 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {/* 결과 */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!q && (
                <p className="px-3 py-6 text-center text-sm text-gray-400">
                  검색어를 입력하세요.
                </p>
              )}
              {empty && (
                <p className="px-3 py-6 text-center text-sm text-gray-400">
                  검색 결과가 없습니다.
                </p>
              )}

              {posts.length > 0 && (
                <Section icon={FileText} label="블로그">
                  {posts.map((p) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => goPost(p.slug)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-indigo-500/10"
                    >
                      <FileText size={16} className="shrink-0 text-indigo-500" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                          {p.title}
                        </span>
                        {p.tags.length > 0 && (
                          <span className="block truncate text-xs text-gray-400">
                            #{p.tags.join(' #')}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </Section>
              )}

              {files.length > 0 && (
                <Section icon={FolderOpen} label="자료실">
                  {files.map((f) => (
                    <a
                      key={f.id}
                      href={base + f.path}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-indigo-500/10"
                    >
                      <FolderOpen size={16} className="shrink-0 text-fuchsia-500" />
                      <span className="min-w-0 flex-grow">
                        <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                          {f.title}
                        </span>
                        <span className="block truncate text-xs text-gray-400">
                          {f.category} · {f.type}
                        </span>
                      </span>
                      <ExternalLink size={13} className="shrink-0 text-gray-400" />
                    </a>
                  ))}
                </Section>
              )}

              {marks.length > 0 && (
                <Section icon={Star} label="즐겨찾기">
                  {marks.map((l) => (
                    <a
                      key={l.id}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-amber-500/10"
                    >
                      <img
                        src={faviconOf(l.url)}
                        alt=""
                        width={16}
                        height={16}
                        className="shrink-0 rounded"
                        onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                      />
                      <span className="min-w-0 flex-grow">
                        <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                          {l.title}
                        </span>
                        <span className="block truncate text-xs text-gray-400">
                          {hostOf(l.url)} · {l.category}
                        </span>
                      </span>
                      <ExternalLink size={13} className="shrink-0 text-gray-400" />
                    </a>
                  ))}
                </Section>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Section({ icon: Icon, label, children }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase">
        <Icon size={12} /> {label}
      </div>
      {children}
    </div>
  )
}

export default GlobalSearch
