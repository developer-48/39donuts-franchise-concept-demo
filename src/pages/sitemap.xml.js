import { sitemapXml } from '../lib/seo.js'
export function GET({ site }) {
  const production = import.meta.env.PUBLIC_SITE_MODE === 'production'
  return new Response(production ? sitemapXml(site.href) : '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>\n', { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
