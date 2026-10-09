import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'dist-preview/**', 'releases/**', 'node_modules/**', '.astro/**', 'output/**', 'public/**'] },
  { ...js.configs.recommended, files: ['**/*.{js,mjs}'], languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.browser, ...globals.node } } },
]
