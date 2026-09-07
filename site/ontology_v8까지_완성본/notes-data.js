// notes.html이 "온톨로지 프로젝트 관련 링크와 시행착오" 목록을 렌더링할 때 쓰는 데이터.
// posts-data.js(MY_POSTS)와 동일한 패턴: 새 글을 추가할 때
//   1) ontology/ 바로 아래(notes/ 하위폴더 없이 평평한 구조)에 새 html 파일을 만든다
//      (기존 파일은 건드리지 않음)
//   2) 아래 배열 맨 앞에 새 항목을 추가한다 (최신순 정렬)
//   url은 notes.html과 같은 위치(ontology/) 기준 상대경로 — 파일명만 쓴다

const ONTOLOGY_NOTES = [
  {
    url: "ontology-v9.1~v9.3-trial-and-error.html",
    title: "[내용 확인 필요] 온톨로지 v9.1~v9.3 시행착오",
    date: "2026-09-XX",
    summary:
      "⚠ 이 항목은 자리표시자입니다 — 실제 글 내용을 아직 전달받지 못해 정확한 요약을 쓸 수 " +
      "없습니다. 파일 내용을 알려주시면 제목·날짜·요약·태그를 정확하게 채워드리겠습니다.",
    tags: ["온톨로지", "v9"],
  },
  {
    url: "ontology-v1~v8-trial-and-error.html",
    title: "온톨로지 버전 전체 정리: v1 → v8",
    date: "2026-08-30",
    summary:
      "v1~v8을 스키마 전환기(v1~v3)·정합성 보강기(v4~v5)·사실 검증 및 불확실성 모델링기 " +
      "(v6~v8) 세 국면으로 정리. 각 버전에서 실제로 무엇을 왜 바꿨는지(안명근체포 시간 정정, " +
      "오산학교 개교일 다출처 재검증, 사건 시점 자동상속 금지 원칙, hasValidationStatus 신설, " +
      "신흥강습소 실체 분리 등)를 근거와 함께 전체 기록.",
    tags: ["온톨로지", "TTL", "버전이력", "provenance"],
  },
  {
    url: "ontology-v1-vs-v6-trial-and-error.html",
    title: "온톨로지 시각화 버전 비교: v1 vs v6 (및 v8)",
    date: "2026-08-27 작성 · 2026-08-28 갱신 · 2026-08-31 v8_d3style.html 재생성",
    summary:
      "v1의 D3 이항관계 그래프와 v6~v8의 '사건(Event) 중심' TTL 스키마 사이의 구조적 차이, " +
      "v6의 Event-접기 해결 과정, v8_d3style(v1 UI를 v8 데이터로 재현하며 발견한 정춘수·박희도 " +
      "전향 미기록 사례)과 v8_with_gonghun 관계망 탭에 필터·검색을 이식한 과정, 그리고 실제로 " +
      "겪은 버그 3건(숨은 탭 초기화, CSS grid 높이, versions-data.js 스키마 사고)까지 기록.",
    tags: ["온톨로지", "시각화", "D3", "vis-network", "TTL"],
  },
];