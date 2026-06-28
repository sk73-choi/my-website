// 사진 원본 일괄 최적화: public/photos/{카테고리}/ 의 이미지를 적당한 해상도로
// 리사이즈하고 다시 압축해 용량을 줄인다. (썸네일 thumbs/ 는 빌드 때 따로 생성)
//
// 사용법:  npm run optimize:photos
//   - 사진을 폴더에 추가한 뒤, 커밋하기 전에 한 번 실행하면 됨.
//   - 이미 충분히 작은 파일과, 더 줄지 않는 파일은 원본 그대로 둠(반복 실행해도 안전).
//   - 움직이는 GIF 보존을 위해 gif/avif 는 건드리지 않음.
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  unlinkSync,
} from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = 'public/photos'
const MAX = 1600 // 가로·세로 최대 픽셀(긴 변 기준, 확대는 안 함)
const GIF_MAX = 720 // GIF(애니메이션)는 더 작게 — 용량 절감 폭이 큼
const SKIP_BYTES = 500 * 1024 // 이미 이 크기 미만이고 해상도도 작으면 건너뜀
const IMG_RE = /\.(jpe?g|png|webp)$/i // 정지 이미지(avif 제외)
const GIF_RE = /\.gif$/i // 움직이는 GIF → 애니메이션 WebP로 변환

let sharp = null
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('[optimize] sharp 가 필요합니다: npm i -D sharp')
  process.exit(1)
}

// 확장자에 맞는 출력 포맷·옵션
function formatFor(ext) {
  const e = ext.toLowerCase()
  if (e === '.png') return ['png', { compressionLevel: 9, palette: true }]
  if (e === '.webp') return ['webp', { quality: 80 }]
  return ['jpeg', { quality: 82, mozjpeg: true }]
}

function listCategories() {
  try {
    return readdirSync(ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== 'thumbs')
      .map((d) => d.name)
  } catch {
    return []
  }
}

let before = 0
let after = 0
let changed = 0
let skipped = 0
let gifConverted = 0

for (const cat of listCategories()) {
  const dir = join(ROOT, cat)
  let files = []
  try {
    files = readdirSync(dir).filter((f) => IMG_RE.test(f) || GIF_RE.test(f))
  } catch {
    continue
  }
  for (const file of files) {
    const fp = join(dir, file)
    // 원본을 버퍼로 먼저 읽음(같은 경로에 다시 쓸 때 Windows 파일 잠금 충돌 방지)
    let input
    try {
      input = readFileSync(fp)
    } catch {
      continue
    }
    const size = input.length

    // ── GIF → 애니메이션 WebP 변환(확장자 .gif→.webp, 원본 삭제) ──
    if (GIF_RE.test(file)) {
      let out
      try {
        out = await sharp(input, { animated: true })
          .resize(GIF_MAX, GIF_MAX, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 70 })
          .toBuffer()
      } catch (e) {
        console.warn(`[optimize] GIF 변환 실패(${file}): ${e.message}`)
        continue
      }
      if (out.length >= size) {
        skipped++ // 드물게 더 안 줄면 원본 GIF 유지
        continue
      }
      // 같은 이름의 webp 가 이미 있으면 충돌 방지로 -anim 접미사
      let dest = join(dir, file.replace(GIF_RE, '.webp'))
      if (existsSync(dest)) dest = join(dir, file.replace(GIF_RE, '-anim.webp'))
      writeFileSync(dest, out)
      unlinkSync(fp) // 확장자가 바뀌므로 원본 GIF 제거
      before += size
      after += out.length
      changed++
      gifConverted++
      continue
    }
    let meta
    try {
      meta = await sharp(input).metadata()
    } catch {
      continue // 이미지로 못 읽으면 건너뜀
    }
    const tooBig = (meta.width || 0) > MAX || (meta.height || 0) > MAX
    if (!tooBig && size < SKIP_BYTES) {
      skipped++
      continue // 이미 충분히 작음
    }
    const [fmt, opts] = formatFor(extname(file))
    let buf
    try {
      buf = await sharp(input)
        .rotate() // EXIF 회전 정보 반영(휴대폰 사진 대비)
        .resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true })
        [fmt](opts)
        .toBuffer()
    } catch (e) {
      console.warn(`[optimize] 실패(${file}): ${e.message}`)
      continue
    }
    if (buf.length < size) {
      writeFileSync(fp, buf)
      before += size
      after += buf.length
      changed++
    } else {
      skipped++ // 더 줄지 않으면 원본 유지(재압축 손실 방지)
    }
  }
}

const mb = (b) => (b / 1024 / 1024).toFixed(1)
console.log(
  `[optimize] 최적화 ${changed}장(GIF→WebP ${gifConverted}장) · 유지 ${skipped}장 | ${mb(before)}MB → ${mb(after)}MB (절감 ${mb(before - after)}MB)`,
)
