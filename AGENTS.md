# Adding diary pages

The app is fixed. Add pages under `content/`. Do not change the React app, the scripts, or the template format unless a person asks you to change the engine.

Read `content/_template` and copy that shape. Lines starting with `%%` are hidden notes. Do not show them in the diary.

This repository is public. Do not commit files from `sources/`. Do not copy textbook or course passages into a page. Explain in your own words, and name the source file on the Sources list.

After you add or edit pages, run `npm run check` and fix every line it prints.

## Write a page

Use this when a person explains what they want on the page, or what they already know, and points at PDFs or notes in `sources/`.

- If a file cannot be read, say so and use what the person explained.
- Start from what they asked for. If they know little, explain from the beginning. If they name something they already know, skip past that and study the rest.
- Create one folder. A subtopic goes inside its parent folder. `Part of` is the parent id, such as `calculus`. A main topic leaves `Part of` blank.
- Set `Status` to `learning`.
- Fill `index.md` (title, status, parent, related ids that already exist, what they want, what they know, sources, and a beginner summary), `notes.md`, `practice.md`, `flashcards.md`, `test.md`, and one file in `diary/` named with today's date.
- Flashcards are `# Card` blocks with `Front` and `Back`. Test questions are `# Question` blocks with `Prompt`, optional `Choices`, `Answer`, and `Why`. The answer of a multiple-choice question must match one choice. Several accepted short answers can be separated with `|`.
- Related ids must be real page ids. If they want a connection to something that has no page yet, create that page as a `to-study` log instead of inventing a lesson.
- Run `npm run check`.

## Log what they want to study

Use this when they hand you a list, or PDFs, and ask you to log them. Do not write the lesson.

- One folder per item, with only `index.md`.
- `Status: to-study`
- Fill `Title`, `Part of` when they named a parent, `Want`, `Know`, and `Sources`.
- Leave the summary, notes, cards, and test empty.
- Run `npm run check`.

## They want to write it themselves

Run `npm run new` only if they asked for a blank page. Do not fill the page in for them. Point them at `content/_template` and the guide in the diary.
