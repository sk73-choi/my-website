// 접근 코드 공용 로직 (자료실 /files, 사진/영상의 잠금 카테고리 공용)
//
// 코드는 .env 의 VITE_FILES_ACCESS_CODE (배포 시 GitHub Secret 으로 주입).
// 빌드 결과(JS 번들)에 평문으로 들어가므로 비밀번호가 아닌 "문턱" 수준의 가리개.
// 한 번 통과하면 localStorage 에 코드 값을 저장 → 코드를 바꾸면 기존 통과 기록은 자동 무효.

export const ACCESS_CODE = import.meta.env.VITE_FILES_ACCESS_CODE ?? ''
export const ACCESS_STORAGE_KEY = 'files-access'

export function isAccessUnlocked() {
  try {
    return !!ACCESS_CODE && localStorage.getItem(ACCESS_STORAGE_KEY) === ACCESS_CODE
  } catch {
    return false
  }
}

// 입력값 검증. 성공하면 true(통과 기록 저장), 실패 시 에러 문구 문자열 반환
export function tryUnlock(input) {
  if (!ACCESS_CODE) return '접근 코드가 설정되지 않았습니다. (.env 의 VITE_FILES_ACCESS_CODE)'
  if (input.trim() !== ACCESS_CODE) return '접근 코드가 올바르지 않습니다.'
  try {
    localStorage.setItem(ACCESS_STORAGE_KEY, ACCESS_CODE)
  } catch {
    /* 저장 실패해도 이번 방문은 통과 */
  }
  return true
}
