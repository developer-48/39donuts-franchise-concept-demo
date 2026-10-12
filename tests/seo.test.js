import test from 'node:test'
import assert from 'node:assert/strict'
import {
  resolveSiteUrl,
  pageUrl,
  serializeJsonLd,
  buildStructuredData,
  sitemapXml,
  robotsTxt,
} from '../src/lib/seo.js'

test('canonical URLs keep one secure origin and reject query/hash configuration', () => {
  assert.equal(pageUrl(resolveSiteUrl(), '/privacy-policy/'), 'https://39donuts.ru/privacy-policy/')
  for (const url of [
    'http://39donuts.ru',
    'https://39donuts.ru/?tracking=1',
    'https://39donuts.ru/folder/',
    'https://user:secret@39donuts.ru',
  ])
    assert.throws(() => resolveSiteUrl(url))
  for (const path of ['//other.example/', '/?tracking=1', '/#story'])
    assert.throws(() => pageUrl(resolveSiteUrl(), path))
})

test('JSON-LD strings cannot terminate their HTML script element', () => {
  const original = { name: '</script><img src=x onerror=alert(1)>\u2028\u2029' }
  const serialized = serializeJsonLd(original)
  assert.ok(!serialized.includes('<'))
  assert.deepEqual(JSON.parse(serialized), original)
})

test('sitemap includes only real canonical pages and preview does not advertise it', () => {
  const xml = sitemapXml(resolveSiteUrl())
  assert.equal((xml.match(/<loc>/g) ?? []).length, 2)
  assert.ok(
    !xml.includes('<lastmod>') &&
      !xml.includes('#') &&
      !xml.includes('/404') &&
      !xml.includes('/g/'),
  )
  assert.ok(robotsTxt(resolveSiteUrl(), true).includes('Sitemap: https://39donuts.ru/sitemap.xml'))
  assert.ok(!robotsTxt(resolveSiteUrl(), false).includes('Sitemap:'))
  assert.ok(robotsTxt(resolveSiteUrl(), false).includes('Allow: /'))
})

test('structured data identifies a network organization and exactly supplied FAQ answers', () => {
  const data = buildStructuredData(resolveSiteUrl(), {
    contact: {
      legalName: 'Operator',
      phoneHref: '+123',
      email: 'info@example.invalid',
      instagram: 'https://instagram.com/example/',
      telegram: 'https://t.me/example',
      whatsapp: 'https://wa.me/123',
      inn: '123',
      postalAddress: { streetAddress: 'Configured street', addressLocality: 'Configured city' },
    },
    faqGroups: [{ items: [{ question: 'Question?', answer: 'Actual answer.' }] }],
  })
  assert.deepEqual(
    data['@graph'].map((item) => item['@type']),
    ['Organization', 'WebSite', 'WebPage', 'FAQPage'],
  )
  assert.equal(data['@graph'][3].mainEntity[0].acceptedAnswer.text, 'Actual answer.')
  assert.equal(data['@graph'][0].address.streetAddress, 'Configured street')
  assert.equal(data['@graph'][0].address.addressLocality, 'Configured city')
  const serialized = JSON.stringify(data)
  for (const unsupported of ['AggregateRating', 'LocalBusiness', 'SearchAction', 'Offer'])
    assert.ok(!serialized.includes(unsupported))
})
