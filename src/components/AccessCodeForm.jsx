import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { tryUnlock } from '../lib/accessCode'

// 접근 코드 입력 카드 (자료실 게이트 / 사진·영상 잠금 카테고리 공용)
function AccessCodeForm({ title = '접근 코드 입력', description, onUnlock }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const result = tryUnlock(input)
    if (result === true) onUnlock()
    else setError(result)
  }

  return (
    <div className="glass mx-auto mt-6 max-w-md rounded-2xl p-8 text-center">
      <Lock className="mx-auto mb-3 text-indigo-500" size={32} />
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      )}

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
  )
}

export default AccessCodeForm
