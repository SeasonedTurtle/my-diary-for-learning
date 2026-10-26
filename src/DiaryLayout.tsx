import { Link, NavLink, Outlet, useMatch } from 'react-router-dom'
import { statusLabel } from '../shared/diary-format.mjs'
import { useDiary } from './diary-context'
import { childrenOf, formatDate, rootTopics, type Topic } from './loadDiary'

function recentEntries(topics: Topic[]) {
  return topics
    .flatMap((topic) => topic.diary.map((entry) => ({ ...entry, topic })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
}

export function ContentsPage() {
  const { topics, config } = useDiary()
  const topicMatch = useMatch('/open/*')
  const activeId = topicMatch?.params['*'] ?? ''
  const roots = rootTopics(topics)
  const loose = topics.filter((topic) => topic.partOf && !topics.some((parent) => parent.id === topic.partOf))
  const recent = recentEntries(topics)

  return (
    <nav className="page page-left" aria-label="Contents">
      <header className="running-head">
        <span>{config.title}</span>
        <Link to="/">Close</Link>
      </header>
      <h2>Contents</h2>
      {topics.length === 0 ? (
        <p>
          This diary has no pages yet. <Link to="/guide">Add the first one.</Link>
        </p>
      ) : null}
      <ol className="toc">
        {roots.map((topic) => (
          <li key={topic.id}>
            <TopicLink topic={topic} activeId={activeId} />
            {childrenOf(topics, topic.id).length > 0 ? (
              <ol>
                {childrenOf(topics, topic.id).map((child) => (
                  <li key={child.id}>
                    <TopicLink topic={child} activeId={activeId} />
                  </li>
                ))}
              </ol>
            ) : null}
          </li>
        ))}
      </ol>
      {loose.length > 0 ? (
        <>
          <h3>Loose pages</h3>
          <ol className="toc">
            {loose.map((topic) => (
              <li key={topic.id}>
                <TopicLink topic={topic} activeId={activeId} />
              </li>
            ))}
          </ol>
        </>
      ) : null}
      {recent.length > 0 ? (
        <section className="recent">
          <h3>Recent lines</h3>
          <ul>
            {recent.map((entry) => (
              <li key={`${entry.topic.id}-${entry.date}`}>
                <Link to={`/open/${entry.topic.id}`}>{formatDate(entry.date)}</Link>
                <span> {entry.topic.title}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="side-links">
        <NavLink to="/connections">Connections</NavLink>
        <NavLink to="/guide">How to add a page</NavLink>
      </p>
    </nav>
  )
}

function TopicLink({ topic, activeId }: { topic: Topic; activeId: string }) {
  return (
    <Link to={`/open/${topic.id}`} aria-current={topic.id === activeId ? 'page' : undefined}>
      <span>{topic.title}</span>
      <span className={`mini-status status-${topic.status}`}>{statusLabel(topic.status)}</span>
    </Link>
  )
}

export function DiaryLayout() {
  const wide = useMatch('/connections')
  return (
    <div className="desk">
      <div className={wide ? 'spread spread-wide' : 'spread'}>
        {wide ? (
          <Outlet />
        ) : (
          <>
            <ContentsPage />
            <section className="page page-right" aria-label="Diary page">
              <Outlet />
            </section>
          </>
        )}
      </div>
    </div>
  )
}
