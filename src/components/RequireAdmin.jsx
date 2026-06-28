// 관리자(저장소 소유자 GitHub 토큰) 로그인 시에만 children 을 보여주는 클라이언트 게이트.
// 주의: 정적 사이트라 public/ 의 파일 직링크 자체는 막지 못함(목록·화면만 숨김).
import { Link } from 'react-router-dom'
import { LoaderCircle, Lock } from 'lucide-react'
import { useAuth } from '../admin/AuthContext'
import { PageWrapper } from './motion'

export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth()

  // 저장된 토큰 검증 중에는 스피너(로그인된 관리자에게 게이트가 깜빡이지 않도록)
  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoaderCircle className="animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <PageWrapper>
        <div className="glass mx-auto mt-10 max-w-md rounded-2xl p-8 text-center">
          <Lock className="mx-auto mb-3 text-indigo-500" size={32} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">관리자 전용</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            자료실은 관리자(GitHub 계정) 로그인 후에만 볼 수 있습니다.
          </p>
          <Link
            to="/admin"
            className="mt-5 inline-block rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-md transition-transform hover:scale-105"
          >
            관리자 로그인
          </Link>
        </div>
      </PageWrapper>
    )
  }

  return children
}
