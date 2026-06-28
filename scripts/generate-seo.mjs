// 빌드 전 실행(prebuild): src/posts/*.md 를 읽어 sitemap.xml 과 rss.xml 을 public/ 에 생성.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseFrontmatter } from '../src/lib/frontmatter.js'
import { SITE } from '../src/lib/site.js'

const POSTS_DIR = 'src/posts'
const OUT_DIR = 'public'

// 블로그 글 메타 수집
function loadPosts() {
  let files = []
  try {
    files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'))
  } catch {
    return []
  }
  return files
    .map((file) => {
      const raw = readFileSync(join(POSTS_DIR, file), 'utf8')
      const { data } = parseFrontmatter(raw)
      return {
        slug: file.replace(/\.md$/, ''),
        title: data.title ?? file,
        date: data.date ?? '',
        excerpt: data.excerpt ?? '',
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const posts = loadPosts()
const staticPaths = ['/', '/about', '/blog', '/favorites', '/photos', '/files']

// ── sitemap.xml ──────────────────────────────
const urls = [
  ...staticPaths.map((p) => ({ loc: SITE.url + (p === '/' ? '' : p) })),
  ...posts.map((p) => ({ loc: `${SITE.url}/blog/${p.slug}`, lastmod: p.date })),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>
`

// ── rss.xml ──────────────────────────────────
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(SITE.title)}</title>
    <link>${SITE.url}/blog</link>
    <description>${xmlEscape(SITE.description)}</description>
    <language>ko</language>
${posts
  .map(
    (p) => `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${SITE.url}/blog/${p.slug}</link>
      <guid>${SITE.url}/blog/${p.slug}</guid>
      ${p.date ? `<pubDate>${new Date(p.date).toUTCString()}</pubDate>` : ''}
      <description>${xmlEscape(p.excerpt)}</description>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`

writeFileSync(join(OUT_DIR, 'sitemap.xml'), sitemap)
writeFileSync(join(OUT_DIR, 'rss.xml'), rss)
console.log(`[seo] sitemap.xml, rss.xml 생성 완료 (글 ${posts.length}개)`)
