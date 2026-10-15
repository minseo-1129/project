# REDI 케이스 스터디

<!-- 자유 배치 케이스 스터디: `case.section.<id>` 섹션이 파일 순서대로 나옵니다. 작성 형식은 CONTENT_GUIDE.md의 '자유 배치 케이스 스터디'를 참고하세요. -->

## Context <!-- case.section.context -->

### 왜 청소년의 하루였나

코로나 이후 청소년의 생활 리듬은 성인보다 크게 흔들렸다. 수면과 좌식 시간이 늘고, 신체활동과 사회적 교류가 줄었다.

생활 불균형은 신체와 정서 양쪽에 남는다. 불규칙한 수면과 결식은 체중 문제로, 지속된 비활동은 골격·심폐 발달 저해로 이어진다. 동시에 일상과 관계의 단절이 심리사회적 발달을 가로막는다.

## Approach <!-- case.section.approach -->

기록 부담은 줄이고, 기록할 이유는 분명하게

- **친숙한 모양** — 기록 화면을 이미 익숙한 시간표 모양으로 만들었다.
- **자주 기록하는 영역** — 청소년에게 가장 중요하고 지배적인 영역으로 구성했다.
- **돌려받는 보상** — 기록의 보상으로 주간 리포트를 준다.

- **생활 4영역** — 수면 · 여가 · 공부 · 운동
- **정서 3지표** — 우울 · 불안 · 스트레스

## System <!-- case.section.system -->

사용자 데이터 수집에 대한 보상은 리포트로

센서가 알아서 남기는 것과 사용자가 직접 남기는 것을 합쳐, 생활 4영역과 정서 3지표로 환산하고, 주 1회 리포트로 돌려준다.

@flow

- Passive — 센서 · 위치, 움직임, 화면 사용, 주변 조도 || Active — 자기기록 · 시간표, 하루 일기, 정서
- **생활 4영역 / 정서 3지표** · Translate
- **주 1회 리포트** · Return

## Study <!-- case.section.study -->

2주 기록 후 8명 청소년 대상 사용성 평가

- **여자 청소년 8명** · Participants — 만 12–17세
- **2주 연속 시간일지** · Duration — 1시간 단위 24칸 × 7일
- **반구조적 인터뷰 + 카드소팅** · Method — 약 40분

## Findings <!-- case.section.findings -->

@stack

- **수치화 된 원자료보다 해석을 원했다** · 01 · Finding — 참여자들은 모든 생활 영역에서 원자료(raw data)보다 각 영역에 특화된 해석 요인을 압도적으로 자주 "도움됨"으로 분류했다. => So the screen must — 숫자와 그래프가 아니라 해석이 화면의 첫 줄에 와야 한다. 시스템이 해석의 부담을 대신 진다.
- **선호하는 요약 방식이 영역마다 달랐다** · 02 · Finding — 수면과 공부는 일간 요약을, 운동과 여가는 주간 요약을 선호했다. 수면·공부는 습관화가 목적이라 매일의 총량이 중요했고, 운동은 이번 주에 한 번이라도 했는가가 중요했다. => So the screen must — 하이라이트를 영역마다 다른 시간 창으로 그린다. 하나로 통일된 요약 방식과 리포트 구성은 오히려 해석을 어렵게 한다.
- **행동 평가 기준의 소재지가 달랐다** · 03 · Finding — 운동과 공부는 개인 목표를, 여가는 객관적 권장 기준을 선호했다. 운동은 주 2회 30분이면 충분하다고 보았지만 권장 기준은 매일 1시간이었고, 여가는 스스로 적정선을 판단하기 어려워했다. => So the screen must — 같은 막대 차트라도 영역마다 기준선이 달라야 한다. 운동의 기준선은 권장량이 아니라 내 목표이고, 상태 라벨은 과다가 아니라 목표 달성이다.

## Digital phenotypes <!-- case.section.phenotypes -->

@wide

수집한 디지털 피노타입

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

※ User exposure: Y = 사용자에게 보이는 값 · N = 백그라운드에서만 쓰는 값

## 소개 <!-- case.intro -->

청소년의 하루를 센서(패시브)와 자기기록(액티브) 두 경로로 모으고, 모은 것을 주간 리포트로 되돌려주는 서비스.
