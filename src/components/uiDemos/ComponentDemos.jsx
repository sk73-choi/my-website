import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  RotateCcw,
  SlidersHorizontal,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { Frame, useClickOutside, useEscape, useScrollLock } from './shared'

// ── 탭 ───────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: '개요', body: '하나의 화면 안에서 주제별 내용을 바꿔 보여주는 컴포넌트입니다. 페이지 이동 없이 패널만 교체됩니다.' },
  { id: 'spec', label: '기술 스펙', body: 'role="tablist" / "tab" / "tabpanel" 과 aria-selected 로 스크린리더가 현재 탭을 인식합니다. ← → 키로 이동할 수 있습니다.' },
  { id: 'price', label: '가격 정책', body: '무료 · 프로(월 9,900원) · 팀(월 29,000원) — 이런 비교 정보를 탭으로 묶으면 화면이 깔끔해집니다.' },
]

export function TabsDemo() {
  const [active, setActive] = useState(0)
  const refs = useRef([])

  function onKeyDown(e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (active + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <Frame hint="탭 클릭 또는 탭에 포커스 후 ← → 방향키">
      <div role="tablist" aria-label="제품 정보" className="flex border-b border-gray-200 dark:border-white/10" onKeyDown={onKeyDown}>
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            id={`demo-tab-${t.id}`}
            aria-selected={active === i}
            aria-controls={`demo-panel-${t.id}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
              active === i ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
            {active === i && (
              <motion.span
                layoutId="demo-tab-indicator"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`demo-panel-${TABS[active].id}`}
        aria-labelledby={`demo-tab-${TABS[active].id}`}
        className="pt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
      >
        {TABS[active].body}
      </div>
    </Frame>
  )
}

// ── 아코디언 ─────────────────────────────────────────────
const FAQ = [
  { q: '무료 체험 기간이 있나요?', a: '네, 가입 후 14일 동안 모든 기능을 무료로 써볼 수 있습니다.' },
  { q: '결제 수단은 무엇이 있나요?', a: '신용카드, 계좌이체, 카카오페이를 지원합니다.' },
  { q: '언제든 해지할 수 있나요?', a: '설정 > 구독 메뉴에서 언제든 해지할 수 있고, 남은 기간까지는 계속 이용 가능합니다.' },
  { q: '팀원 초대는 몇 명까지 되나요?', a: '프로 요금제는 5명, 팀 요금제는 무제한입니다.' },
]

export function AccordionDemo() {
  const [open, setOpen] = useState(0)
  return (
    <Frame hint="질문을 눌러 보세요 (한 번에 하나만 열림)">
      <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-white/10 dark:border-white/10">
        {FAQ.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.q}>
              <button
                type="button"
                id={`faq-q-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-white/5"
              >
                {item.q}
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400">{item.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
      <div className="mt-2 font-mono text-[11px] text-gray-400">
        aria-expanded: [{FAQ.map((_, i) => String(open === i)).join(', ')}]
      </div>
    </Frame>
  )
}

// ── 모달 다이얼로그 & 오버레이 ───────────────────────────
export function ModalDemo() {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState(3)
  const cancelRef = useRef(null)
  const close = useCallback(() => setOpen(false), [])

  useEscape(open, close)
  useScrollLock(open)
  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  return (
    <Frame hint="삭제 버튼 → 취소 / 바깥 클릭 / ESC 로 닫아 보세요">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-white/10">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          저장된 데이터 <span className="font-bold">{rows}건</span>
        </div>
        {rows > 0 ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            <Trash2 size={14} /> 데이터 영구 삭제
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setRows(3)}
            className="inline-flex items-center gap-1.5 rounded-md bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-200"
          >
            <RotateCcw size={14} /> 데모 복구
          </button>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              key="overlay"
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // 오버레이(바깥) 클릭 시 닫기 — 모달 내부 클릭은 무시
              onClick={(e) => e.target === e.currentTarget && close()}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="demo-modal-title"
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15">
                  <AlertTriangle size={22} />
                </div>
                <div id="demo-modal-title" className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                  데이터를 영구 삭제할까요?
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  삭제된 {rows}건의 데이터는 복구할 수 없습니다.
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    ref={cancelRef}
                    type="button"
                    onClick={close}
                    className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRows(0)
                      close()
                    }}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    삭제 확인
                  </button>
                </div>
                <div className="mt-4 text-center text-[11px] text-gray-400">ESC · 바깥 클릭으로도 닫힙니다</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </Frame>
  )
}

// ── 드로어 ───────────────────────────────────────────────
const CATS = ['전자기기', '도서', '의류', '식품']

export function DrawerDemo() {
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState(['도서'])
  const [draft, setDraft] = useState(picked)
  const close = useCallback(() => setOpen(false), [])

  useEscape(open, close)
  useScrollLock(open)

  const toggle = (c) => setDraft((d) => (d.includes(c) ? d.filter((x) => x !== c) : [...d, c]))

  return (
    <Frame hint="우측 상단 필터 아이콘 → 바깥 클릭 / ESC 로 닫기">
      <div className="rounded-lg border border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5 dark:border-white/10">
          <span className="text-sm font-bold text-gray-900 dark:text-white">상품 목록</span>
          <button
            type="button"
            aria-label="필터 열기"
            onClick={() => {
              setDraft(picked)
              setOpen(true)
            }}
            className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
          >
            <SlidersHorizontal size={17} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 px-4 py-3">
          <span className="text-xs text-gray-400">적용된 필터:</span>
          {picked.length === 0 && <span className="text-xs text-gray-400">없음</span>}
          {picked.map((c) => (
            <span key={c} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
              {c}
            </span>
          ))}
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[100]">
              <motion.div
                className="absolute inset-0 bg-black/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={close}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="필터 설정"
                className="absolute inset-y-0 right-0 flex w-[85%] flex-col bg-white shadow-2xl sm:w-[30%] sm:min-w-[300px] dark:bg-gray-900"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.3 }}
              >
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-white/10">
                  <span className="font-bold text-gray-900 dark:text-white">필터 설정</span>
                  <button type="button" onClick={close} aria-label="닫기" className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
                  <div className="text-xs font-semibold text-gray-400">카테고리</div>
                  {CATS.map((c) => (
                    <label key={c} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input type="checkbox" checked={draft.includes(c)} onChange={() => toggle(c)} className="h-4 w-4 accent-emerald-600" />
                      {c}
                    </label>
                  ))}
                </div>
                <div className="border-t border-gray-200 p-4 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setPicked(draft)
                      close()
                    }}
                    className="w-full rounded-md bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    적용하기
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </Frame>
  )
}

// ── 드롭다운 ─────────────────────────────────────────────
const ITEMS = [
  { name: '다람쥐 키보드', likes: 32, date: '2026-11-01' },
  { name: '가벼운 백팩', likes: 88, date: '2026-10-12' },
  { name: '나무 책상', likes: 12, date: '2026-11-18' },
  { name: '라탄 의자', likes: 54, date: '2026-09-30' },
]
const SORTS = [
  { id: 'latest', label: '최신순', fn: (a, b) => b.date.localeCompare(a.date) },
  { id: 'popular', label: '인기순', fn: (a, b) => b.likes - a.likes },
  { id: 'name', label: '이름순', fn: (a, b) => a.name.localeCompare(b.name, 'ko') },
]

export function DropdownDemo() {
  const [open, setOpen] = useState(false)
  const [sort, setSort] = useState(SORTS[0])
  const wrapRef = useRef(null)
  const close = useCallback(() => setOpen(false), [])

  useClickOutside(wrapRef, open, close)
  useEscape(open, close)

  return (
    <Frame hint="정렬 버튼 → 항목 선택, 또는 바깥 아무 곳 클릭">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900 dark:text-white">상품 {ITEMS.length}개</span>
        <div ref={wrapRef} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-white/15 dark:bg-gray-800 dark:text-gray-200"
          >
            <ArrowUpDown size={14} /> {sort.label}
            <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                role="listbox"
                className="absolute right-0 z-30 mt-1 w-32 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-gray-800"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
              >
                {SORTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="option"
                    aria-selected={sort.id === s.id}
                    onClick={() => {
                      setSort(s)
                      close()
                    }}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-emerald-50 dark:text-gray-200 dark:hover:bg-white/10"
                  >
                    {s.label}
                    {sort.id === s.id && <Check size={14} className="text-emerald-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-white/5 dark:border-white/10">
        {[...ITEMS].sort(sort.fn).map((it) => (
          <div key={it.name} className="flex items-center justify-between px-3 py-2 text-sm">
            <span className="text-gray-800 dark:text-gray-100">{it.name}</span>
            <span className="text-xs text-gray-400">
              ♥ {it.likes} · {it.date}
            </span>
          </div>
        ))}
      </div>
    </Frame>
  )
}

// ── 툴팁 (플리핑 포함) ───────────────────────────────────
function HelpTip({ text, boundaryRef }) {
  const [show, setShow] = useState(false)
  const [place, setPlace] = useState('top')
  const iconRef = useRef(null)
  const timer = useRef(null)

  function open() {
    clearTimeout(timer.current)
    // 위쪽 공간이 부족하면(경계와 맞닿으면) 아래로 반전
    const icon = iconRef.current.getBoundingClientRect()
    const limit = boundaryRef.current.getBoundingClientRect().top
    setPlace(icon.top - limit < 52 ? 'bottom' : 'top')
    setShow(true)
  }
  function hide() {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setShow(false), 150)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <span className="relative inline-flex">
      <button
        ref={iconRef}
        type="button"
        aria-label="도움말"
        aria-describedby={show ? 'demo-tip' : undefined}
        onMouseEnter={open}
        onMouseLeave={hide}
        onFocus={open}
        onBlur={hide}
        className="rounded-full text-gray-400 hover:text-emerald-600 focus:text-emerald-600 focus:outline-none"
      >
        <CircleHelp size={16} />
      </button>
      <span
        id="demo-tip"
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-30 w-44 -translate-x-1/2 rounded-md bg-gray-900 px-2.5 py-1.5 text-center text-xs leading-snug text-white shadow-lg transition-opacity duration-150 dark:bg-gray-700 ${
          place === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        } ${show ? 'opacity-100' : 'opacity-0'}`}
      >
        {text}
        {/* 말풍선 꼬리 */}
        <span
          className={`absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900 dark:bg-gray-700 ${
            place === 'top' ? '-bottom-1' : '-top-1'
          }`}
        />
      </span>
    </span>
  )
}

function StatCard({ label, value, tip, boundaryRef }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-gray-800">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          {label} <HelpTip text={tip} boundaryRef={boundaryRef} />
        </div>
        <div className="text-xl font-extrabold text-gray-900 dark:text-white">{value}</div>
      </div>
    </div>
  )
}

export function TooltipDemo() {
  const boundaryRef = useRef(null)
  return (
    <Frame hint="? 아이콘에 마우스를 올리거나 Tab 키로 포커스">
      <div ref={boundaryRef} className="relative flex h-60 flex-col justify-between rounded-lg border-t-2 border-dashed border-red-400/70 bg-gray-50 p-3 dark:bg-white/5">
        <span className="absolute -top-2.5 right-2 bg-white px-1 text-[10px] text-red-500 dark:bg-gray-900">화면 상단 경계(가정)</span>
        <StatCard
          label="이탈률"
          value="23.4%"
          tip="경계에 붙어 있어 툴팁이 아래로 뒤집힙니다 (flipping)"
          boundaryRef={boundaryRef}
        />
        <StatCard
          label="전환율"
          value="4.8%"
          tip="전환율 = 구매 수 ÷ 방문자 수 × 100"
          boundaryRef={boundaryRef}
        />
      </div>
    </Frame>
  )
}

// ── 토스트 ───────────────────────────────────────────────
export function ToastDemo() {
  const [toasts, setToasts] = useState([])
  const [notify, setNotify] = useState(true)
  const timers = useRef(new Map())

  const remove = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  function save() {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id }])
    timers.current.set(id, setTimeout(() => remove(id), 3000))
  }

  useEffect(() => {
    const map = timers.current
    return () => map.forEach(clearTimeout)
  }, [])

  return (
    <Frame hint="설정 저장 버튼 → 화면 우측 하단(모바일은 중앙 하단)을 보세요">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-white/10">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span
            role="switch"
            aria-checked={notify}
            tabIndex={0}
            onClick={() => setNotify((v) => !v)}
            onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), setNotify((v) => !v))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${notify ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-white/20'}`}
          >
            <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${notify ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
          </span>
          이메일 알림 받기
        </label>
        <button type="button" onClick={save} className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">
          설정 저장
        </button>
      </div>

      {createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed bottom-4 left-1/2 z-[110] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:right-4 sm:left-auto sm:translate-x-0"
        >
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                className="pointer-events-auto relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gray-800"
              >
                <div className="flex items-center gap-2.5 px-4 py-3">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                  <span className="flex-1 text-sm text-gray-800 dark:text-gray-100">변경 사항이 성공적으로 저장되었습니다</span>
                  <button type="button" onClick={() => remove(t.id)} aria-label="알림 닫기" className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10">
                    <X size={15} />
                  </button>
                </div>
                {/* 남은 시간(3초) 진행 막대 */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-emerald-500"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </Frame>
  )
}

// ── 캐러셀 ───────────────────────────────────────────────
const REVIEWS = [
  { name: '김하늘', text: '설정이 정말 간단해서 10분 만에 팀 전체가 쓰기 시작했어요.' },
  { name: '이도윤', text: '리포트 자동화 덕분에 매주 2시간을 아끼고 있습니다.' },
  { name: '박서준', text: '디자인이 깔끔해서 임원 보고 자료로 바로 씁니다.' },
  { name: '최유나', text: '모바일에서도 지표 확인이 편해서 출근길에 체크해요.' },
  { name: '정민재', text: '고객 지원 응답이 빨라서 믿고 쓰게 됩니다.' },
  { name: '한소희', text: '무료 체험만 하려다 바로 유료로 전환했어요!' },
]

export function CarouselDemo() {
  const viewRef = useRef(null)
  const [perView, setPerView] = useState(3)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const startX = useRef(null)

  // 박스 폭에 따라 한 번에 보이는 카드 수 결정(데스크톱 3장 / 모바일 1장)
  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => setPerView(entry.contentRect.width >= 480 ? 3 : 1))
    ro.observe(viewRef.current)
    return () => ro.disconnect()
  }, [])

  const maxIndex = REVIEWS.length - perView
  const cur = Math.min(index, maxIndex)
  const next = useCallback(() => setIndex((i) => (Math.min(i, maxIndex) >= maxIndex ? 0 : i + 1)), [maxIndex])
  const prev = () => setIndex((i) => (Math.min(i, maxIndex) <= 0 ? maxIndex : Math.min(i, maxIndex) - 1))

  // 자동 넘김(호버 시 일시정지)
  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 3000)
    return () => clearInterval(t)
  }, [paused, next])

  // 스와이프: 포인터 이동량이 40px 넘으면 이전/다음
  const onPointerDown = (e) => (startX.current = e.clientX)
  const onPointerUp = (e) => {
    if (startX.current == null) return
    const dx = e.clientX - startX.current
    if (dx < -40) next()
    else if (dx > 40) prev()
    startX.current = null
  }

  return (
    <Frame hint="화살표·점 클릭, 드래그/스와이프, 마우스 올리면 자동 넘김 정지">
      <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <div className="flex items-center gap-2">
          <button type="button" onClick={prev} aria-label="이전 리뷰" className="shrink-0 rounded-full border border-gray-200 bg-white p-1.5 text-gray-600 shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-300">
            <ChevronLeft size={16} />
          </button>
          <div
            ref={viewRef}
            className="min-w-0 flex-1 cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerLeave={() => (startX.current = null)}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${cur * (100 / perView)}%)` }}
            >
              {REVIEWS.map((r) => (
                <div key={r.name} className="shrink-0 px-1.5" style={{ width: `${100 / perView}%` }}>
                  <div className="h-full rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-gray-800">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </div>
                    <div className="mt-1.5 text-xs leading-relaxed text-gray-700 dark:text-gray-300">“{r.text}”</div>
                    <div className="mt-2 text-[11px] font-semibold text-gray-500">— {r.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button type="button" onClick={next} aria-label="다음 리뷰" className="shrink-0 rounded-full border border-gray-200 bg-white p-1.5 text-gray-600 shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-300">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}번째로 이동`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${cur === i ? 'w-5 bg-emerald-600' : 'w-2 bg-gray-300 dark:bg-white/20'}`}
            />
          ))}
        </div>
        <div className="mt-1 text-center text-[11px] text-gray-400">
          {perView}장씩 표시 · 자동 넘김 {paused ? '⏸ 일시정지' : '▶ 재생 중'}
        </div>
      </div>
    </Frame>
  )
}

// ── 스켈레톤 로딩 ────────────────────────────────────────
const PEOPLE = [
  { name: '김하늘', role: '프로덕트 디자이너', color: 'bg-rose-400' },
  { name: '이도윤', role: '프론트엔드 개발자', color: 'bg-sky-400' },
  { name: '박서준', role: '데이터 분석가', color: 'bg-amber-400' },
]

export function SkeletonDemo() {
  const [loading, setLoading] = useState(true)
  const timer = useRef(null)

  const load = useCallback(() => {
    setLoading(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setLoading(false), 2000)
  }, [])

  useEffect(() => {
    load()
    return () => clearTimeout(timer.current)
  }, [load])

  return (
    <Frame hint="다시 불러오기 → 2초 동안 스켈레톤 표시 후 실제 데이터">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-white/15 dark:text-gray-200 dark:hover:bg-white/10"
        >
          <RotateCcw size={13} className={loading ? 'animate-spin' : ''} /> 다시 불러오기
        </button>
      </div>
      <div className="space-y-2" aria-busy={loading}>
        {PEOPLE.map((p) => (
          // 스켈레톤과 실제 카드가 완전히 같은 크기(h-10 원 + 20px 줄 2개) → 레이아웃 이동(CLS) 없음
          <div key={p.name} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-gray-800">
            {loading ? (
              <>
                <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1">
                  <div className="py-0.5">
                    <div className="skeleton h-4 w-24 rounded" />
                  </div>
                  <div className="py-0.5">
                    <div className="skeleton h-4 w-40 rounded" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${p.color}`}>
                  {p.name[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm leading-5 font-semibold text-gray-900 dark:text-white">{p.name}</div>
                  <div className="text-sm leading-5 text-gray-500">{p.role}</div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </Frame>
  )
}
