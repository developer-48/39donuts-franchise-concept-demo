import type { CSSProperties } from 'react'
import { revenue } from '../data/siteContent'
import type { SectionProps } from './types'

export function RevenueSection({ variant }: Pick<SectionProps, 'variant'>) {
  const maximum = Math.max(...revenue.map((point) => point.numeric))

  return (
    <section className="section revenue-section reveal" id="revenue" aria-labelledby="revenue-title">
      <div className="section-shell revenue-shell">
        <div className={`section-heading split-heading${variant === 'e' ? '' : ' section-heading-solo'}`}>
          <div>
            <span className="eyebrow">Динамика сети</span>
            <h2 id="revenue-title">Выручка по годам</h2>
          </div>
          {variant === 'e' && <p>Все три значения показаны одновременно — без карусели, скрытых подписей и итоговой цифры вместо динамики.</p>}
        </div>
        <div className="revenue-chart" role="img" aria-label="Выручка сети: 8,5 млн рублей в 2023, 96 млн в 2024 и 202,715 млн в 2025 году">
          {revenue.map((point, index) => (
            <article className="revenue-point" key={point.year}>
              <div className="revenue-meta">
                <span>{point.year}</span>
                <strong>{point.value}</strong>
              </div>
              <div className="revenue-track" aria-hidden="true">
                <span style={{ '--bar-size': `${Math.max(9, (point.numeric / maximum) * 100)}%` } as CSSProperties} />
              </div>
              <small>
                {index === 0
                  ? 'точка отсчёта'
                  : `≈ ${(point.numeric / revenue[index - 1].numeric).toFixed(1).replace('.', ',')}× к предыдущему году`}
              </small>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
