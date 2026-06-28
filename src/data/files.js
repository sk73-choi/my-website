// 자료실 데이터: public/files/{카테고리}/ 폴더를 스캔해 빌드 시 생성된
// manifest(src/data/files.generated.json)를 사용.
// → 폴더에 파일을 넣거나 지우면 빌드 후 자동 반영. (생성: scripts/generate-files.mjs)
import data from './files.generated.json'

export const categories = data.categories
export const files = data.files

// manifest 가 이미 최신순으로 정렬되어 있음
export function getSortedFiles() {
  return files
}
