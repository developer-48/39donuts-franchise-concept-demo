import * as THREE from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'

let studio
let preparation

/** Load the real studio lighting once, before a scene replaces its photograph. */
export function prepareStudio() {
  preparation ??= new HDRLoader()
    .loadAsync(`${import.meta.env.BASE_URL}assets/three-d/studio-small-09-1k.hdr`)
    .then((texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping
      studio = texture
    })
    .catch(() => {
      // A missing optional environment does not remove the approved static fallback.
      studio = null
    })
  return preparation
}

export function getStudio() {
  return studio
}
