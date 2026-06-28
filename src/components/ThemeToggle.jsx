import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

// 초기값: index.html 인라인 스크립트가 이미 적용한 .dark 클래스 기준
function getInitialTheme() {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark'
  }
  return 'light'
}

function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // localStorage 사용 불가 시 무시
    }
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rounded-full p-2 text-gray-600 transition-colors hover:bg-white/50 dark:text-gray-300 dark:hover:bg-white/10"
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드' : '다크 모드'}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}

export default ThemeToggle
