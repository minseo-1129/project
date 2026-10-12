# Editing content and adding projects

**Design lives in Figma; text lives on GitHub.** All ten projects share one layout in `shared/`. Each project folder holds only its own text (`.md`) and settings (`project.json`). There is no build step: commit a `.md` change and refresh the page.

- Design source: [Portfolio Shell Masters v2](https://www.figma.com/design/UM54OetxcnbmbQibK4HqVy)
  - `00 Projects`: project list and the mapping from code to Figma
  - `01 Foundations`: colour, type and grid
  - `02 Components`
  - `03 Prototype masters`: flow, screen, gallery and web
  - `04 Case study masters`
- Code that follows it: `shared/shell.css` (tokens and layout), `shared/shell.mjs` (component structure)

## Which file to edit

| What you want to change | File |
|---|---|
| Project name, one-line summary, role, period, tools, screen descriptions | `<project>/content.md` |
| Case study body (problem, research, decisions, outcome, …) | `<project>/case-study.md` |
| English version | `<project>/content.en.md`, `<project>/case-study.en.md` |
| Preview type, screen order, flows, themes, design system link | `<project>/project.json` |
| Research material | `<project>/docs/` (+ list it in `docs/README.md`) |
| Shared design (applies to every project) | `shared/shell.css`, `shared/shell.mjs` → update Figma as well |

### Recommended workflow (per project)

1. Put the research material in `docs/` (or attach it in a request to Claude).
2. **Fill `case-study.md` in Korean.** A Claude draft is fine to start from; check the numbers and quotes against the source.
3. Fill `content.md`: the intro and screen descriptions.
4. Fill the English files with the same field IDs (a translation draft is fine to start from).
5. Check with `python -m http.server 8000` → `http://localhost:8000/<project>/case-study.html` (add `?lang=en` for English).
6. Commit.

You do **not** need to copy the Figma file for each project. Copy a Figma page and ask for an implementation only in these cases:

- you want a new block that is not in the masters (for example a different chart or a video section);
- you want to change the layout or visuals of a particular project.

In those cases, add the design to `02 Components` / `04 Case study masters` in the Figma file and ask Claude to "apply node X" — the change then reaches every project.

## Basic rules

- Keep the field ID at the end of each heading (`<!-- summary -->`). The heading text itself can be changed. Using the same ID twice is an error.
- A field that contains only `[bracketed text]` counts as **blank**.
  - Required blocks show a blank-field prompt.
  - Optional blocks stay hidden.
- The body supports paragraphs, `**bold**`, `` `code` ``, `[links](docs/a.pdf)` and `- lists`. HTML does not run.
- Do not invent numbers that are not in the data.
- Add an evidence image on its own line: `![Description](assets/case-study/image.png)`. Leave a blank line before and after it. The description becomes the caption, and clicking the image opens the original file.

```md
## One-line summary <!-- summary -->

Write whose task this project helps with, and what that task is.
```

## Case-study blocks (`case-study.md`)

The order is fixed: **Problem → Research → (Persona) → Insights → (Journey) → Key decisions → (Impact) → Outcome → (Design system)**.

Outcome is the closing takeaway: one or two paragraphs of prose, with no screens. Supporting images belong in Key decisions, and screens stay in the prototype. Add a screen to a decision with `- Screen:` only when the decision needs it.

- Blocks in parentheses are optional and appear only when filled in.
- Numbers (`01 · PROBLEM`) are assigned automatically, in display order.

| Block | Field ID | Format |
|---|---|---|
| Problem | `case.problem.lead` | One sentence |
| | `case.problem.points` | `- factor — explanation` |
| Research | `case.research.lead` | Method, participants, hypothesis |
| | `case.research.bars` | `### Chart title · TAG` then `- item: number` |
| | `case.research.numbers` | `- 87% — caption` (up to 3) |
| | `case.research.table` | `- header | header | header` first line, then `- value | value | value` |
| | `case.research.quotes` | `- "quote" — speaker` |
| | `case.research.observed` | `- observation` |
| | `case.research.source` | Source note (one line) |
| Persona (optional) | `case.persona.name` / `profile` / `quote` | Text |
| | `case.persona.goals` / `frustrations` | `- item` |
| Insights | `case.insights` | `### Design rule` then evidence prose |
| Journey (optional) | `case.journey.lead` | One sentence |
| | `case.journey.stages` | `### Stage · EN`, then `- Mood: label · 1–5`, `- Moment:`, `- Pain:`, `- Opportunity:` |
| Key decisions | `case.decisions` | `### Decision title`, prose, `- Before:` `- After:` `- Evidence:` `- Screen: screenID` |
| Impact (optional) | `case.impact` | `- KIND: value` (e.g. `- USABILITY TEST: completion rate 62% → 91%`) |
| Outcome | `case.outcome.lead` | The takeaway, in prose |
| Design system (optional) | `case.system.palette` | `` - `#F3F3F1` name `` |
| | `case.system.type` | `- ROLE | typeface | size` |
| | `case.system.body` | Principles |

- **Research:** fill at least one of bars, numbers, table, quotes or observed. If all are blank, the "add a result" box appears.
- **Labels in English files:** use `Before/After/Evidence/Screen` and `Mood/Moment/Pain/Opportunity` in place of the Korean labels.

## English version

- Turn it on with `?lang=en` or the KO/EN toggle in the top-right corner. The choice is remembered.
- `content.en.md` and `case-study.en.md` use the **same field IDs** as the Korean files.
- Fields that are blank in English fall back to the Korean text. A Korean field that is also a prompt shows the English prompt instead.
- UI labels (section names, buttons) are in the `UI` dictionary at the top of `shared/shell.mjs`.

## `project.json`

| Key | Meaning |
|---|---|
| `type` | `mobile` · `gallery` (KIKETCH, MATHHERO) · `web` (reco, THE LIGHTHOUSE) |
| `layout` | Mobile only. Default `flow` (flow tabs + screen thumbnails); `screen` (whole-screen pills, CUPPO) |
| `flows` | Flow IDs and screen order. Flow and screen names go in `content.md` (`flow.<id>.title`, `screen.<id>.title`) |
| `keyScreens` | Representative screens (kept for reference; the case study no longer shows them) |
| `caseStudy` | `true` shows the "Case study" links on the project list and below the prototype. Leave it out while the case study is being rewritten; the page itself stays reachable at `case-study.html` |
| `themes` | `true` shows the light/dark toggle |
| `designSystem` | File name of the design-system board (shown as a link at the bottom of the Design system block) |

## Adding a new project

1. Create a folder by copying an existing project of the same type (`mobile` / `gallery` / `web`): `index.html`, `case-study.html`, `viewer.html`, `project.json`.
2. Add the screen component (`<Name>Screen.dc.html`) and change `component`, `width`, `height` and `flows` in `project.json`.
3. Copy `content.md` and `case-study.md` (plus the `.en.md` files) and fill them in.
4. Add the folder name to `shared/projects.json`.
5. Run `node --test tests/content.test.mjs`. It checks field IDs, flow links and block formats.

## Running locally

```sh
python -m http.server 8000
```

Open `http://localhost:8000/`. The `file://` method cannot load the md files.

- Responsive widths: 1440 (editorial column 760 / breakout 1120), ≤800 tablet, ≤480 mobile (based on 390).
- In Figma, every master and block is a component set with a `Breakpoint` property (`1440` / `390`). The 390 variants are built from the same components, so editing a shared component updates both widths; layout differences (stacking, padding) live in the 390 variant.
