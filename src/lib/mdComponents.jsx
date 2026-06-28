import { useRef, useState } from 'react'
import { Copy, Check } from 'lucide-react'

// react-markdown 공용 커스텀 렌더러

// 루트 절대경로(/blog-images/...) 이미지를 사이트 base 경로에 맞게 보정.
export function MdImage({ src, alt }) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const resolved = typeof src === 'string' && src.startsWith('/') ? base + src : src
  return <img src={resolved} alt={alt ?? ''} loading="lazy" />
}

// 코드 블록: 복사 버튼이 달린 pre 래퍼
export function CodePre(props) {
  const ref = useRef(null)
  const [copied, setCopied] = useState(false)

  function copy() {
    const text = ref.current?.innerText ?? ''
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={copy}
        aria-label="코드 복사"
        className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-gray-200 opacity-0 transition-opacity hover:bg-white/20 group-hover:opacity-100"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? '복사됨' : '복사'}
      </button>
      <pre ref={ref} {...props} />
    </div>
  )
}
