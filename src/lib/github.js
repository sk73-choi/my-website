// GitHub Contents API 래퍼 (브라우저에서 직접 호출).
// 관리자(/admin)가 토큰으로 저장소 파일을 읽고 커밋하는 데 사용.

export const REPO = {
  owner: 'sk73-choi',
  name: 'my-website',
  branch: 'master',
}

const API = 'https://api.github.com'

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

// 유니코드(한글) 안전한 base64 인코딩/디코딩
export function encodeBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

export function decodeBase64Utf8(b64) {
  const binary = atob(b64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

// 토큰으로 로그인 사용자 조회 (검증용)
export async function ghGetUser(token) {
  const res = await fetch(`${API}/user`, { headers: authHeaders(token) })
  if (res.status === 401) throw new Error('토큰이 유효하지 않습니다.')
  if (!res.ok) throw new Error(`GitHub 인증 실패 (${res.status})`)
  return res.json()
}

// 파일 읽기 → { sha, content } (없으면 null)
export async function ghGetFile(token, path) {
  const url = `${API}/repos/${REPO.owner}/${REPO.name}/contents/${encodeURI(path)}?ref=${REPO.branch}`
  const res = await fetch(url, { headers: authHeaders(token) })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`파일 읽기 실패 (${res.status}): ${path}`)
  const json = await res.json()
  return { sha: json.sha, content: decodeBase64Utf8(json.content) }
}

// 파일 생성/수정 커밋. 기존 파일 수정 시 sha 필요.
export async function ghPutFile(token, path, content, message, sha) {
  const url = `${API}/repos/${REPO.owner}/${REPO.name}/contents/${encodeURI(path)}`
  const body = {
    message,
    content: encodeBase64Utf8(content),
    branch: REPO.branch,
  }
  if (sha) body.sha = sha
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(`저장 실패 (${res.status}): ${detail.message ?? path}`)
  }
  return res.json()
}

// 이미 base64 인 콘텐츠(바이너리 파일 등)를 그대로 커밋
export async function ghPutFileBase64(token, path, base64, message, sha) {
  const url = `${API}/repos/${REPO.owner}/${REPO.name}/contents/${encodeURI(path)}`
  const body = { message, content: base64, branch: REPO.branch }
  if (sha) body.sha = sha
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(`업로드 실패 (${res.status}): ${detail.message ?? path}`)
  }
  return res.json()
}

// 파일이 이미 있으면 sha 반환(덮어쓰기용), 없으면 null
export async function ghGetSha(token, path) {
  const file = await ghGetFile(token, path).catch(() => null)
  return file?.sha ?? null
}

// 파일 삭제 커밋 (sha 필요)
export async function ghDeleteFile(token, path, message, sha) {
  const url = `${API}/repos/${REPO.owner}/${REPO.name}/contents/${encodeURI(path)}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha, branch: REPO.branch }),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(`삭제 실패 (${res.status}): ${detail.message ?? path}`)
  }
  return res.json()
}

// 디렉터리 목록 → [{ name, path, sha, type }]
export async function ghListDir(token, path) {
  const url = `${API}/repos/${REPO.owner}/${REPO.name}/contents/${encodeURI(path)}?ref=${REPO.branch}`
  const res = await fetch(url, { headers: authHeaders(token) })
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`목록 읽기 실패 (${res.status}): ${path}`)
  return res.json()
}

// 최근 배포(Actions) 실행 상태 URL
export function actionsUrl() {
  return `https://github.com/${REPO.owner}/${REPO.name}/actions`
}
