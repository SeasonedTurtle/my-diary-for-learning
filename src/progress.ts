export type Progress = {
  cards: Record<string, { known: number; total: number }>
  tests: Record<string, { correct: number; total: number }>
}

const KEY = 'learning-diary-progress'

export function readProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { cards: {}, tests: {} }
    const parsed = JSON.parse(raw) as Partial<Progress>
    return {
      cards: parsed.cards ?? {},
      tests: parsed.tests ?? {},
    }
  } catch {
    return { cards: {}, tests: {} }
  }
}

export function writeProgress(progress: Progress) {
  localStorage.setItem(KEY, JSON.stringify(progress))
}
