import diaryText from '../diary.txt?raw'
import {
  parseCards,
  parseDiaryConfig,
  parseIndex,
  parseTest,
  type Card,
  type DiaryConfig,
  type Question,
} from '../shared/diary-format.mjs'

export type DiaryEntry = {
  date: string
  body: string
}

export type Topic = {
  id: string
  title: string
  status: string
  partOf: string
  related: string[]
  want: string
  know: string
  sources: string[]
  summary: string
  notes: string
  practice: string
  cards: Card[]
  questions: Question[]
  diary: DiaryEntry[]
}

export type Diary = {
  config: DiaryConfig
  topics: Topic[]
}

type Bucket = {
  index: string
  notes: string
  practice: string
  cards: string
  test: string
  diary: DiaryEntry[]
}

const files = import.meta.glob('../content/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function relativeContentPath(file: string) {
  const normalized = file.replace(/\\/g, '/')
  const marker = '/content/'
  const start = normalized.lastIndexOf(marker)
  if (start === -1) return ''
  return normalized.slice(start + marker.length)
}

function emptyBucket(): Bucket {
  return { index: '', notes: '', practice: '', cards: '', test: '', diary: [] }
}

export function loadDiary(): Diary {
  const buckets = new Map<string, Bucket>()
  const bucketFor = (id: string) => {
    const existing = buckets.get(id)
    if (existing) return existing
    const created = emptyBucket()
    buckets.set(id, created)
    return created
  }

  for (const [file, raw] of Object.entries(files)) {
    const relative = relativeContentPath(file)
    if (!relative || relative.startsWith('_template/')) continue
    const dated = /^(.*)\/diary\/(\d{4}-\d{2}-\d{2})\.md$/.exec(relative)
    if (dated) {
      bucketFor(dated[1]).diary.push({ date: dated[2], body: raw })
      continue
    }
    const slash = relative.lastIndexOf('/')
    if (slash === -1) continue
    const id = relative.slice(0, slash)
    const base = relative.slice(slash + 1)
    const bucket = bucketFor(id)
    if (base === 'index.md') bucket.index = raw
    else if (base === 'notes.md') bucket.notes = raw
    else if (base === 'practice.md') bucket.practice = raw
    else if (base === 'flashcards.md') bucket.cards = raw
    else if (base === 'test.md') bucket.test = raw
  }

  const topics = [...buckets.entries()]
    .filter(([, bucket]) => bucket.index)
    .map(([id, bucket]) => {
      const index = parseIndex(bucket.index)
      return {
        id,
        title: index.title || id,
        status: index.status,
        partOf: index.partOf,
        related: index.related,
        want: index.want,
        know: index.know,
        sources: index.sources,
        summary: index.summary,
        notes: bucket.notes,
        practice: bucket.practice,
        cards: parseCards(bucket.cards),
        questions: parseTest(bucket.test),
        diary: bucket.diary.sort((a, b) => b.date.localeCompare(a.date)),
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))

  return { config: parseDiaryConfig(diaryText), topics }
}

export function rootTopics(topics: Topic[]) {
  return topics.filter((topic) => !topic.partOf)
}

export function childrenOf(topics: Topic[], id: string) {
  return topics.filter((topic) => topic.partOf === id)
}

export function readingOrder(topics: Topic[]) {
  const ordered: Topic[] = []
  const seen = new Set<string>()
  const visit = (topic: Topic) => {
    if (seen.has(topic.id)) return
    seen.add(topic.id)
    ordered.push(topic)
    for (const child of childrenOf(topics, topic.id)) visit(child)
  }
  for (const topic of rootTopics(topics)) visit(topic)
  for (const topic of topics) visit(topic)
  return ordered
}

export function formatDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  return new Date(year, month - 1, day).toLocaleDateString('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
