import { reviews } from '../data/siteContent'
import { BrandText } from '../components/BrandText'

export function ReviewsSection() {
  return (
    <section className="section reviews-section reveal" id="reviews" aria-labelledby="reviews-title">
      <div className="section-shell">
        <div className="section-heading split-heading section-heading-solo">
          <div>
            <span className="eyebrow">Голоса партнёров</span>
            <h2 id="reviews-title">Отзывы из сети</h2>
          </div>
        </div>
        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <article className="review-card motion-item" key={review.name}>
              <div className="review-photo">
                <img src={review.image} alt={`${review.name}, партнёр из города ${review.city}`} />
                <span>0{index + 1}</span>
              </div>
              <blockquote>
                <p>
                  <BrandText>{review.text}</BrandText>
                </p>
                <footer>
                  <strong>{review.name}</strong>
                  <span>{review.city}</span>
                </footer>
              </blockquote>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
