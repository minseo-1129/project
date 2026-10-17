# RECO case study — English

<!-- English text for case-study.md. Same section IDs and patterns. -->

## Problem <!-- case.section.problem -->

Implementation challenges in youth social prescribing

Social prescribing connects young people with non-clinical activities in their communities, including arts, sports and volunteering. It considers personal needs, preferences and goals alongside the everyday and social factors affecting mental health.

Although social prescribing has the potential to benefit individuals and healthcare services, difficulties remain in participation and delivery.

@cards

- Sustaining engagement — Supporting young people to continue activities after the initial referral
- Tailored support — Maintaining resource and support that responds to each person’s needs
- Operational demands — Link workers’ workloads and role duties constrain service provision

Conversational agents are promising because they interact through natural language, a primary source for understanding mental health. Yet there is limited evidence on stakeholder needs and on how agents could be integrated into this context. This study explored existing barriers and stakeholder preferences for integrating conversational agents into social prescribing for young people.

## Research <!-- case.section.research -->

Participatory design workshopss with eight youth and three link workers

@specs

- Participants — **8 young people · 3 link workers** // aged 16–25 with social-activity experience · Trust workers
- Method — **Participatory design workshops** // one session per group
- Activities — **Journey mapping · Concept Ideations** // Exploring situations and roles in which an agent might help

## Result <!-- case.section.result -->

Both groups valued social prescribing, while reporting difficulties with sustained participation and delivery

- Link workers | Young people
- **Systematic burdens** // 9-to-5 hours, admin work, service pushbacks | **Logistical constraints** // Cost, transport, clashes with school or work
- **Engagement issues** // High drop-off; hard to get genuine feedback | **Emotional challenges** // Fatigue, social anxiety, pressure to perform
- **Emotional barriers** // Anxiety about leaving home and stigma | **Communication gaps** // Inconsistent provision, no timely follow-up
- **Resource gaps** // Few current, age-appropriate local services | **Navigational loads** // Not knowing what is available
- **Relational tensions** // Balancing autonomy with guidance | **Personalisation gaps** // Generic support; hard to recognise own needs

## Mapping on the journey <!-- case.section.mapping -->

Ten agent concepts mapped onto the social prescribing journey

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

Session logging and resource management are necessary to the service but do not require ongoing conversations with young people. Goals, interests, mood, barriers and activity experiences, by contrast, can be followed through regular check-ins and then inform conversations with link workers.

## Traceability <!-- case.section.structure -->

Each theme informed a role in the system, leading to one agent centred on check-ins.

@trace Theme(s) | Architectural role | Design justification // Themes from | Young people | Link workers

- Check-in Mate => [primary] Check-in Mate · Primary agent — Check-in and reflection are ongoing, open-ended dialogues rather than single task. This forms the main conversational loop through which other features surface.
- Goal Planner + ^Goal Tracker => [sub] Goal Manager · Sub-agent — Both themes need multi-turn reasoning and shared access to goal records, giving adaptive guidance on setting, monitoring and adjusting goals.
- Activity Connector + ^Activity Recommender => [sub] Activity Connector · Sub-agent — Both themes synthesise personal preferences, constraints and activity resources, allowing oversight boundaries to be set on how suggestions are presented.
- Personal Profiler + ^Interest Bank => [tool] Contextual Profiler · Tool — A separate tool maintains profile information without driving the conversation, updating interests and circumstances as they emerge in dialogue.
- Social Companion => [policy] Interaction Policy · System policy — Rather than creating a companion agent, empathetic and non-clinical conversational principles apply as policy.
- ^Session Logger => [infra] Session Logger · Infrastructure — Session records support continuity of care and reduce administrative work without requiring direct dialogue.
- ^Resource Directory => [repo] Resource Directory · Curated repository — The agent refers to a verified directory of local activities rather than generating resources without a reliable source.

- **Foster youth awareness** · Mechanism 1 — Daily reflection lets young people self-monitor mood and goals and make sense of how activities felt.
- **Enable informed care** · Mechanism 2 — With consent, activity feedback and patterns in mood, goals and engagement reach the link worker over time.

## Four paths <!-- case.section.paths -->

Every check-in starts with mood, branches by the day's context, and ends with a summary shared with the user's consent

@flow down

- Mood check — “How was your day?” (1–5 scale or weather analogy)
- [solid] **Session reflection** · Session — After a session with a link worker // “How did the session go for you today?” // Review agreed plans and the session experience || [outline] **Goal reflection** · Typical day — No session, activity or homework // “What did you do today to move closer to your goal?” // Track steps toward goals · sustain motivation and accountability || [blue] **Activity reflection** · Activity day — After an activity or homework // “Did you go to the activity? What went well or didn’t?” // Activity effects · reasons for not attending · likes and dislikes || [dashed] **Session planning** · Before a session — The day before a scheduled session // “You’ve got a session tomorrow. What would you expect?” // Clarify expectations · review progress and feedback
- Summary and consent — “Here’s what we talked about. Is it okay to share this with your link worker?”
