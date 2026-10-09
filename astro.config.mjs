import { defineConfig } from 'astro/config'

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://39donuts.ru',
  output: 'static',
  vite: { build: { cssMinify: true } },
})
