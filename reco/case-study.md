# RECO 케이스 스터디

<!-- 자유 배치 케이스 스터디: `case.section.<id>` 섹션이 파일 순서대로 나옵니다. 작성 형식은 CONTENT_GUIDE.md의 '자유 배치 케이스 스터디'를 참고하세요. -->

## Problem <!-- case.section.problem -->

청년 정신건강 문제는 커지고 있지만, 기존 서비스는 청년에게 충분히 닿지 못한다.

사회적 처방은 청년을 예술·스포츠·자원봉사 같은 비임상 지역 자원과 연결하는 정신건강 서비스 모델이다. 개인의 필요와 선호, 목표에 맞춘 돌봄을 지원하고, 건강을 결정하는 더 넓은 요인까지 함께 다룬다.

개인부터 의료 체계까지 여러 수준에서 효과가 있지만, 실제 운영에서는 세 가지 어려움이 반복된다.

@cards

- 참여 유지 — 첫 연결 이후 청년이 활동을 계속 이어가도록 돕기 어렵다.
- 맞춤형 지원 — 개인의 필요와 목표에 맞춘 지원을 꾸준히 제공하기 어렵다.
- 운영 부담 — 링크워커의 업무와 행정 부담이 서비스의 폭을 제한한다.

대화형 에이전트는 정신건강을 이해하는 주된 단서인 자연어로 상호작용할 수 있어 가능성이 크다. 그러나 이해관계자의 필요와, 에이전트를 이 맥락에 어떻게 통합할지에 대한 근거는 부족하다. 이 연구는 청년 사회적 처방에 대화형 에이전트를 통합할 때의 장벽과 이해관계자의 선호를 탐색했다.

## Research <!-- case.section.research -->

청년 8명, 링크워커 3명과 함께한 참여형 디자인 워크숍

@specs

- Participants — **청년 8명 · 링크워커 3명** // 16–25세, 사회 활동 참여 경험 · 사회적 처방 실무자
- Method — **참여형 디자인 워크숍** // 집단별 1회 진행
- Activities — **여정 그리기 · 장벽 짚기** // 에이전트가 도울 수 있는 방식 상상하기

## Result <!-- case.section.result -->

두 집단 모두 사회적 처방의 가치를 인정했지만, 세션 사이에 참여를 이어가는 데 어려움을 겪었다.

- 링크워커 | 청년
- **구조적 부담** // 9시–6시 근무, 행정 업무, 서비스 반려 | **물리적 제약** // 비용, 교통, 학교·직장 일정과의 충돌
- **참여 문제** // 높은 이탈률, 솔직한 피드백을 얻기 어려움 | **정서적 어려움** // 브레인 포그, 피로, 사회 불안, 잘해야 한다는 압박
- **정서적 장벽** // 평가받는 두려움, 집 밖에 나서는 불안, 낙인 | **소통 공백** // 일관되지 않은 지원, 의미 있는 후속 관리 부족
- **자원 공백** // 연령에 맞는 최신 지역 자원 부족 | **탐색 부담** // 선택지를 모름, 참여 전 안내 없음
- **관계의 긴장** // 역할에 대한 기대 차이, 자율과 안내 사이의 균형 | **개인화 공백** // 획일적인 지원, 자신의 필요와 목표를 말하기 어려움

## Mapping on the journey <!-- case.section.mapping -->

열 가지 기대를 여정 위에 놓았다. 세션에 속하는 것과, 세션 사이에 계속 이어져야 하는 것을 나눴다.

### 링크워커

@timeline 세션 1 | 처방 활동 | 세션 2

- 기간 한정 — [solid 1] Session logger // Resource directory // Activity recommender || [solid 3] Session logger // Resource directory // Activity recommender
- 백엔드 — [dashed 1-3] Interest bank
- 정기 체크인 — [dotted 1-3] Goal tracker

### 청년

@timeline 세션 1 | 처방 활동 | 세션 2

- 기간 한정 — [solid 1-2] Activity connector || [note 3] 연결 필요 없음
- 백엔드 — [dashed 1-3] Personal profiler
- 정기 체크인 — [dotted 1-3] Goal planner & Check-in mate
- 톤 — [plain 1-3] Social companion // ~전 구간의 분위기를 정함

@legend

- [solid] 기간 한정 기능
- [dashed] 지속적, 드러나지 않음
- [dotted] 꾸준한 체크인
- [plain] 대화의 질

세션 기록과 자원 목록은 서비스에는 중요했지만 청년과의 대화가 필요하지는 않았다. 두 집단이 세션 사이에 필요로 한 것(목표, 관심사, 기분, 장벽, 활동이 어땠는지)은 꾸준한 대화를 통해서만 드러날 수 있었다.

## Traceability <!-- case.section.structure -->

각 주제를 하나의 아키텍처 역할로 추적하자, 체크인을 중심에 둔 하나의 에이전트로 정리됐다.

@trace 주제 | 아키텍처 역할 | 설계 근거 // 주제 출처 | 청년 | 링크워커

- Check-in Mate => [primary] Check-in Mate · Primary agent — 체크인과 성찰은 정해진 과업이 아니라 계속 이어지는 열린 대화다. 그래서 다른 기능이 드러나는 중심 대화 루프가 된다.
- Goal Planner + ^Goal Tracker => [sub] Goal Manager · Sub-agent — 두 주제 모두 여러 턴의 추론과 목표 기록에 대한 공유 접근이 필요하다. 목표 설정·점검·조정을 상황에 맞게 안내한다.
- Activity Connector + ^Activity Recommender => [sub] Activity Connector · Sub-agent — 두 주제 모두 개인 선호, 제약, 활동 자원을 종합한다. 하나로 묶어 제안을 보여주는 방식에 감독 경계를 둘 수 있다.
- Personal Profiler + ^Interest Bank => [tool] Contextual Profiler · Tool — 개인화는 중요하지만 개인 특성 추적이 대화를 이끌 필요는 없다. 배경에서 실행되며 사용자 프로필을 추출하고 갱신한다.
- Social Companion => [policy] Interaction Policy · System policy — 별도의 ‘동반자 에이전트’는 친근함을 따로 떼어 놓는다. 대신 공감적이고 비임상적인 톤을 모든 상호작용에 담는다.
- ^Session Logger => [infra] Session Logger · Infrastructure — 돌봄의 연속성과 행정 부담 감소로 링크워커가 중요하게 여겼지만, 청년과 직접 대화할 필요는 없다.
- ^Resource Directory => [repo] Resource Directory · Curated repository — 지역 자원은 에이전트가 참조하는 검증된 공유 저장소에 둔다. 개방형 생성에 의존하지 않는다.

- **청년의 자기 인식** · Mechanism 1 — 매일의 성찰로 청년이 기분과 목표를 스스로 살피고, 활동이 어땠는지 의미를 정리한다.
- **정보에 기반한 돌봄** · Mechanism 2 — 동의를 받은 활동 피드백과 기분·목표·참여의 패턴이 시간에 걸쳐 링크워커에게 전달된다.

## Four paths <!-- case.section.paths -->

모든 체크인은 기분에서 시작해 그날의 유형에 따라 갈라지고, 동의를 받은 요약으로 끝난다.

@flow down

- 기분 체크 — “오늘 하루 어땠어?” (1–5 척도 또는 날씨 비유)
- [solid] **세션 성찰** · Session — 링크워커와 세션을 마친 날 // “오늘 세션은 어땠어?” // 합의한 계획과 결과 기록 · 세션 내용 떠올리기 || [outline] **목표 성찰** · Typical day — 세션, 활동, 과제가 없는 날 // “오늘 목표에 가까워지려고 무엇을 했어?” // 목표를 향한 걸음 기록 · 동기와 책임감 유지 || [blue] **활동 성찰** · Activity day — 활동이나 과제가 있었던 날 // “활동에 다녀왔어? 무엇이 좋았고 무엇이 아쉬웠어?” // 기분과 활동의 효과 · 불참 이유 · 좋았던 점과 싫었던 점 || [dashed] **세션 준비** · Before a session — 예정된 세션 전날 // “내일 세션이 있네. 어떤 걸 기대해?” // 기대 정리 · 진행 상황과 피드백 돌아보기
- 요약과 동의 — “오늘 나눈 이야기를 정리했어. 링크워커에게 공유해도 될까?”
