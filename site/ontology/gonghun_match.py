#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gonghun_match.py — 공훈전자사료관 공식 오픈API를 로컬(내 컴퓨터)에서 직접 호출해
v9.5 인물 20명을 조회하고, 결과를 site/ontology/versions/data/gonghun_snapshot.json으로
저장하는 스크립트.

왜 브라우저 대신 로컬 스크립트인가:
  - 이 API(e-gonghun.mpva.go.kr)는 HTTP만 제공한다. 그런데 사이트는 HTTPS로 배포돼
    있어서, 브라우저가 "혼합 콘텐츠(mixed content)"로 요청 자체를 막는다.
  - 무료 공개 프록시(allorigins, codetabs)로 우회를 시도했지만 타임아웃/실패가
    반복됐다 — 정부 사이트가 프록시발 트래픽을 막거나 응답이 느린 것으로 보인다.
  - Python의 urllib은 브라우저처럼 http를 https로 자동 승격하지 않으므로, 같은
    API를 로컬에서는 안정적으로 호출할 수 있다.
  - 그래서 "브라우저에서 매번 실시간 호출" 대신 "로컬에서 한 번 조회해 스냅샷을
    만들고, 사이트는 그 정적 파일만 읽는" 방식으로 바꿨다.

사용법:
  python3 gonghun_match.py
  (site/ontology/versions/data/gonghun_snapshot.json 파일이 생성/갱신됩니다.
   생성된 파일을 git add/commit/push 하면 사이트에 반영됩니다.)
"""

import json
import time
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

GONGHUN_BASE = "http://e-gonghun.mpva.go.kr/opnAPI/contribuMeritList.do"

# v9.5 ttl의 Person 개체 20명 (편찬자 placeholder :iteratorfor42 제외)
GONGHUN_PERSONS = [
    "김좌진", "서일", "손병희", "안창호", "양기탁", "오세창", "유영모", "이동휘", "이승만", "이승훈",
    "이시영", "이종일", "이종호", "이회영", "정춘수", "조만식", "최광옥", "최린", "한용운", "홍범도",
]

OUTPUT_PATH = "site/ontology/versions/data/gonghun_snapshot.json"


def fetch_one(name):
    """이름 한 명에 대해 API를 호출하고 (candidates, raw_count, error) 튜플을 반환."""
    params = urllib.parse.urlencode({"nPageIndex": 1, "nCountPerPage": 50, "nameKo": name})
    url = GONGHUN_BASE + "?" + params
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            raw = res.read()
    except Exception as e:
        return None, 0, "요청 실패: {}".format(e)

    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        text = raw.decode("euc-kr", errors="replace")

    try:
        root = ET.fromstring(text)
    except ET.ParseError as e:
        return None, 0, "XML 파싱 실패: {}".format(e)

    items = root.findall(".//ITEM")
    records = []
    for item in items:
        rec = {child.tag: (child.text or "").strip() for child in item}
        records.append(rec)

    exact = [r for r in records if r.get("NAME_KO") == name]
    return exact, len(records), None


def main():
    print("공훈전자사료관 API를 로컬에서 직접 호출합니다 (인물 {}명)...".format(len(GONGHUN_PERSONS)))
    results = []
    for i, name in enumerate(GONGHUN_PERSONS, 1):
        print("  [{}/{}] {} 조회 중...".format(i, len(GONGHUN_PERSONS), name), end=" ")
        candidates, raw_count, error = fetch_one(name)
        if error:
            print("실패:", error)
            results.append({"name": name, "error": error})
        else:
            print("완료 — 후보 {}건".format(len(candidates)))
            results.append({
                "name": name,
                "candidates": candidates,
                "rawCount": raw_count,
            })
        time.sleep(0.3)  # 정부 서버에 과도한 연속 요청을 피하기 위한 최소한의 간격

    snapshot = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "e-gonghun.mpva.go.kr/opnAPI/contribuMeritList.do (nameKo 파라미터로 인물별 직접 조회)",
        "results": results,
    }

    try:
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(snapshot, f, ensure_ascii=False, indent=2)
        print("\n저장 완료:", OUTPUT_PATH)
    except FileNotFoundError:
        fallback = "gonghun_snapshot.json"
        with open(fallback, "w", encoding="utf-8") as f:
            json.dump(snapshot, f, ensure_ascii=False, indent=2)
        print("\n(참고) {} 경로를 찾을 수 없어 현재 폴더에 저장했습니다: {}".format(OUTPUT_PATH, fallback))
        print("이 파일을 site/ontology/versions/data/gonghun_snapshot.json 위치로 옮겨주세요.")

    matched = sum(1 for r in results if r.get("candidates") and len(r["candidates"]) == 1)
    multi = sum(1 for r in results if r.get("candidates") and len(r["candidates"]) > 1)
    unmatched = sum(1 for r in results if r.get("candidates") == [])
    errored = sum(1 for r in results if r.get("error"))
    print("\n요약: 매칭 {} · 동명이인 {} · 미매칭 {} · 오류 {}".format(matched, multi, unmatched, errored))


if __name__ == "__main__":
    main()