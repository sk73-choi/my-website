import { useState } from 'react'
import { Lock, ExternalLink, LoaderCircle } from 'lucide-react'
import { useAuth } from './AuthContext'
import { REPO } from '../lib/github'

// Fine-grained 토큰 생성 링크 (이 저장소 / Contents RW 권장)
const TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new'

function AdminLogin() {
  const { login } = useAuth()
  const [value, setValue] = useState('')
  const [remember, setRemember] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    setBusy(true)
    setErr(null)
    try {
      await login(value.trim(), remember)
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-md rounded-3xl p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white shadow-md">
            <Lock size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">관리자 로그인</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {REPO.owner}/{REPO.name}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="github_pat_..."
              autoComplete="off"
              className="w-full rounded-xl border border-gray-300 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-white/5 dark:text-white"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            이 기기에서 기억하기 (선택 안 하면 탭 종료 시 로그아웃)
          </label>

          {err && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Lock size={16} />}
            로그인
          </button>
        </form>

        <div className="mt-6 border-t border-gray-200/60 pt-4 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
          <p className="mb-2 font-medium">토큰 만드는 법</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>아래 링크에서 Fine-grained token 생성</li>
            <li>
              Repository access: <b>{REPO.name}</b> 만 선택
            </li>
            <li>
              Permissions → Contents: <b>Read and write</b>
            </li>
          </ol>
          <a
            href={TOKEN_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            토큰 생성 페이지 열기 <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
