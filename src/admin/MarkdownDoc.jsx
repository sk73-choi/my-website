import { useState, useEffect } from 'react'
import { Save, LoaderCircle } from 'lucide-react'
import { useAuth } from './AuthContext'
import { AdminShell, StatusBanner } from './AdminShell'
import { ghGetFile, ghPutFile } from '../lib/github'

// content/*.md 같은 단일 마크다운 파일을 통째로 편집·저장하는 관리자 에디터.
// 파일을 직접 수정/push 하는 것과 동일한 결과(같은 파일을 고침).
function MarkdownDoc({ title, path, help, accent = 'from-fuchsia-600 to-indigo-600' }) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState(null)
  const [sha, setSha] = useState(null)
  const [text, setText] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const file = await ghGetFile(token, path)
        if (!file) throw new Error(`${path} 을 찾을 수 없습니다.`)
        if (!alive) return
        setSha(file.sha)
        setText(file.content)
      } catch (e) {
        setStatus('error')
        setMessage(e.message)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [token, path])

  async function onSave() {
    setStatus('saving')
    setMessage(null)
    try {
      await ghPutFile(token, path, text, `${title} 수정`, sha)
      const file = await ghGetFile(token, path)
      setSha(file?.sha ?? null)
      setStatus('success')
      setMessage('저장했습니다.')
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  if (loading) {
    return (
      <AdminShell title={title}>
        <div className="flex justify-center py-16">
          <LoaderCircle className="animate-spin text-indigo-500" />
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      title={title}
      actions={
        <button
          type="button"
          onClick={onSave}
          disabled={status === 'saving'}
          className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${accent} px-4 py-2 text-sm font-semibold text-white shadow-md hover:scale-[1.03] disabled:opacity-60`}
        >
          {status === 'saving' ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          저장
        </button>
      }
    >
      <StatusBanner status={status} message={message} />

      {help && (
        <div className="glass mb-4 rounded-2xl p-4 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
          {help}
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="glass h-[65vh] w-full resize-y rounded-2xl p-4 font-mono text-sm leading-relaxed text-gray-800 outline-none dark:text-gray-100"
      />

      <p className="mt-3 text-xs text-gray-400">
        이 화면은 <code>{path}</code> 파일을 편집합니다. 프로젝트의 같은 파일을 직접
        수정해 push 해도 동일하게 반영됩니다.
      </p>
    </AdminShell>
  )
}

export default MarkdownDoc
