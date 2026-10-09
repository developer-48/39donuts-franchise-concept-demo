export const applicationSteps = [
  { title: 'О вас', copy: 'Знакомимся с будущим партнёром и его ролью.' },
  { title: 'Проект', copy: 'Выбираем формат, бюджет и город запуска.' },
  { title: 'План', copy: 'Фиксируем идеи по развитию будущей точки.' },
  { title: 'Контакт', copy: 'Добавьте контакт и проверьте все ответы перед отправкой.' },
]

export const roleOptions = [
  'Самостоятельно погружусь в операционные процессы, затем найму управляющего',
  'Сразу назначу управляющего, который будет выстраивать процессы',
  'Только инвестирую, без активного участия в управлении',
]
export const formatOptions = ['Кофейня вместе с цехом', 'Кофейня и цех отдельно', 'Цех и точка на вынос']
export const investmentOptions = [
  'Бюджет достаточен для открытия кофейни',
  'Планирую привлечь инвестиции',
  'Имею дополнительный ресурс в запасе',
]

export const reviewDefinitions = [
  { title: 'О вас', step: 0, items: [
    { label: 'ФИО', name: 'fullName', wide: false },
    { label: 'Возраст', name: 'age', wide: false },
    { label: 'Опыт работы', name: 'experience', wide: true },
    { label: 'Роль', name: 'role', wide: true },
  ] },
  { title: 'Проект', step: 1, items: [
    { label: 'Формат', name: 'format', wide: true },
    { label: 'Финансирование', name: 'investment', wide: true },
    { label: 'Регион / город / место', name: 'region', wide: true },
  ] },
  { title: 'План', step: 2, items: [
    { label: 'Маркетинговая стратегия', name: 'marketing', wide: true },
    { label: 'Почему 39 donuts', name: 'reason', wide: true },
    { label: 'О себе', name: 'about', wide: true },
  ] },
]
