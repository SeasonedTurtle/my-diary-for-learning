# My Learning Diary

A personal diary engine. The book stays the same. The pages are what you study.

Open the cover, choose a topic, and read a page written for someone who is new to the idea. Each page can hold notes, a way to practice, flashcards, a short test, and dated lines about what you studied. A main topic can hold subtopics. A connections page shows how the pages link.

Fork the repository to start your own diary. Friends can add pages to a shared fork. Leave the app as it is, and add pages in the same shape.

## Run it

```bash
npm install
npm run dev
```

Open the address the command prints. `npm run check` tells you if a page is missing a piece. `npm run build` makes a static site in `dist`.

## Make the cover yours

Edit `diary.txt`:

```text
Title: My Learning Diary
Owner: Your Name
Cover: A book of what I study
```

Lines that start with `%%` are notes to yourself. The diary does not show them.

## Add a page

Put PDFs and notes in `sources/`. That folder stays on your computer. This repository is public, so a textbook you did not write should not be committed. The published page is your own explanation, and it can name the file.

Three ways to make the page:

1. **Write it yourself.** Copy `content/_template`, or run `npm run new` and answer the questions. Fill in the blanks. The Calculus and Limits folders are filled-in examples. Integrals is only a log.
2. **Ask an assistant to write it.** Say what you want on the page, or what you already know, and point at the PDF. The assistant follows `AGENTS.md`.
3. **Ask an assistant to log what you want to study.** Each item becomes a page marked `to-study`. The lesson is written later.

A page marked `learning` or `studied` needs a summary, notes, practice, at least one flashcard, one test question, and one dated line in `diary/`. A `to-study` page can be only `index.md`.

The guide inside the diary repeats these steps.

## Page files

```text
content/your-topic/index.md
content/your-topic/notes.md
content/your-topic/practice.md
content/your-topic/flashcards.md
content/your-topic/test.md
content/your-topic/diary/2026-10-25.md
```

A subtopic lives inside its topic, for example `content/calculus/limits`, and its `Part of` line is `calculus`.
