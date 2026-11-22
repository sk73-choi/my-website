import { useRef, useState } from 'react'
import { Copy, Check } from 'lucide-react'

// react-markdown 공용 커스텀 렌더러

// 루트 절대경로(/blog-images/...) 이미지를 사이트 base 경로에 맞게 보정.
export function MdImage({ src, alt }) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const resolved = typeof src === 'string' && src.startsWith('/') ? base + src : src
  return <img src={resolved} alt={alt ?? ''} loading="lazy" />
}

// React children 에서 순수 텍스트만 추출
function textOf(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  return textOf(node.props?.children)
}

// 프롬프트 템플릿(```text) 블록: 가독성 높은 카드 + [UI 용어] 강조 + 항상 보이는 복사 버튼
function PromptBlock({ text }) {
  const [copied, setCopied] = useState(false)
  const body = text.replace(/\n+$/, '')

  function copy() {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(body).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  // [용어] 부분만 굵게 강조 (대괄호는 그대로 유지 → 복사 시 원문과 동일)
  const parts = body.split(/(\[[^\]\n]+\])/g)

  return (
    <div className="prompt-block">
      <div className="prompt-block__head">
        <span>💬 프롬프트</span>
        <button type="button" onClick={copy} aria-label="프롬프트 복사" className="prompt-block__copy">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
      <div className="prompt-block__body">
        {parts.map((part, i) =>
          /^\[[^\]]+\]$/.test(part) ? (
            <strong key={i} className="prompt-block__term">
              {part}
            </strong>
          ) : (
            part
          ),
        )}
      </div>
    </div>
  )
}

// 코드 블록: 복사 버튼이 달린 pre 래퍼
export function CodePre(props) {
  const child = Array.isArray(props.children) ? props.children[0] : props.children
  const cls = child?.props?.className ?? ''
  if (/\blanguage-text\b/.test(cls)) {
    return <PromptBlock text={textOf(child.props.children)} />
  }
  return <CodeBlock {...props} />
}

function CodeBlock({ node: _node, ...props }) {
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
