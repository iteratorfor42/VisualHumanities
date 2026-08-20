// .ttl(Turtle) 온톨로지 파일을 fetch로 읽어와 간단한 구문 강조와 함께
// <pre id="ttl-output">에 렌더링하는 공용 스크립트.
// 사용법: 페이지에서 loadTurtle('data/vN.ttl', 'ttl-output') 호출.

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var TOKEN_RE = /<[^<>\s]*>|"(?:[^"\\]|\\.)*"(?:@[a-zA-Z-]+|\^\^[^\s;,.]+)?|@prefix|@base|[A-Za-z][\w-]*:[\w\u3131-\uD79D][\w\u3131-\uD79D-]*|:[\w\u3131-\uD79D][\w\u3131-\uD79D-]*|[.;,](?=\s|$)/g;

function classify(tok) {
  if (tok.charAt(0) === "<") return "tk-iri";
  if (tok.charAt(0) === '"') return "tk-str";
  if (tok === "@prefix" || tok === "@base") return "tk-kw";
  if (tok === "." || tok === ";" || tok === ",") return "tk-punct";
  return "tk-pname";
}

function highlightLine(line) {
  // 줄 전체가 주석(#으로 시작)이면 통째로 회색 처리
  if (/^\s*#/.test(line)) {
    return '<span class="tk-comment">' + escapeHtml(line) + "</span>";
  }

  var out = "";
  var lastIndex = 0;
  var m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(line)) !== null) {
    out += escapeHtml(line.slice(lastIndex, m.index));
    var cls = classify(m[0]);
    out += '<span class="' + cls + '">' + escapeHtml(m[0]) + "</span>";
    lastIndex = m.index + m[0].length;
  }
  out += escapeHtml(line.slice(lastIndex));
  return out;
}

function highlightTurtle(text) {
  return text.replace(/\r\n/g, "\n").split("\n").map(highlightLine).join("\n");
}

function loadTurtle(path, outputId) {
  var out = document.getElementById(outputId);
  if (!out) return;
  out.textContent = "불러오는 중...";
  fetch(path)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (text) {
      out.innerHTML = highlightTurtle(text);
    })
    .catch(function (err) {
      out.innerHTML =
        '<span class="tk-error">파일을 불러오지 못했습니다 (' +
        escapeHtml(err.message) +
        "). 정적 서버(Docker 또는 Render)로 열었는지 확인하세요 — file:// 로 직접 열면 fetch가 차단됩니다.</span>";
    });
}
