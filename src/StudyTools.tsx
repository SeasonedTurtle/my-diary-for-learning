import { useState } from 'react'
import { answersMatch, type Card, type Question } from '../shared/diary-format.mjs'
import { readProgress, writeProgress } from './progress'

export function Flashcards({ topicId, cards }: { topicId: string; cards: Card[] }) {
  const saved = readProgress().cards[topicId]
  const [step, setStep] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<number[]>([])
  const [done, setDone] = useState(false)

  if (cards.length === 0) return <p className="quiet">No cards on this page yet.</p>

  function finish(nextKnown: number[]) {
    const progress = readProgress()
    progress.cards[topicId] = { known: nextKnown.length, total: cards.length }
    writeProgress(progress)
    setKnown(nextKnown)
    setDone(true)
  }

  function mark(remembered: boolean) {
    const nextKnown = remembered ? [...known, step] : known
    const next = step + 1
    if (next >= cards.length) finish(nextKnown)
    else {
      setKnown(nextKnown)
      setStep(next)
      setFlipped(false)
    }
  }

  function again() {
    setStep(0)
    setFlipped(false)
    setKnown([])
    setDone(false)
  }

  if (done) {
    return (
      <div className="study-card">
        <p className="score">
          You knew {known.length} of {cards.length}.
        </p>
        <button type="button" className="ink-button" onClick={again}>
          Practice again
        </button>
      </div>
    )
  }

  const card = cards[step]
  return (
    <div className="study-block">
      {saved ? (
        <p className="quiet">
          Last time you knew {saved.known} of {saved.total}.
        </p>
      ) : null}
      <p className="quiet">
        Card {step + 1} of {cards.length}
      </p>
      <div className="study-card">
        <p className="card-face">{flipped ? card.back : card.front}</p>
        {flipped ? (
          <div className="button-row">
            <button type="button" className="ink-button" onClick={() => mark(true)}>
              I know it
            </button>
            <button type="button" className="ghost-button" onClick={() => mark(false)}>
              Not yet
            </button>
          </div>
        ) : (
          <button type="button" className="ink-button" onClick={() => setFlipped(true)}>
            Turn the card
          </button>
        )}
      </div>
    </div>
  )
}

export function TestReview({ topicId, questions }: { topicId: string; questions: Question[] }) {
  const saved = readProgress().tests[topicId]
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  if (questions.length === 0) return <p className="quiet">No test on this page yet.</p>

  const correctCount = questions.filter((question, index) => answersMatch(answers[index] ?? '', question.answer)).length

  function submit() {
    const progress = readProgress()
    progress.tests[topicId] = { correct: correctCount, total: questions.length }
    writeProgress(progress)
    setSubmitted(true)
  }

  function retry() {
    setAnswers({})
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="study-block">
        <p className="score">
          {correctCount} of {questions.length} correct.
        </p>
        <ol className="review-list">
          {questions.map((question, index) => {
            const attempt = answers[index] ?? ''
            const right = answersMatch(attempt, question.answer)
            return (
              <li key={question.prompt} className={right ? 'verdict-correct' : 'verdict-miss'}>
                <p>{question.prompt}</p>
                <p>{right ? 'Correct.' : 'Not yet.'} {attempt ? `You wrote “${attempt}”.` : 'No answer yet.'}</p>
                <p>Answer: {question.answer.split('|')[0].trim()}</p>
                {question.why ? <p>{question.why}</p> : null}
              </li>
            )
          })}
        </ol>
        <button type="button" className="ink-button" onClick={retry}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <form
      className="study-block"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      {saved ? (
        <p className="quiet">
          Last time: {saved.correct} of {saved.total}.
        </p>
      ) : null}
      <ol className="question-list">
        {questions.map((question, index) => (
          <li key={question.prompt}>
            <fieldset>
              <legend>{question.prompt}</legend>
              {question.choices.length > 0 ? (
                question.choices.map((choice) => (
                  <label key={choice} className="choice">
                    <input
                      type="radio"
                      name={`${topicId}-${index}`}
                      value={choice}
                      checked={answers[index] === choice}
                      onChange={() => setAnswers((current) => ({ ...current, [index]: choice }))}
                    />
                    <span>{choice}</span>
                  </label>
                ))
              ) : (
                <input
                  className="written-answer"
                  aria-label="Your answer"
                  autoComplete="off"
                  value={answers[index] ?? ''}
                  onChange={(event) => setAnswers((current) => ({ ...current, [index]: event.target.value }))}
                />
              )}
            </fieldset>
          </li>
        ))}
      </ol>
      <button type="submit" className="ink-button">
        Check answers
      </button>
    </form>
  )
}
