// 빌드/실행 전(prebuild/predev): public/photos/{카테고리}/ 폴더를 스캔해
//  - 썸네일을 public/photos/{카테고리}/thumbs/ 에 생성(sharp)
//  - 목록을 src/data/photos.generated.json 으로 출력
// → 폴더에 이미지를 넣거나 지우면 빌드 시 사이트에 자동 반영.
import {
  readdirSync,
  statSync,
  mkdirSync,
  existsSync,
  writeFileSync,
} from 'node:fs'
import { join, dirname } from 'node:path'

const ROOT = 'public/photos'
const OUT = 'src/data/photos.generated.json'
const PREFERRED = ['여행', '정보', 'ZARD', '취미', '개인']
const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i
const THUMB_MAX = 480

// sharp 가 없거나 실패하면 썸네일 대신 원본 사용(빌드는 절대 깨지지 않게)
let sharp = null
try {
  sharp = (await import('sharp')).default
} catch {
  console.warn('[photos] sharp 미설치 — 썸네일 대신 원본 사용')
}

function listCategories() {
  try {
    const dirs = readdirSync(ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== 'thumbs')
      .map((d) => d.name)
    const known = PREFERRED.filter((c) => dirs.includes(c))
    const extra = dirs.filter((c) => !PREFERRED.includes(c)).sort()
    return [...known, ...extra]
  } catch {
    return []
  }
}

async function makeThumb(srcFile, destFile) {
  if (!sharp) return false
  try {
    mkdirSync(dirname(destFile), { recursive: true })
    if (existsSync(destFile)) return true
    await sharp(srcFile)
      .resize(THUMB_MAX, THUMB_MAX, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toFile(destFile)
    return true
  } catch (e) {
    console.warn(`[photos] 썸네일 실패(${srcFile}): ${e.message}`)
    return false
  }
}

// 애니메이션(움직이는) 이미지인지 판별 — webp/gif/avif 의 프레임이 2개 이상이면 true
const ANIM_RE = /\.(webp|gif|avif)$/i
async function isAnimated(srcFile) {
  if (!sharp || !ANIM_RE.test(srcFile)) return false
  try {
    const m = await sharp(srcFile, { animated: true }).metadata()
    return (m.pages || 1) > 1
  } catch {
    return false
  }
}

const categories = listCategories()
const photos = []

for (const cat of categories) {
  const dir = join(ROOT, cat)
  let files = []
  try {
    files = readdirSync(dir).filter((f) => IMG_RE.test(f))
  } catch {
    files = []
  }
  for (const file of files) {
    const srcFile = join(dir, file)
    const baseName = file.replace(IMG_RE, '')
    // 썸네일 이름에 원본 파일명 전체(확장자 포함)를 사용해 충돌 방지.
    // (예: ZARD.png · ZARD.jpg 처럼 확장자만 다른 동명 파일이 서로 덮어쓰지 않도록)
    const thumbName = `${file}.jpg`
    const thumbFile = join(dir, 'thumbs', thumbName)
    const ok = await makeThumb(srcFile, thumbFile)
    const animated = await isAnimated(srcFile)
    const date = statSync(srcFile).mtime.toISOString().slice(0, 10)
    photos.push({
      id: `${cat}/${file}`,
      category: cat,
      title: baseName,
      src: `/photos/${cat}/${file}`,
      thumb: ok ? `/photos/${cat}/thumbs/${thumbName}` : `/photos/${cat}/${file}`,
      date,
      ...(animated ? { animated: true } : {}),
    })
  }
}

// 최신순(같으면 이름 역순)
photos.sort((a, b) => new Date(b.date) - new Date(a.date) || (a.id < b.id ? 1 : -1))

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify({ categories, photos }, null, 2) + '\n')
console.log(`[photos] 카테고리 ${categories.length}개 · 사진 ${photos.length}장 → ${OUT}`)
