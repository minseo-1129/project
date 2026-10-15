# ORBIT case study — English

<!-- English text for case-study.md. Same section IDs and patterns. -->

## Background <!-- case.section.background -->

People in their 20s say they need health care, and then drop the apps built for it.

- 76.8% — of MZ respondents said they need to manage their health
- > 50% — of health-application users drop off within the first month
- 20s — the only age group whose perceived health worsened after COVID-19

※ Sources · Korean health-perception survey, MZ health-management survey and health-app retention data, as cited in the team's research deck.

## Research <!-- case.section.research -->

Interviews surfaced that user readiness matters.

- **Behavioural stage** — Participants differed in where they stood on changing their behaviour.
- **Motivation & willpower** — How they pursued motivation and relied on willpower varied.
- **Assistive devices** — Whether and how they used assistive devices differed.
- **Integrated information** — They wanted information beyond exercise itself.

Using the Stages of Change model, participants split in two: beginner and advanced.

## Literature review <!-- case.section.literature -->

Three fields framed the problem: digital health, personalisation and behaviour change.

- **Digital health** — AI's ability to manage and learn from large data makes digital health effective, and lets care adapt as health changes.
- **Personalisation** — Personalisation usually targets content. It should also shape how the user and system interact, so people keep going.
- **Behaviour change** — Health behaviour moves through five stages. The will, level and outside support people need differ at each one.

Strategies from the Transtheoretical Model were split by user: consciousness raising, outcome expectancies and self-monitoring for the primary user; contingency management and self-efficacy for the secondary user.

## User mapping <!-- case.section.mapping -->

Placed on five attributes, participants grouped into two user types.

- Attribute | Scale | Primary · beginner | Secondary · experienced
- Health practice | Everyday ↔ Expert | Everyday end | Expert end
- Will | Low ↔ High | Fairly high | Highest
- Scope | Broad · shallow ↔ Narrow · deep | Broad and shallow | Narrow and deep
- System role | Prompts action ↔ Recommends | In between | Recommends
- Agency | Passive ↔ Active | Passive to middle | Active

The grouped participants became the primary user (beginner); the participant at the expert end became the secondary user (experienced).

## Two users <!-- case.section.users -->

Same goal, different starting points.

- - | Primary · beginner | Secondary · experienced
- Who | **Park Seo-yeon** · 29 · office worker | **Kim Jae-min** · 22 · university student
- Quote | “I need someone beside me who keeps me going.” | “Is it my method or my habits? Tell me what I can actually do.”
- Goals | Simple health habits I can do every day. Care that bends to my daily routine. | A professional plan tailored to my goals. Understand why my progress stalls.
- Frustrations | Work leaves little time for health. Failing to follow through drains my motivation. | Nowhere to ask when questions come up mid-workout. Planning and sticking to it alone is hard.

## Two flows <!-- case.section.flows -->

Same question, different depth.

The two flows differ in what it takes to set a goal and track behaviour: the number of questions asked and the depth of interpretation.

@flow

- Both — Answer the same five-stage question
- Beginner — Picks one routine from four predefined options || Advanced — Describes what is stalling and configures a schedule
- Then — **Both meet the forecast**

- **Explainable AI** — Each suggestion explains why it was made and what to expect by keeping the health behaviour, so users stay motivated by understanding, not by being told.

## Usability test <!-- case.section.usability -->

Wizard of Oz · 6 participants · both flows each

Everyone experienced both prototypes, then completed the SUS and a debrief interview.

@meter max=100 mark=68

- Beginner flow: 90.0
- Advanced flow: 86.3

※ SUS 0–100 · white line = 68 benchmark

Both flows scored well above the 68 benchmark. Split by group, each flow did best with the people it was built for: experienced users gave the advanced flow 96, while beginners gave it 82.

- Flow | Beginners · n=3 | Experienced · n=3 | All
- Beginner flow | 90 | 91 | 90
- Advanced flow | 82 | **96** | 86.25

## Debrief <!-- case.section.debrief -->

The forecast was the only feature both user types rated highly on usefulness and effectiveness.

### Effects participants named unprompted

- **Motivation to stick to the plan** · 01
- **Planning their week around it** · 02
- **Seeing themselves objectively** · 03

- “Imagining a predicted version of myself was what would keep me going.” — Participant · Beginner
- “I would hold a self-set period precisely because the end was visible.” — Participant · Advanced

### What each feature taught us

1. **Stage survey · goal setting** — Beginners wanted to be led through choices; experienced users valued room to explain their problem. Asking about stage first made the app feel open to everyone. // “Give me options and just lead me at first.”
2. **Health logging** — Beginners liked easy, familiar metrics such as water and sleep instead of body fat; experienced users liked tracking what they already check. Logging felt like managing health together with the system. // “Logging every day feels like wrapping up my day; that would keep me going.”
3. **Comparison** — Beginners preferred simple visuals and comparison with people like them; experienced users preferred comparing against their past selves. // “Being rated among people like me is really nice.”
4. **Forecast** — Both groups rated it highly. They asked to see change over longer, adjustable periods, weekly or monthly. // “Seeing the change clearly would change my motivation itself.”
5. **Content recommendation** — Participants liked that recommendations draw on their own behaviour and goals, not just what they viewed recently. They asked for saving and notifications. // “Not having to search YouTube would be great.”

## case.intro <!-- case.intro -->

A stage-aware health coaching app for Android.
