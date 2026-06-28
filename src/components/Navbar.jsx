import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Search } from 'lucide-react'
import GlobalSearch from './GlobalSearch'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../admin/AuthContext'

// 네비게이션 메뉴 정의 (adminOnly=관리자 로그인 시에만 노출)
const navItems = [
  { to: '/', label: '홈', end: true },
  { to: '/about', label: '소개' },
  { to: '/blog', label: '블로그' },
  { to: '/favorites', label: '즐겨찾기' },
  { to: '/photos', label: '사진' },
  { to: '/files', label: '자료실', adminOnly: true },
]

// 활성 링크 스타일을 NavLink className 함수로 처리
function linkClass({ isActive }) {
  return [
    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-white/70 text-indigo-600 shadow-sm dark:bg-white/10 dark:text-indigo-300'
      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white',
  ].join(' ')
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { user } = useAuth()

  // 관리자 전용 메뉴(자료실)는 로그인 시에만 노출
  const items = navItems.filter((i) => !i.adminOnly || user)

  // Ctrl/⌘ + K 로 전역 검색 열기
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40"
    >
      <div className="glass mx-auto mt-3 flex max-w-5xl items-center justify-between rounded-2xl px-4 py-2.5 sm:px-6">
        {/* 로고 / 사이트명 */}
        <Link to="/" className="text-lg font-extrabold tracking-tight">
          <span className="text-gradient">SK</span>
          <span className="text-gray-900 dark:text-white">Choi</span>
        </Link>

        {/* 데스크탑 메뉴 */}
        <div className="hidden items-center gap-1 sm:flex">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {/* 전역 검색 버튼 */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="rounded-full p-2 text-gray-600 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-white/10"
            aria-label="검색 (Ctrl+K)"
            title="검색 (Ctrl+K)"
          >
            <Search size={20} />
          </button>

          {/* 다크/라이트 토글 */}
          <ThemeToggle />

          {/* 모바일 토글 버튼 */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 text-gray-600 hover:bg-white/50 sm:hidden dark:text-gray-300 dark:hover:bg-white/10"
            aria-label="메뉴 열기"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 전역 검색 오버레이 */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* 모바일 메뉴 패널 */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mx-auto mt-2 max-w-5xl rounded-2xl px-3 py-2 sm:hidden"
        >
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}

export default Navbar
