# CUPPO case study — English

<!-- English text for case-study.md. Same section IDs and patterns. -->

## Concept <!-- case.section.concept -->

One cup, one card

A coffee journal that lays hand-drawn coffee illustrations on a paper texture and treats each landscape card like a frame of film. Restoring the 2023 personal project as an HTML prototype, the values were carried over from the original assets as they were, and only the misaligned hierarchy was tidied.

- **16 screens** · Screens — Launch · onboarding · card feed · gallery · calendar · search · menu choice · recipe custom · save · camera · detail · share · taste report · settings · widget
- **Logging flow** · Flow — Choose menu → customise recipe → save → feed
- **One record** · Record — Date · menu · temperature · milk · syrup · topping · title · memo · time · photo

## Color & type <!-- case.section.color-type -->

Eight colours, four type sizes

Two papers (light and dark), two inks, one film-card fill and two coffee-brown accents. Borders are not a new colour: they derive from currentColor at 20%, so the same rule works in both themes. No rounded corners, no shadows, no gradients: just paper, hairlines and cup drawings.

@system

## Layout <!-- case.section.layout -->

Spacing and frames

- Item | Value
- Screen | 375 × 812 (original screenshots 1125×2436, @3x)
- Side margin | 20 px everywhere: header, cards and tab bar
- Card | 335 × 190 · 16:9 · 1 px hairline · no radius
- Inside the card | Padding 13 / 15 / 12 · three rows (tag, illustration, title)
- Card gap | 16 px
- List header | Sticky, with the paper texture behind it so text never overlaps while scrolling
- Tab bar · status bar | 83 / 44; scrolling happens only in between

## Illustration <!-- case.section.illustration -->

The illustration inventory

Eight menus × two temperatures make the base cups, and the topping choice calls a variant file. Cup drawings are not stored; a rule picks them: `hot/ice + menu`, plus whipped cream (`_wip`) or extra ice (`_ice`). Americano has no whipped variant, so it keeps the base cup.

![Eight menus, hot and iced: Americano, latte, cappuccino, mocha, hot chocolate, caramel cream, matcha latte, strawberry latte](assets/case-study/illustrations.png)

### Variant rule

![Variants: latte → whipped (_wip), iced latte → extra ice (_ice)](assets/case-study/variants.png)

## Components <!-- case.section.components -->

Six components

- **Film card** · 01 — A 16:9 landscape card: tag and date (12 px) on top, title (14 px) and time below. The original #333 card now marks photo records only.
- **Segmented tabs + option tiles** · 02·03 — Temperature · milk · syrup · topping. A selected tile gets a 1 px brown border, a 5% fill and a check in the corner.
- **Tab bar** · 04 — Icons alone were unclear, so only the active tab shows a 10 px label.
- **Bottom sheet** · 05 — Month picker, edit and delete share one sheet spec: paper texture, top handle, 17 px row padding.
- **Tag row · toast · buttons** · 06 — The primary button is a brown fill, the secondary a hairline border. The fill is kept for actions that end a flow, such as save or next.
- **Dark theme** · Dark — The original assets already had dark paper and a dark coffee ring. Ink and paper swap, and only the accent brightens to #C08A5C for contrast.

## Diagnosis <!-- case.section.diagnosis -->

What was fixed from the original: only type, spacing and alignment

- # | Original | Tidied
- 01 | The card title sat bottom-left at 12 px, the same weight as the tag and date | Title 14 px ink at 100%, tag and date 12 px at 45%; the time moves bottom-right to separate the three layers
- 02 | Custom tab names differed by screen (topping / whipped) | Unified as temperature · milk · syrup · topping; whipped cream becomes a topping option
- 03 | Option tiles were empty squares, so the selection was invisible | Brown border + 5% fill + check; the choice shows in the cup illustration at once
- 04 | There was no menu step, so the tag was already set on entry | Two explicit steps: STEP 1 menu, STEP 2 recipe
- 05 | The month header scrolled away, losing the current month | Sticky header on the paper texture; tapping it opens a year–month sheet
- 06 | Three tab icons were ambiguous, and settings lived in two places | A 10 px label on the active tab only; settings reached from the tab bar alone

## New features <!-- case.section.new -->

Added in 2026, all within the existing screen grammar

1. **Photo → background removal** — Only the cup is cut out and placed on the card; the original #333 card becomes the photo card.
2. **Similar-illustration suggestion** — Swap the cut-out photo for a similar cup drawing, keeping the grid's tone.
3. **Monthly taste report** — Favourite combinations, menu mix and iced ratio, computed from the records.
4. **Caffeine flow** — Days above a 400 mg line are coloured brown.
5. **One-tap widget logging** — The three most frequent combinations sit on the home screen and save a full recipe in one tap.

## case.system.palette <!-- case.system.palette -->

- `#F3F3F1` Paper · light
- `#2C2C2B` Paper · dark
- `#1F1F1E` Ink
- `#EDEDEA` Ink · dark
- `#333333` Film dark
- `#8A5A3A` Coffee brown
- `#C08A5C` Brown · dark

## case.system.type <!-- case.system.type -->

- 22 / 300 | Jost · FEBRUARY | Month header
- 20 / 400 | Gowun Dodum · 오후 3시의 리셋 | Record title
- 16 / 400 | Gowun Dodum · 오늘의 커피는? | Body, inputs
- 14 / 400 | Card title · label · button | Mixed
- 12 / 400 | #아메리카노 · 2022.02.10 | Tags, dates, captions (numbers in IBM Plex Mono)

## case.system.body <!-- case.system.body -->

The original typeface was Goyang. With no web-distributable Goyang, Jost replaces it for Latin and numerals and Gowun Dodum for Hangul, keeping the original's geometric round zero and thin strokes.
