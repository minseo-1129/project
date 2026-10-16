# ForMe case study — English

<!-- English text for case-study.md. Keep the field IDs; a section written here replaces the Korean section as a whole. -->

## Context <!-- case.section.context -->

ADHD is the most common mental disorder in childhood, yet most cases never reach diagnosis or treatment.

- 7.2% — prevalence of ADHD in children, the most common mental disorder before adolescence
- <1% — children diagnosed and treated in Korean national health insurance data, less than a fifth of those affected

At the core of ADHD is a deficit in executive function. Children who struggle to set goals, plan, regulate themselves and follow through find it hard to adapt to elementary school, where they must sit still at set times. Teachers often notice first, but the stigma around mental health makes it hard to suggest an assessment to parents.

We used the school as a platform and tested the service in a real setting. The child sets and carries out daily tasks by talking with ForMe, while parents follow along in a monitoring app and teachers on a web page.

- **ForMe · tablet app** · Child — Sets and carries out daily tasks
- **Monitoring app** · Parent — Follows the child's tasks and sends praise
- **Monitoring web** · Teacher — Sees how the class is using it

## Approach <!-- case.section.approach -->

Based on cognitive behavioural therapy (CBT), each promise is split into four steps.

- Step | What happens
- Goal | The child and a parent choose three promises to keep for the week
- Plan | At the promised time, the child tells ForMe what they planned to do
- Do | ForMe walks through each step so the child sees the promise through
- Check | Every night the child talks with ForMe about the promises kept that day

Reading, for example, goes from choosing a book → reading for the set time → saying what they thought → praising themselves.

## Conversation <!-- case.section.conversation -->

Even when the child's answer is wrong or missing, the conversation keeps going with a little more of a hint each time.

@defs mono

- ForMe — “Jiwon! What did we plan to do at this time? Tell me, Jiwon!”
- Correct — “Ding-dong!” and moves on to the next step
- Wrong · no answer · other — “Oh no! We planned to focus on something... can you tell me what it was?”
- Still stuck — Gives a closer hint with a picture of a book

The dialogue scenarios ran on the NAVER CLOVA Chatbot builder. The schedule the child sets triggers the system, so ForMe speaks first at the promised time. It is an Android tablet app left on the desk.

## Task flow <!-- case.section.taskflow -->

How one “read a book” promise runs as a conversation, from the first question to praise

@flow down

- ForMe speaks first — At the promised time, ForMe asks // “Jiwon! What did we plan to do at this time?”
- [solid] **Correct** · Book — “Ding-dong!” and straight to the next step || [dashed] **Wrong · no answer · other** · Hint — “We planned to focus on something…” asks once more, then says “We planned to read a book together”
- Choose a book — “Tell ForMe the name of the book.” // If the child doesn't know, ForMe suggests rereading yesterday's book
- Set the time — “How long did we plan to read?” // The timer is set to what the child says
- Get ready and start — “When you're ready, say ‘ready’!” // A timer runs for the agreed minutes
- [solid] **Time completed** · Done — An end sound, then “Time's up! That's amazing!” || [outline] **Stopped early** · Skip — “Wow, done already? Great job!”
- Look back — “Was the book fun?” // ForMe praises the feeling or learning the child names
- Praise yourself — “Say ‘Jiwon worked really hard!’” // Ends by thanking the child for keeping the promise

※ As the steps progress, the on-screen cue changes from a question mark to a book to a star · Source · Book-reading task dialogue design (Task 19, Lv1)

## Rewards <!-- case.section.rewards -->

Fun for the result, praise for the process.

- **Stars · AR character cards** · Result reward — The child gets a star for each promise kept, and a character card on days every promise is kept. Cards come alive through the AR camera.
- **Parents' voice praise** · Process reward — A praise guide, based on the child's progress and reinforcement praise theory, helps parents record a voice message.

※ Praise activities linked with home raise young children's self-esteem (Jang, 2012), and parents' responses shape positive self-esteem (Coopersmith, 1976).

## Screens <!-- case.section.screens -->

A tablet for the child, a phone for the parent

@hero

![The main screen with today's promises and times, and the parent app's progress view](assets/screens/01-hero.jpg)

![Setting promises — choose three of ForMe's suggestions](assets/screens/02-promises.jpg)

![Doing — carry it out at the set time and finish on your own](assets/screens/03-doing.jpg)

![Checking — stars collected for promises kept](assets/screens/04-stars.jpg)

## Study <!-- case.section.study -->

A six-week randomised controlled study with 132 first graders from 20 elementary schools.

@specs

- Participants — **132 first graders** // 20 schools · 67 intervention, 65 control
- Duration — **6 weeks** // 1–4 promises a day with ForMe
- Measures — **BRIEF · ADHD RS** // rated by parents and teachers, pre and post

@boxed

- 56.2% — average daily promise completion in the intervention group
- 31.8 days — average days, out of 42, with at least one promise completed

#### ADHD symptoms rated by teachers · pre → post

@slope Pre | Post // Intervention (n = 67) | Control (n = 65)

- Inattention — 4.21 2.78 | 3.29 3.68
- Hyperactivity / impulsivity — 3.66 2.48 | 3.06 3.20
- Total ADHD RS — 7.87 5.24 | 6.35 6.88

※ Mean ADHD RS score · lower means fewer symptoms · group × time interaction p < .001 · p = .017 · p = .001 · Park et al., CHI 2024

Symptom scores fell over the six weeks in the intervention group and rose in the control group. Parent-rated executive function (BRIEF) also improved in the intervention group for behavioural regulation (BRI, p = .011) and the global composite (GEC, p = .035).

※ In an earlier eight-week study, children with ADHD, borderline or mild intellectual disability averaged 76.1% usage, with improvements in self-efficacy and ADHD-related symptoms · Doeun et al., 2023

## Follow-up study <!-- case.section.followup -->

We designed a follow-up at a scale of 500, looking at effects at home together with digital biomarkers.

- Item | Details
- Participants | 500 children aged 6–8 and 500 parents, remote
- Duration | 6 weeks of ForMe use at home
- Measures | Pre/post emotional behaviour, depression and anxiety, attention, aggression, self-regulation, parental depression, ego resilience
- Digital biomarkers | Heart rate variability (HRV), eye tracking, voice
