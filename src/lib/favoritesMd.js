import { parseFrontmatter } from './frontmatter.js'

// content/favorites.md → { categories: string[], links: [{id, category, title, url, desc}] }
// 규칙:
//  - "## 카테고리명" → 카테고리(순서 유지, 링크 없어도 됨)
//  - "- [제목](URL) — 설명" → 현재 카테고리의 링크 (설명 생략 가능)
export function parseFavorites(md) {
  const { content } = parseFrontmatter(md)
  const categories = []
  const links = []
  let current = null
  let id = 0

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('<!--') || line.startsWith('-->')) continue

    const heading = /^##\s+(.+)$/.exec(line)
    if (heading) {
      current = heading[1].trim()
      if (!categories.includes(current)) categories.push(current)
      continue
    }

    // - [제목](URL) — 설명   /  - [제목](URL)
    const link = /^[-*]\s*\[([^\]]+)\]\(([^)]+)\)\s*(?:[—–-]\s*(.*))?$/.exec(line)
    if (link && current) {
      id += 1
      links.push({
        id,
        category: current,
        title: link[1].trim(),
        url: link[2].trim(),
        desc: (link[3] ?? '').trim(),
      })
    }
  }

  return { categories, links }
}
