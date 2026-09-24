import { assets, contact } from '../data/siteContent'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-shell footer-top">
        <a href={import.meta.env.BASE_URL} aria-label="К началу страницы">
          <img src={assets.logo} alt="39 donuts" width="129" height="24" />
        </a>
        <a className="footer-top-link" href="#top">
          Наверх <span>↑</span>
        </a>
      </div>
      <div className="section-shell footer-legal">
        <div>
          <strong>{contact.legalName}</strong>
          <span>ИНН {contact.inn}</span>
          <span>ОГРНИП {contact.ogrnip}</span>
        </div>
        <div>
          <span>{contact.address}</span>
          <span>Режим работы: {contact.hours}</span>
        </div>
        <a href={contact.privacy} target="_blank" rel="noreferrer">
          Политика обработки персональных данных
        </a>
      </div>
    </footer>
  )
}
