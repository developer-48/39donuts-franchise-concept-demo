import { advantages, assets, network } from '../data/siteContent'
import { BrandText } from '../components/BrandText'
import type { SectionProps } from './types'

export function NetworkSection({ variant }: Pick<SectionProps, 'variant'>) {
  return (
    <section className="section network-section reveal" id="network" aria-labelledby="network-title">
      <div className="section-shell">
        <div className="network-intro">
          <div>
            <span className="eyebrow">География роста</span>
            <h2 id="network-title">Сколько нас</h2>
          </div>
          <p>
            <BrandText>За два года 39 donuts открыли больше 19 точек и продолжают расти. Текущий сайт отдельно показывает такую разбивку сети:</BrandText>
          </p>
        </div>

        <div className="network-proof">
          <div className="country-list">
            {network.map((item) => (
              <article className={variant === 'g' ? 'motion-trigger' : undefined} key={item.country}>
                <strong><span className={variant === 'g' ? 'network-count-value' : undefined}>{item.count}</span></strong>
                <span>{item.count === '1' ? 'точка' : 'точек'}</span>
                <p>{item.country}</p>
              </article>
            ))}
            {variant === 'e' && <p className="source-disclosure">19+ в первом экране и 20 + 1 в разбивке — две формулировки текущего источника.</p>}
          </div>
          <div className="shop-mosaic">
            <figure className={variant === 'g' ? 'motion-item' : undefined}>
              <img src={assets.shopCounter} alt="Витрина с пончиками в кофейне" />
              <figcaption>Россия · витрина</figcaption>
            </figure>
            <figure className={variant === 'g' ? 'motion-item' : undefined}>
              <img src={assets.shopInterior} alt="Интерьер кофейни с открытой витриной" />
              <figcaption>Россия · интерьер</figcaption>
            </figure>
            <figure className={variant === 'g' ? 'motion-item' : undefined}>
              <img src={assets.shopCase} alt="Кофейня с витриной и фирменной вывеской" />
              <figcaption>Казахстан · формат сети</figcaption>
            </figure>
          </div>
        </div>

        <div className="advantages-showcase">
            <article className="advantages-feature">
              <div className="advantages-feature-copy">
                <span className="eyebrow">Продукт как бизнес</span>
                <h3>Почему пончики?</h3>
                <p>Знакомый эмоциональный продукт превращается в компактную и масштабируемую бизнес-модель.</p>
              </div>
              <img className={variant === 'g' ? 'motion-item' : undefined} src={assets.donut} alt="Фирменный пончик 39 donuts" />
              <span className="advantages-feature-note">Вкус, который легко узнать</span>
            </article>
            <div className="advantages-cards">
              {advantages.map((item) => (
                <article className={variant === 'g' ? 'motion-item' : undefined} key={item.title}>
                  <span className="advantage-number">{item.number}</span>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
      </div>
    </section>
  )
}
