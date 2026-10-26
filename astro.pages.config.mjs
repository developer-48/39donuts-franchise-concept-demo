import { defineConfig } from 'astro/config'
import config from './astro.config.mjs'

// The public demonstration lives in a repository subdirectory. The official build stays at /.
export default defineConfig({
  ...config,
  base: '/39donuts-franchise-concept-demo/',
  outDir: './dist-pages',
  devToolbar: { enabled: false },
})
