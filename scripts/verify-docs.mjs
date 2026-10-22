import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? markdownFiles(path) : path.endsWith('.md') ? [path] : []
  })
}

const files = ['README.md', ...markdownFiles('docs')]
let links = 0
for (const file of files) {
  const source = readFileSync(file, 'utf8').replace(/^```[^\n]*\n[\s\S]*?^```/gm, '')
  for (const match of source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim().replace(/^<|>$/g, '')
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target)) continue
    const path = decodeURIComponent(target.split(/[?#]/)[0])
    assert.ok(!path.startsWith('/'), `${file}: use a repository-relative link: ${target}`)
    assert.ok(existsSync(resolve(dirname(file), path)), `${file}: broken link: ${target}`)
    links += 1
  }
}
console.log(`Documentation verified: ${files.length} files, ${links} local links.`)
