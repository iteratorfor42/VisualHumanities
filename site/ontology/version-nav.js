// version-nav.js
// versions-data.js의 VERSIONS 배열을 읽어, 현재 페이지 하단에
// 버전 전환 내비게이션(이전/다음 + 드롭다운)을 렌더링한다.
// 각 버전 페이지(v1/index.html ... v6/index.html)의 </body> 직전에
// versions-data.js보다 "뒤에" 로드되어야 한다.
//
// 현재 페이지가 몇 번째 버전인지는 <body data-version="v5"> 처럼
// body 태그의 data-version 속성으로 판별한다. 이 속성이 없으면
// location.pathname에서 "/v5/" 같은 패턴을 찾아 추정한다.

(function () {
  if (typeof VERSIONS === "undefined") {
    console.warn("version-nav.js: VERSIONS 배열을 찾을 수 없습니다. versions-data.js가 먼저 로드되었는지 확인하세요.");
    return;
  }

  function currentVersionId() {
    var attr = document.body.getAttribute("data-version");
    if (attr) return attr;
    var m = location.pathname.match(/\/(v\d+)\//);
    return m ? m[1] : null;
  }

  function buildNav() {
    var curId = currentVersionId();
    var curIndex = VERSIONS.findIndex(function (v) { return v.id === curId; });

    var nav = document.createElement("nav");
    nav.id = "version-nav";
    nav.style.cssText =
      "position:fixed;bottom:0;left:0;right:0;z-index:1000;" +
      "background:#2B2620;color:#F3EDE0;font-family:'IBM Plex Mono',monospace;" +
      "font-size:12px;padding:10px 20px;display:flex;align-items:center;gap:14px;" +
      "border-top:1px solid #5A5348;";

    // 이전 버전 링크
    var prev = curIndex > 0 ? VERSIONS[curIndex - 1] : null;
    var prevLink = document.createElement("a");
    prevLink.textContent = prev ? "← " + prev.label : "← (첫 버전)";
    prevLink.href = prev ? "../" + prev.file : "#";
    prevLink.style.cssText = "color:" + (prev ? "#F3EDE0" : "#5A5348") + ";text-decoration:none;" + (prev ? "" : "pointer-events:none;");

    // 현재 버전 드롭다운
    var select = document.createElement("select");
    select.style.cssText =
      "background:#3A342C;color:#F3EDE0;border:1px solid #5A5348;" +
      "font-family:'IBM Plex Mono',monospace;font-size:12px;padding:4px 8px;border-radius:3px;";
    VERSIONS.forEach(function (v) {
      var opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = v.label + " — " + v.title + (v.status.indexOf("완료") === 0 ? "" : " (" + v.status + ")");
      if (v.id === curId) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", function () {
      var target = VERSIONS.find(function (v) { return v.id === select.value; });
      if (target) location.href = "../" + target.file;
    });

    // 다음 버전 링크
    var next = curIndex >= 0 && curIndex < VERSIONS.length - 1 ? VERSIONS[curIndex + 1] : null;
    var nextLink = document.createElement("a");
    nextLink.textContent = next ? next.label + " →" : "(최신 버전) →";
    nextLink.href = next ? "../" + next.file : "#";
    nextLink.style.cssText = "color:" + (next ? "#F3EDE0" : "#5A5348") + ";text-decoration:none;" + (next ? "" : "pointer-events:none;");

    // 현재 버전 상태/알려진 이슈 요약 (있으면 표시)
    var infoBtn = document.createElement("button");
    infoBtn.textContent = "ⓘ 이 버전 정보";
    infoBtn.style.cssText =
      "margin-left:auto;background:none;border:1px solid #5A5348;color:#F3EDE0;" +
      "font-family:'IBM Plex Mono',monospace;font-size:11px;padding:4px 10px;" +
      "border-radius:3px;cursor:pointer;";
    infoBtn.addEventListener("click", function () { toggleInfoPanel(curIndex); });

    nav.appendChild(prevLink);
    nav.appendChild(select);
    nav.appendChild(nextLink);
    nav.appendChild(infoBtn);
    document.body.appendChild(nav);

    // 내비게이션이 본문을 가리지 않도록 여백 확보
    document.body.style.paddingBottom = "48px";
  }

  function toggleInfoPanel(curIndex) {
    var existing = document.getElementById("version-info-panel");
    if (existing) { existing.remove(); return; }
    if (curIndex < 0) return;
    var v = VERSIONS[curIndex];

    var panel = document.createElement("div");
    panel.id = "version-info-panel";
    panel.style.cssText =
      "position:fixed;bottom:48px;right:20px;z-index:1001;width:360px;" +
      "background:#fff;color:#2B2620;border:1px solid #C9BFA8;border-radius:6px;" +
      "padding:16px 18px;font-family:'IBM Plex Mono',monospace;font-size:12px;" +
      "line-height:1.7;box-shadow:0 4px 16px rgba(0,0,0,0.18);max-height:60vh;overflow-y:auto;";

    var html = "<b style='font-family:\"Noto Serif KR\",serif;font-size:14px;'>" +
      v.label + " — " + v.title + "</b><br>" +
      "<span style='color:#5A5348;'>" + v.date + " · " + v.status + "</span>" +
      "<p style='margin:10px 0;'>" + v.summary + "</p>";

    if (v.majorChanges && v.majorChanges.length) {
      html += "<b style='color:#A8342A;'>주요 변경</b><ul style='margin:6px 0 12px;padding-left:18px;'>";
      v.majorChanges.forEach(function (c) { html += "<li style='margin-bottom:4px;'>" + c + "</li>"; });
      html += "</ul>";
    }
    if (v.knownIssues && v.knownIssues.length) {
      html += "<b style='color:#B8863B;'>알려진 미완성 지점</b><ul style='margin:6px 0;padding-left:18px;'>";
      v.knownIssues.forEach(function (c) { html += "<li style='margin-bottom:4px;'>" + c + "</li>"; });
      html += "</ul>";
    }
    panel.innerHTML = html;
    document.body.appendChild(panel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildNav);
  } else {
    buildNav();
  }
})();