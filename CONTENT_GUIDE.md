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
| Project name, one-line summary, role, period, tools or organisation (`org`, shown instead of tools when filled), screen descriptions | `<project>/content.md` |
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
- Add an evidence image on its own line: `![Description](assets/case-study/image.png)`. Leave a blank line before and after it. The description becomes the caption.

```md
## One-line summary <!-- summary -->

Write whose task this project helps with, and what that task is.
```

## Case-study blocks (`case-study.md`)

The order is fixed: **Problem → Research → (Persona) → Insights → (Journey) → Key decisions → (Impact) → Outcome → (Design system)**.

Outcome is the closing takeaway: one or two paragraphs of prose, with no screens. It stays hidden until it is written. Supporting images belong in Key decisions, and screens stay in the prototype. Add a screen to a decision with `- Screen:` only when the decision needs it.

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

## Free-layout case studies (`case.section.*`)

A case study can instead follow its own layout, like the frames on the Figma page `05 · Case studies`. As soon as `case-study.md` contains a `case.section.<id>` field, the page shows only those sections, in file order, numbered automatically. The heading text becomes the block label.

```md
## Market <!-- case.section.market -->

The first paragraph is the section's lead sentence.
```

Inside a section, each blank-line-separated block is read like this:

| Write | Shows as |
|---|---|
| A paragraph | The first one is the lead; later ones are body text |
| `### Small heading` | A small blue heading (above a chart it becomes the chart title; `Title · TAG` adds a tag) |
| `- name: 19` lines | A bar chart |
| `- 87% — caption — source` | Big numbers (the value must be short and contain a digit) |
| `- “quote” — speaker` | Quotes |
| `- a \| b \| c` lines | A table; the first line is the header, `-` leaves a cell empty |
| `- **Title** · tag — text // second line` | Cards (`·` tag and `//` line breaks are optional) |
| `1. **Title** — text` | A numbered list |
| `![Caption](assets/…)` | An image; consecutive images form a two-column gallery |
| `@persona` / `@journey` / `@system` | The persona, journey or design system written in the `case.persona.*` / `case.journey.*` / `case.system.*` fields (`case.persona.photo` adds a portrait) |
| `@wide` | Lets the section use the wide 1120 column |
| `#### Heading` | A bold dark sub-heading |
| `※ note` | A small mono caption (sources, legends) |
| `- **Title** · tag — text => **Goal** · tag — text` | A card leading to a dark card (requirement → goal, problem → response) |
| `- **Title** · tag — text >> **87%** caption` | Card rows with an aside on the right |
| `1. **Title** — ![…](…) // text // Input · … // Output · … // Basis · …` | A row with an image beside it, input/output boxes and a caption |
| A card line that is only `**82%**` | Shown as a big figure inside the card |

A line on its own before a list changes how that list is drawn:

| Directive | The list below becomes |
|---|---|
| `@columns` | A vertical column chart (`- 2002: 8조`) |
| `@rows` | Rows with a source on the right (`- headline — outlet · date`) |
| `@meter` (`max=100 mark=68` optional) | Value bars with the figure on the right (`- name: 9,600만 원 — caption`) |
| `@flow` / `@flow down` | Boxes joined by arrows; ` \|\| ` puts boxes side by side in one step; the last step is dark |
| `@lanes` | Journey lanes (`- **Stage** — “thought” // → feature`) |
| `@canvas` | A business model canvas (nine cards in the usual order) |
| `@timeline A \| B \| C` | A lane diagram on a timeline: `- Lane — [solid 1] text // ~caption \|\| [dashed 1-3] text` (spans 1, 2, 3, 1-2, 2-3, 1-3, or h1/h2 for halves; styles solid, dashed, dotted, bold, plain, muted, note); two or more consecutive timelines become capsule tabs, shown one at a time |
| `@flow row` | A row of boxes without arrows (box styles `[solid]`, `[outline]`, `[blue]`, `[dashed]` work in any flow) |
| `@dialog` | A conversation diagram: `- Line — **forward** \| other` puts the agent's line in a dark box with the responses beside it; bold responses (blue) lead on. A line alone has no responses; `**a** \| **b**` alone is a pair of events |
| `@stack` | Pairs stacked vertically, or images one per row instead of a gallery |
| `@meter inline` | Bars with the value inside; the first row is dark, the rest blue |
| `@quad` | Labelled cards (`- Strength — …`) in a 2×2 grid (SWOT, four findings) |
| `@boxed` | Big figures in outlined boxes (`- 76.8% — caption`) |
| `@cards` / `@cards outline` | Equal-width cards; labelled lines (`- Label — text`) get a bold title |
| `@defs` / `@defs mono` | Definition rows: label on the left, text on the right (`mono` for quotes or dialogue) |
| `@chips` | Groups of chips: `- Group — chip, chip, chip` |
| `@specs` | Spec columns: `- Label — **value** // note` |
| `@dots` | Dot plot: `- Attribute \| left \| right \| 15 [25 32] 85*` (numbers 0–100, `[a b]` a grouped range, `*` the highlighted dot) |
| `@versus` | Two side-by-side persona columns: `- **Name** · tag — profile // “quote” // Goals: a; b // Frustrations: a; b` |
| `@split` | Rows with a bold title on the left and text plus a quote on the right |
| `@hero` | Gallery whose first image spans the full width |
| `@legend` | A line-style key: `- [solid] label` (solid, dashed, dotted, bold, plain, muted) |
| `@trace Theme(s) \| Role \| Justification // Themes from \| Group A \| Group B` | A traceability table: `- Theme + ^Theme => [primary] Role · Primary agent — justification` (`^` marks a Group B theme; role styles primary, sub, tool, policy, infra, repo) |
| `@slope Pre \| Post // Group A \| Group B` | Pre/post slope charts, one per row: `- Measure — 4.21 2.78 \| 3.29 3.68` (Group A is highlighted, Group B dashed) |
| `@dash` | A plain list with an em dash before each line (Observed) |
| `@stack` before a chart | Stacks the bar charts full width, one per row |

`### Label` is a small mono sub-heading and `##### Label` the large one (Quote, Observed). Numbered `**Title** — text` rows read as insights, with lines only between rows. Table cells accept ` // ` for a line break, and every column of a table has the same width. A gallery of three images becomes a mosaic (the first image spans two rows). Journey maps sit in the text column, show two stages at a time and scroll with arrows.

### Prototype page options

`"showDetail": false` in `project.json` shows only the web prototype, without the screen title, CONTEXT / DECISION and extra links (used by The Lighthouse and RECO).

`"galleryLayout": "side"` shows a gallery's description first, then the screen on the left and the scene list on the right (Kiketch). `"frameHeight"` sets a web prototype's height in px (RECO). `"frameHide"` lists selectors hidden inside a static prototype and `"frameControls"` names its control rows, which are mirrored above the prototype; `"frameLabels"` renames those buttons, e.g. `{"완성": "Default"}` (The Lighthouse). Web and gallery prototypes show their description above the prototype. `"frameAspect": "16/9"` keeps a web or video frame at that ratio instead of a fixed height (Sweetalk). A `statesLabel` field in content.md renames the tab row above a web prototype (e.g. 영상). `"hotspots"` makes static component screens tappable: `{"<screen>" or "*": [{"text": "…", "to": "<screen>", "exact": true}]}` (PICO).

Mobile prototypes show CONTEXT / DECISION once above the flow tabs, list screens as numbered chips and always open on the first flow.

### Case-study header

`subtitle` and `tagline` in `content.md` appear under the title (without them the summary shows). `case.intro` in `case-study.md` is a large lead line above the first section. `"availability"` in `project.json` sets the pills under the meta row, e.g. `[["prototype", false], ["screens", true], ["case", true]]` (`video` is also available); without it, the pills follow `showPrototype`. The number beside the breadcrumb is the project's position in `shared/projects.json`.

In the English file, write every section in full: a section in `case-study.en.md` replaces the Korean one as a whole.

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
| `showPrototype` | `false` hides the project's prototype from the project list (KIKETCH and MATH HERO, which have no public prototype). A project with neither a prototype nor a published case study is left off the list; the page stays reachable by URL |
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
