# REDI case study — English

<!-- English text for case-study.md. Same section IDs and patterns. -->

## Context <!-- case.section.context -->

##### Adolescent mental health and emotional difficulties

Following COVID-19, adolescents’ daily routines were disrupted more than adults’. Sleep and sedentary time increased, while physical activity and social contact declined.

Disrupted routines can affect both physical and emotional wellbeing. Irregular sleep, missed meals and prolonged inactivity may be linked to physical health concerns, while disruptions to daily life and relationships can also affect psychosocial development.

## Approach <!-- case.section.approach -->

Less effort to log, a clearer reason to log

@defs

- A familiar shape — A familiar timetable-and-diary layout for recording daily activities
- Areas they log often — Four areas of daily life that youth want to track and manage
- A reward in return — Weekly summaries help make the value of everyday logging visible

@chips

- Four life areas — Sleep · leisure · study · exercise
- Three emotional indicators — Depression · Anxiety · Stress

## System <!-- case.section.system -->

Collected data returned to users in a weekly report

Automatically collected sensor data and users’ own entries are analysed together and presented across four areas of daily life and three emotional indicators in a weekly report.

@flow

- Passive — Sensors · location, movement, screen use, ambient light || Active — Self-logging · timetable, daily diary, emotions
- [outline] **Four life areas / Three mood areas** · Translate
- **A weekly report** · Return

## Study <!-- case.section.study -->

A usability study with 8 teenagers after two weeks of logging

@specs

- Participants — **8 adolescents** // Aged 12–17
- Duration — **Two-week time diary** // 24 hourly cells × 7 days
- Method — **Interview + card sorting** // About 40 minutes

## Findings <!-- case.section.findings -->

@stack

- **Interpretation over raw numbers** · 01 · Finding — In every life area, participants more often marked area-specific interpretations as helpful than raw, numerical data. => So the screen must — Lead with an interpretive sentence rather than a number or chart, helping users understand what their records mean.
- **Preferred summary differed by area** · 02 · Finding — Sleep and study were wanted as daily summaries, exercise and leisure as weekly ones. Sleep and study were about habit, so the daily total mattered; for exercise, what mattered was whether it happened at all that week. => So the screen must — Choose time frames and comparison criteria that fit each activity instead of giving every area the same report structure.
- **Comparison benchmark depended on the activity** · 03 · Finding — Exercise and study were judged against personal goals, leisure against an objective recommendation. Participants felt twice a week for 30 minutes was just enough; for leisure, they found it hard to judge the right amount themselves. => So the screen must — Use an activity-specific benchmark. For exercise, show progress towards a personal goal rather than treating more activity as excessive

## Digital phenotypes <!-- case.section.phenotypes -->

Digital phenotyping measures collected

#### GPS

@defs

- **State (Stationary and Transition)** · Background — We estimated the movement speed at each location data sample by calculating its time derivative and then used a threshold speed that defined the boundary between these two states.
- **Location Variance** · Background — We defined location variance to measure the variability in a participant’s GPS location. To calculate location variance, we used only the location data of stationary states.
- **Entropy** · Background — We defined entropy to measure the variability of the time the participant spent at the location clusters.
- **Normalized Entropy** · Background — We defined normalized entropy by dividing the entropy by its maximum value, which is the logarithm of the total number of clusters.
- **Home Stay** · Background — Home stay measured the percentage of time a user spent at home relative to other location clusters. We identified the home cluster with two heuristics: (1) it is among the first to the third most visited clusters, and (2) it is the cluster most visited between 12 a.m. and 6 a.m.
- **Circadian Movement** · Background — If a user left home for work and returned home from work around the same time each day, the circadian movement was high. To calculate it, we used least-squares spectral analysis (the Lomb–Scargle method).

#### Accelerometer

@defs

- **Activity** · Background — We set the accelerometer sampling rate to 5 Hz. To compress the raw data, we only logged aggregated statistics for each 120-second window. The threshold was empirically set to 0.1 m/s².
- **Step Counter** · User-facing — For each detected step we recorded its timestamp, then computed the total number of steps during nighttime (11 PM–7 AM) and daytime (7 AM–11 PM) per day.

#### Camera

@defs

- **Ambient Light** · Background — The light sensor reading was logged every 2 min. We calculated the average light intensity for each hour. The threshold was set to 1 lux.

#### Self-report

@defs

- **EMA** · User-facing — The number of EMAs fired each day varied, but on average 8 EMAs per day were administered.

※ User-facing = shown to the user in the app · Background = used only for analysis

## case.intro <!-- case.intro -->

A service that combines sensor data and self-reported diaries into weekly views
