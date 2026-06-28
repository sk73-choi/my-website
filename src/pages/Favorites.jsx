import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ExternalLink } from 'lucide-react'
import { categories, links, hostOf, faviconOf } from '../data/bookmarks'
import { PageWrapper } from '../components/motion'
import SearchBar from '../components/SearchBar'
import Seo from '../components/Seo'

const ALL = '전체'

function Favorites() {
  const [active, setActive] = useState(ALL)
  const [query, setQuery] = useState('')

  // 링크가 없어도 모든 카테고리를 탭으로 노출
  const tabs = [ALL, ...categories]

  // 카테고리 + 검색어(제목/설명/URL)로 필터링
  const q = query.trim().toLowerCase()
  const filtered = links.filter((l) => {
    const catOk = active === ALL || l.category === active
    const queryOk =
      !q ||
      l.title.toLowerCase().includes(q) ||
      (l.desc ?? '').toLowerCase().includes(q) ||
      l.url.toLowerCase().includes(q)
    return catOk && queryOk
  })

  return (
    <PageWrapper>
      <Seo title="즐겨찾기" description="자주 찾는 사이트를 카테고리별로 모은 공간." path="/favorites" />
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-grad-orange">즐겨찾기</span>
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          자주 찾는 사이트를 카테고리별로 모아둔 공간입니다.
        </p>
      </header>

      {/* 검색 */}
      <SearchBar value={query} onChange={setQuery} placeholder="제목·설명·URL로 검색…" />

      {/* 카테고리 필터 */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Star size={16} className="text-amber-400" />
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={[
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all',
              active === tab
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/30'
                : 'glass text-gray-600 hover:scale-105 dark:text-gray-300',
            ].join(' ')}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 링크 카드 */}
      {filtered.length === 0 ? (
        <p className="glass rounded-2xl py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          조건에 맞는 즐겨찾기가 없습니다.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((link, i) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -6 }}
            >
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="glass group flex h-full items-start gap-3 rounded-2xl p-5"
              >
                {/* 파비콘 (로드 실패 시 Globe 아이콘으로 대체) */}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/70 shadow-sm dark:bg-white/10">
                  <img
                    src={faviconOf(link.url)}
                    alt=""
                    width={24}
                    height={24}
                    onError={(e) => {
                      e.currentTarget.replaceWith(
                        Object.assign(document.createElement('span'), {
                          className: 'text-amber-500',
                          innerHTML:
                            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/></svg>',
                        }),
                      )
                    }}
                  />
                </span>

                <div className="min-w-0 flex-grow">
                  <div className="flex items-center gap-1">
                    <h3 className="truncate font-semibold text-gray-900 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                      {link.title}
                    </h3>
                    <ExternalLink
                      size={13}
                      className="shrink-0 text-gray-400 group-hover:text-orange-500"
                    />
                  </div>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {hostOf(link.url)}
                  </p>
                  {link.desc && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {link.desc}
                    </p>
                  )}
                  <span className="mt-2 inline-block rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-300">
                    {link.category}
                  </span>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}

export default Favorites
