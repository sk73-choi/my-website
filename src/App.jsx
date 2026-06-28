import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Favorites from './pages/Favorites'
import Photos from './pages/Photos'
import About from './pages/About'
import NotFound from './pages/NotFound'

// 무거운 화면은 분할 로딩(초기 번들 축소): 글 상세(마크다운/하이라이트),
// 자료실(PDF 뷰어), 관리자(에디터/업로드)
const BlogPost = lazy(() => import('./pages/BlogPost'))
const Files = lazy(() => import('./pages/Files'))
const AdminApp = lazy(() => import('./admin/AdminApp'))

function Fallback() {
  return (
    <div className="flex justify-center py-24">
      <LoaderCircle className="animate-spin text-indigo-500" />
    </div>
  )
}

// 전체 라우팅 구조. 공개 페이지는 Layout(Navbar/Footer)으로 감싸고,
// /admin 은 별도(공개 네비게이션 없이 자체 인증)로 분리.
function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="files" element={<Files />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="photos" element={<Photos />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
