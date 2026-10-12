import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'

const [command, mode, ...args] = process.argv.slice(2)
if (!['dev', 'build', 'preview'].includes(command) || !['production', 'preview'].includes(mode))
  throw new Error('Expected an Astro command and production/preview mode')
const require = createRequire(import.meta.url)
const packagePath = require.resolve('astro/package.json')
const { bin } = JSON.parse(readFileSync(packagePath, 'utf8'))
const cli = join(dirname(packagePath), typeof bin === 'string' ? bin : bin.astro)
const child = spawn(process.execPath, [cli, command, ...args], {
  stdio: 'inherit',
  env: { ...process.env, PUBLIC_SITE_MODE: mode },
})
child.on('error', (error) => {
  console.error(error)
  process.exitCode = 1
})
child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
