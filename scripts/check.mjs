import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkDiary } from '../shared/check-diary.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const problems = checkDiary(path.join(root, 'content'))

if (problems.length === 0) {
  console.log('The diary structure looks right.')
  process.exit(0)
}

console.log('The diary needs a few fixes:')
for (const problem of problems) console.log(`- ${problem}`)
process.exit(1)
