import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const archive = resolve('releases/39donuts-production.tar.gz')
mkdirSync('releases', { recursive: true })
rmSync(archive, { force: true })
const result = spawnSync('tar', ['-czf', archive, '-C', resolve('dist'), '.'], {
  stdio: 'inherit',
  // Keep macOS resource forks and Finder metadata out of the public release.
  env: { ...process.env, COPYFILE_DISABLE: '1' },
})
if (result.error || result.status !== 0) throw result.error ?? new Error('Could not archive production dist')
const checksum = createHash('sha256').update(readFileSync(archive)).digest('hex')
writeFileSync(`${archive}.sha256`, `${checksum}  39donuts-production.tar.gz\n`)
console.log(`Ready for static hosting: ${archive}\nSHA256: ${checksum}`)
