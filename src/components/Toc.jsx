import { List } from 'lucide-react'

// 목차(TOC). items: [{ level, text, id }]
function Toc({ items }) {
  if (!items || items.length < 2) return null

  return (
    <nav className="glass rounded-2xl p-4 text-sm" aria-label="목차">
      <p className="mb-2 flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
        <List size={15} /> 목차
      </p>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} style={{ paddingLeft: (it.level - 2) * 12 }}>
            <a
              href={`#${it.id}`}
              className="block truncate text-gray-500 transition-colors hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-300"
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Toc
