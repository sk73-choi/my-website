import { Mail } from 'lucide-react'
import { GithubIcon } from './icons'

const iconLink =
  'flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-all hover:scale-110 hover:bg-white/60 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-indigo-300'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mx-auto mb-4 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="glass flex flex-col items-center justify-between gap-4 rounded-2xl px-6 py-5 sm:flex-row">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {year} <span className="font-semibold text-gradient">SK Choi</span>. All rights
          reserved.
        </p>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer noopener"
            className={iconLink}
            aria-label="GitHub"
          >
            <GithubIcon size={18} />
          </a>
          <a href="mailto:choisk73@gmail.com" className={iconLink} aria-label="이메일">
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
