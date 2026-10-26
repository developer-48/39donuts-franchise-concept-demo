import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const directory = 'dist-pages'
const base = '/39donuts-franchise-concept-demo/'
const read = (file) => readFileSync(join(directory, file), 'utf8')
const files = (path) =>
  readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const file = join(path, entry.name)
    return entry.isDirectory() ? files(file) : [file]
  })

assert.ok(existsSync(join(directory, '.nojekyll')))
assert.ok(!existsSync(join(directory, '.htaccess')))
assert.ok(!existsSync(join(directory, 'lab')), 'Experimental routes must not enter the publication')
for (const file of files(directory).filter((path) => path.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8')
  assert.match(html, /name="robots" content="noindex, nofollow"/)
  for (const match of html.matchAll(/\b(?:src|href)="(\/[^"]*)"/g)) {
    const target = match[1].split(/[?#]/)[0]
    assert.ok(target.startsWith(base), `${file}: unprefixed local URL ${target}`)
    const local = target.slice(base.length)
    assert.ok(existsSync(resolve(directory, local)), `${file}: missing local URL ${target}`)
  }
}
const home = read('index.html')
assert.equal((home.match(/<h1\b/g) ?? []).length, 1)
for (const text of ['940 597', 'Три формата кофейни', '7 000 000 ₽', 'Анкета партнёра'])
  assert.ok(home.includes(text), `Missing static content: ${text}`)
assert.ok(home.includes('rel="canonical" href="https://39donuts.ru/"'))
assert.ok(
  read('privacy-policy/index.html').includes(
    'rel="canonical" href="https://39donuts.ru/privacy-policy/"',
  ),
)
assert.ok(home.includes(`href="${base}privacy-policy/"`))
assert.ok(!read('sitemap.xml').includes('<loc>'))
assert.ok(!read('robots.txt').includes('Sitemap:'))
console.log('GitHub Pages verified: Astro HTML, base paths, local resources, noindex, no 3D.')
