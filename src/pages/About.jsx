import { motion } from 'framer-motion'
import { Mail, MapPin, Code2, Wrench, Sparkles, Briefcase, GraduationCap } from 'lucide-react'
import { GithubIcon } from '../components/icons'
import { PageWrapper, Reveal } from '../components/motion'
import { profile, skillGroups, timeline } from '../data/about'
import Seo from '../components/Seo'
import { SITE } from '../lib/site'

// icon 문자열 → lucide 컴포넌트 매핑
const iconMap = { Code2, Wrench, Sparkles, Briefcase, GraduationCap }
function iconFor(name) {
  return iconMap[name] ?? Sparkles
}

function About() {
  return (
    <PageWrapper className="space-y-16">
      <Seo
        title="소개"
        description={`${profile.name} · ${profile.role}`}
        path="/about"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: profile.name,
          jobTitle: profile.role,
          email: profile.email,
          url: SITE.url + '/about',
        }}
      />

      {/* 프로필 헤더 */}
      <section className="glass flex flex-col items-center gap-6 rounded-3xl p-8 text-center sm:flex-row sm:p-10 sm:text-left">
        {/* 이니셜 아바타 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-4xl font-extrabold text-white shadow-lg shadow-sky-500/30"
        >
          SK
        </motion.div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-grad-sky">{profile.name}</span>
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">{profile.role}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 sm:justify-start dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} /> {profile.location}
            </span>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-sky-600 dark:hover:text-sky-300"
            >
              <Mail size={15} /> {profile.email}
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-sky-600 dark:hover:text-sky-300"
            >
              <GithubIcon size={15} /> GitHub
            </a>
          </div>
        </div>
      </section>

      {/* 소개 */}
      <Reveal>
        <h2 className="mb-4 text-2xl font-bold text-grad-sky">소개</h2>
        <div className="space-y-3 text-gray-600 dark:text-gray-300">
          {profile.bio.map((para, i) => (
            <p key={i} className="leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </Reveal>

      {/* 스킬 */}
      <Reveal>
        <h2 className="mb-5 text-2xl font-bold text-grad-sky">스킬</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {skillGroups.map(({ icon, title, items }) => {
            const Icon = iconFor(icon)
            return (
            <motion.div
              key={title}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="glass rounded-2xl p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                  <Icon size={17} />
                </span>
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
            )
          })}
        </div>
      </Reveal>

      {/* 타임라인 */}
      <Reveal>
        <h2 className="mb-6 text-2xl font-bold text-grad-sky">발자취</h2>
        <div className="relative space-y-6 border-l border-gray-200 pl-6 dark:border-white/10">
          {timeline.map(({ icon, period, title, desc }) => {
            const Icon = iconFor(icon)
            return (
            <div key={title} className="relative">
              {/* 타임라인 점 */}
              <span className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md">
                <Icon size={12} />
              </span>
              <div className="glass rounded-2xl p-5">
                <p className="text-xs font-medium text-sky-600 dark:text-sky-300">
                  {period}
                </p>
                <h3 className="mt-0.5 font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            </div>
            )
          })}
        </div>
      </Reveal>

      {/* 연락 CTA */}
      <Reveal>
        <div className="glass rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold text-grad-sky">함께 이야기해요</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
            궁금한 점이나 제안이 있다면 언제든 편하게 연락 주세요.
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-transform hover:scale-105"
          >
            <Mail size={16} /> 이메일 보내기
          </a>
        </div>
      </Reveal>
    </PageWrapper>
  )
}

export default About
