import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { ghGetUser, REPO } from '../lib/github'

const STORAGE_KEY = 'admin_gh_token'
const AuthContext = createContext(null)

// 저장된 토큰 위치(local=기억, session=탭 종료시 삭제) 탐색
function readStoredToken() {
  return localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY) ?? null
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // 초기 토큰 검증 중
  const [error, setError] = useState(null)

  // 토큰 검증: 유효 + 저장소 주인 본인인지 확인
  const verify = useCallback(async (candidate) => {
    const u = await ghGetUser(candidate)
    if (u.login !== REPO.owner) {
      throw new Error(`이 저장소(${REPO.owner})의 소유자 계정만 로그인할 수 있습니다. (현재: ${u.login})`)
    }
    return u
  }, [])

  // 새로고침 시 저장된 토큰으로 자동 로그인 시도
  useEffect(() => {
    const stored = readStoredToken()
    if (!stored) {
      setLoading(false)
      return
    }
    verify(stored)
      .then((u) => {
        setToken(stored)
        setUser(u)
      })
      .catch(() => {
        // 만료/무효 → 정리
        localStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem(STORAGE_KEY)
      })
      .finally(() => setLoading(false))
  }, [verify])

  // 로그인: remember=true 면 localStorage, 아니면 sessionStorage
  const login = useCallback(
    async (candidate, remember) => {
      setError(null)
      const u = await verify(candidate)
      const store = remember ? localStorage : sessionStorage
      const other = remember ? sessionStorage : localStorage
      store.setItem(STORAGE_KEY, candidate)
      other.removeItem(STORAGE_KEY)
      setToken(candidate)
      setUser(u)
      return u
    },
    [verify],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = { token, user, loading, error, setError, login, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
