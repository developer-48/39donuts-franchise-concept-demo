import { contact } from '../data/siteContent'
import { BrandText } from '../components/BrandText'
import { ContactConversation } from '../components/ContactConversation'
import { ArrowIcon, ArrowUpRightIcon, SolidArrowRightIcon } from '../components/Icons'
import type { SectionProps } from './types'

export function ContactSection({ variant }: Pick<SectionProps, 'variant'>) {
  return (
    <section className="section contact-section reveal" id="contacts" aria-labelledby="contacts-title">
      <div className="section-shell contact-shell">
        <div className="contact-copy">
          <span className="eyebrow">Контакты</span>
          <h2 id="contacts-title">Остались вопросы? Команда на связи</h2>
          {variant === 'e' && <p>Контакты приведены для полноты концепта. Демо-форма выше не использует эти каналы и ничего не отправляет.</p>}
          <div className="contact-links">
            <a href={`mailto:${contact.email}`}>
              <span className="contact-link-mark" aria-hidden="true">@</span>
              <span className="contact-link-copy">
                <small>Написать на почту</small>
                <strong>{contact.email}</strong>
              </span>
              {variant === 'g' ? <SolidArrowRightIcon /> : <ArrowIcon />}
            </a>
            <a href={`tel:${contact.phoneHref}`}>
              <span className="contact-link-mark" aria-hidden="true">☎</span>
              <span className="contact-link-copy">
                <small>Позвонить команде</small>
                <strong>{contact.phone}</strong>
              </span>
              {variant === 'g' ? <SolidArrowRightIcon /> : <ArrowIcon />}
            </a>
          </div>
          <div className="messenger-links">
            <a href={contact.instagram} target="_blank" rel="noreferrer">
              Instagram {variant === 'g' ? <ArrowUpRightIcon /> : <ArrowIcon />}
            </a>
            <a href={contact.telegram} target="_blank" rel="noreferrer">
              Telegram {variant === 'g' ? <ArrowUpRightIcon /> : <ArrowIcon />}
            </a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp {variant === 'g' ? <ArrowUpRightIcon /> : <ArrowIcon />}
            </a>
          </div>
        </div>
        {variant === 'e' ? <div className="contact-device" aria-label="Иллюстрация переписки с командой 39 donuts">
          <div className="contact-device-bar" aria-hidden="true">
            <span>9:39</span>
            <span>● ●●</span>
          </div>
          <div className="contact-device-chat" aria-hidden="true">
            <span className="contact-device-status"><BrandText>39 donuts</BrandText> · на связи</span>
            <p>Здравствуйте! Подскажем по форматам и следующему шагу.</p>
            <p>Можно начать с моего города?</p>
            <strong>Да, давайте обсудим локацию ↗</strong>
          </div>
          <div className="contact-device-input" aria-hidden="true">
            <span>Сообщение</span>
            <strong>↑</strong>
          </div>
        </div> : <ContactConversation />}
      </div>
    </section>
  )
}
