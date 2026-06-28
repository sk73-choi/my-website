// 사진 갤러리 데이터: public/photos/{카테고리}/ 폴더를 스캔해 빌드 시 생성된
// manifest(src/data/photos.generated.json)를 사용.
// → 폴더에 이미지를 넣거나 지우면 빌드 후 자동 반영. (생성 스크립트: scripts/generate-photos.mjs)
import data from './photos.generated.json'

export const categories = data.categories
export const photos = data.photos

// manifest 가 이미 최신순으로 정렬되어 있음
export function getSortedPhotos() {
  return photos
}
