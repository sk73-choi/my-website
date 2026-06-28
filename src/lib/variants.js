// Framer Motion 공통 variants (컴포넌트가 아닌 상수 모음)

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

// 자식 요소를 순차적으로 등장시키는 컨테이너
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
