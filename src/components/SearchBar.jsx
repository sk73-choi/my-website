import { Search, X } from 'lucide-react'

// 공용 검색 입력 (제어 컴포넌트). value/onChange 로 상위에서 상태 관리.
function SearchBar({ value, onChange, placeholder = '검색…' }) {
  return (
    <div className="relative mb-4">
      <Search
        size={16}
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass w-full rounded-full py-2.5 pr-9 pl-10 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-400/40 dark:text-gray-100"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="검색어 지우기"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-200/60 hover:text-gray-700 dark:hover:bg-white/10"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

export default SearchBar
