import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseIndex, slugify } from '../shared/diary-format.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = path.join(root, 'content')
const templateDir = path.join(contentDir, '_template')

function readArgs(argv) {
  const args = { help: false, title: '', kind: '', parent: '' }
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index]
    if (token === '--help' || token === '-h') args.help = true
    else if (token === '--title') args.title = argv[++index] ?? ''
    else if (token === '--kind') args.kind = argv[++index] ?? ''
    else if (token === '--parent') args.parent = argv[++index] ?? ''
    else {
      console.log(`Unknown option ${token}. Run npm run new -- --help`)
      process.exit(1)
    }
  }
  return args
}

function topicIds() {
  const ids = []
  function walk(dir) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === '_template' || entry.name === 'diary' || entry.name.startsWith('.')) continue
      const full = path.join(dir, entry.name)
      if (fs.existsSync(path.join(full, 'index.md'))) {
        ids.push(path.relative(contentDir, full).split(path.sep).join('/'))
      }
      walk(full)
    }
  }
  walk(contentDir)
  return ids.sort()
}

function help() {
  console.log(`Create a diary page from the template.

  npm run new
  npm run new -- --title "Limits" --kind subtopic --parent calculus

kind is "main" or "subtopic".
A subtopic needs --parent, the id of the page it belongs to.
`)
}

function fillIndex(text, title, parent) {
  return text
    .split(/\r?\n/)
    .map((line) => {
      if (line.startsWith('Title:')) return `Title: ${title}`
      if (line.startsWith('Status:')) return 'Status: to-study'
      if (line.startsWith('Part of:')) return `Part of: ${parent}`
      return line
    })
    .join('\n')
}

async function ask(args) {
  if (args.title && args.kind) return args
  const rl = readline.createInterface({ input, output })
  try {
    const title = args.title || (await rl.question('What is the title? ')).trim()
    let kind = args.kind
    if (!kind) {
      const answer = (await rl.question('Is this a main topic or a subtopic? Type main or subtopic. ')).trim().toLowerCase()
      kind = answer === 'sub' ? 'subtopic' : answer
    }
    let parent = args.parent
    if (kind === 'subtopic' && !parent) {
      const ids = topicIds()
      if (ids.length === 0) {
        console.log('There is no page to put this inside yet. Make a main topic first.')
        process.exit(1)
      }
      console.log('Pages you can put this inside:')
      for (const id of ids) {
        const index = parseIndex(fs.readFileSync(path.join(contentDir, id, 'index.md'), 'utf8'))
        console.log(`- ${id}${index.title ? ` (${index.title})` : ''}`)
      }
      parent = (await rl.question('Which page does it belong to? Type the id. ')).trim()
    }
    return { ...args, title, kind, parent }
  } finally {
    rl.close()
  }
}

const args = readArgs(process.argv)
if (args.help) {
  help()
  process.exit(0)
}

const answers = await ask(args)
const title = answers.title.trim()
const kind = answers.kind.trim().toLowerCase()
const parent = kind === 'main' ? '' : answers.parent.trim()

if (!title) {
  console.log('Give the page a title.')
  process.exit(1)
}
if (kind !== 'main' && kind !== 'subtopic') {
  console.log('Type main or subtopic.')
  process.exit(1)
}
const slug = slugify(title)
if (!slug) {
  console.log('Use a title with letters or numbers.')
  process.exit(1)
}
if (kind === 'subtopic' && !parent) {
  console.log('A subtopic needs the id of the page it belongs to.')
  process.exit(1)
}
if (parent && !topicIds().includes(parent)) {
  console.log(`There is no page with id "${parent}".`)
  process.exit(1)
}

const destination = path.join(contentDir, ...parent.split('/').filter(Boolean), slug)
if (fs.existsSync(destination)) {
  console.log(`content/${path.relative(contentDir, destination).split(path.sep).join('/')} already exists.`)
  process.exit(1)
}
if (!fs.existsSync(templateDir)) {
  console.log('The template folder content/_template is missing.')
  process.exit(1)
}

fs.cpSync(templateDir, destination, { recursive: true })
const indexPath = path.join(destination, 'index.md')
fs.writeFileSync(indexPath, fillIndex(fs.readFileSync(indexPath, 'utf8'), title, parent))

const id = path.relative(contentDir, destination).split(path.sep).join('/')
console.log(`Created content/${id}.`)
console.log('It is logged as to-study. Fill in the files yourself, ask an assistant to write the page from sources/, or leave it as a log.')
console.log('Then run npm run check.')
