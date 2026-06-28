import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Tag } from 'lucide-react'
import { getSortedPosts, getAllTags } from '../data/posts'
import { formatDate } from '../lib/format'
import { PageWrapper } from '../components/motion'
import SearchBar from '../components/SearchBar'
import Seo from '../components/Seo'

const ALL = '전체'

function Blog() {
  const [activeTag, setActiveTag] = useState(ALL)
  const [query, setQuery] = useState('')
  const posts = getSortedPosts()
  const tags = [ALL, ...getAllTags()]

  // 태그 + 검색어(제목/태그)로 필터링
  const q = query.trim().toLowerCase()
  const filtered = posts.filter((p) => {
    const tagOk = activeTag === ALL || p.tags.includes(activeTag)
    const queryOk =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    return tagOk && queryOk
  })

  return (
    <PageWrapper>
      <Seo title="블로그" description="배운 것들과 생각을 기록한 글 목록." path="/blog" />
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-grad-emerald">블로그</span>
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          배운 것들과 생각을 글로 기록합니다.
        </p>
      </header>

      {/* 검색 */}
      <SearchBar value={query} onChange={setQuery} placeholder="제목·태그로 검색…" />

      {/* 태그 필터 */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Tag size={16} className="text-gray-400" />
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={[
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all',
              activeTag === tag
                ? 'bg-gradient-to-r from-lime-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                : 'glass text-gray-600 hover:scale-105 dark:text-gray-300',
            ].join(' ')}
          >
            {tag === ALL ? tag : `#${tag}`}
          </button>
        ))}
      </div>

      {/* 글 목록 */}
      {filtered.length === 0 ? (
        <p className="glass rounded-2xl py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          조건에 맞는 글이 없습니다.
        </p>
      ) : (
        <div className="space-y-5">
          {filtered.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <Link to={`/blog/${post.slug}`} className="glass group block rounded-2xl p-6">
                <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar size={13} />
                  {formatDate(post.date)}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {post.excerpt}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}

export default Blog
