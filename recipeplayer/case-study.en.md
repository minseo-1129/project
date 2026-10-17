# Recipe Player case study — English

<!-- English text for case-study.md. Keep the field IDs; a section written here replaces the Korean section as a whole. -->

## Problem <!-- case.section.problem -->

Finding a suitable recipe is hard and following it while cooking can be harder

For people living alone who cook at home, both finding a recipe and following it during preparation can be burdensome. Interviews repeatedly surfaced difficulties around searching menus, interpreting measurements and controlling videos while cooking.

@cards

- Scattered channels and recipes — Recipes live across apps, and saved ones end up scattered.
- Search not starting from ingredients — It is hard to find dishes you can make with what is already at home.
- Instructions that don't fit your skill — Units feel unfamiliar, and videos must be paused and replayed.

## Research <!-- case.section.research -->

Interviews with five people living alone, coded by behaviour and feeling.

@stack

### Utterances per coding category · CODED UTTERANCES

- Cooking behaviour: 60
- Recipe references: 37
- App expectations: 26
- Music-app behaviour: 15
- Reasons for not using apps: 13

### Most frequent codes · TOP CODES

- Personalised recipes: 11
- Simple cooking methods: 10
- Recipes that use leftovers: 8
- Hard to measure: 7
- Hard to handle the phone: 5
- Intuitive UI: 4
- Hard to use up leftovers: 4
- Clean UI: 3
- Voice recognition: 1

## Result <!-- case.section.result -->

##### Quote

- “When my hands are dirty mid-cooking, wiping them to touch the phone is a hassle.” — P1 · lives alone
- “The video sweetens it with rice syrup, but I only had sugar, so I was stuck.” — P3 · job seeker
- “I don't really know what one teaspoon means… I couldn't get a feel for measuring.” — P4 · lives alone

##### Observed

@dash

- Ingredients at hand were more than a filter: they were where deciding the menu began.
- People who wanted to skim text and people who preferred clarity of video coexisted.
- Operating screen mid-cooking and interpreting measuring units came up as main issues.

## Persona <!-- case.section.persona -->

@persona

## Insights <!-- case.section.insights -->

1. **Start with what users have, not what they want to eat** — Participants wanted to use leftovers and often chose a dish based on available ingredients. Ingredients should therefore guide discovery.
2. **Let users control how recipes are presented and how quickly they progress** — Some wanted to skim text or images, while others preferred video. Video could remain the default, with steps skipped or replayed at the user’s own pace.
3. **Reduce both screen interaction and the effort of learning units** — Explain quantities using familiar kitchen tools, with simple and visual guidance.

## Storyboard <!-- case.section.storyboard -->

A storyboard from recipe selection to voice-guided cooking

![A storyboard from choosing a menu to cooking, measuring, voice control and saving to a playlist](assets/case-study/storyboard.png)

## Journey <!-- case.section.journey -->

@journey

## Architecture <!-- case.section.outcome -->

Information architecture linking recipe discovery, community, and playlists

![Recipe Player information architecture — home (recipe recommendations, search), community, playlists, profile](assets/case-study/ia.png)

## case.persona.name <!-- case.persona.name -->

Han Seon-woo

## case.persona.profile <!-- case.persona.profile -->

- Age: 23
- Role: University student · second year living alone
- Experience: Keen but not yet skilled; prefers simple dishes
- Browsing: Picks a menu from what is at hand and follows YouTube recipes

## case.persona.quote <!-- case.persona.quote -->

“I want a simple recipe app that **recommends recipes quickly and easily**, so I can sort out home meals!”

## case.persona.goals <!-- case.persona.goals -->

- Find simple, new dishes from what is at home
- Follow the cooking steps at my own pace
- Keep scattered recipes and come back to them

## case.persona.frustrations <!-- case.persona.frustrations -->

- Having to search multiple channels
- Pausing and replaying videos while cooking
- Losing track of saved recipes

## case.journey.lead <!-- case.journey.lead -->

A user journey from recommendations to choosing, cooking and saving

## case.journey.stages <!-- case.journey.stages -->

### From my ingredients · DISCOVER

- Mood: Hopeful
- Moment: Picks food tastes and what is in the fridge, and finds a dish to make today.
- Pain: Has to search several channels over and over for dishes that use the leftovers
- Opportunity: Start browsing from ingredients at hand and taste

### Choose before cooking · CHOOSE

- Mood: Relieved
- Moment: Checks difficulty, time and ingredients, and picks a dish they can actually make.
- Pain: Missing ingredients or an unexpected difficulty sends them back to browsing
- Opportunity: Show what a dish needs up front, including substitutes

### Follow at my own pace · COOK

- Mood: At ease
- Moment: Follows the steps, controls playback and checks measurements in their own tools.
- Pain: Has to touch the screen with wet or dirty hands, and struggles to read exact units
- Opportunity: Auto-play cuts handling; measurements come in familiar units

### Save and share · KEEP

- Mood: Satisfied
- Moment: Saves recipes they liked to a playlist and leaves likes and comments.
- Pain: Recipes saved across many channels are hard to find again
- Opportunity: A playlist flow that keeps and reuses recipes in one place

### Come back · RETURN

- Mood: Hopeful
- Moment: Makes a saved recipe again or checks new recipes from creators they follow.
- Pain: May forget a recipe was saved, or miss new content from creators they like
- Opportunity: Build return visits on the playlist and let users follow list creators
