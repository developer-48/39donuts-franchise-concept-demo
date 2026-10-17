import * as THREE from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'

let studio
let preparation

/** The approved architecture uses one locally stored cafe environment. */
export function prepareStudio() {
  preparation ??= new HDRLoader()
    .loadAsync(`${import.meta.env.BASE_URL}assets/three-d/boma-1k.hdr`)
    .then((texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping
      studio = texture
    })
    .catch(() => {
      studio = null
    })
  return preparation
}

export function getStudio() {
  return studio
}
