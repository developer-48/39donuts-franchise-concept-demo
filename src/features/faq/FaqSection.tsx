import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { faqGroups } from '../../data/siteContent'
import { BrandText } from '../../components/BrandText'
import { PlusIcon } from '../../components/Icons'
import type { Variant } from '../../types/Variant'

export function FaqSection({ variant }: { variant: Variant }) {
  const [activeGroup, setActiveGroup] = useState(0)
  const [openItem, setOpenItem] = useState<string | null>('finance-0')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const group = faqGroups[activeGroup]

  useEffect(() => {
    setOpenItem(`${faqGroups[activeGroup].id}-0`)
  }, [activeGroup])

  const moveTab = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % faqGroups.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + faqGroups.length) % faqGroups.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = faqGroups.length - 1
    else return

    event.preventDefault()
    setActiveGroup(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className={`section faq-section faq-section-${variant} reveal`} id="faq" aria-labelledby="faq-title">
      <div className="section-shell faq-layout">
        <div className="faq-intro">
          <span className="eyebrow">Коротко и по делу</span>
          <h2 id="faq-title">Всё, что важно узнать до старта</h2>
          {variant === 'e' && <p>Ответы и условия перенесены с текущего публичного сайта. Финальные условия фиксируются договором.</p>}
          <div className="faq-category-tabs" role="tablist" aria-label="Категории вопросов">
            {faqGroups.map((item, index) => (
              <button
                key={item.id}
                ref={(node) => {
                  tabRefs.current[index] = node
                }}
                id={`faq-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={index === activeGroup}
                aria-controls="faq-panel"
                tabIndex={index === activeGroup ? 0 : -1}
                className={index === activeGroup ? 'is-active' : ''}
                onClick={() => setActiveGroup(index)}
                onKeyDown={(event) => moveTab(event, index)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="faq-list"
          id="faq-panel"
          role="tabpanel"
          aria-labelledby={`faq-tab-${group.id}`}
        >
          {group.items.map((item, index) => {
            const itemId = `${group.id}-${index}`
            const expanded = openItem === itemId
            return (
              <article className={`faq-item ${expanded ? 'is-open' : ''}`} key={item.question}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`faq-answer-${itemId}`}
                    id={`faq-question-${itemId}`}
                    onClick={() => setOpenItem(expanded ? null : itemId)}
                  >
                    <span>{item.question}</span>
                    <span className="faq-plus">
                      <PlusIcon />
                    </span>
                  </button>
                </h3>
                <div
                  className="faq-answer-grid"
                  id={`faq-answer-${itemId}`}
                  role="region"
                  aria-labelledby={`faq-question-${itemId}`}
                  aria-hidden={!expanded}
                >
                  <div>
                    <p>
                      <BrandText>{item.answer}</BrandText>
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
