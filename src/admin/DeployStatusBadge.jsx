import { CheckCircle2, AlertCircle, LoaderCircle, ExternalLink } from 'lucide-react'
import { useDeployStatus } from './useDeployStatus'

function timeAgo(iso) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return '방금 전'
  if (min < 60) return `${min}분 전`
  return `${Math.round(min / 60)}시간 전`
}

// 최근 배포(Actions) 상태 배지. GitHub Actions 탭 없이 관리자 안에서 바로 확인용.
export function DeployStatusBadge({ className = '', delayMs = 0 }) {
  const { run, loading } = useDeployStatus(delayMs)
  const base = `inline-flex items-center gap-1.5 text-xs font-medium ${className}`

  if (loading) {
    return (
      <span className={`${base} text-gray-400`}>
        <LoaderCircle size={12} className="animate-spin" /> 배포 상태 확인 중…
      </span>
    )
  }
  if (!run) return null

  if (run.status !== 'completed') {
    return (
      <a href={run.url} target="_blank" rel="noreferrer noopener" className={`${base} text-indigo-600 hover:underline dark:text-indigo-400`}>
        <LoaderCircle size={12} className="animate-spin" /> 배포 중…
        <ExternalLink size={11} />
      </a>
    )
  }

  if (run.conclusion === 'success') {
    return (
      <a href={run.url} target="_blank" rel="noreferrer noopener" className={`${base} text-green-600 hover:underline dark:text-green-400`}>
        <CheckCircle2 size={12} /> 배포 완료 · {timeAgo(run.updatedAt)}
        <ExternalLink size={11} />
      </a>
    )
  }

  if (run.conclusion === 'failure') {
    return (
      <a href={run.url} target="_blank" rel="noreferrer noopener" className={`${base} text-red-600 hover:underline dark:text-red-400`}>
        <AlertCircle size={12} /> 배포 실패
        <ExternalLink size={11} />
      </a>
    )
  }

  return (
    <a href={run.url} target="_blank" rel="noreferrer noopener" className={`${base} text-gray-500 hover:underline dark:text-gray-400`}>
      배포 상태: {run.conclusion ?? run.status}
      <ExternalLink size={11} />
    </a>
  )
}
