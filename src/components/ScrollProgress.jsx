import { motion, useScroll, useSpring } from 'framer-motion'

// 페이지 상단 읽기 진행바 (스크롤 비율)
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 })

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 z-50 h-1 w-full origin-left bg-gradient-to-r from-lime-500 to-teal-600"
    />
  )
}

export default ScrollProgress
