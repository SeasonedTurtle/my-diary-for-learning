import { useNavigate } from 'react-router-dom'
import { useDiary, usePageTitle } from './diary-context'
import { rootTopics } from './loadDiary'

export function Cover() {
  const { config, topics } = useDiary()
  const navigate = useNavigate()
  usePageTitle(config.title)

  function open() {
    const first = rootTopics(topics)[0]
    navigate(first ? `/open/${first.id}` : '/guide')
  }

  return (
    <div className="desk">
      <main className="cover-wrap">
        <h1 className="sr-only">{config.title}</h1>
        <div className="cover-book">
          <span className="ribbon" aria-hidden="true" />
          <p className="cover-kicker">Diary</p>
          <div className="cover-plate">
            <p className="cover-title">{config.title}</p>
            <p className="cover-owner">{config.owner}</p>
          </div>
          {config.cover ? <p className="cover-line">{config.cover}</p> : null}
          <button type="button" className="cover-open" onClick={open}>
            Open the diary
          </button>
        </div>
      </main>
    </div>
  )
}
