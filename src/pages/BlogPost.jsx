import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import { getPostBySlug, getPostContent, getSortedPosts } from '../data/posts'
import { formatDate } from '../lib/format'
import { PageWrapper } from '../components/motion'
import { MdImage, CodePre } from '../lib/mdComponents'
import { readingTime, buildToc } from '../lib/reading'
import Toc from '../components/Toc'
import ScrollProgress from '../components/ScrollProgress'
import Seo from '../components/Seo'
import { SITE } from '../lib/site'

function BlogPost() {
  const { slug } = useParams()
  const post = getPostBySlug(slug)
  const content = getPostContent(slug)

  // 존재하지 않는 글 처리
  if (!post || !content) {
    return (
      <PageWrapper className="py-20 text-center">
        <Seo title="글을 찾을 수 없음" path={`/blog/${slug}`} />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          글을 찾을 수 없습니다
        </h1>
        <Link
          to="/blog"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-lime-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105"
        >
          블로그 목록으로
        </Link>
      </PageWrapper>
    )
  }

  const toc = buildToc(content)
  const minutes = readingTime(content)

  // 이전/다음 글 (최신순 기준: prev=더 최신, next=더 과거)
  const sorted = getSortedPosts()
  const idx = sorted.findIndex((p) => p.slug === slug)
  const prev = idx > 0 ? sorted[idx - 1] : null
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null

  return (
    <PageWrapper className="mx-auto max-w-5xl">
      <ScrollProgress />
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blog/${slug}`}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          datePublished: post.date,
          description: post.excerpt,
          keywords: post.tags.join(', '),
          author: { '@type': 'Person', name: SITE.author },
          url: `${SITE.url}/blog/${slug}`,
        }}
      />

      <Link
        to="/blog"
        className="inline-flex items-center gap-1 text-sm text-emerald-600 transition-all hover:gap-2 dark:text-emerald-400"
      >
        <ArrowLeft size={16} /> 목록으로
      </Link>

      {/* 글 헤더 */}
      <header className="mt-4 mb-8 border-b border-gray-200/60 pb-6 dark:border-white/10">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-grad-emerald">{post.title}</span>
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> 약 {minutes}분
          </span>
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="lg:flex lg:items-start lg:gap-8">
        {/* 본문 */}
        <article className="min-w-0 lg:flex-1">
          <div className="glass prose-custom rounded-2xl p-6 sm:p-8">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug, rehypeHighlight]}
              components={{
                // 본문 최상단 h1(글 제목 중복)은 렌더링하지 않음
                h1: () => null,
                img: MdImage,
                pre: CodePre,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {/* 이전/다음 글 */}
          {(prev || next) && (
            <nav className="mt-8 grid gap-4 sm:grid-cols-2">
              {prev ? (
                <Link
                  to={`/blog/${prev.slug}`}
                  className="glass group rounded-2xl p-4 transition-transform hover:-translate-y-1"
                >
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <ArrowLeft size={12} /> 이전 글
                  </span>
                  <span className="mt-1 block truncate font-medium text-gray-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  to={`/blog/${next.slug}`}
                  className="glass group rounded-2xl p-4 text-right transition-transform hover:-translate-y-1"
                >
                  <span className="flex items-center justify-end gap-1 text-xs text-gray-400">
                    다음 글 <ArrowRight size={12} />
                  </span>
                  <span className="mt-1 block truncate font-medium text-gray-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </article>

        {/* 목차 (데스크탑 사이드, sticky) */}
        {toc.length >= 2 && (
          <aside className="mt-6 lg:mt-0 lg:w-60 lg:shrink-0">
            <div className="lg:sticky lg:top-24">
              <Toc items={toc} />
            </div>
          </aside>
        )}
      </div>
    </PageWrapper>
  )
}

export default BlogPost
