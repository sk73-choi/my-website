import { Routes, Route, Navigate } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from './AuthContext'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import AdminBlog from './AdminBlog'
import BlogEditor from './BlogEditor'
import AdminFiles from './AdminFiles'
import AdminPhotos from './AdminPhotos'
import MarkdownDoc from './MarkdownDoc'

// 소개/즐겨찾기 편집 도움말
const aboutHelp = (
  <>
    프로필은 맨 위 <b>---</b> 사이에, <b>## 소개</b>는 줄마다 한 문단,{' '}
    <b>## 스킬</b>은 “### 그룹명 | 아이콘” + 쉼표목록, <b>## 발자취</b>는 “### 기간 |
    아이콘” + 제목줄 + 설명줄. 아이콘: Code2, Wrench, Sparkles, Briefcase, GraduationCap.
  </>
)
const favoritesHelp = (
  <>
    <b>## 카테고리명</b> 으로 카테고리를 만들고(링크 없어도 됨), 링크는{' '}
    <code>- [제목](URL) — 설명</code> 형식으로 한 줄씩 추가하세요. 카테고리 순서 = 노출
    순서.
  </>
)

// 로그인 여부에 따라 보호된 내용/로그인 화면 분기
function Gate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!user) return <AdminLogin />

  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="blog" element={<AdminBlog />} />
      <Route path="blog/new" element={<BlogEditor />} />
      <Route path="blog/edit/:slug" element={<BlogEditor />} />
      <Route
        path="about"
        element={
          <MarkdownDoc
            title="소개 편집"
            path="content/about.md"
            help={aboutHelp}
            accent="from-sky-500 to-blue-600"
          />
        }
      />
      <Route
        path="favorites"
        element={
          <MarkdownDoc
            title="즐겨찾기 편집"
            path="content/favorites.md"
            help={favoritesHelp}
            accent="from-amber-500 to-orange-600"
          />
        }
      />
      <Route path="files" element={<AdminFiles />} />
      <Route path="photos" element={<AdminPhotos />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

function AdminApp() {
  // AuthProvider 는 App 최상위에서 제공됨(공개 페이지와 로그인 상태 공유)
  return <Gate />
}

export default AdminApp
