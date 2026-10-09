import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { seoContent } from '../src/data/seoContent.js'
import { resolveSiteUrl, pageUrl } from '../src/lib/seo.js'

const [directory = 'dist', mode = 'production'] = process.argv.slice(2)
const production = mode === 'production'
const site = resolveSiteUrl(process.env.SITE_URL)
const read = (path) => readFileSync(resolve(directory, path), 'utf8')
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]))
const meta = (html, key) => [...html.matchAll(/<meta\b[^>]*>/g)].map((match) => attributes(match[0])).find((attrs) => attrs.name === key || attrs.property === key)?.content
const canonicals = (html) => [...html.matchAll(/<link\b[^>]*>/g)].map((match) => attributes(match[0])).filter((attrs) => attrs.rel === 'canonical')
const titles = new Set()
for (const path of seoContent.indexablePaths) {
  const html = read(path === '/' ? 'index.html' : `${path.slice(1)}index.html`)
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${path} must have one H1`)
  assert.match(html, /<html lang="ru">/)
  const title = html.match(/<title>(.*?)<\/title>/)?.[1]
  assert.ok(title?.length && !titles.has(title), 'Page titles must be unique')
  titles.add(title)
  assert.ok(meta(html, 'description')?.length > 40, 'Missing page description')
  assert.ok(!/концепт|редизайн/i.test(title + meta(html, 'description')), 'Preview copy leaked into SEO metadata')
  assert.equal(canonicals(html).length, 1)
  assert.equal(canonicals(html)[0].href, pageUrl(site, path))
  assert.equal(meta(html, 'og:url'), pageUrl(site, path))
  assert.equal(meta(html, 'og:title'), title)
  assert.equal(meta(html, 'og:image'), pageUrl(site, seoContent.image))
  assert.equal(meta(html, 'twitter:card'), 'summary_large_image')
  assert.equal(meta(html, 'robots'), production ? 'index, follow, max-image-preview:large' : 'noindex, nofollow')
  const script = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
  const schema = JSON.parse(script)
  assert.equal(schema['@context'], 'https://schema.org')
  const types = schema['@graph'].map((entry) => entry['@type'])
  for (const type of ['Organization', 'WebSite', 'WebPage']) assert.ok(types.includes(type))
  if (path === '/') {
    const faq = schema['@graph'].find((entry) => entry['@type'] === 'FAQPage')
    assert.equal(faq.mainEntity.length, (html.match(/<article class="faq-item /g) ?? []).length)
    assert.match(html, /fetchpriority="high"/)
    assert.match(html, /loading="lazy"/)
    assert.ok(html.includes('href="/privacy-policy/"'))
  }
  for (const match of html.matchAll(/\b(?:src|href)="(\/(?:assets|_astro|favicon|og)[^"]*)"/g)) {
    assert.ok(existsSync(resolve(directory, `.${match[1].split(/[?#]/)[0]}`)), `Missing local asset ${match[1]}`)
  }
}

const robots = read('robots.txt')
assert.ok(robots.includes('User-agent: *') && robots.includes('Allow: /') && !robots.includes('Disallow: /'))
assert.equal(robots.includes(`Sitemap: ${pageUrl(site, '/sitemap.xml')}`), production)
const locations = [...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
assert.deepEqual(locations, production ? seoContent.indexablePaths.map((path) => pageUrl(site, path)) : [])
assert.ok(!read('sitemap.xml').includes('<lastmod>'), 'Do not invent content modification dates')
const notFound = read('404.html')
assert.equal(meta(notFound, 'robots'), 'noindex, nofollow')
assert.equal(canonicals(notFound).length, 0)
assert.ok(read('.htaccess').includes('ErrorDocument 404 /404.html'))
const image = readFileSync(resolve(directory, `.${seoContent.image}`))
assert.equal(image.subarray(1, 4).toString(), 'PNG')
assert.equal(image.readUInt32BE(16), 1200)
assert.equal(image.readUInt32BE(20), 630)
assert.ok(existsSync(resolve(directory, `.${seoContent.logo}`)))
console.log(`SEO verified: ${mode}, canonical pages, metadata, JSON-LD, images, robots, sitemap, privacy and 404.`)
