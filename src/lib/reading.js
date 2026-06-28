// 본문 기준 예상 읽는 시간(분). 한글(문자)·영어(단어) 혼합 추정.
export function readingTime(text) {
  if (!text) return 1
  const hangul = (text.match(/[ㄱ-힝]/g) || []).length
  const words = (text.replace(/[ㄱ-힝]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length
  const minutes = hangul / 500 + words / 200
  return Math.max(1, Math.round(minutes))
}

// 마크다운 본문에서 ## / ### 헤딩을 추출해 목차(TOC) 항목 생성.
// id 는 rehype-slug(github-slugger)와 동일 규칙으로 맞춤.
import GithubSlugger from 'github-slugger'

export function buildToc(content) {
  if (!content) return []
  const slugger = new GithubSlugger()
  const items = []
  let inFence = false
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const m = /^(#{2,3})\s+(.+)$/.exec(line)
    if (m) {
      const text = m[2].replace(/[*_`]/g, '').trim()
      items.push({ level: m[1].length, text, id: slugger.slug(text) })
    }
  }
  return items
}
