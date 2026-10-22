import * as THREE from 'three'
import { architecturalMaterial, material, palette } from '../model-helpers.js'

export function surfaces() {
  return {
    plaster: architecturalMaterial('plaster', '#dedbd3'),
    concrete: architecturalMaterial('concrete', '#a4a39e'),
    terrazzo: architecturalMaterial('terrazzo', '#d3cfc4'),
    oak: architecturalMaterial('oak', '#af9170'),
    walnut: architecturalMaterial('oak', '#6e5742'),
    fabric: architecturalMaterial('fabric', '#aa8f71'),
    steel: architecturalMaterial('stainless', '#c0c5c5', { metalness: 0.9, roughness: 0.48 }),
    aluminium: material('#303635', { metalness: 0.7, roughness: 0.4 }),
    white: material('#f5f3ec', { roughness: 0.68 }),
    black: material('#171b1b', { metalness: 0.2, roughness: 0.42 }),
    orange: material(palette.orange, { roughness: 0.5 }),
    purple: material(palette.purple, { roughness: 0.57 }),
    chrome: material('#dadfdf', { metalness: 0.98, roughness: 0.19 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#f1f6f4',
      transparent: false,
      opacity: 1,
      transmission: 0.94,
      thickness: 0.012,
      ior: 1.52,
      attenuationColor: '#bdd2ca',
      attenuationDistance: 2,
      metalness: 0,
      roughness: 0.018,
      specularIntensity: 1,
      envMapIntensity: 1,
      depthWrite: false,
      side: THREE.FrontSide,
    }),
    ovenGlass: material('#1d2628', { metalness: 0.35, roughness: 0.12 }),
    light: material('#fff1da', { emissive: '#ffd7a3', emissiveIntensity: 0.45 }),
    leaf: material('#395240', { roughness: 0.7 }),
    soil: material('#362e25', { roughness: 1 }),
  }
}
