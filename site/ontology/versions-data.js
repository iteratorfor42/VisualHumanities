// 온톨로지 프로젝트의 버전 이력.
// 원칙: 이전 버전 파일은 절대 덮어쓰거나 삭제하지 않는다.
// 새 버전을 올릴 때마다:
//   1) versions/vN.html (뷰어 페이지) + versions/data/vN.ttl (실제 온톨로지 파일)을 새로 추가
//      (기존 파일은 그대로 둠)
//   2) 아래 배열 맨 앞에 새 항목을 추가 (최신순 정렬)
// version-nav.js가 이 배열을 읽어 모든 버전 페이지의 상단 네비게이션 바를
// 자동으로 갱신하므로, 새 버전을 추가해도 기존 v1~v4 파일은 손댈 필요가 없다.

const ONTOLOGY_VERSIONS = [
  {
    version: "v10",
    date: "2026-09-02",
    label: "공훈전자사료관 API 매칭 버그 수정 (현재 최신)",
    changelog:
      "v9.5re(Claim 근거모델 + 의미론 재검토 표시) 데이터·로직은 그대로 두고, 세 번째 탭으로 " +
      "공훈전자사료관 연동을 다시 추가하되 v6/v8_with_gonghun의 근본 버그를 고침: (1) 응답 " +
      "필드를 rec['성명']||rec['name']으로 읽어 항상 빈 문자열이었던 것을 실제 필드명 " +
      "NAME_KO로 정정 — 이게 지금까지 0명 매칭의 진짜 원인이었음. (2) '이름 필터 파라미터 " +
      "미확인'이라 적혀있던 것을 mpva.go.kr 공식 문서에서 nameKo 파라미터를 실제로 찾아내, " +
      "19,059명 전체를 페이지 단위로 훑던 방식에서 인물별 직접 질의(20회)로 전환. (3) 훈격/" +
      "운동계열/공적개요 필드명도 HUNKUK/WORKOUT_AFFIL/ACHIVEMENT로 정정, 생몰년·이명 필드도 " +
      "추가 표시. (4) 동명이인 다중 후보를 전부 표시하도록 처리. jsdom+모의 API 응답으로 " +
      "매칭/동명이인/미매칭 3가지 케이스가 정확히 집계되는 것(18/1/1)을 배포 전 실행 검증함. " +
      "GIS·관계망 탭은 v9.5re와 완전히 동일(987 트리플·40 노드·31 간선·재검토 2건, 재검증 완료).",
    file: "versions/v10.html",
  },
  {
    version: "v9_5re",
    date: "2026-09-01",
    label: "의미론 재검토 표시 추가",
    changelog:
      "v9.5 데이터(core 34/hold 5)는 전혀 바꾸지 않음. v9.5 설명서·검증서에 대한 상호 " +
      "피드백 검토에서, date_status='not_applicable'인 참여 Claim 6건 중 CLM-024('합류" +
      "하였다')·CLM-027-04('이끌었다')는 동작 동사를 쓰고 있어 다른 4건(지위·성격 서술)과 " +
      "달리 not_directly_verified가 더 적합할 수 있다는 재검토 의견이 나왔으나, 정책(참여 " +
      "Claim은 개별 날짜 불요 vs 날짜축은 있으나 미검증) 자체가 아직 확정되지 않아 데이터는 " +
      "그대로 두고 지도·관계망·상세패널에만 '🔍 의미론 재검토 권고' 표시를 추가함 — " +
      "core/hold(데이터 상태)와 review(시각화상의 검토 의견)를 섞지 않기 위함. jsdom+실제 " +
      "vis-network로 재검토 간선 2건이 정확히 표시되는 것을 배포 전 실행 검증함.",
    file: "versions/v9_5re.html",
  },
  {
    version: "v9_5",
    date: "2026-08-31",
    label: "Claim 기반 근거모델",
    changelog:
      "v8까지의 단일 Event 스키마에서 한 걸음 더 나아가, 사실 하나하나를 Claim(주장) 단위로 " +
      "분리하고 각 Claim에 Source(출처)·Evidence(근거)·claim_status·date_status·" +
      "verification_status·review_flag·change_history를 개별적으로 부여하는 모델로 전환. " +
      "Claim 39건을 core 34건(근거 확보)과 hold 5건(관계·해석 추가검증 필요)으로 구분해 " +
      "claim_core.csv/claim_hold.csv로 관리하고, source/evidence 없이 related_to만 있던 " +
      "16건은 exclusion_manifest.csv로 별도 격리(TTL 미반영). 시각화는 GIS 지도(Leaflet)+ " +
      "관계망(vis-network) 2탭 구조(v6과 동일한 '기존 스타일')로 제작 — hold Claim은 " +
      "점선·주황색으로 core와 시각적으로 구분. jsdom+실제 d3/vis-network로 노드 40개· " +
      "간선 31개(hold 5개 포함)가 정확히 생성되는 것을 배포 전에 실행 검증함.",
    file: "versions/v9_5.html",
  },
  {
    version: "v8_d3style",
    date: "2026-08-28",
    label: "v1 스타일 D3 그래프 재현 (v8 데이터)",
    changelog:
      "v1.html의 D3.js force-graph UI(필터 버튼·검색창·범례·상세패널)를 그대로 두고, 하드코딩 " +
      "데이터 대신 v8.ttl을 브라우저에서 실시간 파싱해 채움. Event 중심 스키마를 이항관계 2개로 " +
      "접어 v1과 동일한 그래프 형태로 표시(노드 44개·간선 48개). v1은 최린·정춘수·박희도 3인을 " +
      "'친일 전향'으로 표시했으나, v8 온톨로지엔 현재 최린만 :전향 이벤트가 명시돼 있어 이 그래프는 " +
      "그 실제 데이터 커버리지를 있는 그대로 반영함(정춘수·박희도는 일반 인물 노드로 표시).",
    file: "versions/v8_d3style.html",
  },
  {
    version: "v8_with_gonghun",
    date: "2026-08-27",
    label: "2차 재검증 반영 + v1 스타일 필터·검색 관계망",
    changelog:
      "v6→v8: v6에서 3회차 검토 결과(안명근체포 유형·시간 수정, 오산-대성 승계관계 삭제, 오산학교 " +
      "개교일 1907-12-24 확정, 안악사건 2단계 확대구조 등) 반영, v7에서 소속·참여 Event 시간정보 " +
      "보강 및 '사건 시점 자동상속 금지' 원칙 적용(차이석 임시정부 참여를 1919가 아닌 1933으로 " +
      "정정 등), v8에서 임시정부 소속 4건 개별 재검증(이동휘 1919-09, 이승만 1919-09-11 확정) 등 " +
      "2차 재검증 완료. 트리플 982개 · Person 31 · Group 14 · Event 74. GIS·네트워크·공훈전자사료관 " +
      "연동 UI는 v6_with_gonghun과 동일, 데이터만 v8.ttl로 교체. 추가로 관계망(Network) 탭에 " +
      "v1.html 스타일의 유형 필터 버튼·이름 검색창·범례를 이식(vis-network의 hidden 속성으로 " +
      "필터링 구현).",
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
