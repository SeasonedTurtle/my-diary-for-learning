import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDiary, usePageTitle } from './diary-context'
import type { Topic } from './loadDiary'

type Point = { id: string; title: string; x: number; y: number }
type Edge = { a: string; b: string; kind: 'parent' | 'related' }

const width = 1000
const height = 420

function layout(topics: Topic[]) {
  const points = new Map<string, Point>()
  const roots = topics.filter((topic) => !topic.partOf)
  const loose = topics.filter((topic) => topic.partOf && !topics.some((parent) => parent.id === topic.partOf))
  const columns = Math.max(roots.length + loose.length, 1)

  function placeRow(row: Topic[], y: number, center: number, span: number) {
    row.forEach((topic, index) => {
      const x = row.length === 1 ? center : center - span / 2 + (index * span) / (row.length - 1)
      points.set(topic.id, { id: topic.id, title: topic.title, x, y })
    })
  }

  roots.forEach((topic, index) => {
    const center = ((index + 1) / (columns + 1)) * width
    const children = topics.filter((item) => item.partOf === topic.id)
    points.set(topic.id, { id: topic.id, title: topic.title, x: center, y: 90 })
    placeRow(children, 280, center, Math.min(640, 320 * Math.max(children.length - 1, 1)))
  })
  placeRow(loose, 280, width / 2, 360)

  const edges: Edge[] = []
  const seen = new Set<string>()
  const add = (a: string, b: string, kind: Edge['kind']) => {
    if (!points.has(a) || !points.has(b) || a === b) return
    const key = [a, b].sort().join('|')
    if (seen.has(key)) return
    seen.add(key)
    edges.push({ a, b, kind })
  }
  for (const topic of topics) {
    if (topic.partOf) add(topic.partOf, topic.id, 'parent')
  }
  for (const topic of topics) {
    for (const related of topic.related) add(topic.id, related, 'related')
  }

  return { nodes: [...points.values()], edges }
}

export function Connections() {
  const { topics, config } = useDiary()
  usePageTitle(`Connections · ${config.title}`)
  const graph = useMemo(() => layout(topics), [topics])

  return (
    <section className="page graph-page" aria-label="Connections">
      <header className="running-head">
        <span>{config.title}</span>
        <Link to="/">Close</Link>
      </header>
      <h1>How the pages connect</h1>
      <p className="legend">
        <span className="legend-parent">A solid line</span> means a page sits inside another.{' '}
        <span className="legend-related">A dashed line</span> is a connection written on the page.
      </p>
      {topics.length === 0 ? <p>There are no pages to connect yet.</p> : null}
      <div className="graph">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="A web of diary pages">
          {graph.edges.map((edge) => {
            const a = graph.nodes.find((node) => node.id === edge.a)
            const b = graph.nodes.find((node) => node.id === edge.b)
            if (!a || !b) return null
            return (
              <line
                key={`${edge.a}-${edge.b}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={edge.kind === 'parent' ? 'edge-parent' : 'edge-related'}
              />
            )
          })}
        </svg>
        {graph.nodes.map((node) => (
          <Link
            key={node.id}
            to={`/open/${node.id}`}
            className="graph-node"
            style={{ left: `${(node.x / width) * 100}%`, top: `${(node.y / height) * 100}%` }}
          >
            {node.title}
          </Link>
        ))}
      </div>
      <h2>In words</h2>
      <ul>
        {graph.edges.map((edge) => {
          const a = topics.find((topic) => topic.id === edge.a)
          const b = topics.find((topic) => topic.id === edge.b)
          if (!a || !b) return null
          const sentence = edge.kind === 'parent' ? `${b.title} sits inside ${a.title}.` : `${a.title} is connected to ${b.title}.`
          return <li key={`${edge.kind}-${edge.a}-${edge.b}`}>{sentence}</li>
        })}
      </ul>
    </section>
  )
}
