import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import {
  AlertTriangle,
  BarChart3,
  Check,
  CheckCircle2,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Loader2,
  Menu,
  RotateCcw,
  Save,
  Settings,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import Seo from '../../components/Seo'
import { useEscape, useScrollLock } from '../../components/uiDemos/shared'
import { DemoToolbar, LabelProvider, Term, useLabels } from './demoKit'

// "데이터 분석 대시보드 단일 프롬프트"를 실제로 구현한 데모 페이지 (/demo/dashboard)
// (원문 프롬프트는 Next.js+TypeScript 기준이지만, 이 사이트 스택인 React 로 같은 화면을 구현)

const MENU = [
  { id: 'overview', label: '개요', Icon: LayoutDashboard },
  { id: 'analytics', label: '분석', Icon: BarChart3 },
  { id: 'reports', label: '보고서', Icon: FileText },
  { id: 'settings', label: '설정', Icon: Settings },
]
const PERIODS = [
  { id: '7', label: '최근 7일', points: 7 },
  { id: '30', label: '최근 30일', points: 15 },
  { id: '90', label: '최근 90일', points: 18 },
]
const CHANNELS = ['전체', '검색', 'SNS', '광고']
const DEFAULT_FILTER = { period: '30', channel: '전체' }

// 필터 값으로 결정되는 가짜 데이터(같은 필터 → 같은 숫자)
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
function makeData({ period, channel }) {
  const p = PERIODS.find((x) => x.id === period)
  const r = rng(Number(period) * 31 + CHANNELS.indexOf(channel) * 7 + 3)
  const scale = (Number(period) / 7) * (channel === '전체' ? 1 : 0.4 + r() * 0.3)
  const visitors = Math.round(8000 * scale * (0.8 + r() * 0.4))
  const conv = 2 + r() * 3
  const orders = Math.round((visitors * conv) / 100)
  const aov = Math.round(38000 + r() * 20000)
  const signups = Math.round(visitors * (0.03 + r() * 0.02))
  const bounce = 30 + r() * 20
  const delta = () => Math.round((r() * 30 - 10) * 10) / 10
  return {
    metrics: [
      { label: '매출', value: `₩${(orders * aov).toLocaleString()}`, delta: delta(), formula: '매출 = 주문 수 × 평균 주문액' },
      { label: '방문자', value: visitors.toLocaleString(), delta: delta(), formula: '방문자 = 기간 내 고유 세션 사용자 수' },
      { label: '전환율', value: `${conv.toFixed(2)}%`, delta: delta(), formula: '전환율 = 주문 수 ÷ 방문자 × 100' },
      { label: '평균 주문액', value: `₩${aov.toLocaleString()}`, delta: delta(), formula: '평균 주문액(AOV) = 매출 ÷ 주문 수' },
      { label: '신규 가입', value: signups.toLocaleString(), delta: delta(), formula: '신규 가입 = 기간 내 회원가입 완료 수' },
      { label: '이탈률', value: `${bounce.toFixed(1)}%`, delta: -delta(), formula: '이탈률 = 1페이지만 보고 나간 세션 ÷ 전체 세션 × 100' },
    ],
    series: Array.from({ length: p.points }, (_, i) => Math.round(40 + i * 2 + r() * 40)),
    channels: ['검색', 'SNS', '광고', '직접'].map((name) => ({ name, value: Math.round(10 + r() * 50) })),
  }
}

// ── 툴팁(산출 공식) ──────────────────────────────────────
function FormulaTip({ text }) {
  const [show, setShow] = useState(false)
  const t = useRef(null)
  const open = () => {
    clearTimeout(t.current)
    setShow(true)
  }
  const hide = () => {
    clearTimeout(t.current)
    t.current = setTimeout(() => setShow(false), 150)
  }
  useEffect(() => () => clearTimeout(t.current), [])
  return (
    <span className="relative">
      <button type="button" aria-label="산출 공식 보기" onMouseEnter={open} onMouseLeave={hide} onFocus={open} onBlur={hide} className="rounded-full text-gray-400 hover:text-indigo-600 focus:text-indigo-600 focus:outline-none">
        <CircleHelp size={16} />
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-full right-0 z-30 mt-2 w-52 rounded-md bg-gray-900 px-3 py-2 text-xs leading-snug text-white shadow-lg transition-opacity duration-150 ${show ? 'opacity-100' : 'opacity-0'}`}
      >
        {text}
        <span className="absolute -top-1 right-1.5 h-2 w-2 rotate-45 bg-gray-900" />
      </span>
    </span>
  )
}

// ── 지표 카드 / 스켈레톤 ─────────────────────────────────
function MetricCard({ m, first }) {
  const up = m.delta >= 0
  // 이탈률은 낮을수록 좋음
  const good = m.label === '이탈률' ? !up : up
  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-5 transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {first && <Term className="-top-2.5">카드 레이아웃 + 툴팁(?)</Term>}
      <div className="flex items-start justify-between">
        <span className="text-sm text-gray-500">{m.label}</span>
        <FormulaTip text={m.formula} />
      </div>
      <div className="mt-2 h-8 text-2xl font-extrabold text-gray-900">{m.value}</div>
      <div className={`mt-1 flex h-5 items-center gap-1 text-xs font-semibold ${good ? 'text-emerald-600' : 'text-rose-600'}`}>
        {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {up ? '+' : ''}
        {m.delta}% <span className="font-normal text-gray-400">지난 기간 대비</span>
      </div>
    </div>
  )
}

// 실제 카드와 같은 높이 규격(줄 높이 20px / 32px / 20px)
function MetricSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex h-5 items-center justify-between">
        <div className="skeleton h-3.5 w-16 rounded" />
        <div className="skeleton h-4 w-4 rounded-full" />
      </div>
      <div className="mt-2 flex h-8 items-center">
        <div className="skeleton h-6 w-32 rounded" />
      </div>
      <div className="mt-1 flex h-5 items-center">
        <div className="skeleton h-3 w-28 rounded" />
      </div>
    </div>
  )
}

// ── 차트 ─────────────────────────────────────────────────
function LineChart({ data }) {
  const w = 600
  const h = 200
  const max = Math.max(...data) * 1.1
  const step = w / (data.length - 1)
  const pts = data.map((v, i) => [i * step, h - (v / max) * h])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-52 w-full" preserveAspectRatio="none" role="img" aria-label="기간별 매출 추이">
      <defs>
        <linearGradient id="dash-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} stroke="#e5e7eb" strokeDasharray="4 4" />
      ))}
      <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#dash-area)" />
      <path d={line} fill="none" stroke="#6366f1" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

// ── 오버레이 + 확인 모달 ─────────────────────────────────
function ConfirmModal({ open, onClose, onConfirm }) {
  const cancelRef = useRef(null)
  useEscape(open, onClose)
  useScrollLock(open)
  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <Term>오버레이</Term>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dash-modal-title"
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
          >
            <Term>확인 모달</Term>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={22} />
            </div>
            <div id="dash-modal-title" className="mt-4 text-lg font-bold text-gray-900">
              데이터를 초기화할까요?
            </div>
            <div className="mt-1 text-sm text-gray-500">필터와 화면 설정이 기본값으로 돌아갑니다. 이 작업은 되돌릴 수 없습니다.</div>
            <div className="mt-6 flex justify-end gap-2">
              <button ref={cancelRef} type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                취소
              </button>
              <button type="button" onClick={onConfirm} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                초기화
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── 토스트 ───────────────────────────────────────────────
function Toast({ toast, onClose }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 z-[110] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto relative flex items-center gap-2.5 overflow-hidden rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-xl"
          >
            <Term>토스트</Term>
            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
            <span className="flex-1">{toast.text}</span>
            <button type="button" onClick={onClose} aria-label="알림 닫기" className="rounded p-0.5 text-gray-400 hover:text-white">
              <X size={15} />
            </button>
            <motion.span className="absolute bottom-0 left-0 h-0.5 bg-emerald-400" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 3, ease: 'linear' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── 사이드바 ─────────────────────────────────────────────
function SidebarNav({ active, onSelect }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-5 text-lg font-extrabold text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
          <BarChart3 size={17} />
        </span>
        Insight
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {MENU.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-current={active === id ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 ${
              active === id ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <div className="rounded-lg bg-white/5 p-3 text-xs text-slate-400">고정 폭 260px · 메뉴를 눌러도 페이지가 새로고침되지 않습니다.</div>
      </div>
    </div>
  )
}

export default function DashboardDemo() {
  const [labels, setLabels] = useLabels()
  const [menu, setMenu] = useState('overview')
  const [mobileNav, setMobileNav] = useState(false)
  const [draft, setDraft] = useState(DEFAULT_FILTER)
  const [filter, setFilter] = useState(DEFAULT_FILTER)
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState('idle') // idle | saving | done
  const [toast, setToast] = useState(null)
  const [confirm, setConfirm] = useState(false)
  const timers = useRef([])

  const later = useCallback((fn, ms) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])
  useEffect(() => {
    const list = timers.current
    return () => list.forEach(clearTimeout)
  }, [])

  // 비동기 데이터 로딩 흉내(1.2초) — 그동안 스켈레톤
  const reload = useCallback(() => {
    setLoading(true)
    later(() => setLoading(false), 1200)
  }, [later])
  useEffect(() => {
    reload()
  }, [reload])

  const data = useMemo(() => makeData(filter), [filter])
  const closeConfirm = useCallback(() => setConfirm(false), [])
  useEscape(mobileNav, () => setMobileNav(false))

  const showToast = (text) => {
    const id = Date.now()
    setToast({ id, text })
    later(() => setToast((t) => (t?.id === id ? null : t)), 3000)
  }

  function save() {
    if (saveState === 'saving') return
    setSaveState('saving')
    later(() => {
      setSaveState('done')
      setFilter(draft)
      reload()
      showToast('필터 설정이 저장되었습니다')
      later(() => setSaveState('idle'), 1800)
    }, 800)
  }

  function resetAll() {
    setConfirm(false)
    setDraft(DEFAULT_FILTER)
    setFilter(DEFAULT_FILTER)
    reload()
    showToast('데이터가 초기화되었습니다')
  }

  const selectCls = 'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none'
  const dirty = draft.period !== filter.period || draft.channel !== filter.channel

  return (
    <MotionConfig reducedMotion="user">
      <LabelProvider value={labels}>
        <Seo title="데모: 데이터 분석 대시보드" path="/demo/dashboard" description="종합 프롬프트로 만든 데이터 분석 대시보드 예제" />
        <div className="min-h-screen bg-slate-100 text-gray-900">
          {/* 1. 사이드바 레이아웃: 데스크톱 고정 260px */}
          <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] bg-slate-900 lg:block">
            <Term>사이드바 레이아웃 (260px 고정)</Term>
            <SidebarNav active={menu} onSelect={setMenu} />
          </aside>

          {/* 모바일: 햄버거로 여는 사이드바 */}
          <AnimatePresence>
            {mobileNav && (
              <div className="fixed inset-0 z-[95] lg:hidden">
                <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNav(false)} />
                <motion.aside className="absolute inset-y-0 left-0 w-[260px] max-w-[85%] bg-slate-900" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.25 }}>
                  <SidebarNav
                    active={menu}
                    onSelect={(id) => {
                      setMenu(id)
                      setMobileNav(false)
                    }}
                  />
                </motion.aside>
              </div>
            )}
          </AnimatePresence>

          <div className="lg:pl-[260px]">
            {/* 상단 바 */}
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-3 px-5 py-3 sm:px-8">
                <button type="button" onClick={() => setMobileNav(true)} aria-label="메뉴 열기" className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 lg:hidden">
                  <Menu size={20} />
                </button>
                <div className="text-lg font-bold">{MENU.find((m) => m.id === menu).label}</div>
                <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">나</div>
              </div>
            </header>

            <main className="px-5 py-6 sm:px-8">
              <AnimatePresence mode="wait">
                <motion.div key={menu} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  {menu !== 'overview' ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
                      <div className="text-lg font-bold text-gray-800">{MENU.find((m) => m.id === menu).label} 화면</div>
                      <div className="mt-1 text-sm">메뉴를 눌러도 페이지 전체가 새로고침되지 않고 이 영역만 바뀝니다. (데모는 '개요' 화면만 구현)</div>
                    </div>
                  ) : (
                    <>
                      {/* 필터 + 저장 + 초기화 */}
                      <div className="mb-6 flex flex-wrap items-center gap-2">
                        <select value={draft.period} onChange={(e) => setDraft((d) => ({ ...d, period: e.target.value }))} className={selectCls} aria-label="기간">
                          {PERIODS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <select value={draft.channel} onChange={(e) => setDraft((d) => ({ ...d, channel: e.target.value }))} className={selectCls} aria-label="채널">
                          {CHANNELS.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                        <span className="relative">
                          <Term className="-top-5">마이크로 인터랙션</Term>
                          <motion.button
                            type="button"
                            onClick={save}
                            animate={saveState === 'done' ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`inline-flex min-w-[104px] items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 ${
                              saveState === 'done' ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                          >
                            {saveState === 'saving' ? <Loader2 size={15} className="animate-spin" /> : saveState === 'done' ? <Check size={15} strokeWidth={3} /> : <Save size={15} />}
                            {saveState === 'saving' ? '저장 중' : saveState === 'done' ? '저장됨' : '저장'}
                          </motion.button>
                        </span>
                        {dirty && saveState === 'idle' && <span className="text-xs text-amber-600">● 변경 사항이 있습니다 — 저장을 눌러 적용</span>}
                        <button
                          type="button"
                          onClick={() => setConfirm(true)}
                          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50"
                        >
                          <RotateCcw size={14} /> 데이터 초기화
                        </button>
                      </div>

                      {/* 2·3. 반응형 3열 + 스켈레톤 / 카드 */}
                      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy={loading}>
                        <Term className="-top-5">반응형 레이아웃 (3열→2열→1열)</Term>
                        {loading
                          ? data.metrics.map((m) => <MetricSkeleton key={m.label} />)
                          : data.metrics.map((m, i) => <MetricCard key={m.label} m={m} first={i === 0} />)}
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <div className="relative rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2">
                          {loading && <Term>스켈레톤 로딩</Term>}
                          <div className="flex h-6 items-center justify-between">
                            {loading ? <div className="skeleton h-4 w-28 rounded" /> : <span className="font-bold">매출 추이</span>}
                            {!loading && <span className="text-xs text-gray-400">{PERIODS.find((p) => p.id === filter.period).label} · {filter.channel}</span>}
                          </div>
                          <div className="mt-4">{loading ? <div className="skeleton h-52 w-full rounded-lg" /> : <LineChart data={data.series} />}</div>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                          <div className="flex h-6 items-center">{loading ? <div className="skeleton h-4 w-24 rounded" /> : <span className="font-bold">유입 채널</span>}</div>
                          <div className="mt-4 space-y-4">
                            {data.channels.map((c) => (
                              <div key={c.name}>
                                <div className="flex h-5 items-center justify-between text-sm">
                                  {loading ? <div className="skeleton h-3.5 w-12 rounded" /> : <span className="text-gray-600">{c.name}</span>}
                                  {!loading && <span className="font-semibold">{c.value}%</span>}
                                </div>
                                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-gray-100">
                                  {loading ? (
                                    <div className="skeleton h-full w-full" />
                                  ) : (
                                    <motion.div className="h-full rounded-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${c.value}%` }} transition={{ duration: 0.6 }} />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="h-16" />
            </main>
          </div>

          <ConfirmModal open={confirm} onClose={closeConfirm} onConfirm={resetAll} />
          <Toast toast={toast} onClose={() => setToast(null)} />
          <DemoToolbar labels={labels} setLabels={setLabels} />
        </div>
      </LabelProvider>
    </MotionConfig>
  )
}
