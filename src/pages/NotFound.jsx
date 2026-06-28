import { Link } from 'react-router-dom'
import { PageWrapper } from '../components/motion'
import Seo from '../components/Seo'

// 404 페이지
function NotFound() {
  return (
    <PageWrapper className="py-20 text-center">
      <Seo title="404" description="페이지를 찾을 수 없습니다." />
      <p className="text-7xl font-extrabold text-gradient">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">
        페이지를 찾을 수 없습니다
      </h1>
      <Link
        to="/"
        className="mt-8 inline-block rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105"
      >
        홈으로 돌아가기
      </Link>
    </PageWrapper>
  )
}

export default NotFound
