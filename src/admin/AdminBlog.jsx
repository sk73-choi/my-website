import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, LoaderCircle } from 'lucide-react'
import { useAuth } from './AuthContext'
import { AdminShell, StatusBanner } from './AdminShell'
import { getSortedPosts } from '../data/posts'
import { ghGetFile, ghDeleteFile } from '../lib/github'
import { formatDate } from '../lib/format'

function AdminBlog() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState(getSortedPosts())
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState(null)
  const [deleting, setDeleting] = useState(null)

  async function onDelete(slug, title) {
    if (!window.confirm(`'${title}' 글을 삭제할까요? 되돌릴 수 없습니다.`)) return
    setDeleting(slug)
    setStatus('saving')
    setMessage(null)
    try {
      const path = `src/posts/${slug}.md`
      const file = await ghGetFile(token, path)
      if (!file) throw new Error('파일을 찾을 수 없습니다.')
      await ghDeleteFile(token, path, `삭제: ${title}`, file.sha)
      setPosts((prev) => prev.filter((p) => p.slug !== slug))
      setStatus('success')
      setMessage(`'${title}' 글을 삭제했습니다.`)
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AdminShell
      title="블로그 관리"
      actions={
        <button
          type="button"
          onClick={() => navigate('/admin/blog/new')}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:scale-[1.03]"
        >
          <Plus size={15} /> 새 글
        </button>
      }
    >
      <StatusBanner status={status} message={message} />

      {posts.length === 0 ? (
        <p className="glass rounded-2xl py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          아직 글이 없습니다. "새 글"로 작성하세요.
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="glass flex items-center justify-between gap-4 rounded-2xl p-4"
            >
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-gray-900 dark:text-white">
                  {post.title}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(post.date)} · {post.slug}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/blog/edit/${post.slug}`)}
                  className="inline-flex items-center gap-1 rounded-full glass px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200"
                >
                  <Pencil size={14} /> 수정
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(post.slug, post.title)}
                  disabled={deleting === post.slug}
                  className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-500/20 disabled:opacity-50 dark:text-red-400"
                >
                  {deleting === post.slug ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-gray-400">
        목록은 마지막 배포 기준입니다. 새 글/삭제는 배포 후 목록에 반영됩니다.
      </p>
    </AdminShell>
  )
}

export default AdminBlog
