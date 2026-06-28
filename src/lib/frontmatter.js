// 마크다운 상단 YAML frontmatter 를 파싱하는 경량 파서.
// 지원: 문자열, 인라인 배열([a, b]) — 블로그 글 메타데이터(title/date/excerpt/tags)에 충분.
// (gray-matter 등 무거운 의존성 없이 브라우저/빌드 양쪽에서 동작)

export function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!match) return { data: {}, content: raw }

  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (!key) continue

    if (value.startsWith('[') && value.endsWith(']')) {
      // 인라인 배열: [a, b, c]
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    } else {
      data[key] = value.replace(/^["']|["']$/g, '')
    }
  }
  return { data, content: match[2] }
}

// 메타데이터 객체 → frontmatter 문자열 + 본문 으로 직렬화 (관리자 저장 시 사용)
export function buildMarkdown(data, content) {
  const lines = ['---']
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.join(', ')}]`)
    } else {
      lines.push(`${key}: ${value}`)
    }
  }
  lines.push('---', '')
  return lines.join('\n') + (content ?? '')
}
