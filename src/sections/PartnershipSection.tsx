import { assets, steps } from '../data/siteContent'
import { ArrowIcon, SolidArrowRightIcon } from '../components/Icons'
import type { SectionProps } from './types'

export function PartnershipSection({ variant, onOpenApplication }: SectionProps) {
  return (
    <section className="section partnership-section reveal" id="application" aria-labelledby="partnership-title">
      <div className="section-shell">
        <div className="partnership-topline">
          <span className="eyebrow">Путь к открытию</span>
          <h2 id="partnership-title">5 шагов к партнёрству</h2>
        </div>
        <ol className={`steps-list${variant === 'g' ? ' motion-trigger' : ''}`}>
          {steps.map((step, index) => (
            <li className={variant === 'g' ? 'motion-item' : undefined} key={step}>
              <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
        <div className="application-callout">
          <div className="application-copy">
            {variant === 'e' && <span className="demo-pill">Демо · без отправки данных</span>}
            <h3>Анкета — первый шаг к знакомству</h3>
            {variant === 'e' && (
              <p>
                Посмотрите, как может работать обновлённый путь заявки. Поля валидируются локально, а введённая информация никуда не передаётся.
              </p>
            )}
            <button className="button" type="button" onClick={onOpenApplication}>
              {variant === 'e' ? 'Заполнить демо-анкету' : 'Заполнить анкету'}
              {variant === 'g' ? <SolidArrowRightIcon /> : <ArrowIcon />}
            </button>
          </div>
          <img src={assets.application} alt="Иллюстративная композиция: телефон, стакан и пончик 39 donuts" />
        </div>
      </div>
    </section>
  )
}
