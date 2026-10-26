import { Link, useParams } from 'react-router-dom'
import { statusLabel } from '../shared/diary-format.mjs'
import { useDiary, usePageTitle } from './diary-context'
import { childrenOf, formatDate, readingOrder } from './loadDiary'
import { Prose } from './Prose'
import { Flashcards, TestReview } from './StudyTools'

export function TopicView() {
  const { topics, config } = useDiary()
  const params = useParams()
  const id = params['*'] ?? ''
  const topic = topics.find((item) => item.id === id)
  const pageTitle = topic ? `${topic.title} · ${config.title}` : config.title
  usePageTitle(pageTitle)

  if (!id) {
    return (
      <article className="entry">
        <h1>Choose a page</h1>
        <p>The contents are on the left. Open a topic, or read how to add one.</p>
        <p>
          <Link to="/guide">How to add a page</Link>
        </p>
      </article>
    )
  }

  if (!topic) {
    return (
      <article className="entry">
        <h1>No page here</h1>
        <p>There is no diary page with that name.</p>
        <p>
          <Link to="/guide">How to add a page</Link>
        </p>
      </article>
    )
  }

  const parent = topics.find((item) => item.id === topic.partOf)
  const children = childrenOf(topics, topic.id)
  const related = topic.related
    .map((relatedId) => topics.find((item) => item.id === relatedId))
    .filter((item) => item !== undefined)
  const pageNumber = readingOrder(topics).findIndex((item) => item.id === topic.id) + 1
  const logged = topic.status === 'to-study'

  return (
    <article className="entry">
      <p className={`kicker status-${topic.status || 'blank'}`}>
        {statusLabel(topic.status)}
        {parent ? (
          <>
            {' '}
            · part of <Link to={`/open/${parent.id}`}>{parent.title}</Link>
          </>
        ) : null}
      </p>
      <h1>{topic.title}</h1>
      {topic.want || topic.know ? (
        <aside className="margin-note">
          {topic.want ? (
            <p>
              <strong>On this page. </strong>
              {topic.want}
            </p>
          ) : null}
          {topic.know ? (
            <p>
              <strong>Already known. </strong>
              {topic.know}
            </p>
          ) : null}
        </aside>
      ) : null}
      <Prose text={topic.summary} />
      {children.length > 0 ? (
        <section>
          <h2>Inside this topic</h2>
          <ul className="plain-list">
            {children.map((child) => (
              <li key={child.id}>
                <Link to={`/open/${child.id}`}>{child.title}</Link>
                <span className={`mini-status status-${child.status}`}>{statusLabel(child.status)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {logged ? (
        <p className="log-note">
          This is logged to study. Notes, practice, cards, and a test are written when you fill them in or ask for the page.
        </p>
      ) : (
        <>
          <section>
            <h2>Useful information</h2>
            <Prose text={topic.notes} />
          </section>
          <section>
            <h2>Practice</h2>
            <Prose text={topic.practice} />
          </section>
          <section>
            <h2>Flashcards</h2>
            <Flashcards key={topic.id} topicId={topic.id} cards={topic.cards} />
          </section>
          <section>
            <h2>Test</h2>
            <TestReview key={topic.id} topicId={topic.id} questions={topic.questions} />
          </section>
        </>
      )}
      <section>
        <h2>Diary</h2>
        {topic.diary.length === 0 ? <p className="quiet">No dated lines yet.</p> : null}
        {topic.diary.map((entry) => (
          <article key={entry.date} className="dated">
            <h3>{formatDate(entry.date)}</h3>
            <Prose text={entry.body} />
          </article>
        ))}
      </section>
      {topic.sources.length > 0 ? (
        <section>
          <h2>Sources</h2>
          <ul>
            {topic.sources.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {related.length > 0 ? (
        <section>
          <h2>Connected topics</h2>
          <ul className="plain-list">
            {related.map((item) => (
              <li key={item.id}>
                <Link to={`/open/${item.id}`}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="page-number">Page {pageNumber}</p>
    </article>
  )
}
