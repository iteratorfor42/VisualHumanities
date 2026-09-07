// 버전 페이지 상단에 삽입되는 공용 네비게이션 바.
// ONTOLOGY_VERSIONS(=versions-data.js)를 읽어 렌더링하므로,
// versions-data.js에 새 버전을 추가하기만 하면 이미 배포된 모든 버전 페이지의
// 네비게이션 바에도 자동으로 새 버전 링크가 나타난다. (각 파일을 일일이 고칠 필요 없음)
(function () {
  if (typeof ONTOLOGY_VERSIONS === "undefined" || !ONTOLOGY_VERSIONS.length) return;

  var style = document.createElement("style");
  style.textContent = [
    ".v-nav{display:flex;align-items:center;gap:10px;flex-wrap:wrap;",
    "padding:9px 20px;background:#EAE2D0;border-bottom:1px solid #C9BEA2;",
    "font-family:'Noto Sans KR',sans-serif;font-size:12.5px;position:relative;z-index:100;}",
    ".v-nav a{color:#5A5348;text-decoration:none;padding:3px 9px;border-radius:3px;white-space:nowrap;}",
    ".v-nav a:hover{background:#DDD3BC;}",
    ".v-nav a.current{background:#2C4A46;color:#fff;font-weight:600;}",
    ".v-nav .v-sep{color:#B8AD93;}",
    ".v-nav .v-back{font-weight:600;}",
  ].join("");
  document.head.appendChild(style);

  var currentFile = location.pathname.split("/").pop();

  var nav = document.createElement("div");
  nav.className = "v-nav";

  var back = document.createElement("a");
  back.className = "v-back";
  back.href = "../versions.html";
  back.textContent = "← 버전 목록";
  nav.appendChild(back);

  var sep = document.createElement("span");
  sep.className = "v-sep";
  sep.textContent = "|";
  nav.appendChild(sep);

  // 오래된 버전 → 최신 버전 순으로 좌에서 우로 표시
  var ordered = ONTOLOGY_VERSIONS.slice().reverse();
  ordered.forEach(function (v) {
    var fname = v.file.split("/").pop();
    var a = document.createElement("a");
    a.href = fname;
    a.textContent = v.version + (v === ordered[ordered.length - 1] ? " (최신)" : "");
    if (fname === currentFile) a.classList.add("current");
    nav.appendChild(a);
  });

  document.body.insertBefore(nav, document.body.firstChild);
})();
