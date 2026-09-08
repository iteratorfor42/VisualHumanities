// notes.html이 "온톨로지 프로젝트 관련 링크와 시행착오" 목록을 렌더링할 때 쓰는 데이터.
// posts-data.js(MY_POSTS)와 동일한 패턴: 새 글을 추가할 때
//   1) ontology/ 바로 아래(notes/ 하위폴더 없이 평평한 구조)에 새 html 파일을 만든다
//      (기존 파일은 건드리지 않음)
//   2) 아래 배열 맨 앞에 새 항목을 추가한다 (최신순 정렬)
//   url은 notes.html과 같은 위치(ontology/) 기준 상대경로 — 파일명만 쓴다

const ONTOLOGY_NOTES = [
  {
    url: "ontology-v9.1~v9.5-trial-and-error.html",
    title: "온톨로지 v9 계열 전체 정리: v9.1 → v9.5 (+v9.5re)",
    date: "2026-08-29 작성 · 2026-09-08 v9.4~v9.5 및 v9.5re 갱신",
    summary:
      "v8 TTL 본체를 검증하기 위해 별도로 시작한 병렬 Provenance 트랙(ver2~ver5 방법론 " +
      "설계 → v9.1~v9.5 실제 구현). Claim/Evidence/Source 분리, '49개 항목 매핑'과 " +
      "'Claim 단위 신뢰도 확정'을 별개 축으로 두는 원칙(Rule G-01~G-08)을 먼저 세운 뒤, " +
      "v9.1 구조검증 → v9.2 포함/제외 최초 분리 → v9.3 Core/Hold/Exclusion 3분할(이 과정에서 " +
      "CLM-023 재발을 개별 버그가 아니라 수작업 CSV 파이프라인의 재현성 문제로 격상) → " +
      "v9.4 Claim 문장·subject/object URI·relation 의미 정합 6건 수정 → v9.5 date_status " +
      "완전 정합화(처음 세운 규칙이 스스로의 경고를 어기는 자기모순임을 재검토에서 발견해 " +
      "폐기하고 'Claim의 시간적 의미' 기준으로 재수립)까지 진행. v9.5re에서는 데이터는 그대로 " +
      "둔 채 review 표시축(SEMANTIC_REVIEW, CLM-024·CLM-027-04 2건)만 얹은 시각화 오버레이를 " +
      "별도 파서로 독립 재파싱해 987 트리플까지 완전히 일치시키며 이 프로젝트에서 처음으로 " +
      "이중 교차검증을 달성했고, 그 과정에서 찾아낸 ttl-parser.js의 '<IRI> 안 # 오인식' 버그를 " +
      "공용 파일 차원에서 수정했다.",
    tags: ["온톨로지", "provenance", "TTL", "버전이력", "v9"],
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