import { spawnSync } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'

const result = spawnSync(
  process.execPath,
  ['scripts/astro-command.mjs', 'build', 'preview', '--config', 'astro.pages.config.mjs'],
  { stdio: 'inherit' },
)
if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)

// GitHub Pages serves generated files directly and does not read Apache rules.
writeFileSync('dist-pages/.nojekyll', '')
rmSync('dist-pages/.htaccess', { force: true })
