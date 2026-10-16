# RECO case study — English

<!-- English text for case-study.md. Same section IDs and patterns. -->

## Problem <!-- case.section.problem -->

Mental health challenges among young people are a significant global concern, yet traditional services often fall short.

Social prescribing connects young people to non-clinical, community-based resources such as arts, sports or volunteering. It supports personalised care that aligns with each person's needs, preferences and goals, and recognises the broader determinants of health.

It offers benefits from individuals to the wider healthcare system, but its implementation keeps meeting three challenges.

@cards

- Sustaining engagement — Keeping young people involved after the first connection is hard.
- Tailored support — Support that fits each person's needs and goals is difficult to provide consistently.
- Operational demands — Link workers' workload and admin limit how far the service can reach.

Conversational agents are promising because they interact through natural language, a primary source for understanding mental health. Yet there is limited evidence on stakeholder needs and on how agents could be integrated into this context. This study explored existing barriers and stakeholder preferences for integrating conversational agents into social prescribing for young people.

## Research <!-- case.section.research -->

A participatory design workshop with 8 young people and 3 link workers

@specs

- Participants — **8 young people · 3 link workers** // aged 16–25 with social-activity experience · social prescribing practitioners
- Method — **Participatory design workshop** // one session per group
- Activities — **Journey mapping · naming barriers** // imagining how an agent could help

## Result <!-- case.section.result -->

Both groups valued social prescribing. Both struggled to keep participation going between sessions.

- Link workers | Young people
- **Systematic burdens** // 9-to-5 hours, admin work, service pushbacks | **Logistical constraints** // Cost, transport, clashes with school or work
- **Engagement issues** // High drop-off; hard to get genuine feedback | **Emotional challenges** // Brain fog, fatigue, social anxiety, pressure to perform
- **Emotional barriers** // Fear of judgement, anxiety about leaving home, stigma | **Communication gaps** // Inconsistent provision, little meaningful follow-up
- **Resource gaps** // Few age-appropriate, up-to-date local resources | **Navigational loads** // Unaware of options; no induction before joining
- **Relational tensions** // Mismatched role expectations; autonomy vs guidance | **Personalisation gaps** // Generic support; hard to name own needs and goals

## Mapping on the journey <!-- case.section.mapping -->

Ten expectations, placed on the journey: which belong to a session, and which need to run between sessions.

### Link workers

@timeline Session 1 | Prescribed activity | Session 2

- Time bounded — [solid 1] Session logger // Resource directory // Activity recommender || [solid 3] Session logger // Resource directory // Activity recommender
- Backend — [dashed 1-3] Interest bank
- Regular check — [dotted 1-3] Goal tracker

### Young people

@timeline Session 1 | Prescribed activity | Session 2

- Time bounded — [solid 1-2] Activity connector || [note 3] No connector needed
- Backend — [dashed 1-3] Personal profiler
- Regular check — [dotted 1-3] Goal planner & Check-in mate
- Tone — [plain 1-3] Social companion // ~sets the tone throughout

@legend

- [solid] Bounded function
- [dashed] Continuous, hidden
- [dotted] Ongoing check-ins
- [plain] Interactional quality

Session logging and resource directories mattered to the service but did not need a conversation with the young person. What both groups needed between sessions — goals, interests, mood, barriers, how an activity felt — could only surface through ongoing dialogue.

## Traceability <!-- case.section.structure -->

Tracing each theme to an architectural role, the expectations collapse into one agent with check-ins at its centre.

@trace Theme(s) | Architectural role | Design justification // Themes from | Young people | Link workers

- Check-in Mate => [primary] Check-in Mate · Primary agent — Check-in and reflection are ongoing, open-ended dialogues rather than discrete tasks, so this forms the main conversational loop through which other features surface.
- Goal Planner + ^Goal Tracker => [sub] Goal Manager · Sub-agent — Both themes need multi-turn reasoning and shared access to goal records, giving adaptive guidance on setting, monitoring and adjusting goals.
- Activity Connector + ^Activity Recommender => [sub] Activity Connector · Sub-agent — Both themes synthesise personal preferences, constraints and activity resources, allowing oversight boundaries to be set on how suggestions are presented.
- Personal Profiler + ^Interest Bank => [tool] Contextual Profiler · Tool — Personalisation matters, but tracking personal attributes need not drive dialogue; it runs in the background, extracting and updating the user profile.
- Social Companion => [policy] Interaction Policy · System policy — A separate “companion agent” would isolate friendliness; instead an empathetic and non-clinical tone is embedded across every interaction.
- ^Session Logger => [infra] Session Logger · Infrastructure — Valued by link workers for care continuity and reduced administrative burden, but requires no direct conversation with the young person.
- ^Resource Directory => [repo] Resource Directory · Curated repository — Community resources are stored in a verified and shared repository that the agents draw on, instead of relying on open-ended generation.

- **Foster youth awareness** · Mechanism 1 — Daily reflection lets young people self-monitor mood and goals and make sense of how activities felt.
- **Enable informed care** · Mechanism 2 — With consent, activity feedback and patterns in mood, goals and engagement reach the link worker over time.

## Four paths <!-- case.section.paths -->

Every check-in starts with mood, branches by the kind of day, and ends with a consented summary.

@flow down

- Mood check — “How was your day?” (1–5 scale or weather analogy)
- [solid] **Session reflection** · Session — After a session with a link worker // “How did the session go for you today?” // Log agreed plans and outcomes · recall session notes || [outline] **Goal reflection** · Typical day — No session, activity or homework // “What did you do today to move closer to your goal?” // Track steps toward goals · sustain motivation and accountability || [blue] **Activity reflection** · Activity day — After an activity or homework // “Did you go to the activity? What went well or didn’t?” // Mood and activity effects · reasons for not attending · likes and dislikes || [dashed] **Session planning** · Before a session — The day before a scheduled session // “You’ve got a session tomorrow. What would you expect?” // Clarify expectations · review progress and feedback
- Summary and consent — “Here’s what we talked about. Is it okay to share this with your link worker?”
