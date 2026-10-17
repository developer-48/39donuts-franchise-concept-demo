import * as THREE from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'

const studios = new Map()
const preparations = new Map()

/** Load the real studio lighting once, before a scene replaces its photograph. */
export function prepareStudio(kind = 'product') {
  if (preparations.has(kind)) return preparations.get(kind)
  const file = kind === 'architecture' ? 'boma-1k.hdr' : 'studio-small-09-1k.hdr'
  const preparation = new HDRLoader()
    .loadAsync(`${import.meta.env.BASE_URL}assets/three-d/${file}`)
    .then((texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping
      studios.set(kind, texture)
    })
    .catch(() => {
      // A missing optional environment does not remove the approved static fallback.
      studios.set(kind, null)
    })
  preparations.set(kind, preparation)
  return preparation
}

export function getStudio(kind = 'product') {
  return studios.get(kind)
}
