import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const html = readFileSync('dist/index.html', 'utf8')
assert.match(html, /<html lang="ru">/)
assert.equal((html.match(/<h1\b/g) ?? []).length, 1, 'The landing must have one main heading')
for (const id of [
  'top',
  'revenue',
  'story',
  'network',
  'formats',
  'reviews',
  'application',
  'faq',
  'contacts',
]) {
  assert.ok(html.includes(`id="${id}"`), `Missing static section: ${id}`)
}
for (const text of [
  '940 597',
  'Три формата кофейни',
  'Павильон-островок',
  '7 000 000 ₽',
  '7% при переводе',
  'Анкета партнёра',
]) {
  assert.ok(html.includes(text), `Missing pre-rendered content: ${text}`)
}

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs')
for (const match of html.matchAll(/\baria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
  for (const id of match[1].split(/\s+/)) assert.ok(ids.includes(id), `Missing ARIA target: ${id}`)
}

for (const match of html.matchAll(/\b(?:src|href)="(\/(?:assets|_astro|favicon)[^"]*)"/g)) {
  const path = match[1].split(/[?#]/)[0]
  assert.ok(existsSync(resolve('dist', `.${path}`)), `Missing resource: ${path}`)
}
for (const name of ['e', 'f', 'g']) {
  const redirect = readFileSync(`dist/${name}/index.html`, 'utf8')
  assert.ok(
    redirect.includes('window.location.search') && redirect.includes('window.location.hash'),
    `Legacy redirect loses query/hash: ${name}`,
  )
}
console.log('Static HTML, SEO content, resources, ARIA references and legacy redirects verified.')
