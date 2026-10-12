import { seoContent } from '../config/seo.js'

export function resolveSiteUrl(value = seoContent.siteUrl) {
  const url = new URL(value)
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('SITE_URL must be an HTTPS origin, for example https://39donuts.ru/')
  }
  return `${url.origin}/`
}

export function pageUrl(siteUrl, path = '/') {
  if (!path.startsWith('/') || path.startsWith('//') || /[?#]/.test(path))
    throw new Error('Canonical path must be an absolute path without query or fragment')
  return new URL(path, resolveSiteUrl(siteUrl)).href
}

export function serializeJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function buildStructuredData(
  siteUrl,
  {
    path = '/',
    title = seoContent.title,
    description = seoContent.description,
    contact,
    faqGroups = [],
  },
) {
  const root = resolveSiteUrl(siteUrl)
  const canonical = pageUrl(root, path)
  const organizationId = `${root}#organization`
  const websiteId = `${root}#website`
  const webpageId = `${canonical}#webpage`
  const organization = {
    '@type': 'Organization',
    '@id': organizationId,
    name: seoContent.siteName,
    legalName: contact.legalName,
    url: root,
    email: contact.email,
    telephone: contact.phoneHref,
    logo: { '@type': 'ImageObject', url: pageUrl(root, seoContent.logo), width: 512, height: 512 },
    sameAs: [contact.instagram, contact.telegram, contact.whatsapp],
    address: {
      '@type': 'PostalAddress',
      ...contact.postalAddress,
    },
    taxID: contact.inn,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Вопросы о франшизе',
      telephone: contact.phoneHref,
      email: contact.email,
      availableLanguage: 'Russian',
    },
  }
  const graph = [
    organization,
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: seoContent.siteName,
      url: root,
      inLanguage: seoContent.language,
      publisher: { '@id': organizationId },
    },
    {
      '@type': 'WebPage',
      '@id': webpageId,
      url: canonical,
      name: title,
      description,
      inLanguage: seoContent.language,
      isPartOf: { '@id': websiteId },
      about: { '@id': organizationId },
    },
  ]
  if (path === '/' && faqGroups.length)
    graph.push({
      '@type': 'FAQPage',
      '@id': `${root}#faq`,
      isPartOf: { '@id': webpageId },
      mainEntity: faqGroups.flatMap((group) =>
        group.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      ),
    })
  return { '@context': 'https://schema.org', '@graph': graph }
}

export function sitemapXml(siteUrl) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${seoContent.indexablePaths.map((path) => `  <url><loc>${pageUrl(siteUrl, path)}</loc></url>`).join('\n')}\n</urlset>\n`
}

export function robotsTxt(siteUrl, production) {
  return `User-agent: *\nAllow: /\n${production ? `\nSitemap: ${pageUrl(siteUrl, '/sitemap.xml')}\n` : '\n# Preview pages carry noindex. Allow crawling so robots can read that directive.\n'}`
}
