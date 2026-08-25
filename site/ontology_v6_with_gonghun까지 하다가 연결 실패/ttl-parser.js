// 아주 작은 Turtle(.ttl) 서브셋 파서.
// 이 프로젝트의 온톨로지 파일들(v3~v6)이 쓰는 패턴만 지원한다:
//   - @prefix 선언
//   - "subject pred1 obj1 ; pred2 obj2, obj3 ." 형태의 단순 트리플 블록
//   - blank node([...]), collection(( ... )) 문법은 사용하지 않는다고 가정
// 반환값: [{ s: "주어localname", p: "술어localname", o: {kind, value, lang, datatype, prefix} }, ...]

function ttlStripLineComment(line) {
  var inQuote = false;
  for (var i = 0; i < line.length; i++) {
    var c = line[i];
    if (c === '"' && line[i - 1] !== "\\") inQuote = !inQuote;
    else if (c === "#" && !inQuote) return line.slice(0, i);
  }
  return line;
}

var TTL_TOKEN_RE = /<[^<>]*>|"(?:[^"\\]|\\.)*"(?:@[a-zA-Z-]+|\^\^[^\s;,.]+)?|[;,]|[^\s;,]+/g;

function ttlSplitStatements(text) {
  var stmts = [];
  var buf = "";
  var inQuote = false;
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    if (c === '"' && text[i - 1] !== "\\") inQuote = !inQuote;
    if (c === "." && !inQuote) {
      var next = text[i + 1];
      if (next === undefined || /\s/.test(next)) {
        stmts.push(buf);
        buf = "";
        continue;
      }
    }
    buf += c;
  }
  if (buf.trim()) stmts.push(buf);
  return stmts;
}

function ttlTokenize(stmt) {
  var out = [];
  var m;
  TTL_TOKEN_RE.lastIndex = 0;
  while ((m = TTL_TOKEN_RE.exec(stmt)) !== null) out.push(m[0]);
  return out;
}

function ttlLocalName(tok) {
  if (tok === "a") return { kind: "iri", value: "type" };
  if (tok.charAt(0) === "<" && tok.charAt(tok.length - 1) === ">") {
    var v = tok.slice(1, -1);
    var idx = Math.max(v.lastIndexOf("#"), v.lastIndexOf("/"));
    return { kind: "iri", value: idx >= 0 ? v.slice(idx + 1) : v };
  }
  if (tok.charAt(0) === '"') {
    var m = tok.match(/^"((?:[^"\\]|\\.)*)"(?:@([a-zA-Z-]+)|\^\^(.+))?$/);
    if (m) {
      return {
        kind: "literal",
        value: m[1].replace(/\\"/g, '"').replace(/\\n/g, "\n"),
        lang: m[2] || null,
        datatype: m[3] ? ttlLocalName(m[3]).value : null,
      };
    }
    return { kind: "literal", value: tok, lang: null, datatype: null };
  }
  var idx2 = tok.indexOf(":");
  if (idx2 >= 0) return { kind: "iri", value: tok.slice(idx2 + 1), prefix: tok.slice(0, idx2) };
  return { kind: "iri", value: tok };
}

function parseTurtle(text) {
  text = text.replace(/\r\n/g, "\n");
  var cleaned = text
    .split("\n")
    .map(ttlStripLineComment)
    .join("\n");
  var statements = ttlSplitStatements(cleaned);

  var triples = [];
  for (var si = 0; si < statements.length; si++) {
    var s = statements[si].trim();
    if (!s || s.indexOf("@prefix") === 0 || s.indexOf("@base") === 0) continue;
    var tokens = ttlTokenize(s);
    if (!tokens.length) continue;
    var subject = ttlLocalName(tokens[0]);
    var i = 1;
    while (i < tokens.length) {
      if (tokens[i] === ";" || tokens[i] === ",") { i++; continue; }
      var pred = ttlLocalName(tokens[i++]);
      while (i < tokens.length) {
        if (tokens[i] === ";") { i++; break; }
        if (tokens[i] === ",") { i++; continue; }
        var obj = ttlLocalName(tokens[i++]);
        triples.push({ s: subject.value, p: pred.value, o: obj });
      }
    }
  }
  return triples;
}
