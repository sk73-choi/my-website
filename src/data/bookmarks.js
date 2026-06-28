// 즐겨찾기 데이터: content/favorites.md (관리자 또는 파일 직접 편집)
import { parseFavorites } from '../lib/favoritesMd'

const mdFiles = import.meta.glob('/content/favorites.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const raw = Object.values(mdFiles)[0] ?? ''
const data = parseFavorites(raw)

export const categories = data.categories
export const links = data.links

// URL 에서 호스트명 추출 (파비콘/표시용)
export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

// 구글 파비콘 서비스 URL
export function faviconOf(url) {
  try {
    const host = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`
  } catch {
    return ''
  }
}
