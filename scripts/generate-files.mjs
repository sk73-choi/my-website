// 빌드/실행 전(prebuild/predev): public/files/{카테고리}/ 폴더를 스캔해
// 자료실 목록을 src/data/files.generated.json 으로 출력.
// → 폴더에 파일을 넣거나 지우면 빌드 시 사이트에 자동 반영.
import { readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'

const ROOT = 'public/files'
const OUT = 'src/data/files.generated.json'
const PREFERRED = [
  '경제투자',
  'AI',
  '데이터 사이언스',
  'IT',
  '취미',
  '여행',
  '매뉴얼',
  'Youtube',
  '구독',
  '쇼핑',
  '기타',
]

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

function extOf(name) {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase()
}

function listCategories() {
  try {
    const dirs = readdirSync(ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
    const known = PREFERRED.filter((c) => dirs.includes(c))
    const extra = dirs.filter((c) => !PREFERRED.includes(c)).sort()
    return [...known, ...extra]
  } catch {
    return []
  }
}

const categories = listCategories()
const files = []

for (const cat of categories) {
  const dir = join(ROOT, cat)
  let entries = []
  try {
    entries = readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name !== '.gitkeep')
      .map((e) => e.name)
  } catch {
    entries = []
  }
  for (const name of entries) {
    const full = join(dir, name)
    const st = statSync(full)
    files.push({
      id: `${cat}/${name}`,
      title: name.replace(/\.[^.]+$/, ''),
      category: cat,
      type: extOf(name),
      path: `/files/${cat}/${name}`,
      size: humanSize(st.size),
      date: st.mtime.toISOString().slice(0, 10),
    })
  }
}

files.sort((a, b) => new Date(b.date) - new Date(a.date) || (a.id < b.id ? 1 : -1))

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify({ categories, files }, null, 2) + '\n')
console.log(`[files] 카테고리 ${categories.length}개 · 파일 ${files.length}개 → ${OUT}`)
