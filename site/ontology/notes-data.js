// notes.html이 "온톨로지 프로젝트 관련 링크와 시행착오" 목록을 렌더링할 때 쓰는 데이터.
// posts-data.js(MY_POSTS)와 동일한 패턴: 새 글을 추가할 때
//   1) notes/ 폴더에 새 html 파일을 만든다 (기존 파일은 건드리지 않음)
//   2) 아래 배열 맨 앞에 새 항목을 추가한다 (최신순 정렬)
//   url은 notes.html 기준 상대경로 (예: "notes/파일명.html")

const ONTOLOGY_NOTES = [
  {
    url: "notes/ontology-v1-vs-v6-trial-and-error.html",
    title: "온톨로지 시각화 버전 비교: v1 vs v6 (및 v8)",
    date: "2026-08-27",
    summary:
      "v1의 D3 이항관계 그래프와 v6~v8의 '사건(Event) 중심' TTL 스키마 사이의 구조적 차이를 정리하고, " +
      "v6에서 Event를 두 개의 간선으로 접어 v1과 비슷한 이항관계 그래프처럼 보이게 만든 해결 과정을 기록.",
    tags: ["온톨로지", "시각화", "D3", "vis-network", "TTL"],
  },
];
