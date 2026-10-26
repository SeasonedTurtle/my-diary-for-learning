import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { checkDiary } from './check-diary.mjs'
import {
  answersMatch,
  parseCards,
  parseIndex,
  parseTest,
  renderMarkdown,
  slugify,
} from './diary-format.mjs'

test('parses a page header and summary', () => {
  const page = parseIndex(`%% hidden
Title: Limits
Status: learning
Part of: calculus
Related: calculus/integrals, continuity
Want: The idea of approaching a value
Know: How to plug a number into a function
Sources:
- Stewart chapter 2, local only

Summary:
A limit is what the output approaches.
`)
  assert.equal(page.title, 'Limits')
  assert.equal(page.status, 'learning')
  assert.equal(page.partOf, 'calculus')
  assert.deepEqual(page.related, ['calculus/integrals', 'continuity'])
  assert.equal(page.want, 'The idea of approaching a value')
  assert.deepEqual(page.sources, ['Stewart chapter 2, local only'])
  assert.match(page.summary, /output approaches/)
})

test('parses cards and questions', () => {
  const cards = parseCards(`%% note
# Card
Front: What is a limit?
Back: The value the output approaches.

# Card
Front:
Back:
`)
  assert.equal(cards.length, 1)
  assert.equal(cards[0].front, 'What is a limit?')

  const questions = parseTest(`# Question
Prompt: Which value is the limit?
Choices:
- 2
- 0
Answer: 2
Why: The two sides approach 2.

# Question
Prompt: Does it exist?
Answer: no | it does not exist
Why: The sides disagree.
`)
  assert.equal(questions.length, 2)
  assert.deepEqual(questions[0].choices, ['2', '0'])
  assert.equal(questions[0].why, 'The two sides approach 2.')
  assert.equal(answersMatch('It does not exist.', questions[1].answer), true)
  assert.equal(answersMatch('yes', questions[1].answer), false)
})

test('markdown escapes html and keeps lists', () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\n- one\n- *two*')
  assert.equal(html.includes('<script>'), false)
  assert.match(html, /&lt;script&gt;/)
  assert.match(html, /<li><em>two<\/em><\/li>/)
})

test('slug keeps a readable id', () => {
  assert.equal(slugify('Partial Derivatives'), 'partial-derivatives')
})

test('the diary in this repo passes the structure check', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  assert.deepEqual(checkDiary(path.join(root, 'content')), [])
})

test('check allows a log and rejects a broken study page', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'diary-'))
  const page = path.join(dir, 'graphs')
  fs.mkdirSync(page)
  fs.writeFileSync(
    path.join(page, 'index.md'),
    `Title: Graphs
Status: to-study
Part of:
Related:
Want: What a graph is
Know:
Sources:

Summary:
`,
  )
  assert.deepEqual(checkDiary(dir), [])

  fs.writeFileSync(path.join(page, 'index.md'), `Title: Graphs\nStatus: learning\nPart of: missing\nRelated:\n\nSummary:\nA graph.\n`)
  const problems = checkDiary(dir)
  assert.ok(problems.some((problem) => problem.includes('missing')))
  assert.ok(problems.some((problem) => problem.includes('flashcards.md')))
})
