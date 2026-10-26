const STATUSES = ['to-study', 'learning', 'studied']

export function stripComments(text) {
  return String(text)
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith('%%'))
    .join('\n')
}

export function meaningfulText(text) {
  return stripComments(text).trim()
}

export function isPlaceholderDiary(text) {
  return stripComments(text).includes('Rename this file to the day you studied')
}

function field(line, label) {
  const match = new RegExp(`^${label}:\\s*(.*)$`).exec(line)
  return match ? match[1].trim() : null
}

function normalizeNone(value) {
  if (!value || value === '-' || value.toLowerCase() === 'none') return ''
  return value
}

function splitList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function parseDiaryConfig(text) {
  const lines = stripComments(text).split(/\r?\n/)
  const read = (label) => {
    for (const line of lines) {
      const value = field(line, label)
      if (value !== null) return value
    }
    return ''
  }
  return {
    title: read('Title') || 'My Learning Diary',
    owner: read('Owner') || 'Your Name',
    cover: read('Cover'),
  }
}

export function parseIndex(text) {
  const lines = stripComments(text).split(/\r?\n/)
  const result = {
    title: '',
    status: '',
    partOf: '',
    related: [],
    want: '',
    know: '',
    sources: [],
    summary: '',
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const summary = field(line, 'Summary')
    if (summary !== null) {
      const rest = summary ? [summary, ...lines.slice(index + 1)] : lines.slice(index + 1)
      result.summary = rest.join('\n').trim()
      break
    }
    if (line.trim().startsWith('- ')) {
      result.sources.push(line.trim().slice(2).trim())
      continue
    }
    const sources = field(line, 'Sources')
    if (sources !== null) {
      if (sources) result.sources.push(...splitList(sources))
      continue
    }
    const title = field(line, 'Title')
    if (title !== null) {
      result.title = title
      continue
    }
    const status = field(line, 'Status')
    if (status !== null) {
      result.status = status
      continue
    }
    const partOf = field(line, 'Part of')
    if (partOf !== null) {
      result.partOf = normalizeNone(partOf)
      continue
    }
    const related = field(line, 'Related')
    if (related !== null) {
      result.related = splitList(related)
      continue
    }
    const want = field(line, 'Want')
    if (want !== null) {
      result.want = want
      continue
    }
    const know = field(line, 'Know')
    if (know !== null) {
      result.know = know
    }
  }

  return result
}

export function parseCards(text) {
  const chunks = stripComments(text).split(/^# Card\s*$/m).slice(1)
  return chunks
    .map((chunk) => {
      const lines = chunk.split(/\r?\n/)
      let front = ''
      const backLines = []
      let inBack = false
      for (const line of lines) {
        if (!inBack) {
          const value = field(line, 'Front')
          if (value !== null) {
            front = value
            continue
          }
        }
        const back = field(line, 'Back')
        if (back !== null) {
          inBack = true
          if (back) backLines.push(back)
          continue
        }
        if (inBack) backLines.push(line)
      }
      return { front, back: backLines.join('\n').trim() }
    })
    .filter((card) => card.front || card.back)
}

export function parseTest(text) {
  const chunks = stripComments(text).split(/^# Question\s*$/m).slice(1)
  return chunks
    .map((chunk) => {
      const lines = chunk.split(/\r?\n/)
      let prompt = ''
      let answer = ''
      const choices = []
      const whyLines = []
      let mode = 'seek'
      for (const line of lines) {
        if (mode === 'why') {
          whyLines.push(line)
          continue
        }
        if (mode === 'choices') {
          if (line.trim().startsWith('- ')) {
            const choice = line.trim().slice(2).trim()
            if (choice && choice !== '-') choices.push(choice)
            continue
          }
          mode = 'seek'
        }
        const promptValue = field(line, 'Prompt')
        if (promptValue !== null) {
          prompt = promptValue
          continue
        }
        if (/^Choices:\s*$/.test(line)) {
          mode = 'choices'
          continue
        }
        const answerValue = field(line, 'Answer')
        if (answerValue !== null) {
          answer = answerValue
          continue
        }
        const whyValue = field(line, 'Why')
        if (whyValue !== null) {
          mode = 'why'
          if (whyValue) whyLines.push(whyValue)
        }
      }
      return { prompt, choices, answer, why: whyLines.join('\n').trim() }
    })
    .filter((question) => question.prompt || question.answer)
}

export function normalizeAnswer(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.。]+$/g, '')
}

export function answersMatch(given, expected) {
  const options = String(expected)
    .split('|')
    .map((option) => normalizeAnswer(option))
    .filter(Boolean)
  const attempt = normalizeAnswer(given)
  return options.some((option) => option === attempt)
}

export function slugify(title) {
  return String(title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inline(value) {
  return value
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*]+)\*(?=$|[\s).,;:])/g, '$1<em>$2</em>')
}

export function renderMarkdown(source) {
  const text = stripComments(source).replace(/\r\n/g, '\n').trim()
  if (!text) return ''
  return text
    .split(/\n{2,}/)
    .map((block) => {
      const rawLines = block.split('\n')
      const lines = rawLines.map((line) => escapeHtml(line))
      if (lines.every((line) => /^- /.test(line))) {
        return `<ul>${lines.map((line) => `<li>${inline(line.slice(2))}</li>`).join('')}</ul>`
      }
      if (lines.every((line) => /^\d+\. /.test(line))) {
        return `<ol>${lines.map((line) => `<li>${inline(line.replace(/^\d+\. /, ''))}</li>`).join('')}</ol>`
      }
      if (lines.length === 1 && /^#{1,3} /.test(lines[0])) {
        const match = /^(#{1,3}) (.*)$/.exec(lines[0])
        const tag = `h${match[1].length + 2}`
        return `<${tag}>${inline(match[2])}</${tag}>`
      }
      return `<p>${lines.map((line) => inline(line)).join('<br>')}</p>`
    })
    .join('')
}

export function statusLabel(status) {
  if (status === 'to-study') return 'To study'
  if (status === 'learning') return 'Learning'
  if (status === 'studied') return 'Studied'
  return status || 'Unlabeled'
}

export { STATUSES }
