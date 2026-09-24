import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { formats } from '../../data/siteContent'
import { BrandText } from '../../components/BrandText'

export function FormatsSection() {
  const [activeFormat, setActiveFormat] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const format = formats[activeFormat]

  const moveTab = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % formats.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + formats.length) % formats.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = formats.length - 1
    else return

    event.preventDefault()
    setActiveFormat(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className="section formats-section reveal" id="formats" aria-labelledby="formats-title">
      <div className="section-shell">
        <div className="section-heading split-heading section-heading-solo">
          <div>
            <span className="eyebrow">Выберите модель</span>
            <h2 id="formats-title">Три формата кофейни</h2>
          </div>
        </div>

        <div
          className="format-tabs"
          role="tablist"
          aria-label="Форматы кофеен"
          style={{ '--active-format': activeFormat } as CSSProperties}
        >
          <span className="format-moving-selection" aria-hidden="true" />
          {formats.map((item, index) => (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              id={`format-tab-${item.id}`}
              type="button"
              role="tab"
              aria-label={`${String(index + 1).padStart(2, '0')}. ${item.name}${item.note ? `, ${item.note}` : ''}`}
              aria-selected={activeFormat === index}
              aria-controls="format-panel"
              tabIndex={activeFormat === index ? 0 : -1}
              className={activeFormat === index ? 'is-active' : ''}
              onClick={() => setActiveFormat(index)}
              onKeyDown={(event) => moveTab(event, index)}
            >
              <span>0{index + 1}</span>
              <span className="format-tab-label">
                <strong>{item.name}</strong>
                {item.note && <small>{item.note}</small>}
              </span>
            </button>
          ))}
        </div>

        <div
          className="format-panel format-panel-details"
          id="format-panel"
          role="tabpanel"
          aria-labelledby={`format-tab-${format.id}`}
          tabIndex={0}
        >
          <div className="format-visual">
            {formats.map((item, index) => (
              <img
                className={activeFormat === index ? 'is-active' : undefined}
                src={item.image}
                alt={activeFormat === index ? `${item.name}${item.note ? `, ${item.note}` : ''}` : ''}
                aria-hidden={activeFormat !== index}
                key={item.id}
              />
            ))}
            {format.id === 'island' && <span className="asset-note">Визуализация формата с текущего сайта</span>}
          </div>
          <div className="format-copy" key={`copy-${format.id}`}>
            <div className={`format-title-row format-title-row-${format.id}`}>
              <div>
                <span>Выбранный формат</span>
                <h3>
                  <BrandText>{format.name}</BrandText>
                </h3>
              </div>
              {format.note && <p>{format.note}</p>}
            </div>
            <dl className="format-facts format-facts-grid">
              {format.facts.map((fact, index) => (
                <div className={`format-fact format-fact-${index + 1}`} key={fact.label}>
                  <span className="format-fact-index" aria-hidden="true">0{index + 1}</span>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
