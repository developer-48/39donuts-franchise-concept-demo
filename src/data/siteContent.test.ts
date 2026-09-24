import { describe, expect, it } from 'vitest'
import { faqGroups, formats, heroMetrics, network, revenue, story } from './siteContent'

describe('shared content contract', () => {
  it('keeps both public network statements without silently reconciling them', () => {
    expect(heroMetrics[0]).toEqual({ value: '19+', label: 'кофеен за 2 года' })
    expect(network).toEqual([
      { country: 'Россия', count: '20' },
      { country: 'Казахстан', count: '1' },
    ])
  })

  it('keeps every required revenue year and hero metric', () => {
    expect(heroMetrics).toHaveLength(4)
    expect(revenue.map((item) => [item.year, item.numeric])).toEqual([
      ['2023', 8_500_000],
      ['2024', 96_000_000],
      ['2025', 202_715_000],
    ])
  })

  it('keeps the full verified formats and FAQ groups', () => {
    expect(formats).toHaveLength(3)
    expect(formats.every((format) => format.facts.length === 6)).toBe(true)
    expect(formats.map((format) => format.image)).toEqual([
      '/assets/official/blocks__formats__formats_img_1.png',
      '/assets/official/blocks__formats__formats_img_3.png',
      '/assets/official/blocks__formats__formats_img_2.png',
    ])
    expect(faqGroups.map((group) => group.items.length)).toEqual([7, 7, 8, 7])
  })

  it('preserves the 2023 and 39-square-metre origin', () => {
    expect(story.origin).toContain('2023')
    expect(story.origin).toContain('39 квадратных метрах')
    expect(story.origin).toContain('Ибрагим Токкаев')
  })
})
