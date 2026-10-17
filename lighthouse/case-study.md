# THE LIGHTHOUSE 케이스 스터디

<!-- 자유 배치 케이스 스터디: `case.section.<id>` 섹션이 파일 순서대로 나옵니다. 작성 형식은 CONTENT_GUIDE.md의 '자유 배치 케이스 스터디'를 참고하세요. -->

## Concept <!-- case.section.concept -->

물을 부으면 등대 조명이 켜지고 물결이 생기는 가습기

- **부직포 가습기** · Organic — 플라스틱 디스크 대신 부직포에 스며든 물이 증발하는 원리를 활용한 가습 방식
- **무드등** · Healing — 물을 채우면 등대 조명이 켜지고, 주변 밝기에 따라 빛의 세기가 조절됨
- **등대와 바다** · Nature — 수조 위에 섬과 등대를 배치하고, 잔잔한 물결로 바닷가 풍경을 표현

## References <!-- case.section.references -->

수위와 밝기에 반응하는 조명 사례를 제어 구조로 연결

@cards

- Water Lamp · Witaya Junma — 초음파 센서로 물이 차오르면 LED가 켜지는 전등. 물의 일렁임이 빛과 만나 벽면에 반사. // → 물의 높이를 전원 작동의 조건으로 활용
- Night Light · Egrobotics — 조도 센서로 방이 어두워지면 켜지고 밝아지면 꺼지는 무드등 기능의 램프. // → 스위치와 함께 주변 조도에 따라 밝기를 조절

## Specification <!-- case.section.specification -->

조명과 펌프를 제어하는 두 센서의 동작 조건

- 부품 | 역할 | 동작
- 수위 센서 | 물 주입 감지 | 수위 센서 값이 300 이상이면 조명과 펌프가 켜지고, 300 미만이면 꺼짐. 물 보충 시점을 알 수 있음
- 조도 센서 | 주변 밝기 측정 | 값 200–600을 조명 밝기 1–255로 변환
- 등대 조명 | 무드등 | 따뜻한 노란빛 조명, 수위에 따라 켜지고 주변 밝기에 광량이 조절됨
- 수중 펌프 | 잔잔한 파도 | 육지 모형 아래에 배치
- 토글 스위치 | 전원 on/off | 사용자가 무드등을 켜고 끔
- 전원 | 12V 어댑터 | 외부 전원 공급

## Drawings <!-- case.section.drawings -->

정투상도·회로도·분해도로 정리한 제작 사양

@stack

![SHEET 01 · 정투상 도면 — 정면·단면·평면, 단위 mm](assets/case-study/drawing-01-orthographic.jpg)

![SHEET 02 · 회로 결선도 — Arduino Uno R3, 수위 센서·조도 센서·LED·수중 펌프](assets/case-study/drawing-02-circuit.jpg)

![SHEET 03 · 분해도·부품표 — 부품 12종과 조립 순서](assets/case-study/drawing-03-exploded.jpg)

## 소개 <!-- case.intro -->

가습기의 플라스틱 디스크를 대체하고, 무드등과 잔잔한 물결을 결합해 일상 속 휴식 경험을 제공하는 방식을 탐색함.
