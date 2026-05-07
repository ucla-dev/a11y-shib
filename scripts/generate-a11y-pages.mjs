import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()

const pages = fs
  .readdirSync(projectRoot)
  .filter((name) => name.endsWith('.html'))
  .filter((name) => name !== 'stylesheet.html')
  .sort()
  .map((name) => `/${name}`)

const outFile = path.join(projectRoot, 'cypress', 'support', 'generated-pages.ts')

const contents = `export const pages = ${JSON.stringify(pages, null, 2)} as const
`

fs.writeFileSync(outFile, contents)
console.log(`Wrote ${pages.length} pages to ${outFile}`)