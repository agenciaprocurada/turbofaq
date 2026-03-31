export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__inner">
          <span>© {year} TurboCloud. Todos os direitos reservados.</span>
          <div className="site-footer__links">
            <a
              href="https://turbocloud.com.br"
              className="site-footer__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              turbocloud.com.br
            </a>
            <a
              href="https://wa.me/5511940000000"
              className="site-footer__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Suporte via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
