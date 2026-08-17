// 1회성 스크립트: E:\games\게임명.txt 의 게임 목록과 E:\games\snaps_288 의 스크린샷을
// 읽어 스크린샷을 public/blog-images/mame/ 로 복사하고, 이름+이미지를 그리드로 보여주는
// 블로그 글(src/posts/{SLUG}.md)을 생성한다.
// 사용법: node scripts/generate-mame-post.mjs
import {
  readFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { safeFileName } from '../src/lib/upload.js'
import { buildMarkdown } from '../src/lib/frontmatter.js'

const LIST_FILE = 'E:\\games\\게임명.txt'
const SNAPS_DIR = 'E:\\games\\snaps_288'
const OUT_IMG_DIR = 'public/blog-images/mame'
const SLUG = 'my-mame-game-list-20260817'
const POST_FILE = `src/posts/${SLUG}.md`

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// 게임 목록 읽기 (UTF-8 BOM + CRLF)
const raw = readFileSync(LIST_FILE, 'utf8').replace(/^\uFEFF/, '')
const names = raw
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter(Boolean)

mkdirSync(OUT_IMG_DIR, { recursive: true })

const items = []
const missing = []
const usedNames = new Set()

for (const name of names) {
  const srcFile = join(SNAPS_DIR, `${name}.png`)
  if (!existsSync(srcFile)) {
    missing.push(name)
    continue
  }
  let destName = safeFileName(`${name}.png`)
  if (usedNames.has(destName)) {
    // 정리 후 이름이 겹치면 원본 인덱스를 붙여 구분
    destName = safeFileName(`${name}_${items.length}.png`)
  }
  usedNames.add(destName)
  copyFileSync(srcFile, join(OUT_IMG_DIR, destName))
  items.push({ name, file: destName })
}

const gridLines = items.map(
  ({ name, file }) =>
    `<figure><img src="/blog-images/mame/${file}" alt="${escapeHtml(name)}" loading="lazy" /><figcaption>${escapeHtml(name)}</figcaption></figure>`,
)

const content = `# My MAME Game List(2026년 8월 17일)

<div class="mame-grid">
${gridLines.join('\n')}
</div>
`

const frontmatter = {
  title: 'My MAME Game List(2026년 8월 17일)',
  date: '2026-08-17',
  excerpt: `MAME 아케이드 게임 ${items.length}개의 이름과 스크린샷을 그리드로 정리했습니다.`,
  tags: ['MAME', '아케이드', '게임'],
}

writeFileSync(POST_FILE, buildMarkdown(frontmatter, content))

console.log(`[mame] 게임 ${names.length}개 중 ${items.length}개 처리, ${missing.length}개 스냅샷 없음`)
if (missing.length) {
  console.log('[mame] 스냅샷 없는 게임:')
  for (const m of missing) console.log(`  - ${m}`)
}
console.log(`[mame] 이미지 → ${OUT_IMG_DIR}/ (${items.length}개)`)
console.log(`[mame] 글 → ${POST_FILE}`)
