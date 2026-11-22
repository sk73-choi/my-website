// 자료실(/files) 접근 게이트: 접근 코드를 입력해야 내용을 보여준다.
// (관리자로 로그인돼 있으면 코드 없이 통과)
//
// 주의: 코드는 VITE_ 환경변수라 빌드 결과(JS 번들)에 평문으로 들어가고,
// public/files 의 파일 직링크도 막지 못한다. 비밀번호가 아니라 "문턱" 수준의
// 가리개이므로 민감하지 않은 자료에만 사용할 것. (공용 로직: lib/accessCode.js)
import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from '../admin/AuthContext'
import { isAccessUnlocked } from '../lib/accessCode'
import AccessCodeForm from './AccessCodeForm'
import { PageWrapper } from './motion'

export default function RequireAccessCode({ children }) {
  const { user, loading } = useAuth()
  const [unlocked, setUnlocked] = useState(isAccessUnlocked)

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
      <div className="pt-4">
        <AccessCodeForm
          description="자료실은 접근 코드를 입력해야 볼 수 있습니다."
          onUnlock={() => setUnlocked(true)}
        />
      </div>
    </PageWrapper>
  )
}
