# ForMe case study — English

<!-- English text for case-study.md. Keep the field IDs; a section written here replaces the Korean section as a whole. -->

## Context <!-- case.section.context -->

ADHD is the most common mental disorder in childhood, yet there is a significant gap in early support and diagnosis

- 7.2% — prevalence of ADHD in children, the most common mental disorder before adolescence
- <1% — children treated in Korean national health insurance data, less than a fifth of the affected

Children with ADHD may find it difficult to set goals, follow plans or regulate their behaviour, which can affect their daily school routines. Teachers may notice changes in everyday behaviour, yet concerns and stigma around diagnosis can make it difficult to recommend seeking support.

The service was deployed through schools and evaluated in a real-world setting. Children used a tablet to plan and complete daily promises with ForMe, while parents and teachers viewed participation through a mobile app and web dashboard.

- **ForMe · tablet app** · Child — Sets and carries out daily promises
- **Monitoring app** · Parent — Follows child's progress and sends praise
- **Monitoring web** · Teacher — Sees how the class is using ForMe

## Approach <!-- case.section.approach -->

Four steps informed by cognitive behavioural therapy (CBT).

- Step | What happens
- Goal | The child and a parent choose three promises to keep for the week
- Plan | At the promised time, the child tells ForMe what they planned to do
- Do | ForMe walks through each step so the child sees the promise through
- Check | Every night the child talks with ForMe about the promises kept that day

## Conversation <!-- case.section.conversation -->

Even when the child's answer is wrong or missing, the conversation keeps going with a little more of a hint each time

@defs mono

- ForMe — “Jiwon! What did we plan to do at this time? Tell me, Jiwon!”
- Correct — “Ding-dong!” and moves on to the next step
- Wrong · no answer — “We planned to focus on something... can you tell me what it was?”
- Still stuck — Gives a closer hint with a picture of a book

The dialogue scenarios ran on the NAVER CLOVA Chatbot builder. The schedule the child sets triggers the system, so ForMe speaks first at the promised time.

#### A sample case of “read a book”: from the first question to praise

@dialog

- What did we plan to do? — **Correct** | Wrong | No answer | Other
- Shall we read a book, then?
- What's the book called? — **Answer** | Refuse | No answer
- How long did we plan to read? — **A time** | Refuse | Other | No answer
- I'll time it for you
- Are you ready? — **Ready** | No answer | Other
- **End sound** | **Stopped early**
- How was the book? — **Answer (A)** | **Feeling (B)** | **Learning (C)** | No answer
- You're doing great! Say it — **Says it** | No answer

※ Blue responses lead to the next step; for the others ForMe gives a hint and asks again · Source · Book-reading task dialogue design (Task 19, Lv1)

## Rewards <!-- case.section.rewards -->

Make completion rewarding and celebrate together

- **Stars · AR character cards** · Result reward — The child gets a star and character cards for each promise kept. Cards come alive through the AR camera.
- **Parents' voice praise** · Process reward — A praise guide, based on the child's progress and reinforcement theory, helps parents record a voice message.

※ Praise activities linked with home raise young children's self-esteem (Jang, 2012), and parents' responses shape positive self-esteem (Coopersmith, 1976).

## Screens <!-- case.section.screens -->

A tablet app for children and a mobile app for parents

@hero

![The main screen with today's promises and times, and the parent app's progress view](assets/screens/01-hero.jpg)

![Setting promises — choose three of ForMe's suggestions](assets/screens/02-promises.jpg)

![Doing — carry it out at the set time and finish on your own](assets/screens/03-doing.jpg)

![Checking — stars collected for promises kept](assets/screens/04-stars.jpg)

## Study <!-- case.section.study -->

A six-week randomised controlled study with 132 first graders from 20 elementary schools

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

## Follow-up study <!-- case.section.followup -->

Follow-up study at a scale of 500, looking at effects at home together with digital biomarkers

- Item | Details
- Participants | 500 children aged 6–8 and 500 parents, remote
- Duration | 6 weeks of ForMe use at home
- Measures | Pre/post emotional behaviour, depression and anxiety, attention, aggression, self-regulation, parental depression, ego resilience
- Digital biomarkers | Heart rate variability (HRV), eye tracking, voice
