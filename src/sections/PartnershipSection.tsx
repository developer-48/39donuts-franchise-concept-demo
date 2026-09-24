import { assets, steps } from '../data/siteContent'
import { SolidArrowRightIcon } from '../components/Icons'
import type { SectionProps } from './types'

export function PartnershipSection({ onOpenApplication }: SectionProps) {
  return (
    <section className="section partnership-section reveal" id="application" aria-labelledby="partnership-title">
      <div className="section-shell">
        <div className="partnership-topline">
          <span className="eyebrow">Путь к открытию</span>
          <h2 id="partnership-title">5 шагов к партнёрству</h2>
        </div>
        <ol className="steps-list motion-trigger">
          {steps.map((step, index) => (
            <li className="motion-item" key={step}>
              <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
        <div className="application-callout">
          <div className="application-copy">
            <h3>Анкета — первый шаг к знакомству</h3>
            <button className="button" type="button" onClick={onOpenApplication}>
              Заполнить анкету
              <SolidArrowRightIcon />
            </button>
          </div>
          <img src={assets.application} alt="Иллюстративная композиция: телефон, стакан и пончик 39 donuts" />
        </div>
      </div>
    </section>
  )
}
