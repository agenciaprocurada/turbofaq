import Link from 'next/link'
import SearchBar from '@/components/public/SearchBar'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header__inner">
          <Link href="/" className="site-header__logo">
            Turbo<span>Cloud</span> Ajuda
          </Link>

          <div className="site-header__search">
            <SearchBar />
          </div>

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
