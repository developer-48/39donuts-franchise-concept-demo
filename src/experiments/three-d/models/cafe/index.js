import { loadLogoTexture } from '../model-helpers.js'
import { surfaces } from './materials.js'
import { workshopCafe } from './cafe-workshop.js'
import { ordinaryCafe } from './cafe-separate.js'
import { streetPavilion } from './pavilion.js'

// Architectural studies, not exact plans. Front faces +Z; dimensions deliberately differ.

export function createCafe(kind = 'cafe-workshop') {
  const s = surfaces()
  const logo = loadLogoTexture()
  const model =
    kind === 'island'
      ? streetPavilion(s, logo)
      : kind === 'cafe-separate'
        ? ordinaryCafe(s, logo)
        : workshopCafe(s, logo)
  model.group.userData.architecture = model.meta
  return model
}
