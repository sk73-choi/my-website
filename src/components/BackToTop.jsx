import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

// 일정 스크롤 후 나타나는 '맨 위로' 버튼
function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="맨 위로"
      className="glass fixed right-5 bottom-5 z-40 rounded-full p-3 text-gray-700 shadow-lg transition-transform hover:scale-110 dark:text-gray-200"
    >
      <ArrowUp size={18} />
    </button>
  )
}

export default BackToTop
