# REDI case study — English

<!-- English text for case-study.md. Same section IDs and patterns. -->

## Context <!-- case.section.context -->

### Why a teenager's day

After COVID-19, teenagers' daily rhythms were shaken more than adults'. Sleep and sitting time went up; physical activity and social contact went down.

An unbalanced routine leaves marks on both body and mind. Irregular sleep and skipped meals lead to weight problems, and lasting inactivity holds back bone and cardiopulmonary development. At the same time, losing daily routines and relationships gets in the way of psychosocial development.

## Approach <!-- case.section.approach -->

Less effort to log, a clearer reason to log

@defs

- A familiar shape — The logging screen takes the shape of a timetable teenagers already know.
- Areas they log often — Built around the areas that matter most and take up most of a teenager's day.
- A reward in return — Logging is rewarded with a weekly report.

@chips

- Four life areas — Sleep · leisure · study · exercise
- Three emotional indicators — Depression · anxiety · stress

## System <!-- case.section.system -->

Data collection is rewarded with a report

What the sensors record on their own and what users log themselves are combined, converted into four life areas and three emotional indicators, and returned as a weekly report.

@flow

- Passive — Sensors · location, movement, screen use, ambient light || Active — Self-logging · timetable, daily diary, emotions
- [outline] **Four life areas / three emotional indicators** · Translate
- **A weekly report** · Return

## Study <!-- case.section.study -->

A usability study with 8 teenagers after two weeks of logging

@specs

- Participants — **8 teenage girls** // Aged 12–17
- Duration — **Two-week time diary** // 24 hourly cells × 7 days
- Method — **Semi-structured interview + card sorting** // About 40 minutes

## Findings <!-- case.section.findings -->

@stack

- **They wanted interpretation over raw numbers** · 01 · Finding — In every life area, participants marked area-specific interpretation as "helpful" far more often than raw data. => So the screen must — Put interpretation, not numbers and graphs, on the first line. The system carries the burden of interpreting.
- **The preferred summary differed by area** · 02 · Finding — Sleep and study were wanted as daily summaries, exercise and leisure as weekly ones. Sleep and study were about habit, so the daily total mattered; for exercise, what mattered was whether it happened at all that week. => So the screen must — Draw highlights with a different time window per area. One uniform summary and report layout makes interpretation harder.
- **Where the benchmark comes from differed** · 03 · Finding — Exercise and study were judged against personal goals, leisure against an objective recommendation. Participants felt twice a week for 30 minutes was enough exercise, while the recommendation was an hour a day; for leisure, they found it hard to judge the right amount themselves. => So the screen must — Give each area its own baseline, even on the same bar chart. For exercise, the baseline is my goal, not the recommended amount, and the status label is goal reached, not too much.

## Digital phenotypes <!-- case.section.phenotypes -->

@wide

The digital phenotypes collected

- Sensor | User exposure | Feature | Calculation
- GPS | - | - | Every 5 minutes.
- - | N | State (Stationary and Transition) | We estimated the movement speed at each location data sample by calculating its time derivative and then used a threshold speed that defined the boundary between these two states. In this study, we set this threshold to 1 km/h.
- - | N | Location Variance | We defined location variance to measure the variability in a participant’s GPS location. To calculate location variance, we used only the location data of stationary states.
- - | N | Entropy | We defined entropy to measure the variability of the time the participant spent at the location clusters.
- - | N | Normalized Entropy | We defined normalized entropy by dividing the entropy by its maximum value, which is the logarithm of the total number of clusters.
- - | N | Home Stay | Home stay measured the percentage of time a participant spent at home relative to other location clusters. We identified the home cluster with two heuristics: (1) it is among the first to the third most visited clusters, and (2) it is the cluster most visited between 12 a.m. and 6 a.m.
- - | N | Circadian Movement | If a participant left home for work and returned home from work around the same time each day, the circadian movement was high. To calculate it, we used least-squares spectral analysis (the Lomb–Scargle method).
- Accelerometer | N | Activity | We set the accelerometer sampling rate to 5 Hz. To compress the raw data, we only logged aggregated statistics for each 120-second window. The threshold was empirically set to 0.1 m/s².
- - | Y | Step Counter | For each detected step we recorded its timestamp, then computed the total number of steps during nighttime (11 PM–7 AM) and daytime (7 AM–11 PM) per day.
- Camera | N | Ambient Light | The light sensor reading was logged every 2 min. We calculated the average light intensity for each hour. The threshold was empirically set to 1 lux.
- - | Y | EMA | The number of EMAs fired each day varied, but on average 8 EMAs per day were administered.

※ User exposure: Y = shown to the user · N = used only in the background

## case.intro <!-- case.intro -->

A service that collects a teenager's day through two paths, sensors (passive) and self-logging (active), and gives it back as a weekly report.
