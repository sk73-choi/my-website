// YYYY-MM-DD 문자열을 'YYYY년 M월 D일' 형식으로 변환
export function formatDate(dateStr) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}
