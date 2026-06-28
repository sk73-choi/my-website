import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, LoaderCircle } from 'lucide-react'
import { actionsUrl } from '../lib/github'

// 관리자 하위 페이지 공통 레이아웃 (뒤로가기 + 제목)
export function AdminShell({ title, backTo = '/admin', actions, children }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={backTo}
            className="inline-flex items-center gap-1 text-sm text-indigo-600 transition-all hover:gap-2 dark:text-indigo-400"
          >
            <ArrowLeft size={16} /> 뒤로
          </Link>
          <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
            {title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </div>
      {children}
    </div>
  )
}

// 저장 상태 배너 (idle / saving / success / error)
export function StatusBanner({ status, message }) {
  if (status === 'idle' || !status) return null

  if (status === 'saving') {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-indigo-500/10 px-4 py-3 text-sm text-indigo-700 dark:text-indigo-300">
        <LoaderCircle size={16} className="animate-spin" /> 저장(커밋) 중…
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
        <CheckCircle2 size={16} /> {message ?? '저장되었습니다.'} 약 1~2분 후 사이트에 반영됩니다.
        <a
          href={actionsUrl()}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 font-medium underline"
        >
          배포 보기 <ExternalLink size={12} />
        </a>
      </div>
    )
  }

  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
      <AlertCircle size={16} /> {message ?? '오류가 발생했습니다.'}
    </div>
  )
}
