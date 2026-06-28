// 화면 전체에 떠다니는 그라데이션 블롭 (장식용, 클릭 불가)
function Background() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="animate-blob absolute -top-32 -left-24 h-96 w-96 rounded-full bg-fuchsia-400/30 blur-3xl dark:bg-fuchsia-600/25" />
      <div
        className="animate-blob absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-400/30 blur-3xl dark:bg-sky-600/20"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="animate-blob absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-600/25"
        style={{ animationDelay: '-12s' }}
      />
    </div>
  )
}

export default Background
