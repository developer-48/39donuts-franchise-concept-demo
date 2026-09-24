import { BrandText } from './BrandText'

export function ContactConversation() {
  return (
    <figure className="contact-phone-next" aria-label="Пример переписки с командой 39 donuts внутри смартфона">
      <span className="contact-phone-side-button contact-phone-side-button-top" aria-hidden="true" />
      <span className="contact-phone-side-button contact-phone-side-button-bottom" aria-hidden="true" />
      <div className="contact-phone-screen">
        <div className="contact-phone-island" aria-hidden="true" />
        <div className="contact-phone-status" aria-hidden="true">
          <span>9:39</span>
          <span>● ᯤ ▰</span>
        </div>

        <div className="contact-conversation-heading">
          <span className="contact-conversation-avatar" aria-hidden="true">39</span>
          <div>
            <strong><BrandText>39 donuts</BrandText></strong>
            <small>обычно отвечает быстро</small>
          </div>
          <span className="contact-conversation-online" aria-label="Команда в сети" />
        </div>

        <div className="contact-conversation-messages">
          <div className="chat-message chat-message-brand">
            <span><BrandText>39 donuts</BrandText></span>
            <p>Здравствуйте! Подскажем по форматам и следующему шагу.</p>
          </div>
          <div className="chat-message chat-message-user">
            <p>Можно начать с моего города?</p>
          </div>
          <div className="chat-message chat-message-brand">
            <span><BrandText>39 donuts</BrandText></span>
            <p>Да, давайте обсудим локацию.</p>
          </div>
        </div>

        <div className="contact-phone-input" aria-hidden="true">
          <span>Сообщение</span>
          <strong>↑</strong>
        </div>
      </div>
    </figure>
  )
}
