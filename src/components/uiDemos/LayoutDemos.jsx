import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  Cloud,
  LayoutDashboard,
  Lock,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { Frame, ViewportSwitch } from './shared'

// 대시보드 미리보기 목업(히어로/스플릿 공용)
function DashboardMock({ className = '' }) {
  const bars = [40, 65, 50, 80, 60, 92, 75]
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-gray-800 ${className}`}
    >
      <div className="mb-2 flex gap-1">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="h-2 w-2 rounded-full bg-yellow-400" />
        <span className="h-2 w-2 rounded-full bg-green-400" />
      </div>
      <div className="mb-2 grid grid-cols-3 gap-1.5">
        {['매출', '방문', '전환'].map((t) => (
          <div key={t} className="rounded bg-gray-100 px-1.5 py-1 dark:bg-white/5">
            <div className="text-[9px] text-gray-400">{t}</div>
            <div className="text-[11px] font-bold text-gray-800 dark:text-gray-100">+12%</div>
          </div>
        ))}
      </div>
      <div className="flex h-16 items-end gap-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-emerald-500 to-teal-300"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}

// ── 히어로 섹션 & CTA ─────────────────────────────────────
export function HeroDemo() {
  const boxRef = useRef(null)
  const formRef = useRef(null)
  const [done, setDone] = useState(false)

  // CTA 클릭 → 미니 페이지 내부에서 가입 폼으로 부드럽게 스크롤
  const goForm = () => {
    boxRef.current?.scrollTo({ top: formRef.current.offsetTop - 12, behavior: 'smooth' })
  }

  return (
    <Frame hint="CTA 버튼을 눌러 보세요 (가입 폼으로 스크롤)" bodyClassName="p-0">
      <div ref={boxRef} className="@container relative h-80 overflow-y-auto">
        {/* 히어로 */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 px-6 py-10 dark:from-emerald-950/40 dark:to-teal-950/30">
          <div className="flex flex-col items-center gap-6 @lg:flex-row">
            <div className="text-center @lg:flex-1 @lg:text-left">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                <Sparkles size={11} /> NEW · AI 분석
              </span>
              <div className="mt-3 text-2xl leading-tight font-extrabold text-gray-900 dark:text-white">
                데이터 정리는 AI에게,
                <br />
                결정은 당신에게
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                흩어진 지표를 한 화면에 모아 3초 만에 인사이트를 확인하세요.
              </div>
            </div>
            <DashboardMock className="w-full max-w-[220px] @lg:flex-1" />
          </div>
          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={goForm}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:scale-105 hover:bg-orange-600"
            >
              무료로 시작하기 <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* 중간 콘텐츠 */}
        <div className="space-y-2 px-6 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-3 rounded bg-gray-100 dark:bg-white/5" style={{ width: `${90 - i * 15}%` }} />
          ))}
          <div className="pt-2 text-center text-xs text-gray-400">(기능 소개 영역…)</div>
        </div>

        {/* 가입 폼 */}
        <div ref={formRef} className="mx-6 mb-8 rounded-lg border border-emerald-500/40 bg-emerald-50/60 p-4 dark:bg-emerald-950/30">
          <div className="text-sm font-bold text-gray-900 dark:text-white">회원가입</div>
          {done ? (
            <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
              <Check size={15} /> 가입 신청 완료 (데모)
            </div>
          ) : (
            <form
              className="mt-2 flex flex-col gap-2 @sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                setDone(true)
              }}
            >
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-white/15 dark:bg-gray-800"
              />
              <button type="submit" className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white">
                가입
              </button>
            </form>
          )}
        </div>
      </div>
    </Frame>
  )
}

// ── 반응형 레이아웃 ───────────────────────────────────────
export function ResponsiveDemo() {
  const colors = ['bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-sky-400', 'bg-violet-400', 'bg-pink-400']
  return (
    <Frame hint="폭 버튼을 바꿔 열 개수 변화를 보세요 (3열 → 2열 → 1열)">
      <ViewportSwitch>
        <div className="grid grid-cols-1 gap-6 @sm:grid-cols-2 @lg:grid-cols-3">
          {colors.map((c, i) => (
            <div key={c} className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-800">
              <div className={`h-12 ${c}`} />
              <div className="p-2.5">
                <div className="text-xs font-bold text-gray-800 dark:text-gray-100">콘텐츠 {i + 1}</div>
                <div className="mt-1 h-2 w-3/4 rounded bg-gray-100 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </ViewportSwitch>
    </Frame>
  )
}

// ── 카드 레이아웃 ─────────────────────────────────────────
const FEATURES = [
  { Icon: Zap, color: 'text-amber-500 bg-amber-500/10', title: '빠른 처리', desc: '대용량 데이터도 몇 초 안에 분석해 결과를 보여줍니다.' },
  { Icon: Shield, color: 'text-emerald-500 bg-emerald-500/10', title: '안전한 보관', desc: '모든 데이터는 암호화되어 저장되고 접근 기록이 남습니다.' },
  { Icon: BarChart3, color: 'text-sky-500 bg-sky-500/10', title: '자동 리포트', desc: '매주 핵심 지표를 정리한 리포트를 메일로 받아보세요.' },
]

export function CardDemo() {
  return (
    <Frame hint="아이콘 → 볼드 타이틀 → 요약 설명의 3단 계층">
      <div className="@container">
        <div className="grid gap-4 @lg:grid-cols-3">
          {FEATURES.map(({ Icon, color, title, desc }) => (
            <div key={title} className="rounded-lg border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-800">
              <div className={`inline-flex rounded-lg p-2 ${color}`}>
                <Icon size={20} />
              </div>
              <div className="mt-3 font-bold text-gray-900 dark:text-white">{title}</div>
              <div className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}

// ── 벤토 그리드 ───────────────────────────────────────────
export function BentoDemo() {
  const small = [
    { Icon: Cloud, title: '클라우드 동기화' },
    { Icon: Bell, title: '실시간 알림' },
    { Icon: Lock, title: '권한 관리' },
    { Icon: Users, title: '팀 협업' },
  ]
  return (
    <Frame hint="모바일로 바꾸면 모든 카드가 1열로 정렬됩니다">
      <ViewportSwitch>
        <div className="grid grid-cols-1 gap-3 @lg:auto-rows-[110px] @lg:grid-cols-4">
          <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white @lg:col-span-2 @lg:row-span-2">
            <div>
              <div className="text-xs opacity-80">핵심 기능 · 2×2</div>
              <div className="text-lg font-extrabold">데이터 분석</div>
            </div>
            <div className="mt-4 flex h-20 items-end gap-1.5">
              {[30, 55, 45, 70, 60, 88, 76, 95].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-white/70" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          {small.map(({ Icon, title }) => (
            <div
              key={title}
              className="flex flex-col justify-between gap-2 rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-gray-800"
            >
              <Icon size={18} className="text-emerald-600 dark:text-emerald-400" />
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</div>
            </div>
          ))}
        </div>
      </ViewportSwitch>
    </Frame>
  )
}

// ── 사이드바 레이아웃 ─────────────────────────────────────
const MENU = [
  { id: 'dashboard', label: '대시보드', Icon: LayoutDashboard },
  { id: 'analytics', label: '분석', Icon: BarChart3 },
  { id: 'users', label: '사용자', Icon: Users },
  { id: 'settings', label: '설정', Icon: Settings },
]

export function SidebarDemo() {
  const [active, setActive] = useState('dashboard')
  const [open, setOpen] = useState(false)
  const current = MENU.find((m) => m.id === active)

  const nav = (
    <div className="flex flex-col gap-1 p-2">
      <div className="px-2 py-2 text-xs font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400">MY APP</div>
      {MENU.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            setActive(id)
            setOpen(false)
          }}
          className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
            active === id
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-200/70 dark:text-gray-300 dark:hover:bg-white/10'
          }`}
        >
          <Icon size={15} /> {label}
        </button>
      ))}
    </div>
  )

  return (
    <Frame hint="메뉴 클릭 → 우측만 교체 / 모바일에선 햄버거(☰)로 토글">
      <ViewportSwitch>
        <div className="relative flex h-64 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-800">
          {/* 데스크톱: 고정 사이드바 */}
          <div className="hidden w-40 shrink-0 border-r border-gray-200 bg-gray-50 @lg:block dark:border-white/10 dark:bg-gray-900/60">
            {nav}
          </div>

          {/* 모바일: 햄버거로 여는 오버레이 사이드바 */}
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  className="absolute inset-0 z-10 bg-black/30 @lg:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                />
                <motion.div
                  className="absolute inset-y-0 left-0 z-20 w-40 bg-gray-50 shadow-xl @lg:hidden dark:bg-gray-900"
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'tween', duration: 0.25 }}
                >
                  {nav}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* 메인 콘텐츠 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2 dark:border-white/10">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="메뉴 열기"
                className="rounded p-1 text-gray-600 hover:bg-gray-100 @lg:hidden dark:text-gray-300 dark:hover:bg-white/10"
              >
                {open ? <X size={16} /> : <Menu size={16} />}
              </button>
              <span className="truncate font-mono text-[11px] text-gray-400">/app/{active}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="p-4"
              >
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <current.Icon size={16} /> {current.label}
                </div>
                <div className="mt-1 text-xs text-gray-500">페이지 리로드 없이 이 영역만 바뀝니다.</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 rounded bg-gray-100 dark:bg-white/5" />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </ViewportSwitch>
    </Frame>
  )
}

// ── 스티키 헤더 ───────────────────────────────────────────
export function StickyHeaderDemo() {
  const [scrollY, setScrollY] = useState(0)
  const scrolled = scrollY > 0
  return (
    <Frame hint="박스 안을 아래로 스크롤해 보세요" bodyClassName="p-0">
      <div className="relative h-64 overflow-y-auto" onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}>
        <div
          className={`sticky top-0 z-20 flex items-center justify-between px-4 py-2.5 transition-all duration-300 ${
            scrolled
              ? 'bg-white/70 shadow-md backdrop-blur-md dark:bg-gray-900/70'
              : 'bg-transparent'
          }`}
        >
          <span className="text-sm font-extrabold text-gray-900 dark:text-white">LOGO</span>
          <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-300">
            <span>제품</span>
            <span>가격</span>
            <span>문의</span>
          </div>
          <span className="rounded-full bg-gray-900/80 px-2 py-0.5 font-mono text-[10px] text-white">
            scrollY={Math.round(scrollY)}
          </span>
        </div>
        <div className="space-y-3 px-4 pt-2 pb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div
                className={`h-14 w-14 shrink-0 rounded-lg ${
                  ['bg-rose-300', 'bg-sky-300', 'bg-amber-300', 'bg-emerald-300'][i % 4]
                }`}
              />
              <div className="flex-1 space-y-1.5 pt-1">
                <div className="h-2.5 w-2/3 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-2.5 w-full rounded bg-gray-100 dark:bg-white/5" />
                <div className="h-2.5 w-4/5 rounded bg-gray-100 dark:bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}

// ── 스플릿 레이아웃 ───────────────────────────────────────
export function SplitDemo() {
  return (
    <Frame hint="모바일로 바꾸면 이미지↑ 텍스트↓ 세로 스택으로 전환">
      <ViewportSwitch>
        <div className="flex flex-col gap-5 @lg:flex-row @lg:items-center">
          <div className="@lg:w-1/2">
            <DashboardMock />
          </div>
          <div className="@lg:w-1/2">
            <div className="text-lg font-extrabold text-gray-900 dark:text-white">한 화면에서 끝나는 리포트</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              클릭 몇 번으로 팀 전체가 같은 숫자를 봅니다.
            </div>
            <div className="mt-3 space-y-1.5">
              {['실시간 지표 갱신', '드래그로 위젯 배치', 'PDF·엑셀 내보내기'].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                    <Check size={12} />
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ViewportSwitch>
    </Frame>
  )
}
