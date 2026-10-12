# WINNUS 케이스 스터디

<!-- 블록 순서: Problem → Research → Persona → Insights → Journey → Key decisions → Outcome → Impact → Learnings → Design system -->
<!-- [대괄호]로만 된 항목은 빈칸으로 취급합니다. 필수 블록(Problem·Research·Insights·Key decisions·Outcome)은 빈칸 안내가 보이고, 선택 블록은 내용을 채우면 나타납니다. -->
<!-- 작성 형식은 CONTENT_GUIDE.md의 '케이스 스터디 블록'을 참고하세요. -->

## 문제 한 문장 <!-- case.problem.lead -->

현재 구현은 취향 퀴즈, 태그 탐색, 와인 카드, 기록과 학습의 흐름을 연결합니다. 연구 관련 숫자는 원자료 확인 뒤 포트폴리오에 추가할 수 있습니다.

## 문제를 만든 요인 <!-- case.problem.points -->

[- 요인 — 설명 형식으로 2~4줄]

## 리서치 요약 <!-- case.research.lead -->

2022년 시니어 프로젝트의 인터뷰와 주제분석 코딩 데이터를 다시 읽었습니다. 사람들은 와인을 숫자 눈금이 아니라 **색과 말로** 인지하고 있었습니다.

## 결과 · 막대그래프 <!-- case.research.bars -->

### 맛·향을 인지하는 수단 · PERCEPTION
- 언어: 15
- 색 단서: 11
- 스케일 매트릭스: 1

### 맛 기준 언급량 · TASTE CRITERIA
- 단맛: 17
- 떫은맛: 4
- 신맛: 4
- 무게감: 1

### 추가로 원하는 정보 · ADDITIONAL INFO
- 페어링 푸드: 16
- 상황: 10
- 테이스팅 노트: 8

## 결과 · 큰 숫자 <!-- case.research.numbers -->

[- 87% — 설명 형식, 1~3개]

## 결과 · 표 <!-- case.research.table -->

[- 가설 | 결과 | 데이터]

## 결과 · 인용 <!-- case.research.quotes -->

[- “인용문” — 출처]

## 결과 · 관찰 <!-- case.research.observed -->

[- 관찰한 사실 한 줄씩]

## 결과 · 출처 <!-- case.research.source -->

출처 · WINNUS 2022 인터뷰 코딩 (original-prototype.html). 참여자 수와 조사 방법은 원자료로 확인이 필요합니다.

## 페르소나 이름 <!-- case.persona.name -->

[이름]

## 페르소나 정보 <!-- case.persona.profile -->

[- 나이: 23세]

## 페르소나 한마디 <!-- case.persona.quote -->

[“페르소나의 목소리” — **강조할 부분**]

## 페르소나 목표 <!-- case.persona.goals -->

[- 목표 한 줄씩]

## 페르소나 불편 <!-- case.persona.frustrations -->

[- 불편 한 줄씩]

## 인사이트 <!-- case.insights -->

### 1–5 스케일을 버릴 것
맛을 인지하는 수단으로 스케일 매트릭스는 1회만 언급됐고, 색 단서(11)와 언어(15)가 압도적이었습니다.

### 단맛을 맨 위로
맛 기준 언급량은 단맛 17 · 떫은맛 4 · 신맛 4 · 무게감 1이었습니다.

### 페어링을 먼저, 전문가 노트는 뒤로
추가 정보 요구는 페어링 푸드 16 · 상황 10 · 테이스팅 노트 8이었습니다. 인지 부하 요인 1위는 정보 과다(19)였습니다.

## 저니 요약 <!-- case.journey.lead -->

[계기부터 재사용까지, 이탈이 가장 큰 구간 한 문장]

## 저니 단계 <!-- case.journey.stages -->

[### 단계 · ENGLISH 아래에 - 감정: 기대 · 4 / - 순간: / - 불편: / - 기회:]

## 핵심 결정 <!-- case.decisions -->

### 필요할 때 정보를 펼치기
기존 HTML은 와인 설명을 한 문장과 색 단서로 먼저 제시하고, 상세 정보를 눌러서 열도록 구성합니다. 기록 완료 화면에서는 취향 프로필의 변화를 보여줍니다.
- 이전: [원본에서 어떻게 했는지]
- 이후: [바꾼 뒤 무엇이 달라졌는지]
- 근거: [이 결정을 만든 발견]

## 결과 <!-- case.outcome.lead -->

일상적인 취향 표현으로 와인을 탐색하고, 마신 경험을 기록하는 모바일 서비스 프로토타입.

[확인된 성과가 있다면 근거와 함께 추가해 주세요.]

## 바뀐 것 <!-- case.outcome.changes -->

[- 제거: … / - 추가: … / - 변경: …]

## 최종 화면 · flow.title <!-- case.flow.title -->

화면이 이어지는 이유

## 최종 화면 · flow.body <!-- case.flow.body -->

취향 온보딩·탐색·와인 카드·기록 흐름을 선택해 보세요. 색과 말로 취향을 보여주는 방식, 눌러 펼치는 정보를 살펴볼 수 있습니다.

## 최종 화면 · hero.title <!-- case.hero.title -->

취향 설정부터 와인 카드와 기록까지

## 최종 화면 · hero.body <!-- case.hero.body -->

취향 온보딩·탐색·와인 카드·기록 흐름을 선택해 보세요. 색과 말로 취향을 보여주는 방식, 눌러 펼치는 정보를 살펴볼 수 있습니다.

## 최종 화면 · before.title <!-- case.before.title -->

경험의 시작

## 최종 화면 · before.body <!-- case.before.body -->

결과를 점수가 아니라 이름·색·말로 돌려줍니다. 코딩 결과 1·2번의 직접 적용.

## 최종 화면 · after.title <!-- case.after.title -->

행동 뒤의 장면

## 최종 화면 · after.body <!-- case.after.body -->

기록이 프로필을 어떻게 바꿨는지 즉시 보여줘 다음 회차의 동기를 만듭니다.

## 임팩트 <!-- case.impact -->

[- PUBLICATION: … / - AWARD: … / - METRIC: …]

## 배운 점 <!-- case.learnings -->

[사용자가 어디에서 멈추는지, 설명이 충분한지, 다음 행동이 분명한지 확인할 질문을 작성해 주세요.]

## 디자인 시스템 <!-- case.system.body -->

[팔레트·타입·컴포넌트 원칙을 작성해 주세요. 원본에서 반드시 살린 요소가 있다면 함께 적어 주세요.]

## 디자인 시스템 · 팔레트 <!-- case.system.palette -->

[- `#HEX` 이름 형식으로 한 줄에 하나씩 작성하면 색 칩으로 표시됩니다.]

## 디자인 시스템 · 타입 <!-- case.system.type -->

[- 역할 | 글꼴 | 크기 / 행간]
