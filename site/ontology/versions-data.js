// 온톨로지 프로젝트의 버전 이력.
// 원칙: 이전 버전 파일은 절대 덮어쓰거나 삭제하지 않는다.
// 새 버전을 올릴 때마다:
//   1) versions/vN.html (뷰어 페이지) + versions/data/vN.ttl (실제 온톨로지 파일)을 새로 추가
//      (기존 파일은 그대로 둠)
//   2) 아래 배열 맨 앞에 새 항목을 추가 (최신순 정렬)
// version-nav.js가 이 배열을 읽어 모든 버전 페이지의 상단 네비게이션 바를
// 자동으로 갱신하므로, 새 버전을 추가해도 기존 v1~v4 파일은 손댈 필요가 없음.

const ONTOLOGY_VERSIONS = [
  {
    version: "v8_with_gonghun",
    date: "2026-08-27",
    label: "2차 재검증 반영 (현재 최신)",
    changelog:
      "v6→v8: v6에서 3회차 검토 결과(안명근체포 유형·시간 수정, 오산-대성 승계관계 삭제, 오산학교 " +
      "개교일 1907-12-24 확정, 안악사건 2단계 확대구조 등) 반영, v7에서 소속·참여 Event 시간정보 " +
      "보강 및 '사건 시점 자동상속 금지' 원칙 적용(차이석 임시정부 참여를 1919가 아닌 1933으로 " +
      "정정 등), v8에서 임시정부 소속 4건 개별 재검증(이동휘 1919-09, 이승만 1919-09-11 확정) 등 " +
      "2차 재검증 완료. 트리플 982개 · Person 31 · Group 14 · Event 74. GIS·네트워크·공훈전자사료관 " +
      "연동 UI는 v6_with_gonghun과 동일, 데이터만 v8.ttl로 교체.",
    file: "versions/v8_with_gonghun.html",
  },
  {
    version: "v6_with_gonghun",
    date: "2026-08-19",
    label: "GIS·네트워크·공훈전자사료관 연동",
    changelog:
      "v6에 세 번째 탭 추가: 국가보훈부 공훈전자사료관 공식 오픈API를 사용자 브라우저에서 직접 호출해 " +
      "v5 인물 30명과 대조. 정직 고지: 이 API 호출은 실행 환경의 네트워크 제약상 Claude가 사전에 " +
      "성공 여부를 검증하지 못했으며, 정부 사이트 특성상 CORS로 막힐 가능성이 있음 — 실패 시 원인과 " +
      "로컬 Python 스크립트 대안을 화면에 그대로 안내함. GIS·네트워크 탭 로직은 v6과 동일.",
    file: "versions/v6_with_gonghun.html",
  },
  {
    version: "v6",
    date: "2026-08-19",
    label: "GIS·네트워크 시각화",
    changelog:
      "[표 2] 2주차 교육과정 9일차 '시각적 인문학의 모색: GIS 및 NETWORK 시각화 기술 응용'을 참고해 " +
      "직접 구현. v5.ttl을 브라우저에서 실시간 파싱해 (1) Leaflet 기반 GIS 지도 — 조직 소재지 POI " +
      "(오산학교의 hasSpaceValue 명시값 1건 + 필자가 조사해 부여한 나머지 조직 소재지), " +
      "(2) vis-network 기반 관계망 — Event의 hasObject/hasPreObject/hasPostObject를 간선으로 접어 " +
      "Person·Group 간 관계로 표시. 하드코딩 데이터 없이 실제 .ttl 파일에서 전부 추출.",
    file: "versions/v6.html",
  },
  {
    version: "v5",
    date: "2026-08-19",
    label: "placeholder 정리",
    changelog:
      "hasCompiler placeholder(:김바로_예시편찬자)를 실제 편찬자 개체(:iteratorfor42)로 전체 68회 " +
      "일괄 치환. Person 선언의 rdfs:comment도 placeholder 안내문에서 실제 편찬자 설명으로 정정. " +
      "남은 작업: hasWebResource 항목별 실제 permalink, 시간정보 미상 52건 추정치 보강.",
    file: "versions/v5.html",
  },
  {
    version: "v4",
    date: "2026-08-18",
    label: "v3 검증 후 보완",
    changelog:
      "hasCompiler/hasCompiledTime 미기입 상태였던 Event 65건 전부 보강. :백오인사건의 Group/Event " +
      "이중 타입 충돌 해소(Event로 단일화). 천도교 관련 이벤트 3건에 재검증 필요 표시 실제 추가. " +
      "중복 개체(:이승훈설립오산학교_01 ↔ :19071201이승훈설립_01) 통합.",
    file: "versions/v4.html",
  },
  {
    version: "v3",
    date: "2026-08-16",
    label: "제도·인사 온톨로지 (핵심 패턴, full sourced)",
    changelog:
      "김바로, 「제도-인사 온톨로지 설계」(한국학중앙연구원 한국학대학원 박사논문)의 학술모델·추정모델·" +
      "조직모델·사건모델·공리 설계를 준용하여, 설립·임명/역할변화·사건확대·조직승계 4대 핵심 패턴을 재현. " +
      "v2 대비 출처·추정 근거를 전면 보강(전체 소스 태깅).",
    file: "versions/v3.html",
  },
  {
    version: "v2",
    date: "2026-08-14",
    label: "사건 중심 설계 (김바로/김현 방식)",
    changelog:
      "AKS 인문정보학 방법론(김현 교수 정립, 김바로 교수 계승)을 따라 원문에서 시간·장소·관직 등 요소를 " +
      "추출하고 '사건'을 독립된 노드로 승격, 여러 속성을 갖도록 재설계. v1의 이항관계 중심 구조와 대비됨.",
    file: "versions/v2.html",
  },
  {
    version: "v1",
    date: "2026-08-12",
    label: "프로토타입",
    changelog:
      "최초 프로토타입. 오산학교·대성학교·숭실학교·보성학교·신흥무관학교 5개 학교를 축으로, " +
      "신민회·대한독립군·천도교·북로군정서·임시정부 등 단체, 삼일운동·백오인사건·청산리전투 등 " +
      "사건, 인물 30여 명을 D3.js force-directed graph로 연결. 유형별 필터·검색·상세 패널 구현.",
    file: "versions/v1.html",
  },
];
