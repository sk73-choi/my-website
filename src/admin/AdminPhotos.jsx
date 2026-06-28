import { useState, useEffect, useRef, useCallback } from 'react'
import { LoaderCircle, Plus, Trash2, Upload, RefreshCw } from 'lucide-react'
import { useAuth } from './AuthContext'
import { AdminShell, StatusBanner } from './AdminShell'
import { ghListDir, ghPutFileBase64, ghGetSha, ghDeleteFile } from '../lib/github'
import { fileToBase64, safeFileName, categoryFolder } from '../lib/upload'

const ROOT = 'public/photos'
const PREFERRED = ['여행', '정보', 'ZARD', '취미', '개인']
const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i

function AdminPhotos() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)
  const [cats, setCats] = useState([]) // [{ name, photos:[{name,path,sha,url}] }]
  const [newCat, setNewCat] = useState('')
  const [uploadCat, setUploadCat] = useState('')
  const fileRef = useRef(null)

  // GitHub 폴더 구조를 읽어 카테고리/사진 목록 구성
  const load = useCallback(async () => {
    const dirs = await ghListDir(token, ROOT)
    const names = dirs
      .filter((d) => d.type === 'dir' && d.name !== 'thumbs')
      .map((d) => d.name)
    const ordered = [
      ...PREFERRED.filter((c) => names.includes(c)),
      ...names.filter((c) => !PREFERRED.includes(c)).sort(),
    ]
    const result = []
    for (const name of ordered) {
      const items = await ghListDir(token, `${ROOT}/${name}`)
      const photos = items
        .filter((it) => it.type === 'file' && IMG_RE.test(it.name))
        .map((it) => ({ name: it.name, path: it.path, sha: it.sha, url: it.download_url }))
      result.push({ name, photos })
    }
    return { ordered, result }
  }, [token])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { ordered, result } = await load()
        if (!alive) return
        setCats(result)
        setUploadCat(ordered[0] ?? '')
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
  }, [load])

  async function refresh() {
    try {
      const { result } = await load()
      setCats(result)
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  // 카테고리 추가: 빈 폴더(.gitkeep) 커밋
  async function addCategory() {
    const name = categoryFolder(newCat.trim())
    if (!name) return
    if (cats.some((c) => c.name === name)) {
      setStatus('error')
      setMessage('이미 있는 카테고리입니다.')
      return
    }
    setBusy(true)
    setStatus('saving')
    setMessage(null)
    try {
      await ghPutFileBase64(token, `${ROOT}/${name}/.gitkeep`, '', `사진 카테고리 추가: ${name}`)
      setNewCat('')
      await refresh()
      setUploadCat((u) => u || name)
      setStatus('success')
      setMessage(`'${name}' 카테고리를 추가했습니다.`)
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    } finally {
      setBusy(false)
    }
  }

  // 이미지 업로드(원본을 폴더에 커밋). 썸네일은 배포 빌드 때 자동 생성.
  async function onPickFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (files.length === 0) return
    if (!uploadCat) {
      setStatus('error')
      setMessage('업로드할 카테고리를 선택하세요.')
      return
    }
    setBusy(true)
    setStatus('saving')
    setMessage(null)
    try {
      let n = 0
      for (const file of files) {
        const filename = safeFileName(file.name)
        const path = `${ROOT}/${uploadCat}/${filename}`
        const b64 = await fileToBase64(file)
        await ghPutFileBase64(token, path, b64, `사진 업로드: ${uploadCat}/${filename}`, await ghGetSha(token, path))
        n += 1
      }
      await refresh()
      setStatus('success')
      setMessage(`${n}장 업로드 완료. 배포(약 1~2분) 후 사이트에 반영됩니다.`)
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function removePhoto(photo) {
    if (!window.confirm(`'${photo.name}' 사진을 삭제할까요?`)) return
    setBusy(true)
    setStatus('saving')
    setMessage(null)
    try {
      await ghDeleteFile(token, photo.path, `사진 삭제: ${photo.name}`, photo.sha)
      await refresh()
      setStatus('success')
      setMessage(`'${photo.name}' 삭제 완료. 배포 후 반영됩니다.`)
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <AdminShell title="사진 불러오는 중">
        <div className="flex justify-center py-16">
          <LoaderCircle className="animate-spin text-pink-500" />
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      title="사진 편집"
      actions={
        <button
          type="button"
          onClick={refresh}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-2 text-sm text-gray-700 disabled:opacity-60 dark:text-gray-200"
        >
          {busy ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          새로고침
        </button>
      }
    >
      <StatusBanner status={status} message={message} />

      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
        업로드·삭제는 즉시 저장소에 반영되고, 배포(약 1~2분) 후 사이트에 보입니다.
        프로젝트의 <code>public/photos/&#123;카테고리&#125;/</code> 폴더에 직접 이미지를
        넣거나 지운 뒤 push 해도 동일하게 반영됩니다. (썸네일은 빌드 시 자동 생성)
      </p>

      {/* 카테고리 추가 + 업로드 */}
      <section className="glass mb-5 rounded-2xl p-5">
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              업로드 카테고리
            </span>
            <select
              value={uploadCat}
              onChange={(e) => setUploadCat(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white/70 px-2.5 py-2 text-sm outline-none focus:border-pink-500 dark:border-gray-700 dark:bg-white/5 dark:text-white"
            >
              {cats.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              onPickFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy || cats.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-pink-500/30 hover:scale-[1.03] disabled:opacity-60"
          >
            {busy ? <LoaderCircle size={15} className="animate-spin" /> : <Upload size={15} />}
            이미지 업로드(여러 장)
          </button>
        </div>

        <div className="flex gap-2 border-t border-gray-200/60 pt-3 dark:border-white/10">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
            placeholder="새 카테고리 이름"
            className="max-w-xs rounded-lg border border-gray-300 bg-white/70 px-2.5 py-1.5 text-sm outline-none focus:border-pink-500 dark:border-gray-700 dark:bg-white/5 dark:text-white"
          />
          <button
            type="button"
            onClick={addCategory}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg bg-pink-500/15 px-3 py-1.5 text-sm font-medium text-pink-700 hover:bg-pink-500/25 disabled:opacity-60 dark:text-pink-300"
          >
            <Plus size={14} /> 카테고리 추가
          </button>
        </div>
      </section>

      {/* 카테고리별 사진 */}
      {cats.map((cat) => (
        <section key={cat.name} className="mb-6">
          <h2 className="mb-2 font-semibold text-gray-900 dark:text-white">
            {cat.name}{' '}
            <span className="text-xs font-normal text-gray-400">({cat.photos.length})</span>
          </h2>
          {cat.photos.length === 0 ? (
            <p className="glass rounded-2xl py-6 text-center text-xs text-gray-400">
              사진 없음
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {cat.photos.map((photo) => (
                <div key={photo.path} className="glass overflow-hidden rounded-2xl">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-1 p-2">
                    <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {photo.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo)}
                      disabled={busy}
                      className="shrink-0 rounded-full bg-red-500/10 p-1.5 text-red-600 hover:bg-red-500/20 disabled:opacity-60 dark:text-red-400"
                      aria-label="삭제"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </AdminShell>
  )
}

export default AdminPhotos
