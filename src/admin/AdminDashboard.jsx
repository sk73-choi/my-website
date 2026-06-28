import { Link } from 'react-router-dom'
import {
  FileText,
  FolderOpen,
  User,
  Star,
  Camera,
  LogOut,
  ExternalLink,
  Rocket,
  Home,
} from 'lucide-react'
import { useAuth } from './AuthContext'
import { actionsUrl } from '../lib/github'
import { getSortedPosts } from '../data/posts'
import { getSortedFiles } from '../data/files'
import { links as bookmarkLinks } from '../data/bookmarks'
import { photos as photoList } from '../data/photos'

// 편집 영역 카드 (2단계에서 실제 에디터 연결 예정)
const sections = [
  {
    to: '/admin/blog',
    icon: FileText,
    title: '블로그',
    desc: '글 작성 · 수정 · 삭제',
    count: () => getSortedPosts().length,
    unit: '개 글',
  },
  {
    to: '/admin/about',
    icon: User,
    title: '소개',
    desc: '프로필 · 스킬 · 타임라인',
    count: () => null,
    unit: '',
  },
  {
    to: '/admin/favorites',
    icon: Star,
    title: '즐겨찾기',
    desc: '카테고리 · 사이트 링크',
    count: () => bookmarkLinks.length,
    unit: '개 링크',
  },
  {
    to: '/admin/photos',
    icon: Camera,
    title: '사진',
    desc: '카테고리 · 이미지 업로드',
    count: () => photoList.length,
    unit: '장',
  },
  {
    to: '/admin/files',
    icon: FolderOpen,
    title: '자료실',
    desc: '자료 메타데이터 편집',
    count: () => getSortedFiles().length,
    unit: '개 자료',
  },
]

function AdminDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* 헤더 */}
      <header className="glass mb-8 flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {user?.avatar_url && (
            <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full" />
          )}
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white">관리자 대시보드</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.login} 으로 로그인됨
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
          >
            <Home size={15} /> 사이트
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/20 dark:text-red-400"
          >
            <LogOut size={15} /> 로그아웃
          </button>
        </div>
      </header>

      {/* 편집 영역 */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map(({ to, icon: Icon, title, desc, count, unit }) => {
          const n = count()
          return (
            <Link
              key={to}
              to={to}
              className="glass group rounded-2xl p-5 transition-transform hover:-translate-y-1"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white shadow-md">
                <Icon size={18} />
              </span>
              <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              {n != null && (
                <p className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-300">
                  {n}
                  {unit}
                </p>
              )}
            </Link>
          )
        })}
      </div>

      {/* 배포 상태 안내 */}
      <div className="glass mt-8 flex items-start gap-3 rounded-2xl p-5">
        <Rocket size={18} className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-300" />
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p className="font-medium text-gray-900 dark:text-white">자동 배포</p>
          <p className="mt-1">
            관리자에서 저장하면 저장소에 커밋되고 GitHub Actions가 사이트를 자동
            갱신합니다(약 1~2분).
          </p>
          <a
            href={actionsUrl()}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            배포 진행 상황 보기 <ExternalLink size={13} />
          </a>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        각 영역에서 편집·저장하면 저장소에 커밋되어 자동 배포됩니다. 실제 파일
        업로드는 3단계에서 추가됩니다.
      </p>
    </div>
  )
}

export default AdminDashboard
