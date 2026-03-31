import Link from 'next/link'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <Header />

      <main className="page-content">
        <div className="container">
          <div className="not-found">
            <div className="not-found__code">404</div>
            <h1 className="not-found__title">Página não encontrada</h1>
            <p className="not-found__text">
              A página que você procura não existe ou foi movida.
              <br />
              Tente navegar pela Central de Ajuda ou entre em contato com o
              suporte.
            </p>
            <div className="not-found__actions">
              <Link href="/" className="btn-primary">
                Ir para Central de Ajuda
              </Link>
              <a
                href="https://wa.me/5511940000000"
                className="btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar com suporte
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
