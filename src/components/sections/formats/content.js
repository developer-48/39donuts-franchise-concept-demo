import { asset } from '../../../config/assets.js'

export const formats = [
  {
    id: 'cafe-workshop',
    name: 'Кофейня + цех',
    image: asset('images/formats/cafe-workshop.png'),
    facts: [
      { label: 'Минимальная площадь', value: '80 м²' },
      { label: 'Инвестиции', value: 'от 7 000 000 ₽' },
      { label: 'Рентабельность', value: '25–30%' },
      { label: 'Средняя выручка', value: '≈ 2 400 000 ₽' },
      { label: 'Средняя чистая прибыль', value: '600 000 ₽' },
      { label: 'Средняя окупаемость', value: '12–16 месяцев' },
    ],
  },
  {
    id: 'cafe-separate',
    name: 'Кофейня',
    note: 'цех отдельно',
    image: asset('images/formats/cafe-separate.png'),
    facts: [
      { label: 'Минимальная площадь', value: 'от 40 м² + 30 м² цех' },
      { label: 'Инвестиции', value: 'от 7 000 000 ₽' },
      { label: 'Рентабельность', value: '25–30%' },
      { label: 'Средняя выручка', value: '≈ 2 100 000 ₽' },
      { label: 'Средняя чистая прибыль', value: '630 000 ₽' },
      { label: 'Средняя окупаемость', value: '12–16 месяцев' },
    ],
  },
  {
    id: 'island',
    name: 'Павильон-островок',
    note: 'цех отдельно',
    image: asset('images/formats/island.png'),
    facts: [
      { label: 'Минимальная площадь', value: 'от 12 м² + 30 м² цех' },
      { label: 'Инвестиции', value: 'от 5 000 000 ₽' },
      { label: 'Рентабельность', value: '27–33%' },
      { label: 'Средняя выручка', value: '≈ 2 400 000 ₽' },
      { label: 'Средняя чистая прибыль', value: '720 000 ₽' },
      { label: 'Средняя окупаемость', value: '6–12 месяцев' },
    ],
  },
]
