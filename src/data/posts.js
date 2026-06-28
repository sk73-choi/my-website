// 블로그 글: src/posts/*.md (상단 frontmatter 에 title/date/excerpt/tags)
// import.meta.glob 로 본문을 읽어 frontmatter 를 파싱한다.
import { parseFrontmatter } from '../lib/frontmatter'

const rawFiles = import.meta.glob('../posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function slugFromPath(path) {
  return path.split('/').pop().replace(/\.md$/, '')
}

// { slug, title, date, excerpt, tags, content } 형태로 정규화
const allPosts = Object.entries(rawFiles).map(([path, raw]) => {
  const { data, content } = parseFrontmatter(raw)
  const slug = slugFromPath(path)
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? '',
    excerpt: data.excerpt ?? '',
    tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
    content,
  }
})

// 메타데이터만(본문 제외)
export const posts = allPosts.map(({ content: _content, ...meta }) => meta)

// 최신순 정렬된 글 목록
export function getSortedPosts() {
  return [...allPosts].sort((a, b) => new Date(b.date) - new Date(a.date))
}

// slug 로 글 메타데이터 조회
export function getPostBySlug(slug) {
  return allPosts.find((p) => p.slug === slug) ?? null
}

// slug 로 마크다운 본문 조회 (없으면 null)
export function getPostContent(slug) {
  return allPosts.find((p) => p.slug === slug)?.content ?? null
}

// 전체 태그 목록(중복 제거)
export function getAllTags() {
  return [...new Set(allPosts.flatMap((p) => p.tags))]
}
