import { robotsTxt } from '../lib/seo.js'
export function GET({ site }) {
  return new Response(robotsTxt(site.href, import.meta.env.PUBLIC_SITE_MODE === 'production'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
