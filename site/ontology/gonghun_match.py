#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gonghun_match.py — 공훈전자사료관 공식 오픈API를 로컬(내 컴퓨터)에서 직접 호출해
v9.5 인물 20명을 조회하고, 결과를 site/ontology/versions/data/gonghun_snapshot.json으로
저장하는 스크립트.

[v10 최종 수정] "nameKo=이름"으로 단건 질의하던 방식을 폐기했다.
  실제로 API를 호출해 확인한 결과, nameKo 파라미터는 공식 문서(mpva.go.kr)에는
  나와 있지만 서버가 실제로는 무시한다 — nameKo 값을 뭘 넣어도 TOTAL_COUNT=19059,
  그리고 항상 가나다순 "가네코 후미코, 가재연, 가재창..."으로 시작하는 첫 페이지가
  그대로 돌아온다(nameKo가 없을 때와 결과가 완전히 동일). 즉 서버 측 이름 필터는
  작동하지 않는다.

  따라서 이번 버전은 이름별 단건 질의(20회) 대신, nCountPerPage=50으로
  전체 목록(약 19,059명 ÷ 50 ≈ 382페이지)을 처음부터 끝까지 순회하면서,
  각 페이지에서 v9.5 인물 20명의 NAME_KO와 정확히 일치하는 레코드만 그때그때
  수집하는 방식으로 바꿨다. 이렇게 하면 서버의 이름 필터가 작동하든 안 하든
  결과가 항상 정확하다(전체를 다 보므로 필터링을 서버에 의존하지 않는다).

  참고: v6/v8_with_gonghun이 원래 시도했던 것도 전체 순회 방식이었고, 그때 실패한
  이유는 응답 필드를 rec["성명"]/rec["name"]으로 읽어서였다(실제 필드명은 NAME_KO).
  이번 스크립트는 필드명은 그때 이미 바로잡힌 것을 그대로 쓰고, "전체 순회"
  방식으로 되돌리되 페이지 수를 하드코딩하지 않고 첫 응답의 TOTAL_COUNT/
  COUNT_PER_PAGE로 동적으로 계산한다.

  전체 순회이므로 요청 수가 많다(약 382회). 서버 부담을 줄이기 위해 요청 사이
  0.3초 간격을 유지하며, 사람이 지켜보지 않아도 완주할 수 있도록 각 페이지
  요청은 실패 시 최대 3회 재시도하고, 중간에 중단돼도 이어서 재개할 수 있도록
  20페이지마다 중간 저장(checkpoint)을 남긴다.

왜 로컬 스크립트인가 (브라우저가 아니라):
  - 이 API(e-gonghun.mpva.go.kr)는 HTTP만 제공한다. 그런데 사이트는 HTTPS로 배포돼
    있어서, 브라우저가 "혼합 콘텐츠(mixed content)"로 요청 자체를 막는다
    (코드를 아무리 고쳐도 브라우저 정책이라 우회 불가 — 실제로 배포 후
    전원 "Failed to fetch"로 확인됨).
  - 무료 공개 프록시(allorigins, codetabs)로 우회를 시도했지만 타임아웃/실패가
    반복됐다 — 정부 사이트가 프록시발 트래픽을 막거나 응답이 느린 것으로 보인다.
  - Python의 urllib은 브라우저처럼 http를 https로 자동 승격하지 않으므로, 같은
    API를 로컬에서는 안정적으로 호출할 수 있다.
  - 그래서 "브라우저에서 매번 실시간 호출" 대신 "로컬에서 한 번 조회해 스냅샷을
    만들고, 사이트는 그 정적 파일만 읽는" 방식으로 바꿨다.

사용법:
  python3 gonghun_match.py
  (전체 순회라 수 분 정도 걸릴 수 있습니다. 완료되면
   site/ontology/versions/data/gonghun_snapshot.json 파일이 생성/갱신됩니다.
   중간에 중단해도 gonghun_match.checkpoint.json이 남아 있으면 이어서 재개합니다.
   생성된 스냅샷 파일을 git add/commit/push 하면 사이트에 반영됩니다.)
"""

import json
import math
import os
import time
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

GONGHUN_BASE = "http://e-gonghun.mpva.go.kr/opnAPI/contribuMeritList.do"
COUNT_PER_PAGE = 50          # API 최대치
REQUEST_INTERVAL_SEC = 0.3   # 정부 서버에 대한 최소한의 예의
MAX_RETRY_PER_PAGE = 3
CHECKPOINT_EVERY_N_PAGES = 20

# v9.5 ttl의 Person 개체 20명 (편찬자 placeholder :iteratorfor42 제외)
GONGHUN_PERSONS = [
    "김좌진", "서일", "손병희", "안창호", "양기탁", "오세창", "유영모", "이동휘", "이승만", "이승훈",
    "이시영", "이종일", "이종호", "이회영", "정춘수", "조만식", "최광옥", "최린", "한용운", "홍범도",
]

OUTPUT_PATH = "site/ontology/versions/data/gonghun_snapshot.json"
CHECKPOINT_PATH = "gonghun_match.checkpoint.json"


def _fetch_page_raw(page_index):
    """한 페이지를 호출해 (raw_bytes) 반환. 실패 시 예외를 그대로 던짐(재시도는 호출부에서)."""
    params = urllib.parse.urlencode({
        "nPageIndex": page_index,
        "nCountPerPage": COUNT_PER_PAGE,
    })
    url = GONGHUN_BASE + "?" + params
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as res:
        return res.read()


def fetch_page(page_index):
    """페이지 하나를 파싱해 (records, total_count) 반환. 실패 시 최대 MAX_RETRY_PER_PAGE회 재시도."""
    last_err = None
    for attempt in range(1, MAX_RETRY_PER_PAGE + 1):
        try:
            raw = _fetch_page_raw(page_index)
            try:
                text = raw.decode("utf-8")
            except UnicodeDecodeError:
                text = raw.decode("euc-kr", errors="replace")
            root = ET.fromstring(text)
            total_count_el = root.find(".//TOTAL_COUNT")
            total_count = int(total_count_el.text) if total_count_el is not None and total_count_el.text else None
            items = root.findall(".//ITEM")
            records = []
            for item in items:
                rec = {child.tag: (child.text or "").strip() for child in item}
                records.append(rec)
            return records, total_count
        except Exception as e:  # 네트워크 오류, XML 파싱 오류 등
            last_err = e
            if attempt < MAX_RETRY_PER_PAGE:
                time.sleep(1.0 * attempt)  # 재시도 전 점증 대기
    raise RuntimeError("페이지 {} 호출 {}회 모두 실패: {}".format(page_index, MAX_RETRY_PER_PAGE, last_err))


def _load_checkpoint():
    if os.path.exists(CHECKPOINT_PATH):
        try:
            with open(CHECKPOINT_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return None


def _save_checkpoint(next_page, found_by_name, total_pages):
    with open(CHECKPOINT_PATH, "w", encoding="utf-8") as f:
        json.dump(
            {"nextPage": next_page, "totalPages": total_pages, "foundByName": found_by_name},
            f, ensure_ascii=False, indent=2,
        )


def _write_snapshot(found_by_name, total_scanned_records, total_pages, resumed):
    results = []
    for name in GONGHUN_PERSONS:
        candidates = found_by_name.get(name, [])
        results.append({"name": name, "candidates": candidates, "rawCount": len(candidates)})

    snapshot = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": (
            "e-gonghun.mpva.go.kr/opnAPI/contribuMeritList.do "
            "(nameKo 파라미터는 서버에서 실제로 무시됨을 확인 — 전체 {}건을 "
            "{}페이지 순회하며 NAME_KO 정확일치로 직접 수집)"
        ).format(total_scanned_records, total_pages),
        "results": results,
    }

    out_dir = os.path.dirname(OUTPUT_PATH)
    try:
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(snapshot, f, ensure_ascii=False, indent=2)
        print("\n저장 완료:", OUTPUT_PATH)
    except OSError:
        fallback = "gonghun_snapshot.json"
        with open(fallback, "w", encoding="utf-8") as f:
            json.dump(snapshot, f, ensure_ascii=False, indent=2)
        print("\n(참고) {} 경로에 쓸 수 없어 현재 폴더에 저장했습니다: {}".format(OUTPUT_PATH, fallback))
        print("이 파일을 site/ontology/versions/data/gonghun_snapshot.json 위치로 옮겨주세요.")


def main():
    name_set = set(GONGHUN_PERSONS)
    found_by_name = {name: [] for name in GONGHUN_PERSONS}
    start_page = 1
    total_pages = None

    checkpoint = _load_checkpoint()
    if checkpoint:
        resume = input(
            "이전 중단 지점을 발견했습니다 (페이지 {}/{} 부터 재개). 이어서 진행할까요? [Y/n] ".format(
                checkpoint["nextPage"], checkpoint.get("totalPages", "?")
            )
        ).strip().lower()
        if resume in ("", "y", "yes"):
            start_page = checkpoint["nextPage"]
            total_pages = checkpoint.get("totalPages")
            for name, recs in checkpoint.get("foundByName", {}).items():
                if name in found_by_name:
                    found_by_name[name] = recs
            print("체크포인트에서 재개합니다.")
        else:
            print("처음부터 다시 시작합니다.")

    print("공훈전자사료관 전체 목록을 로컬에서 직접 순회 조회합니다 (인물 {}명 대상)...".format(len(GONGHUN_PERSONS)))

    page = start_page
    total_scanned = (start_page - 1) * COUNT_PER_PAGE  # 재개 시 대략치, 로그용
    try:
        while True:
            try:
                records, total_count = fetch_page(page)
            except RuntimeError as e:
                print("\n중단됨:", e)
                print("현재까지 결과를 스냅샷으로 저장하고, 체크포인트를 남깁니다.")
                _save_checkpoint(page, found_by_name, total_pages)
                _write_snapshot(found_by_name, total_scanned, total_pages or "?", resumed=True)
                return

            if total_pages is None:
                if not total_count:
                    print("TOTAL_COUNT를 확인할 수 없습니다 — API 응답 구조를 확인해주세요.")
                    return
                total_pages = math.ceil(total_count / COUNT_PER_PAGE)
                print("전체 {}명, {}페이지(페이지당 {}건) 확인됨.".format(total_count, total_pages, COUNT_PER_PAGE))

            for rec in records:
                nm = rec.get("NAME_KO")
                if nm in name_set:
                    found_by_name[nm].append(rec)

            total_scanned += len(records)
            matched_so_far = sum(1 for n in GONGHUN_PERSONS if found_by_name[n])
            print(
                "  [{}/{}] 페이지 처리 완료 — 누적 스캔 {}건, 지금까지 매칭된 인물 {}/{}명".format(
                    page, total_pages, total_scanned, matched_so_far, len(GONGHUN_PERSONS)
                )
            )

            if page % CHECKPOINT_EVERY_N_PAGES == 0:
                _save_checkpoint(page + 1, found_by_name, total_pages)

            if page >= total_pages:
                break
            page += 1
            time.sleep(REQUEST_INTERVAL_SEC)

    except KeyboardInterrupt:
        print("\n사용자가 중단했습니다. 현재까지 결과를 스냅샷으로 저장하고, 체크포인트를 남깁니다.")
        _save_checkpoint(page, found_by_name, total_pages)
        _write_snapshot(found_by_name, total_scanned, total_pages or "?", resumed=True)
        return

    # 전체 순회 완료 — 체크포인트 정리 후 최종 스냅샷 저장
    if os.path.exists(CHECKPOINT_PATH):
        os.remove(CHECKPOINT_PATH)
    _write_snapshot(found_by_name, total_scanned, total_pages, resumed=False)

    matched = sum(1 for n in GONGHUN_PERSONS if len(found_by_name[n]) == 1)
    multi = sum(1 for n in GONGHUN_PERSONS if len(found_by_name[n]) > 1)
    unmatched = sum(1 for n in GONGHUN_PERSONS if len(found_by_name[n]) == 0)
    print("\n전체 순회 완료 — 총 {}건 스캔.".format(total_scanned))
    print("요약: 매칭 {} · 동명이인 {} · 미매칭 {} (총 {}명)".format(matched, multi, unmatched, len(GONGHUN_PERSONS)))


if __name__ == "__main__":
    main()