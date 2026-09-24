import { assets, story } from '../data/siteContent'
import { BrandText } from '../components/BrandText'
import { FounderGallery } from '../components/FounderGallery'
import type { SectionProps } from './types'

export function StorySection({ variant }: Pick<SectionProps, 'variant'>) {
  return (
    <section className="section story-section reveal" id="story" aria-labelledby="story-title">
      <div className="section-shell">
        <div className="story-origin">
          <div className="story-origin-copy">
            <span className="eyebrow">Глава 01 · Начало</span>
            <h2 id="story-title">
              История, которая началась <span className="nowrap">с <BrandText>39 м²</BrandText></span>
            </h2>
            <p>
              <BrandText>{story.origin}</BrandText>
            </p>
            <div className="origin-equation" aria-label="От 39 квадратных метров к бесконечному росту">
              <strong><BrandText>39 м²</BrandText></strong>
              {variant === 'g' ? (
                <svg className="origin-equation-arrow" viewBox="0 0 68 40" fill="none" aria-hidden="true">
                  <path d="M3 20H61M43 3L61 20L43 37" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : <span>→</span>}
              <strong>∞</strong>
            </div>
          </div>
          {variant === 'e' ? (
            <figure className="founder-gallery">
              <a
                className="founder-gallery-photo founder-gallery-photo-main"
                href="https://www.instagram.com/tokkaev/"
                target="_blank"
                rel="noreferrer"
                aria-label="Открыть фотографию Ибрагима Токкаева в Instagram"
              >
                <img src={assets.ibrahim} alt="Ибрагим Токкаев — основатель сети" />
              </a>
              <a
                className="founder-gallery-photo"
                href="https://www.instagram.com/tokkaev/"
                target="_blank"
                rel="noreferrer"
                aria-label="Открыть вторую фотографию Ибрагима Токкаева в Instagram"
              >
                <img src={assets.founderDetail} alt="Ибрагим Токкаев на встрече" />
              </a>
              <a
                className="founder-gallery-photo"
                href="https://www.instagram.com/tokkaev/"
                target="_blank"
                rel="noreferrer"
                aria-label="Открыть третью фотографию из истории 39 donuts в Instagram"
              >
                <img src={assets.founderDetailTwo} alt="Рабочая встреча команды 39 donuts" />
              </a>
              <figcaption>
                <span>Ибрагим Токкаев</span>
                <small>основатель, первая кофейня — 2023</small>
              </figcaption>
            </figure>
          ) : <FounderGallery />}
        </div>

        <div className="story-grid">
          <article className={`story-card story-mission${variant === 'g' ? ' motion-item' : ''}`}>
            <span className="story-number">02</span>
            <h3>Смысл бренда</h3>
            <p>
              <BrandText>{story.mission}</BrandText>
            </p>
            <div className="story-photo-pair" aria-hidden="true">
              <img src={assets.crowd} alt="" />
              <img src={assets.kioskNight} alt="" />
            </div>
          </article>
          <article className={`story-card story-recipe${variant === 'g' ? ' motion-item' : ''}`}>
            <span className="story-number">03</span>
            <div>
              <h3>Секрет — во вкусе</h3>
              <p>{story.recipe}</p>
            </div>
            <img src={assets.donut} alt="Фирменный пончик с шоколадной глазурью" />
          </article>
          <article className={`story-card story-growth${variant === 'g' ? ' motion-item' : ''}`}>
            <span className="story-number">04</span>
            <img src={assets.founders} alt="Ибрагим Токкаев и Джамбулат Исмаилов" />
            <div>
              <h3>Усиление команды</h3>
              <p>
                <BrandText>{story.partnership}</BrandText>
              </p>
            </div>
          </article>
          <article className={`story-card story-counter${variant === 'g' ? ' motion-item' : ''}`}>
            <span className="story-number">05</span>
            {variant === 'e' ? (
              <>
                <strong>{story.donutsSold}</strong>
                <p>{story.donutsSoldLabel}</p>
              </>
            ) : (
              <>
                <div className="story-counter-copy">
                  <strong>{story.donutsSold}</strong>
                  <p>{story.donutsSoldLabel}</p>
                </div>
                <img className="story-counter-ribbon" src={assets.donutRibbon} alt="" />
              </>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
