export type DiaryConfig = {
  title: string
  owner: string
  cover: string
}

export type IndexData = {
  title: string
  status: string
  partOf: string
  related: string[]
  want: string
  know: string
  sources: string[]
  summary: string
}

export type Card = {
  front: string
  back: string
}

export type Question = {
  prompt: string
  choices: string[]
  answer: string
  why: string
}

export function stripComments(text: string): string
export function meaningfulText(text: string): string
export function isPlaceholderDiary(text: string): boolean
export function parseDiaryConfig(text: string): DiaryConfig
export function parseIndex(text: string): IndexData
export function parseCards(text: string): Card[]
export function parseTest(text: string): Question[]
export function normalizeAnswer(value: string): string
export function answersMatch(given: string, expected: string): boolean
export function slugify(title: string): string
export function escapeHtml(value: string): string
export function renderMarkdown(source: string): string
export function statusLabel(status: string): string
export const STATUSES: string[]
