import { Link } from 'react-router-dom'
import { useDiary, usePageTitle } from './diary-context'

export function Guide() {
  const { config } = useDiary()
  usePageTitle(`How to add a page · ${config.title}`)

  return (
    <article className="entry guide">
      <h1>How to add a page</h1>
      <p>
        The diary itself stays fixed. You add pages. A main topic, such as Calculus, can hold subtopics, such as Limits.
        Every page uses the same files, so a person or an assistant can add one without changing the app.
      </p>

      <h2>1. Make the cover yours</h2>
      <p>
        Open <code>diary.txt</code> in the project folder. Change the title, your name, and the line on the cover.
        Lines that start with <code>%%</code> are notes. They are not shown.
      </p>

      <h2>2. Put sources on your computer</h2>
      <p>
        Drop PDFs and notes into the <code>sources</code> folder. They stay on your machine and are not published.
        A textbook you did not write should stay there. The diary page is your own explanation, and it can name that file.
      </p>

      <h2>3. Choose how the page gets written</h2>
      <h3>Write it yourself</h3>
      <p>Copy <code>content/_template</code>, rename the folder, and fill in the blanks. Or, from the project folder, run:</p>
      <pre>npm run new</pre>
      <p>
        It asks for the title, whether this is a main topic or a subtopic, and which page a subtopic belongs to.
        The same files can be edited on the GitHub website.
      </p>
      <h3>Ask an assistant to write the page</h3>
      <p>
        Say what you want on the page, or what you already know, and point at the PDF. The assistant follows{' '}
        <code>AGENTS.md</code>. Someone who knows little gets a page that starts from the beginning. Someone who names
        what they know gets a page that moves past that. The page still gets notes, practice, flashcards, a short test,
        and a dated line.
      </p>
      <h3>Ask an assistant to log what you want to study</h3>
      <p>
        Hand over a list, or the PDFs, and say to log them. Each item becomes a page marked <strong>to study</strong>,
        with the title, the source, and what you said. The lesson waits until you ask for it or write it.{' '}
        <Link to="/open/calculus/integrals">Integrals</Link> is a logged example.
      </p>

      <h2>4. Keep every page in the same shape</h2>
      <pre>{`content/your-topic/index.md
content/your-topic/notes.md
content/your-topic/practice.md
content/your-topic/flashcards.md
content/your-topic/test.md
content/your-topic/diary/2026-10-25.md`}</pre>
      <ul>
        <li>
          <code>index.md</code> holds the title, the status, the parent page, related pages, what you want, what you know,
          the sources, and the summary.
        </li>
        <li>
          <code>notes.md</code> is the useful information. <code>practice.md</code> is how to practice.
        </li>
        <li>
          A card is a <code>Front</code> line and a <code>Back</code> line. A test question is a <code>Prompt</code>,
          optional <code>Choices</code>, an <code>Answer</code>, and a <code>Why</code>.
        </li>
        <li>A diary file is named with the day, then a few sentences about what you studied.</li>
      </ul>
      <p>
        Status <code>to-study</code> can be only the log. Status <code>learning</code> or <code>studied</code> needs the
        summary, notes, practice, at least one card, one test question, and one dated line.
      </p>
      <p>
        The Calculus and Limits pages are filled-in examples. Open <Link to="/open/calculus">Calculus</Link> and compare
        it with <code>content/_template</code>.
      </p>

      <h2>5. Check the shape</h2>
      <pre>npm run check</pre>
      <p>If something is missing or a related page does not exist, the command says what to fix, in plain language.</p>

      <h2>6. Share a diary with friends</h2>
      <p>
        Fork this repository. Change the cover. Add pages with the template, and open a pull request for each new page.
        Leave the app as it is, so every diary stays the same kind of book.
      </p>
    </article>
  )
}
