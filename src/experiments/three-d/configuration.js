export const sceneDefinitions = [
  { id: 'hero', label: 'Первый экран', description: 'Предметная съёмка пончика', anchor: 'top' },
  {
    id: 'product',
    label: 'Почему пончики?',
    description: 'Разбор продукта на слои',
    anchor: 'network',
  },
  {
    id: 'formats',
    label: 'Форматы кофеен',
    description: 'Архитектурные миниатюры',
    anchor: 'formats',
  },
  {
    id: 'box',
    label: '940 597 пончиков',
    description: 'Открытие фирменной коробки',
    anchor: 'story',
  },
]

export const sceneIds = sceneDefinitions.map(({ id }) => id)

export const presets = [
  { id: 'baseline', label: 'Оригинал', scenes: [] },
  { id: 'formats', label: 'Только форматы', scenes: ['formats'] },
  { id: 'one', label: 'Одна сцена', scenes: ['hero'] },
  { id: 'two', label: 'Две сцены', scenes: ['hero', 'formats'] },
  { id: 'three', label: 'Три сцены', scenes: ['hero', 'formats', 'box'] },
  { id: 'all', label: 'Все четыре', scenes: [...sceneIds] },
]

export function normalizeScenes(value) {
  const selected = Array.isArray(value) ? value : String(value ?? '').split(',')
  return sceneIds.filter((id) => selected.includes(id))
}

export function readSceneSelection(search, fallback) {
  const params = new URLSearchParams(search)
  return params.has('scenes') ? normalizeScenes(params.get('scenes')) : normalizeScenes(fallback)
}

export function matchingPreset(scenes) {
  const value = normalizeScenes(scenes).join(',')
  return presets.find((preset) => normalizeScenes(preset.scenes).join(',') === value)
}
