import fs from 'node:fs'
import path from 'node:path'
import {
  answersMatch,
  isPlaceholderDiary,
  meaningfulText,
  normalizeAnswer,
  parseCards,
  parseIndex,
  parseTest,
  STATUSES,
} from './diary-format.mjs'

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

function topicDirs(contentDir) {
  const dirs = []
  function walk(dir) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '_template' || entry.name === 'diary' || entry.name.startsWith('.')) continue
      if (!entry.isDirectory()) continue
      const full = path.join(dir, entry.name)
      if (fs.existsSync(path.join(full, 'index.md'))) dirs.push(full)
      walk(full)
    }
  }
  walk(contentDir)
  return dirs
}

export function checkDiary(contentDir) {
  const problems = []
  if (!fs.existsSync(contentDir)) {
    return ['The content folder is missing.']
  }

  const topics = topicDirs(contentDir).map((dir) => {
    const id = path.relative(contentDir, dir).split(path.sep).join('/')
    return { id, dir, index: parseIndex(read(path.join(dir, 'index.md'))) }
  })
  const ids = new Set(topics.map((topic) => topic.id))

  if (topics.length === 0) {
    problems.push('There are no pages yet. Run npm run new, or copy content/_template into content and give it a title.')
  }

  for (const topic of topics) {
    const { id, dir, index } = topic
    const where = index.title ? `"${index.title}" (${id})` : id
    if (!index.title) problems.push(`${id}/index.md needs a Title.`)
    if (!STATUSES.includes(index.status)) {
      problems.push(`${where} has status "${index.status || '(blank)'}". Use to-study, learning, or studied.`)
    }
    if (index.partOf === id) problems.push(`${where} cannot be part of itself.`)

    const folderParent = id.includes('/') ? id.slice(0, id.lastIndexOf('/')) : ''
    if (folderParent && index.partOf !== folderParent) {
      problems.push(`${where} sits inside ${folderParent}. Set Part of: ${folderParent}.`)
    }
    if (index.partOf && !ids.has(index.partOf)) {
      problems.push(`${where} says it is part of "${index.partOf}", and there is no page with that id.`)
    }
    for (const related of index.related) {
      if (!ids.has(related)) {
        problems.push(`${where} lists related topic "${related}", and there is no page with that id.`)
      }
    }

    const diaryDir = path.join(dir, 'diary')
    const diaryFiles = fs.existsSync(diaryDir)
      ? fs.readdirSync(diaryDir).filter((name) => name.endsWith('.md'))
      : []
    for (const name of diaryFiles) {
      if (!/^\d{4}-\d{2}-\d{2}\.md$/.test(name)) {
        problems.push(`${where} has diary/${name}. Name it with the day, like 2026-10-25.md.`)
      }
    }
    const realDiary = diaryFiles.filter((name) => {
      if (!/^\d{4}-\d{2}-\d{2}\.md$/.test(name)) return false
      const body = read(path.join(diaryDir, name))
      return !isPlaceholderDiary(body) && meaningfulText(body)
    })

    if (index.status !== 'learning' && index.status !== 'studied') continue

    if (!index.summary) {
      problems.push(`${where} needs a Summary written for someone new to the topic.`)
    }
    for (const file of ['notes.md', 'practice.md', 'flashcards.md', 'test.md']) {
      const full = path.join(dir, file)
      if (!fs.existsSync(full) || !meaningfulText(read(full))) {
        problems.push(`${where} is ${index.status}, and ${file} is missing or blank. Copy it from content/_template/${file}.`)
      }
    }

    const cards = fs.existsSync(path.join(dir, 'flashcards.md'))
      ? parseCards(read(path.join(dir, 'flashcards.md')))
      : []
    if (!cards.some((card) => card.front && card.back)) {
      problems.push(`${where} needs at least one flashcard with a Front line and a Back line.`)
    }
    cards.forEach((card, indexNumber) => {
      if (card.front && !card.back) problems.push(`${where} card ${indexNumber + 1} is missing a Back line.`)
      if (!card.front && card.back) problems.push(`${where} card ${indexNumber + 1} is missing a Front line.`)
    })

    const questions = fs.existsSync(path.join(dir, 'test.md'))
      ? parseTest(read(path.join(dir, 'test.md')))
      : []
    if (!questions.some((question) => question.prompt && question.answer)) {
      problems.push(`${where} needs at least one test question with a Prompt line and an Answer line.`)
    }
    questions.forEach((question, indexNumber) => {
      if (question.choices.length === 0 || !question.answer) return
      const matched = question.choices.some((choice) =>
        question.answer.split('|').some((option) => normalizeAnswer(option) === normalizeAnswer(choice) || answersMatch(choice, option)),
      )
      if (!matched) {
        problems.push(`${where} question ${indexNumber + 1} has an Answer that does not match any choice. Copy one choice onto the Answer line.`)
      }
    })

    if (realDiary.length === 0) {
      problems.push(`${where} needs a dated line in diary/, named like 2026-10-25.md, saying what you studied.`)
    }
  }

  return problems
}
