# ORBIT case study — English

<!-- English text for case-study.md. Same section IDs and patterns. -->

## Background <!-- case.section.background -->

People in their 20s recognise the need to manage health, yet service drop-off remains high

@boxed

- 76.8% — of MZ respondents said they need to manage their health
- > 50% — of health-application users drop off within the first month
- 20s — the only age group whose perceived health worsened after COVID-19

※ Sources · Korean health-perception survey, MZ health-management survey and health-app retention data, as cited in the team's research deck.

## Research <!-- case.section.research -->

Participants differed in how ready they were to start and maintain

@quad

- Behavioural stage — Participants were at different stages of starting and maintaining health behaviour.
- Motivation & willpower — Ways of finding motivation and sustaining effort varied by stage
- Assistive devices — Both the use of wearables and how they were used differed by readiness
- Integrated information — Those who already maintained habits wanted information beyond exercise.

Based on the behaviour change stages, participants were grouped into two.

## Literature review <!-- case.section.literature -->

Design considerations drawn from digital health, personalisation and behaviour change research.

@cards

- Digital health — Advances in data collection and analysis have made it possible to use personal health data for tailored support.
- Personalisation — Advances in data collection and analysis have made it possible to use personal health data for tailored support.
- Behaviour change — Transtheoretical Model describes five stages of behaviour change, with different support needed at each stage.

Drawing on the Transtheoretical Model, we differentiated care strategies: consciousness raising, outcome expectancies and self-monitoring for the primary (beginner) group; reinforcement management and self-efficacy for the secondary (experienced) group.

## User mapping <!-- case.section.mapping -->

Five attributes of health habits and motivation

@dots

- Health practice | Everyday | Expert | 15 [25 32] 85*
- Will | Low | High | 15 [63 70] 88*
- Scope | Broad · shallow | Narrow · deep | [5 10] 62 90*
- System role | Prompts action | Recommends | 15 [41 47] 90*
- Agency | Passive | Active | 12 [26 36] 55 88*

※ ● Primary users: beginners · Secondary users: experienced users · blue dot → secondary user (experienced)

The grouped participants became the primary user (beginner); the participant at the expert end became the secondary user (experienced).

## Two users <!-- case.section.users -->

Shared health goals, different starting points

@versus

- **Park Seo-yeon** · Primary · beginner — 29 · office worker // “I need someone beside me who keeps me working out and tracking.” // Goals: Simple health habits I can do every day; Care that bends to my daily routine // Frustrations: Work leaves little time for health; Failing to follow through drains my motivation
- **Kim Jae-min** · Secondary · experienced — 22 · university student // “Is it my method or my habits? Tell me what I can actually do.” // Goals: A professional plan tailored to my goals; Understand why my progress stalls // Frustrations: Nowhere to ask when questions come up mid-workout; Planning and sticking to it alone is hard

## Two flows <!-- case.section.flows -->

Shared assessment leads to two stage-specific experiences.

The flows differ in the effort needed to set goals and log activities, the number of questions asked and the depth of interpretation offered.

@flow

- [outline] Both — Both complete the stage-of-change assessment
- Beginner — Choose one of four preset routines || Advanced — Describe a challenge and set a routine schedule
- Then — **Both flows include a forecast of potential changes**

@cards outline

- Explainable AI — Each AI suggestion explains why it was made and what continued practice might bring, supporting motivation through understanding rather than instructions alone.

## Usability test <!-- case.section.usability -->

Six participants evaluated both flows in a Wizard-of-Oz study

Everyone experienced both prototypes, then completed the SUS and a debrief interview.

@meter inline max=100 mark=68

- Beginner flow: 90.5
- Advanced flow: 86.3

※ SUS 0–100 · white line = 68 benchmark

Both flows scored above the SUS benchmark of 68. The advanced flow scored 96 among experienced participants and 82 among beginners.

- Flow | Beginners · n=3 | Experienced · n=3 | All
- Beginner flow | 90 | 91 | 90.5
- Advanced flow | 82 | **96** | 86.25

## Debrief <!-- case.section.debrief -->

Both groups expected the forecast feature to help them stay motivated

##### Effects participants named

@cards

- **Motivation to stick to the plan** · 01
- **A guide for planning the week** · 02
- **A more objective view of oneself** · 03

- “Imagining a predicted version of myself was what would keep me going.” — Participant · Beginner
- “I would hold a self-set period precisely because the end was visible.” — Participant · Advanced

### What each feature taught us

@split

- **Stage survey** — Beginners preferred being guided through choices; experienced users valued the chance to explain their challenges in detail. The findings supported stage-specific goal-setting. // “Give me options and just lead me at first.”
- **Health logging** — Beginners liked easy metrics such as water and sleep; experienced users liked tracking what they already check. Logging felt like managing health together with the system. // “Logging every day feels like wrapping up my day well.”
- **Comparison** — Beginners preferred simple visuals and comparisons with similar people; experienced users preferred comparisons with their past selves // “Being rated among people like me is really nice.”
- **Forecast** — Both groups valued seeing possible future changes and wanted adjustable forecast periods, such as weekly or monthly views. // “Seeing the change clearly would change my motivation itself.”
- **Content recommendation** — Participants valued suggestions based on their behaviour and goals, rather than browsing history alone, and requested options to save content and receive notifications. // “Not having to search YouTube would be great.”

## case.intro <!-- case.intro -->

Stage-aware health coaching app with different goal-setting and logging features
