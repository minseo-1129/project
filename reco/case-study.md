# RECO 케이스 스터디

<!-- 자유 배치 케이스 스터디: `case.section.<id>` 섹션이 파일 순서대로 나옵니다. 작성 형식은 CONTENT_GUIDE.md의 '자유 배치 케이스 스터디'를 참고하세요. -->

## Problem <!-- case.section.problem -->

사회적 처방 과정에서 반복되는 참여·지원·운영의 어려움

사회적 처방은 청년을 예술·스포츠·자원봉사 등 지역사회 활동과 연결하는 비임상적 지원 방식이다. 개인의 필요와 선호, 목표를 고려해 정신건강에 영향을 미치는 일상적·사회적 요인을 함께 다룬다.

개인과 보건의료 체계에 도움이 될 가능성이 있지만, 실제 참여와 운영에는 여러 어려움이 보고된다.

@cards

- 참여 유지 — 첫 연결 이후 청년이 활동을 계속 이어가도록 돕기 어렵다.
- 맞춤형 지원 — 개인의 필요에 맞는 지원을 지속적으로 제공하기 어렵다.
- 운영 부담 — 링크워커의 업무와 행정 부담이 서비스의 폭을 제한한다.

대화형 에이전트는 자연어로 청년의 경험을 묻고 응답할 수 있다는 점에서 효과적인 정신건강 보조 수단으로 여겨진다. 하지만 사회적 처방에 어떻게 통합해야 하는지, 이해관계자가 무엇을 원하는지에 관한 설계 근거는 충분하지 않다. 이에 청년과 링크워커의 관점에서 에이전트의 역할을 탐색했다.

## Research <!-- case.section.research -->

청년 8명과 링크워커 3명이 참여한 디자인 워크숍

@specs

- Participants — **청년 8명 · 링크워커 3명** // 16–25세 사회적 활동 참여 경험자 · 사회적 처방 실무자
- Method — **참여형 디자인 워크숍** // 집단별 1회 진행
- Activities — **여정 그리기 · 컨셉 도출** // 에이전트가 지원할 수 있는 상황과 역할 탐색

## Result <!-- case.section.result -->

두 집단은 사회적 처방의 가치를 인정하면서도, 참여 지속과 운영 어려움을 보고

- 링크워커 | 청년
- **구조적 부담** // 정해진 근무 시간, 행정 업무, 서비스 의뢰 반려 | **물리적 제약** // 비용과 이동 부담, 학교·직장 일정과의 충돌
- **참여 문제** // 활동 중도 이탈, 솔직한 피드백을 듣기 어려움 | **정서적 어려움** // 심리적 피로, 사회적 불안, 잘해야 한다는 압박
- **정서적 장벽** // 평가받는 두려움, 집 밖에 나서는 불안, 낙인 | **소통 공백** // 일관되지 않은 지원, 유의미한 후속 관리 부족
- **자원 공백** // 연령에 맞는 최신 지역 자원 부족 | **탐색의 어려움** // 자원 선택지를 모름, 참여 전 안내 미비
- **관계 불균형** // 서로 다른 역할 기대, 자율성 존중과 안내 사이의 균형 | **낮은 개인화** // 획일적인 지원, 본인의 필요에 대한 인지 부족

## Mapping on the journey <!-- case.section.mapping -->

워크숍에서 나온 열 가지 에이전트 아이디어를 사회적 처방 여정에 배치

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

- [solid] 세션 중심 기능
- [dashed] 대화 없이 작동하는 기능
- [dotted] 지속적 체크인
- [plain] 대화의 질

세션 기록과 자원 관리는 서비스에 필요하지만, 이를 위해 청년과 지속적으로 대화할 필요는 없었다. 반면 목표·관심사·기분·참여 장벽·활동 경험은 세션 사이의 체크인을 통해 계속 파악하고, 이후 링크워커와의 대화에 활용할 수 있었다.

## Traceability <!-- case.section.structure -->

열 가지 아이디어를 시스템 역할로 묶어 체크인 중심의 에이전트 구조로 구체화

@trace 주제 | 아키텍처 역할 | 설계 근거 // 주제 출처 | 청년 | 링크워커

- Check-in Mate => [primary] Check-in Mate · Primary agent — 체크인과 성찰은 한 번에 끝나는 과업보다 지속되는 대화에 가깝다. 이를 중심 흐름으로 두고, 필요한 순간 다른 기능을 연결했다.
- Goal Planner + ^Goal Tracker => [sub] Goal Manager · Sub-agent — 목표를 세우고 점검·조정하려면 이전 대화와 목표 기록을 함께 참고해야 한다. 이를 하나의 목표 관리 역할로 통합했다.
- Activity Connector + ^Activity Recommender => [sub] Activity Connector · Sub-agent — 활동 연결과 추천 모두 개인의 선호·제약·지역 자원을 참고한다. 이를 한 역할로 묶고, 추천에 대한 사람의 검토를 적용할 수 있도록 했다.
- Personal Profiler + ^Interest Bank => [tool] Contextual Profiler · Tool — 프로필 정보는 대화를 주도하지 않도록 별도의 도구에서 관리한다. 대화 중 드러난 관심사와 상황을 반영해 사용자 프로필을 갱신한다.
- Social Companion => [policy] Interaction Policy · System policy — 친근함을 별도 에이전트로 분리하지 않고, 공감적이고 비임상적인 대화 원칙을 모든 기능에 공통으로 적용한다.
- ^Session Logger => [infra] Session Logger · Infrastructure — 세션 기록은 지원의 연속성과 행정 부담 감소에 중요하지만, 이를 위해 청년과 별도 대화를 이어갈 필요는 없다.
- ^Resource Directory => [repo] Resource Directory · Curated repository — 지역 활동 정보는 검증된 자료 목록에서 참조하고, 생성형 응답으로 임의의 자원을 만들어 내지 않도록 설계했다.

- **청년의 자기 인식** · Mechanism 1 — 활동을 돌아보는 대화를 통해 청년이 경험의 의미와 자신의 기분 변화를 스스로 살핀다.
- **정보에 기반한 돌봄** · Mechanism 2 — 청년이 공유에 동의한 활동 경험과 기분·목표·참여 기록을 링크워커가 참고하도록 한다.

## Four paths <!-- case.section.paths -->

기분을 묻는 질문으로 시작해 상황에 따라 나뉘고, 요약문으로 마무리되는 대화

@flow down

- 기분 체크: “오늘 하루는 어땠어?”
- [solid] **세션 성찰** · Session — 링크워커와 세션을 마친 날 // “오늘 세션은 어땠어?” // 링크워커와 세운 계획 확인 · 세션 돌아보기 || [outline] **목표 성찰** · Typical day — 세션, 활동, 과제가 없는 날 // “오늘 목표에 가까워지려고 무엇을 했어?” // 목표를 향한 노력 돌아보기 · 다음 행동 세우기 || [blue] **활동 성찰** · Activity day — 활동이나 과제가 있었던 날 // “활동에 다녀왔어? 무엇이 좋았던 것 같아?” // 활동 경험 · 불참 이유 · 좋고 아쉬웠던 점 || [dashed] **세션 준비** · Before a session — 예정된 세션 전날 // “내일 세션에서 어떤 이야기를 나누고 싶어?” // 세션에 대한 기대 정리 · 진행 상황 돌아보기
- 대화 요약: “오늘 나눈 이야기를 정리했어. 링크워커에게 공유해도 될까?”
