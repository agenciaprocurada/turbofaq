'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SearchBar from '@/components/public/SearchBar'

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header__inner">
          <Link href="/" className="site-header__logo">
            Turbo<span>Cloud</span> Ajuda
          </Link>

          {!isHome && (
            <div className="site-header__center">
              <div className="site-header__search">
                <SearchBar />
              </div>
            </div>
          )}

          <a
            href="https://turbocloud.com.br"
            className="site-header__back"
            target="_blank"
            rel="noopener noreferrer"
          >
            ← Voltar ao site
          </a>
        </div>
      </div>
    </header>
  )
}
