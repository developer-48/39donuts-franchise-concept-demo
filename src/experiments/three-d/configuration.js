export const sceneDefinitions = [
  {
    id: 'formats',
    label: 'Форматы кофеен',
    description: 'Архитектурные модели',
    anchor: 'formats',
  },
]

export const sceneIds = sceneDefinitions.map(({ id }) => id)

export const presets = [
  { id: 'baseline', label: 'Оригинал', scenes: [] },
  { id: 'formats', label: '3D в форматах', scenes: ['formats'] },
]

export const retiredPresets = ['one', 'two', 'three', 'all']

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
