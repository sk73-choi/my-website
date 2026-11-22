import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  Cloud,
  Lock,
  Sparkles,
  Users,
  Workflow,
  X,
} from 'lucide-react'
import Seo from '../../components/Seo'
import { useEscape, useScrollLock } from '../../components/uiDemos/shared'
import { DemoToolbar, LabelProvider, Term, useLabels } from './demoKit'

// "고성능 랜딩 페이지 단일 프롬프트"를 실제로 구현한 데모 페이지 (/demo/landing)
// 강조색은 CSS 변수 --accent 로 관리 → 드로어 환경설정에서 바꿀 수 있음

const ACCENTS = [
  { id: 'violet', label: '보라', value: '#7c3aed' },
  { id: 'emerald', label: '초록', value: '#059669' },
  { id: 'orange', label: '주황', value: '#ea580c' },
]

const FEATURES = [
  { Icon: BarChart3, title: 'AI 데이터 분석', desc: '흩어진 지표를 자동으로 모아 이상 징후와 추세를 알려 줍니다.', big: true },
  { Icon: Workflow, title: '자동화 워크플로', desc: '반복 작업을 드래그 몇 번으로 자동화.' },
  { Icon: Bell, title: '실시간 알림', desc: '중요한 변화가 생기면 즉시 알려 줍니다.' },
  { Icon: Lock, title: '엔터프라이즈 보안', desc: 'SSO · 감사 로그 · 권한 관리.' },
  { Icon: Users, title: '팀 협업', desc: '댓글과 멘션으로 바로 논의.' },
  { Icon: Cloud, title: '어디서나 동기화', desc: '웹·모바일·데스크톱 어디서든 같은 화면.', wide: true },
]

const FAQ = [
  { q: '무료 체험 기간이 있나요?', a: '가입 후 14일 동안 모든 기능을 제한 없이 무료로 써볼 수 있습니다. 카드 등록도 필요 없습니다.' },
  { q: '기존 데이터를 옮겨 올 수 있나요?', a: '엑셀·구글 시트·주요 DB 를 클릭 몇 번으로 연결할 수 있습니다.' },
  { q: '팀원은 몇 명까지 초대할 수 있나요?', a: '프로 요금제는 10명, 엔터프라이즈는 무제한입니다.' },
  { q: '언제든 해지할 수 있나요?', a: '설정 > 구독에서 즉시 해지할 수 있으며 남은 기간까지 이용 가능합니다.' },
]

// ── 1. 스티키 헤더 + 글래스모피즘 ─────────────────────────
function Header({ onProfile, onCta }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-200 ${
        scrolled
          ? 'border-b border-white/40 bg-white/65 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Term>스티키 헤더 + 글래스모피즘</Term>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-1.5 text-lg font-extrabold text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
            <Sparkles size={15} />
          </span>
          Flowly
        </button>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
          {[
            ['기능', 'features'],
            ['FAQ', 'faq'],
            ['시작하기', 'signup'],
          ].map(([label, id]) => (
            <button
              key={id}
              type="button"
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
              className="transition-colors duration-200 hover:text-[var(--accent)]"
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCta}
            className="hidden rounded-full bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--accent)] sm:block"
          >
            무료 체험
          </button>
          <button
            type="button"
            onClick={onProfile}
            aria-label="프로필 · 환경설정 열기"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-orange-400 text-sm font-bold text-white ring-2 ring-white transition-transform duration-200 hover:scale-105"
          >
            나
          </button>
        </div>
      </div>
    </header>
  )
}

// ── 2. 히어로 섹션 + CTA ──────────────────────────────────
function Hero({ onCta }) {
  return (
    <section className="relative -mt-16 overflow-hidden pt-16">
      {/* 배경 블롭 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-blob absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[var(--accent)] opacity-20 blur-3xl" />
        <div className="animate-blob absolute top-40 -right-20 h-96 w-96 rounded-full bg-sky-400 opacity-20 blur-3xl" style={{ animationDelay: '-7s' }} />
      </div>
      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:py-32">
        <Term>히어로 섹션</Term>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-600 backdrop-blur">
            <Sparkles size={12} className="text-[var(--accent)]" /> 새 기능 · AI 인사이트 출시
          </span>
          <h1 className="mt-6 text-4xl leading-tight font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            숫자는 AI가 정리하고,
            <br />
            <span className="text-[var(--accent)]">결정은 더 빠르게</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-gray-600 sm:text-lg">
            팀의 모든 데이터를 한 화면에 모아 매일 아침 핵심만 알려 드립니다.
            <br className="hidden sm:block" />
            설정은 5분, 보고서 작성 시간은 90% 줄어듭니다.
          </p>
          <div className="relative mt-9 inline-flex flex-col items-center gap-3 sm:flex-row">
            <Term className="-top-5">CTA 버튼</Term>
            <button
              type="button"
              onClick={onCta}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 text-base font-bold text-white shadow-xl shadow-black/10 transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
            >
              14일 무료로 시작하기 <ArrowRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full px-6 py-4 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-white/70"
            >
              기능 둘러보기
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── 3·4. 벤토 그리드 + 스크롤 리빌 + 스태거 + 호버 ────────
const gridVariants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
      <div className="text-center">
        <div className="text-sm font-bold text-[var(--accent)]">FEATURES</div>
        <h2 className="mt-2 text-3xl font-extrabold text-gray-900">필요한 건 전부, 한 곳에</h2>
      </div>
      <motion.div
        variants={gridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="relative mt-12 grid grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[190px]"
      >
        <Term className="-top-6">벤토 그리드 · 스크롤 리빌 · 스태거</Term>
        {FEATURES.map(({ Icon, title, desc, big, wide }) => (
          <motion.div
            key={title}
            variants={cardVariants}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-[translate,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-xl ${
              big ? 'md:col-span-2 md:row-span-2' : wide ? 'md:col-span-2' : ''
            }`}
          >
            {big && <Term>호버 이펙트 + 스무스 트랜지션</Term>}
            <div className={`flex items-center justify-center rounded-xl bg-gray-100 text-[var(--accent)] transition-colors duration-200 group-hover:bg-[var(--accent)] group-hover:text-white ${big ? 'h-14 w-14' : 'h-10 w-10'}`}>
              <Icon size={big ? 28 : 20} />
            </div>
            {big && (
              <div className="my-6 flex h-32 items-end gap-2">
                {[35, 60, 45, 80, 65, 95, 75, 88].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-md bg-[var(--accent)] opacity-70" style={{ height: `${h}%` }} />
                ))}
              </div>
            )}
            <div>
              <div className={`font-bold text-gray-900 ${big ? 'text-2xl' : 'text-base'}`}>{title}</div>
              <div className="mt-1 text-sm text-gray-500">{desc}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

// ── 5-1. 아코디언 FAQ ─────────────────────────────────────
function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20">
      <h2 className="text-center text-3xl font-extrabold text-gray-900">자주 묻는 질문</h2>
      <div className="relative mt-10 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
        <Term className="-top-6">아코디언</Term>
        {FAQ.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.q}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`lp-faq-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-gray-900 transition-colors duration-200 hover:text-[var(--accent)]"
              >
                {item.q}
                <ChevronDown size={18} className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--accent)]' : 'text-gray-400'}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`lp-faq-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-sm leading-relaxed text-gray-600">{item.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── 가입 섹션(CTA 목적지) ─────────────────────────────────
function Signup({ inputRef }) {
  const [done, setDone] = useState(false)
  return (
    <section id="signup" className="scroll-mt-20 px-5 pb-28">
      <div className="mx-auto max-w-4xl rounded-3xl bg-gray-900 px-6 py-14 text-center text-white sm:px-12">
        <h2 className="text-3xl font-extrabold">지금 바로 시작하세요</h2>
        <p className="mt-2 text-gray-400">이메일만 입력하면 1분 안에 첫 대시보드가 만들어집니다.</p>
        {done ? (
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 font-semibold">
            <Check size={18} className="text-emerald-400" /> 가입 완료! (데모)
          </div>
        ) : (
          <form
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              setDone(true)
            }}
          >
            <input
              ref={inputRef}
              type="email"
              required
              placeholder="you@company.com"
              className="min-w-0 flex-1 rounded-full bg-white px-5 py-3 text-gray-900 outline-none focus:ring-4 focus:ring-[var(--accent)]/40"
            />
            <button type="submit" className="rounded-full bg-[var(--accent)] px-6 py-3 font-bold transition-[filter] duration-200 hover:brightness-110">
              가입하기
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

// ── 5-2. 드로어 (프로필 → 환경설정) ───────────────────────
function SettingsDrawer({ open, onClose, accent, setAccent }) {
  const [notify, setNotify] = useState(true)
  const [marketing, setMarketing] = useState(false)
  useEscape(open, onClose)
  useScrollLock(open)

  const Switch = ({ on, setOn, label }) => (
    <div className="flex items-center justify-between py-3 text-sm text-gray-700">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${on ? 'bg-[var(--accent)]' : 'bg-gray-300'}`}
      >
        <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div className="absolute inset-0 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="환경설정"
            className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-white shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.3 }}
          >
            <Term>드로어</Term>
            <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-orange-400 font-bold text-white">나</div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">홍길동</div>
                <div className="text-xs text-gray-500">프로 요금제</div>
              </div>
              <button type="button" onClick={onClose} aria-label="닫기" className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="text-xs font-bold text-gray-400">강조 색상</div>
              <div className="mt-2 flex gap-2">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAccent(a.value)}
                    aria-pressed={accent === a.value}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-xl border-2 py-2 text-xs font-medium text-gray-700 transition-colors duration-200 ${
                      accent === a.value ? 'border-gray-900' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="h-5 w-5 rounded-full" style={{ background: a.value }} />
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="mt-6 text-xs font-bold text-gray-400">알림</div>
              <div className="divide-y divide-gray-100">
                <Switch on={notify} setOn={setNotify} label="이메일 알림 받기" />
                <Switch on={marketing} setOn={setMarketing} label="마케팅 정보 수신" />
              </div>
              <div className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                💡 ESC 키 또는 바깥 어두운 영역을 클릭하면 닫힙니다. 색상을 바꾸면 페이지 전체 강조색이 즉시 바뀝니다.
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function LandingDemo() {
  const [labels, setLabels] = useLabels()
  const [drawer, setDrawer] = useState(false)
  const [accent, setAccent] = useState(ACCENTS[0].value)
  const inputRef = useRef(null)
  const closeDrawer = useCallback(() => setDrawer(false), [])

  // CTA → 가입 섹션으로 스크롤 후 이메일 입력창 포커스
  const goSignup = () => {
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 600)
  }

  return (
    <MotionConfig reducedMotion="user">
      <LabelProvider value={labels}>
        <Seo title="데모: SaaS 랜딩 페이지" path="/demo/landing" description="종합 프롬프트로 만든 SaaS 랜딩 페이지 예제" />
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-gray-900" style={{ '--accent': accent }}>
          <Header onProfile={() => setDrawer(true)} onCta={goSignup} />
          <Hero onCta={goSignup} />
          <Features />
          <Faq />
          <Signup inputRef={inputRef} />
          <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-400">© Flowly — 바이브 코딩 UI 데모 페이지</footer>
          <SettingsDrawer open={drawer} onClose={closeDrawer} accent={accent} setAccent={setAccent} />
          <DemoToolbar labels={labels} setLabels={setLabels} />
        </div>
      </LabelProvider>
    </MotionConfig>
  )
}
