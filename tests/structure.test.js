import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve, relative } from 'node:path'

const root = resolve('src')
const pages = join(root, 'pages')
const experiments = join(root, 'experiments')

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? files(path) : /\.(?:js|astro|css)$/.test(path) ? [path] : []
  })
}

// All current source imports are literal paths. Vite remains the authoritative build resolver.
const graph = new Map(
  files(root).map((file) => {
    const text = readFileSync(file, 'utf8')
    const imports = [
      ...text.matchAll(
        /\b(?:import|export)\s+(?:[^'";]+?\s+from\s*)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)|@import\s+['"]([^'"]+)['"]/g,
      ),
    ]
      .map((match) => match[1] ?? match[2] ?? match[3])
      .filter((path) => path.startsWith('.'))
      .map((path) => resolve(dirname(file), path))
    return [file, imports]
  }),
)

const isInside = (file, directory) => file === directory || file.startsWith(`${directory}/`)

test('source file moves leave all literal relative imports resolvable', () => {
  for (const [file, imports] of graph) {
    for (const dependency of imports) {
      assert.ok(existsSync(dependency), `${relative(root, file)}: missing ${dependency}`)
    }
  }
})

test('reusable modules never import routes and the source graph contains no cycles', () => {
  const visited = new Set()
  function visit(file, chain = []) {
    assert.ok(!chain.includes(file), `Circular import: ${[...chain, file].join(' -> ')}`)
    if (visited.has(file)) return
    for (const dependency of graph.get(file) ?? []) {
      if (!isInside(file, pages)) {
        assert.ok(!isInside(dependency, pages), `Reusable module imports a route: ${file}`)
      }
      visit(dependency, [...chain, file])
    }
    visited.add(file)
  }
  for (const file of graph.keys()) visit(file)
})

test('the primary landing does not depend on experimental 3D modules', () => {
  const visited = new Set()
  function visit(file) {
    if (visited.has(file)) return
    visited.add(file)
    assert.ok(!isInside(file, experiments), `Primary route imports an experiment: ${file}`)
    for (const dependency of graph.get(file) ?? []) visit(dependency)
  }
  visit(join(pages, 'index.astro'))
})
