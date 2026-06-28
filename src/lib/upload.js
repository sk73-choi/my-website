// 업로드 파일 처리 유틸

// File → base64 문자열 (바이너리 안전, 큰 파일도 청크로 처리)
export async function fileToBase64(file) {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

// 바이트 수 → 사람이 읽기 쉬운 크기
export function humanSize(bytes) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

// 파일명을 URL/경로 안전하게 정리 (공백→하이픈, 위험 문자 제거, 확장자 유지)
export function safeFileName(name) {
  const dot = name.lastIndexOf('.')
  const base = (dot === -1 ? name : name.slice(0, dot))
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-.]/g, '')
    .replace(/-+/g, '-')
  const ext = dot === -1 ? '' : name.slice(dot).toLowerCase()
  return (base || 'file') + ext
}

// 파일명에서 확장자(소문자, 점 제외) 추출
export function extOf(name) {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase()
}

// 카테고리명 → 경로 안전한 폴더명 (슬래시/공백 정리)
export function categoryFolder(cat) {
  return cat.replace(/[\\/\s]+/g, '-') || 'etc'
}

// File → HTMLImageElement
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

// 이미지 파일 → 썸네일 base64(JPEG). 긴 변을 maxDim 으로 축소.
export async function makeThumbnail(file, maxDim = 480, quality = 0.82) {
  const img = await loadImage(file)
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(img, 0, 0, w, h)
  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  return dataUrl.split(',')[1] // base64 부분만
}
