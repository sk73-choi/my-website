import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Save, Eye, Pencil, LoaderCircle, Image as ImageIcon } from 'lucide-react'
import { useAuth } from './AuthContext'
import { AdminShell, StatusBanner } from './AdminShell'
import { ghGetFile, ghPutFile, ghPutFileBase64, ghGetSha } from '../lib/github'
import { parseFrontmatter, buildMarkdown } from '../lib/frontmatter'
import { fileToBase64, safeFileName } from '../lib/upload'
import { MdImage, CodePre } from '../lib/mdComponents'

// 제목 → slug (영문/숫자/하이픈). 한글 등은 제거되므로 직접 수정 가능.
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function BlogEditor() {
  const { slug: routeSlug } = useParams()
  const isNew = !routeSlug
  const { token } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(!isNew)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState(null)
  const [tab, setTab] = useState('write') // write | preview
  const [sha, setSha] = useState(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [date, setDate] = useState(todayStr())
  const [tags, setTags] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const bodyRef = useRef(null)

  // 기존 글 수정: GitHub 에서 최신 내용 + sha 로드
  useEffect(() => {
    if (isNew) return
    let alive = true
    ;(async () => {
      try {
        const file = await ghGetFile(token, `src/posts/${routeSlug}.md`)
        if (!file) throw new Error('글을 찾을 수 없습니다.')
        if (!alive) return
        const { data, content } = parseFrontmatter(file.content)
        setSha(file.sha)
        setSlug(routeSlug)
        setTitle(data.title ?? '')
        setDate(data.date ?? todayStr())
        setTags(Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags ?? ''))
        setExcerpt(data.excerpt ?? '')
        setBody(content.replace(/^\s+/, ''))
      } catch (e) {
        setStatus('error')
        setMessage(e.message)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [isNew, routeSlug, token])

  // 새 글: 제목 입력 시 slug 자동 제안
  function onTitleChange(v) {
    setTitle(v)
    if (isNew) setSlug(slugify(v))
  }

  // 본문 textarea 커서 위치에 텍스트 삽입
  function insertAtCursor(snippet) {
    const ta = bodyRef.current
    const start = ta ? ta.selectionStart : body.length
    const end = ta ? ta.selectionEnd : body.length
    const next = body.slice(0, start) + snippet + body.slice(end)
    setBody(next)
    setTimeout(() => {
      if (ta) {
        ta.focus()
        const pos = start + snippet.length
        ta.setSelectionRange(pos, pos)
      }
    }, 0)
  }

  // 이미지 업로드: public/blog-images/ 에 커밋 후 본문에 마크다운 삽입
  async function uploadImage(file) {
    setStatus('saving')
    setMessage(null)
    setTab('write')
    try {
      const filename = safeFileName(file.name)
      const repoPath = `public/blog-images/${filename}`
      const base64 = await fileToBase64(file)
      const existingSha = await ghGetSha(token, repoPath)
      await ghPutFileBase64(token, repoPath, base64, `블로그 이미지: ${filename}`, existingSha)
      const altText = filename.replace(/\.[^.]+$/, '')
      insertAtCursor(`\n![${altText}](/blog-images/${filename})\n`)
      setStatus('success')
      setMessage(`이미지 '${filename}' 업로드 후 본문에 삽입했습니다.`)
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  async function onSave() {
    const finalSlug = slug.trim()
    if (!title.trim()) return fail('제목을 입력하세요.')
    if (!finalSlug) return fail('slug(파일명)을 입력하세요.')

    setStatus('saving')
    setMessage(null)
    try {
      const path = `src/posts/${finalSlug}.md`

      // 새 글인데 같은 slug 가 이미 있으면 막기
      if (isNew) {
        const existing = await ghGetFile(token, path)
        if (existing) throw new Error(`이미 '${finalSlug}' slug 의 글이 있습니다.`)
      }

      const frontmatter = {
        title: title.trim(),
        date: date.trim(),
        excerpt: excerpt.trim(),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }
      const md = buildMarkdown(frontmatter, body)
      const msg = `${isNew ? '새 글' : '수정'}: ${title.trim()}`
      await ghPutFile(token, path, md, msg, isNew ? undefined : sha)

      setStatus('success')
      setMessage(`'${title.trim()}' 저장 완료.`)
      setTimeout(() => navigate('/admin/blog'), 1200)
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  function fail(m) {
    setStatus('error')
    setMessage(m)
  }

  if (loading) {
    return (
      <AdminShell title="글 불러오는 중" backTo="/admin/blog">
        <div className="flex justify-center py-16">
          <LoaderCircle className="animate-spin text-indigo-500" />
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      title={isNew ? '새 글 작성' : '글 수정'}
      backTo="/admin/blog"
      actions={
        <button
          type="button"
          onClick={onSave}
          disabled={status === 'saving'}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:scale-[1.03] disabled:opacity-60"
        >
          {status === 'saving' ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          저장
        </button>
      }
    >
      <StatusBanner status={status} message={message} />

      {/* 메타데이터 */}
      <div className="glass mb-4 grid gap-3 rounded-2xl p-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">제목</span>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-white/5 dark:text-white"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
            slug (파일명, 영문)
          </span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={!isNew}
            className="w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2 outline-none focus:border-indigo-500 disabled:opacity-60 dark:border-gray-700 dark:bg-white/5 dark:text-white"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
            날짜 (YYYY-MM-DD)
          </span>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-white/5 dark:text-white"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
            태그 (쉼표로 구분)
          </span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="React, 회고"
            className="w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-white/5 dark:text-white"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">요약</span>
          <input
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-white/5 dark:text-white"
          />
        </label>
      </div>

      {/* 본문: 작성/미리보기 탭 */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex gap-1">
          <button
            type="button"
            onClick={() => setTab('write')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
              tab === 'write'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            <Pencil size={14} /> 작성
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
              tab === 'preview'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
            }`}
          >
            <Eye size={14} /> 미리보기
          </button>

          {/* 이미지 업로드(커서 위치에 삽입) */}
          <ImageUploadButton onPick={uploadImage} className="ml-auto" />
        </div>

        {tab === 'write' ? (
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="# 제목&#10;&#10;마크다운으로 본문을 작성하세요…&#10;이미지는 위 '이미지' 버튼으로 넣을 수 있어요."
            spellCheck={false}
            className="h-[60vh] w-full resize-y rounded-lg border border-gray-300 bg-white/70 p-3 font-mono text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-white/5 dark:text-white"
          />
        ) : (
          <div className="prose-custom min-h-[60vh] rounded-lg bg-white/40 p-4 dark:bg-white/5">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{ img: MdImage, pre: CodePre }}
            >
              {body || '_(미리볼 내용이 없습니다)_'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </AdminShell>
  )
}

// 이미지 선택 버튼 (숨김 input, accept=image/*)
function ImageUploadButton({ onPick, className = '' }) {
  const ref = useRef(null)
  return (
    <span className={className}>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onPick(f)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        <ImageIcon size={14} /> 이미지
      </button>
    </span>
  )
}

export default BlogEditor
