import { renderMarkdown } from '../shared/diary-format.mjs'

export function Prose({ text }: { text: string }) {
  const html = renderMarkdown(text)
  if (!html) return null
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
}
