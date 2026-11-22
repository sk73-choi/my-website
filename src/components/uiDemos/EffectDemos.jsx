import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, Heart, Loader2, RotateCcw, Search, TrendingUp, Users } from 'lucide-react'
import { Frame } from './shared'

// 비교용 토글 버튼 그룹
function Toggle({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-full bg-gray-100 p-0.5 dark:bg-white/10">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            value === o.value ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Caption({ children }) {
  return <div className="mb-1.5 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">{children}</div>
}

// ── 호버 이펙트 ──────────────────────────────────────────
function MetricCard({ hover }) {
  return (
    <div
      tabIndex={0}
      className={`rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-800 ${
        hover
          ? 'transition duration-300 ease-out hover:-translate-y-1 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/15 focus-visible:-translate-y-1 focus-visible:border-emerald-500 focus-visible:outline-none'
          : ''
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Users size={13} /> 이번 주 방문자
      </div>
      <div className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">12,480</div>
      <div className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600">
        <TrendingUp size={12} /> +8.2%
      </div>
    </div>
  )
}

export function HoverDemo() {
  return (
    <Frame hint="두 카드에 각각 마우스를 올려 비교해 보세요">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Caption>Before · 효과 없음</Caption>
          <MetricCard hover={false} />
        </div>
        <div>
          <Caption>After · 호버 이펙트</Caption>
          <MetricCard hover />
        </div>
      </div>
    </Frame>
  )
}

// ── 스크롤 리빌 ──────────────────────────────────────────
function Reveal({ rootRef, children }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    // 뷰포트(여기선 스크롤 박스)에 20% 이상 들어오면 1회 등장
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { root: rootRef.current, threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootRef])
  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out motion-reduce:transition-none"
      style={{ opacity: shown ? 1 : 0, transform: shown ? 'translateY(0)' : 'translateY(30px)' }}
    >
      {children}
    </div>
  )
}

export function ScrollRevealDemo() {
  const rootRef = useRef(null)
  const [run, setRun] = useState(0)
  const sections = [
    { emoji: '⚡', title: '빠른 시작', desc: '가입 후 1분이면 첫 대시보드가 완성됩니다.' },
    { emoji: '🔒', title: '강력한 보안', desc: '모든 통신은 암호화되고 권한별로 접근이 제한됩니다.' },
    { emoji: '📊', title: '자동 리포트', desc: '매주 월요일 아침, 핵심 지표가 메일로 도착합니다.' },
    { emoji: '🤝', title: '팀 협업', desc: '댓글과 멘션으로 숫자에 대한 대화를 바로 나눕니다.' },
  ]
  return (
    <Frame hint="박스 안을 천천히 스크롤해 보세요" bodyClassName="p-0">
      <div className="flex justify-end border-b border-gray-200 px-3 py-1.5 dark:border-white/10">
        <button
          type="button"
          onClick={() => {
            rootRef.current.scrollTop = 0
            setRun((r) => r + 1)
          }}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600"
        >
          <RotateCcw size={12} /> 처음부터 다시
        </button>
      </div>
      <div ref={rootRef} className="h-72 overflow-y-auto px-5">
        <div className="flex h-56 items-center justify-center text-sm text-gray-400">↓ 아래로 스크롤</div>
        <div key={run} className="space-y-24 pb-16">
          {sections.map((s) => (
            <Reveal key={s.title} rootRef={rootRef}>
              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-800">
                <div className="text-2xl">{s.emoji}</div>
                <div className="mt-1 font-bold text-gray-900 dark:text-white">{s.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Frame>
  )
}

// ── 스태거 애니메이션 ────────────────────────────────────
export function StaggerDemo() {
  const [mode, setMode] = useState('stagger')
  const [run, setRun] = useState(0)
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: mode === 'stagger' ? 0.1 : 0 } },
  }
  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  }
  return (
    <Frame hint="모드를 고른 뒤 검색 버튼으로 차이를 비교해 보세요">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Toggle
          value={mode}
          onChange={setMode}
          options={[
            { value: 'together', label: '동시에 등장' },
            { value: 'stagger', label: '스태거 (100ms)' },
          ]}
        />
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Search size={14} /> 검색 실행
        </button>
      </div>
      <motion.div
        key={`${run}-${mode}`}
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div key={i} variants={item} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-gray-800">
            <div className="text-[11px] text-gray-400">결과 {i + 1}</div>
            <div className="mt-1 h-2 w-4/5 rounded bg-emerald-200 dark:bg-emerald-500/30" />
            <div className="mt-1 h-2 w-3/5 rounded bg-gray-100 dark:bg-white/10" />
          </motion.div>
        ))}
      </motion.div>
    </Frame>
  )
}

// ── 스무스 트랜지션 ──────────────────────────────────────
function TransitionSet({ smooth }) {
  const [tab, setTab] = useState(0)
  // transition: all 대신 색·보더·그림자 등 변하는 속성만(Tailwind 기본 transition)
  const t = smooth ? 'transition duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]' : 'transition-none'
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-white/10">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-emerald-500 dark:bg-white dark:text-gray-900 dark:hover:bg-emerald-400 ${t}`}>
          버튼
        </button>
        <button type="button" className={`rounded-md border-2 border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:border-emerald-500 hover:text-emerald-600 dark:border-white/20 dark:text-gray-200 ${t}`}>
          아웃라인
        </button>
        <span className={`cursor-pointer self-center text-sm text-gray-600 underline decoration-transparent underline-offset-4 hover:text-emerald-600 hover:decoration-emerald-500 dark:text-gray-300 ${t}`}>
          링크
        </span>
      </div>
      <div className="flex gap-1 rounded-md bg-gray-100 p-1 dark:bg-white/10">
        {['일간', '주간', '월간'].map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setTab(i)}
            className={`flex-1 rounded px-2 py-1 text-xs ${t} ${
              tab === i ? 'bg-emerald-600 text-white shadow' : 'text-gray-500 hover:bg-white dark:hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SmoothTransitionDemo() {
  return (
    <Frame hint="양쪽 버튼·링크·탭에 마우스를 올리고 눌러 비교">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Caption>transition 없음 (뚝 끊김)</Caption>
          <TransitionSet smooth={false} />
        </div>
        <div>
          <Caption>200ms cubic-bezier(0.4,0,0.2,1)</Caption>
          <TransitionSet smooth />
        </div>
      </div>
    </Frame>
  )
}

// ── 글래스모피즘 ─────────────────────────────────────────
export function GlassDemo() {
  const [blur, setBlur] = useState(12)
  const [alpha, setAlpha] = useState(0.65)
  const lowContrast = alpha < 0.35
  return (
    <Frame hint="슬라이더로 블러·투명도를 바꿔 보세요">
      <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        {/* 뒤 배경 오브젝트 (유리 뒤로 비침) */}
        <div className="animate-blob absolute top-4 left-6 h-28 w-28 rounded-full bg-yellow-300" />
        <div className="animate-blob absolute right-8 bottom-2 h-36 w-36 rounded-full bg-cyan-300" style={{ animationDelay: '-6s' }} />
        <div className="absolute top-10 right-1/3 h-16 w-16 rotate-12 rounded-xl bg-white/80" />
        <div
          className="relative w-64 max-w-[85%] rounded-2xl p-5 shadow-xl"
          style={{
            background: `rgba(255,255,255,${alpha})`,
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <div className="text-xs font-semibold text-gray-700">GLASS CARD</div>
          <div className="mt-1 text-lg font-extrabold text-gray-900">반투명 유리 카드</div>
          <div className="mt-1 text-sm text-gray-800">뒤 배경이 은은하게 비치면서도 글자는 또렷해야 합니다.</div>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-gray-600 dark:text-gray-300">
          backdrop-filter: blur(<span className="font-mono font-bold">{blur}px</span>)
          <input type="range" min={0} max={24} value={blur} onChange={(e) => setBlur(+e.target.value)} className="mt-1 w-full accent-emerald-600" />
        </label>
        <label className="text-xs text-gray-600 dark:text-gray-300">
          background: rgba(255,255,255,<span className="font-mono font-bold">{alpha.toFixed(2)}</span>)
          <input type="range" min={0.05} max={0.9} step={0.05} value={alpha} onChange={(e) => setAlpha(+e.target.value)} className="mt-1 w-full accent-emerald-600" />
        </label>
      </div>
      <div className={`mt-2 text-xs ${lowContrast ? 'font-semibold text-red-500' : 'text-gray-400'}`}>
        {lowContrast
          ? '⚠ 투명도가 너무 낮아 글자 대비가 떨어집니다 → 프롬프트의 "WCAG AA 4.5:1 유지" 조건이 필요한 이유'
          : '✓ 적당한 불투명도 — 배경은 비치고 글자 대비는 유지'}
      </div>
    </Frame>
  )
}

// ── 패럴렉스 스크롤링 ────────────────────────────────────
export function ParallaxDemo() {
  const reduce = useReducedMotion()
  const [enabled, setEnabled] = useState(true)
  const [y, setY] = useState(0)
  const active = enabled && !reduce
  // 배경이 콘텐츠와 함께 1 속도로 움직이므로, scrollTop×0.7 만큼 되돌려 0.3 속도로 보이게 함
  const offset = active ? y * 0.7 : 0

  return (
    <Frame hint="박스 안을 스크롤 — 배경 원이 글자보다 느리게 움직입니다" bodyClassName="p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-3 py-1.5 dark:border-white/10">
        <Toggle
          value={enabled ? 'on' : 'off'}
          onChange={(v) => setEnabled(v === 'on')}
          options={[
            { value: 'on', label: '패럴렉스 ON' },
            { value: 'off', label: 'OFF' },
          ]}
        />
        {reduce && <span className="text-[11px] text-amber-600">OS '동작 줄이기' 켜짐 → 효과 비활성화됨</span>}
      </div>
      <div className="h-72 overflow-y-auto" onScroll={(e) => setY(e.currentTarget.scrollTop)}>
        <div className="relative h-[40rem] overflow-hidden bg-gradient-to-b from-sky-100 to-emerald-50 dark:from-sky-950/50 dark:to-emerald-950/30">
          {/* 배경 원형 그래픽(속도 0.3) */}
          <div className="pointer-events-none absolute inset-0" style={{ transform: `translateY(${offset}px)` }}>
            <div className="absolute top-8 left-[10%] h-32 w-32 rounded-full bg-sky-300/60 dark:bg-sky-500/30" />
            <div className="absolute top-40 right-[12%] h-44 w-44 rounded-full bg-emerald-300/50 dark:bg-emerald-500/25" />
            <div className="absolute top-80 left-[35%] h-24 w-24 rounded-full bg-violet-300/50 dark:bg-violet-500/25" />
          </div>
          {/* 본문(속도 1) */}
          <div className="relative space-y-40 px-6 py-10">
            {['첫 번째 이야기', '두 번째 이야기', '세 번째 이야기'].map((t) => (
              <div key={t} className="max-w-xs rounded-lg bg-white/85 p-4 shadow dark:bg-gray-900/85">
                <div className="font-bold text-gray-900 dark:text-white">{t}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">글자는 1의 속도로, 뒤 원은 0.3의 속도로 움직여 깊이감이 생깁니다.</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  )
}

// ── 스크롤 스냅 ──────────────────────────────────────────
const SLIDES = [
  { n: '01', t: '문제', d: '매주 엑셀을 합치느라 3시간을 씁니다.', c: 'from-rose-400 to-orange-400' },
  { n: '02', t: '해결', d: '데이터를 연결하면 대시보드가 자동으로 만들어집니다.', c: 'from-amber-400 to-lime-400' },
  { n: '03', t: '결과', d: '보고 시간이 3시간 → 5분으로 줄었습니다.', c: 'from-emerald-400 to-teal-500' },
  { n: '04', t: '시작', d: '지금 무료로 체험해 보세요.', c: 'from-sky-400 to-indigo-500' },
]

export function ScrollSnapDemo() {
  const [snap, setSnap] = useState(true)
  const [cur, setCur] = useState(0)
  return (
    <Frame hint="박스 안에서 휠/트랙패드로 스크롤 — ON/OFF 비교" bodyClassName="p-0">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5 dark:border-white/10">
        <Toggle
          value={snap ? 'on' : 'off'}
          onChange={(v) => setSnap(v === 'on')}
          options={[
            { value: 'on', label: '스냅 ON' },
            { value: 'off', label: 'OFF' },
          ]}
        />
        <span className="font-mono text-[11px] text-gray-400">{snap ? 'scroll-snap-type: y mandatory' : 'scroll-snap-type: none'}</span>
      </div>
      <div className="relative">
        <div
          className={`h-60 overflow-y-auto ${snap ? 'snap-y snap-mandatory' : ''}`}
          onScroll={(e) => setCur(Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight))}
        >
          {SLIDES.map((s) => (
            <div key={s.n} className={`flex h-full snap-start flex-col items-center justify-center bg-gradient-to-br px-6 text-center text-white ${s.c}`}>
              <div className="text-xs font-bold opacity-80">{s.n}</div>
              <div className="text-2xl font-extrabold">{s.t}</div>
              <div className="mt-1 text-sm opacity-90">{s.d}</div>
            </div>
          ))}
        </div>
        {/* 현재 섹션 인디케이터 */}
        <div className="pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 flex-col gap-1.5">
          {SLIDES.map((s, i) => (
            <span key={s.n} className={`w-1.5 rounded-full bg-white transition-all ${cur === i ? 'h-4' : 'h-1.5 opacity-60'}`} />
          ))}
        </div>
      </div>
    </Frame>
  )
}

// ── 마이크로 인터랙션 ────────────────────────────────────
function useAsyncButton(duration = 900) {
  const [state, setState] = useState('idle') // idle | loading | done
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  function run(onDone) {
    if (state === 'loading') return
    setState('loading')
    timer.current = setTimeout(() => {
      setState('done')
      onDone?.()
    }, duration)
  }
  return [state, run, setState]
}

export function MicroDemo() {
  const [saveState, runSave, setSaveState] = useAsyncButton()
  const [favState, runFav, setFavState] = useAsyncButton(700)
  const [faved, setFaved] = useState(false)

  // 저장 완료 표시는 2초 후 원래대로
  useEffect(() => {
    if (saveState !== 'done') return
    const t = setTimeout(() => setSaveState('idle'), 2000)
    return () => clearTimeout(t)
  }, [saveState, setSaveState])

  const bounce = { scale: [1, 1.1, 1], transition: { duration: 0.2 } }

  return (
    <Frame hint="저장 / 즐겨찾기 버튼을 눌러 보세요">
      <div className="flex flex-wrap items-center justify-center gap-4 py-4">
        {/* 저장 버튼: 스피너 → 초록 체크 + 바운스 */}
        <motion.button
          type="button"
          onClick={() => runSave()}
          animate={saveState === 'done' ? bounce : { scale: 1 }}
          className={`inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
            saveState === 'done' ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900'
          }`}
        >
          {saveState === 'loading' && <Loader2 size={16} className="animate-spin" />}
          {saveState === 'done' && <Check size={16} strokeWidth={3} />}
          {saveState === 'idle' ? '저장' : saveState === 'loading' ? '저장 중…' : '저장됨'}
        </motion.button>

        {/* 즐겨찾기 버튼: 스피너 → 하트 채움 + 바운스 (다시 누르면 해제) */}
        <motion.button
          type="button"
          aria-pressed={faved}
          onClick={() => {
            if (faved) {
              setFaved(false)
              setFavState('idle')
            } else runFav(() => setFaved(true))
          }}
          animate={favState === 'done' && faved ? bounce : { scale: 1 }}
          className={`inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
            faved ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-500/10' : 'border-gray-300 text-gray-700 hover:border-rose-300 dark:border-white/20 dark:text-gray-200'
          }`}
        >
          {favState === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} fill={faved ? 'currentColor' : 'none'} />}
          {faved ? '즐겨찾기됨' : '즐겨찾기'}
        </motion.button>
      </div>
    </Frame>
  )
}
