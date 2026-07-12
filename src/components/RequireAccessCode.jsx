// 자료실(/files) 접근 게이트: 접근 코드를 입력해야 내용을 보여준다.
// (관리자로 로그인돼 있으면 코드 없이 통과)
//
// 주의: 코드는 VITE_ 환경변수라 빌드 결과(JS 번들)에 평문으로 들어가고,
// public/files 의 파일 직링크도 막지 못한다. 비밀번호가 아니라 "문턱" 수준의
// 가리개이므로 민감하지 않은 자료에만 사용할 것.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LoaderCircle, Lock } from 'lucide-react'
import { useAuth } from '../admin/AuthContext'
import { PageWrapper } from './motion'

const CODE = import.meta.env.VITE_FILES_ACCESS_CODE ?? ''
const STORAGE_KEY = 'files-access'

export default function RequireAccessCode({ children }) {
  const { user, loading } = useAuth()

  // 한 번 통과하면 저장해 두고 재방문 시 다시 묻지 않는다.
  // 코드 값 자체를 저장해 비교하므로, 코드를 바꾸면 기존 통과 기록은 자동 무효가 된다.
  const [unlocked, setUnlocked] = useState(
    () => !!CODE && localStorage.getItem(STORAGE_KEY) === CODE,
  )
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!CODE) {
      setError('접근 코드가 설정되지 않았습니다. (.env 의 VITE_FILES_ACCESS_CODE)')
      return
    }
    if (input.trim() !== CODE) {
      setError('접근 코드가 올바르지 않습니다.')
      return
    }
    localStorage.setItem(STORAGE_KEY, CODE)
    setUnlocked(true)
  }

  // 저장된 관리자 토큰 검증 중에는 스피너(로그인된 관리자에게 게이트가 깜빡이지 않도록)
  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoaderCircle className="animate-spin text-indigo-500" />
      </div>
    )
  }

  if (user || unlocked) return children

  return (
    <PageWrapper>
      <div className="glass mx-auto mt-10 max-w-md rounded-2xl p-8 text-center">
        <Lock className="mx-auto mb-3 text-indigo-500" size={32} />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">접근 코드 입력</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          자료실은 접근 코드를 입력해야 볼 수 있습니다.
        </p>

        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError('')
            }}
            placeholder="접근 코드"
            autoFocus
            aria-label="접근 코드"
            className="rounded-full border border-gray-200 bg-white/70 px-5 py-2 text-center text-sm text-gray-900 outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-md transition-transform hover:scale-105"
          >
            입장하기
          </button>
        </form>

        <Link
          to="/admin"
          className="mt-4 inline-block text-xs text-gray-500 hover:text-indigo-500 dark:text-gray-400"
        >
          관리자 로그인
        </Link>
      </div>
    </PageWrapper>
  )
}
