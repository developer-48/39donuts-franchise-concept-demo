import { defineConfig } from 'astro/config'
import { resolveSiteUrl } from './src/lib/seo.js'

export default defineConfig({
  site: resolveSiteUrl(process.env.SITE_URL),
  output: 'static',
  outDir: process.env.PUBLIC_SITE_MODE === 'preview' ? './dist-preview' : './dist',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  vite: { build: { cssMinify: true } },
})
