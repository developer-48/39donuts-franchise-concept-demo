import { heroMetrics, assets } from '../data/siteContent'
import { BrandText } from '../components/BrandText'
import { ArrowIcon, PackIcon, SolidArrowRightIcon } from '../components/Icons'
import type { SectionProps } from './types'

export function HeroSection({ variant, onOpenApplication }: SectionProps) {
  return (
    <section className="hero-section" id="top" aria-labelledby="hero-title">
      {variant === 'e' && (
        <div className="concept-notice">
          <span aria-hidden="true" /> Независимый концепт редизайна — не официальный сайт
        </div>
      )}
      <div className="hero-canvas section-shell">
        <div className="hero-copy">
          <span className="eyebrow">Франшиза кофеен с пончиками</span>
          <h1 id="hero-title">
            Маленькая точка.<br />Большая амбиция.
          </h1>
          <p className="hero-lede">
            <BrandText>
              39 donuts выросли из первой кофейни площадью 39 м² — и продолжают двигаться от локальной идеи к мировой сети.
            </BrandText>
          </p>
          <div className="hero-origin-inline">
            <span>Первая идея</span>
            <strong><BrandText>39 м²</BrandText></strong>
            <small>старт сети · 2023</small>
          </div>
          <div className="hero-actions">
            <button className="button" type="button" onClick={onOpenApplication}>
              Купить франшизу
              <PackIcon className="button-pack-icon" name="shop" />
            </button>
            <a className="text-link" href="#revenue">
              Смотреть показатели
              {variant === 'g' ? <SolidArrowRightIcon /> : <ArrowIcon />}
            </a>
          </div>
        </div>

        <div className="hero-media">
          <img className="hero-photo" src={assets.hero} alt="" />
          <img className="hero-donut" src={assets.donut} alt="" />
          <div className="hero-origin-proof">
            <span>Первая идея</span>
            <strong><BrandText>39 м²</BrandText></strong>
            <small>старт сети · 2023</small>
          </div>
        </div>

        <div className="hero-metrics" aria-label="Ключевые показатели франшизы">
          {heroMetrics.map((metric, index) => (
            <article key={metric.value}>
              <span>0{index + 1}</span>
              <strong>{metric.value}</strong>
              <p>{metric.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
