// 소개 데이터: content/about.md (관리자 또는 파일 직접 편집)
import { parseAbout } from '../lib/aboutMd'

const mdFiles = import.meta.glob('/content/about.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const raw = Object.values(mdFiles)[0] ?? ''
const data = parseAbout(raw)

export const profile = data.profile
export const skillGroups = data.skillGroups
export const timeline = data.timeline
