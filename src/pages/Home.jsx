import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Calendar, FileText, FolderOpen } from 'lucide-react'
import { getSortedPosts } from '../data/posts'
import { getSortedFiles } from '../data/files'
import { formatDate } from '../lib/format'
import { PageWrapper, Reveal } from '../components/motion'
import { fadeUp, stagger } from '../lib/variants'
import Seo from '../components/Seo'
import { SITE } from '../lib/site'
import { useAuth } from '../admin/AuthContext'

// 홈에서 사용할 기술 스택 뱃지
const techStack = ['React', 'Vite', 'Tailwind CSS', 'JavaScript', 'GitHub Pages']

// 관심 분야 태그
const interests = ['웹 프론트엔드', '데이터 시각화', 'UI/UX', '오픈소스', '기술 글쓰기']

// 파일 유형별 색상
const typeColor = {
  pdf: 'from-red-500 to-rose-500',
  pptx: 'from-orange-500 to-amber-500',
  xlsx: 'from-green-500 to-emerald-500',
  docx: 'from-blue-500 to-sky-500',
}

// 섹션 헤더 (제목 + '전체 보기' 링크)
function SectionHeader({ title, to, linkLabel }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="text-2xl font-bold text-gradient">{title}</h2>
      <Link
        to={to}
        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:gap-2 transition-all dark:text-indigo-400"
      >
        {linkLabel} <ArrowRight size={15} />
      </Link>
    </div>
  )
}

function Home() {
  const { user } = useAuth() // 자료실 관련 노출은 관리자 로그인 시에만
  const recentPosts = getSortedPosts().slice(0, 3)
  const recentFiles = getSortedFiles().slice(0, 3)

  return (
    <PageWrapper className="space-y-20">
      <Seo
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: SITE.name,
          url: SITE.url,
          jobTitle: '프론트엔드 개발자',
        }}
      />

      {/* 히어로 */}
      <section className="py-10 text-center sm:py-16">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.p
            variants={fadeUp}
            className="mb-4 inline-block rounded-full glass px-4 py-1.5 text-xs font-semibold tracking-wide text-gradient uppercase"
          >
            ✦ Portfolio &amp; Blog
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-extrabold tracking-tight sm:text-6xl"
          >
            안녕하세요,
            <br />
            <span className="text-gradient">SK Choi</span>입니다
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300"
          >
            개발과 기록을 좋아합니다. 배운 것들을 글로 남기고, 만든 자료를 이곳에 모아
            공유합니다.
          </motion.p>

          {/* 기술 스택 뱃지 */}
          <motion.div
            variants={fadeUp}
            className="mt-7 flex flex-wrap justify-center gap-2"
          >
            {techStack.map((tech) => (
              <span
                key={tech}
                className="glass rounded-full px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-200"
              >
                {tech}
              </span>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-wrap justify-center gap-3"
          >
            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105"
            >
              블로그 보기
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-gray-700 transition-transform hover:scale-105 dark:text-gray-200"
            >
              소개 보기
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 관심 분야 */}
      <Reveal>
        <h2 className="mb-4 text-2xl font-bold text-gradient">관심 분야</h2>
        <div className="flex flex-wrap gap-2.5">
          {interests.map((item, i) => (
            <motion.span
              key={item}
              whileHover={{ scale: 1.08, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="glass rounded-full bg-gradient-to-r from-fuchsia-500/10 to-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-200"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              {item}
            </motion.span>
          ))}
        </div>
      </Reveal>

      {/* 최근 블로그 글 */}
      <Reveal>
        <SectionHeader title="최근 글" to="/blog" linkLabel="전체 글" />
        {recentPosts.length === 0 ? (
          <p className="glass rounded-2xl py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            아직 작성된 글이 없습니다.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <motion.div
                key={post.slug}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="glass group flex h-full flex-col rounded-2xl p-5"
                >
                  <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={13} />
                    {formatDate(post.date)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-grow text-sm text-gray-600 dark:text-gray-400">
                    {post.excerpt}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-600 dark:text-indigo-300"
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
      </Reveal>

      {/* 최근 자료 (자료실은 관리자 전용 → 로그인 시에만 노출) */}
      {user && (
      <Reveal>
        <SectionHeader title="최근 자료" to="/files" linkLabel="자료실" />
        {recentFiles.length === 0 ? (
          <p className="glass rounded-2xl py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            아직 등록된 자료가 없습니다.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentFiles.map((file) => (
              <motion.div
                key={file.id}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link to="/files" className="glass group flex items-center gap-4 rounded-2xl p-5">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white uppercase shadow-md ${
                      typeColor[file.type] ?? 'from-gray-500 to-gray-600'
                    }`}
                  >
                    {file.type}
                  </span>
                  <div className="min-w-0 flex-grow">
                    <h3 className="truncate font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
                      {file.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {file.size} · {formatDate(file.date)}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-300"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Reveal>
      )}

      {/* 둘러보기 CTA (자료실 카드는 관리자 로그인 시에만) */}
      <Reveal>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { to: '/blog', icon: FileText, title: '블로그', desc: '배운 것들과 생각을 글로 기록합니다.' },
            { to: '/files', icon: FolderOpen, title: '자료실', desc: 'PDF, 문서, 슬라이드 등 자료를 모아둔 공간입니다.', adminOnly: true },
          ]
            .filter((c) => !c.adminOnly || user)
            .map(({ to, icon: Icon, title, desc }) => (
            <motion.div key={to} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Link to={to} className="glass group block rounded-2xl p-6">
                <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white shadow-md">
                  <Icon size={20} />
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </Reveal>
    </PageWrapper>
  )
}

export default Home
