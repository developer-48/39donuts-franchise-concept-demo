import { contact } from '../data/siteContent'
import { ContactConversation } from '../components/ContactConversation'
import { ArrowUpRightIcon, SolidArrowRightIcon } from '../components/Icons'

export function ContactSection() {
  return (
    <section className="section contact-section reveal" id="contacts" aria-labelledby="contacts-title">
      <div className="section-shell contact-shell">
        <div className="contact-copy">
          <span className="eyebrow">Контакты</span>
          <h2 id="contacts-title">Остались вопросы? Команда на связи</h2>
          <div className="contact-links">
            <a href={`mailto:${contact.email}`}>
              <span className="contact-link-mark" aria-hidden="true">@</span>
              <span className="contact-link-copy">
                <small>Написать на почту</small>
                <strong>{contact.email}</strong>
              </span>
              <SolidArrowRightIcon />
            </a>
            <a href={`tel:${contact.phoneHref}`}>
              <span className="contact-link-mark" aria-hidden="true">☎</span>
              <span className="contact-link-copy">
                <small>Позвонить команде</small>
                <strong>{contact.phone}</strong>
              </span>
              <SolidArrowRightIcon />
            </a>
          </div>
          <div className="messenger-links">
            <a href={contact.instagram} target="_blank" rel="noreferrer">
              Instagram <ArrowUpRightIcon />
            </a>
            <a href={contact.telegram} target="_blank" rel="noreferrer">
              Telegram <ArrowUpRightIcon />
            </a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp <ArrowUpRightIcon />
            </a>
          </div>
        </div>
        <ContactConversation />
      </div>
    </section>
  )
}
