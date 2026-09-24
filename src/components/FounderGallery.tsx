import { assets } from '../data/siteContent'

const instagramUrl = 'https://www.instagram.com/tokkaev/'

const photos = [
  {
    src: assets.ibrahim,
    alt: 'Ибрагим Токкаев — основатель сети',
    label: 'Открыть фотографию Ибрагима Токкаева в Instagram',
  },
  {
    src: assets.founderDetail,
    alt: 'Ибрагим Токкаев на встрече',
    label: 'Открыть вторую фотографию Ибрагима Токкаева в Instagram',
  },
  {
    src: assets.founderDetailTwo,
    alt: 'Рабочая встреча команды 39 donuts',
    label: 'Открыть фотографию из истории 39 donuts в Instagram',
  },
]

export function FounderGallery() {
  return (
    <figure className="founder-gallery-next founder-gallery-next-f">
      <div className="founder-gallery-next-photos" aria-label="Три фотографии из истории бренда">
        {photos.map((photo, index) => (
          <a
            className="founder-story-link"
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={photo.label}
            key={photo.src}
          >
            <img src={photo.src} alt={photo.alt} />
            <span aria-hidden="true">0{index + 1}</span>
          </a>
        ))}
      </div>
      <figcaption>
        <div>
          <strong>Ибрагим Токкаев</strong>
          <small>основатель, первая кофейня — 2023</small>
        </div>
        <a href={instagramUrl} target="_blank" rel="noreferrer">
          @tokkaev <span aria-hidden="true">↗</span>
        </a>
      </figcaption>
    </figure>
  )
}
