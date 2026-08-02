import { useCallback, useEffect, useRef, useState } from 'react'
import { ghLatestDeployRun } from '../lib/github'

const POLL_MS = 10000

// 최근 배포(Actions) 실행 상태를 조회하고, 진행 중이면 자동으로 재조회한다.
// delayMs: 첫 조회를 늦추는 시간(ms). 저장 직후에는 GitHub이 새 워크플로 실행을
// 등록하기까지 짧은 지연이 있어, 그 사이 이전 배포의 "완료" 상태가 잘못 보이는
// 것을 막기 위해 사용.
export function useDeployStatus(delayMs = 0) {
  const [run, setRun] = useState(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  const fetchOnce = useCallback(async () => {
    try {
      const r = await ghLatestDeployRun()
      setRun(r)
    } catch {
      // 조회 실패는 조용히 무시(외부 "배포 보기" 링크로 대체 확인 가능)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    timerRef.current = setTimeout(fetchOnce, delayMs)
    return () => clearTimeout(timerRef.current)
    // delayMs 는 최초 마운트 시 값만 사용
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOnce])

  useEffect(() => {
    if (!run || run.status === 'completed') return
    timerRef.current = setTimeout(fetchOnce, POLL_MS)
    return () => clearTimeout(timerRef.current)
  }, [run, fetchOnce])

  return { run, loading, refresh: fetchOnce }
}
