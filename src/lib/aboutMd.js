import { parseFrontmatter } from './frontmatter.js'

// content/about.md → { profile, skillGroups, timeline }
// 규칙:
//  - frontmatter: name/role/location/email/github
//  - "## 소개"   : 각 줄 = 한 문단 (bio[])
//  - "## 스킬"   : "### 그룹명 | 아이콘" + 다음 줄 쉼표목록 → { icon, title, items[] }
//  - "## 발자취" : "### 기간 | 아이콘" + 제목줄 + 설명줄 → { icon, period, title, desc }
export function parseAbout(md) {
  const { data, content } = parseFrontmatter(md)

  const profile = {
    name: data.name ?? '',
    role: data.role ?? '',
    location: data.location ?? '',
    email: data.email ?? '',
    github: data.github ?? '',
    bio: [],
  }
  const skillGroups = []
  const timeline = []

  let section = null // '소개' | '스킬' | '발자취'
  let group = null // { heading, icon, body: [] }

  function flush() {
    if (!group) return
    if (section === '스킬') {
      const items = group.body
        .join(' ')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      skillGroups.push({ icon: group.icon, title: group.heading, items })
    } else if (section === '발자취') {
      const body = group.body.filter(Boolean)
      timeline.push({
        icon: group.icon,
        period: group.heading,
        title: body[0] ?? '',
        desc: body.slice(1).join(' '),
      })
    }
    group = null
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()

    const h2 = /^##\s+(.+)$/.exec(line)
    if (h2) {
      flush()
      section = h2[1].trim()
      continue
    }

    const h3 = /^###\s+(.+)$/.exec(line)
    if (h3) {
      flush()
      const [headingPart, iconPart] = h3[1].split('|')
      group = {
        heading: headingPart.trim(),
        icon: (iconPart ?? '').trim() || undefined,
        body: [],
      }
      continue
    }

    if (section === '소개') {
      if (line) profile.bio.push(line)
    } else if (group) {
      group.body.push(line)
    }
  }
  flush()

  return { profile, skillGroups, timeline }
}
