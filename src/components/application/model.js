// Pure answer validation and review data; no DOM or network access.
import { reviewDefinitions } from './content.js'

export const fieldNames = [
  'fullName',
  'age',
  'experience',
  'role',
  'format',
  'investment',
  'region',
  'marketing',
  'reason',
  'about',
  'contact',
]

export function readAnswers(form) {
  const values = new FormData(form)
  return Object.fromEntries(fieldNames.map((name) => [name, String(values.get(name) ?? '')]))
}

export function validateStep(data, step) {
  const errors = {}
  if (step === 0) {
    if (data.fullName.trim().length < 3) errors.fullName = 'Введите имя — не меньше 3 символов.'
    if (
      data.age &&
      (!Number.isInteger(Number(data.age)) || Number(data.age) < 1 || Number(data.age) > 120)
    ) {
      errors.age = 'Укажите целый возраст от 1 до 120.'
    }
    if (!data.role) errors.role = 'Выберите планируемую роль.'
  }
  if (step === 1) {
    if (!data.format) errors.format = 'Выберите формат.'
    if (!data.investment) errors.investment = 'Выберите вариант финансирования.'
    if (data.region.trim().length < 2) errors.region = 'Укажите город или регион.'
  }
  if (step === 3 && data.contact.trim().length < 4) errors.contact = 'Укажите удобный контакт.'
  return errors
}

export function getReviewGroups(data) {
  return reviewDefinitions
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => ({ ...item, value: data[item.name].trim() }))
        .filter((item) => item.value),
    }))
    .filter((group) => group.items.length)
}
