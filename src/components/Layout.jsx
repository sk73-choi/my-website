import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import Background from './Background'
import BackToTop from './BackToTop'

// 공통 레이아웃: 그라데이션 배경 + Navbar + 본문(Outlet) + Footer
// 페이지별 진입 애니메이션은 각 페이지의 PageWrapper 가 담당
function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 본문 바로가기 (키보드 접근성) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        본문으로 건너뛰기
      </a>
      <Background />
      <Navbar />
      <main
        id="main-content"
        className="mx-auto w-full max-w-5xl flex-grow px-4 py-10 sm:px-6 lg:px-8"
      >
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}

export default Layout
