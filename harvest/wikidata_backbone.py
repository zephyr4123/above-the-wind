#!/usr/bin/env python3
"""Wikidata 事实骨架采集 (P0)。

把登山档案库的主键层从 Wikidata(CC0)拉成 JSON,以 QID 为全库主键:
  - eight_thousanders: 海拔 >=8000m 的山峰(真米,含各山的独立卫峰)
  - notable_peaks:     海拔 >=3000m 且有英文维基条目的知名山峰
  - mountaineers:      occupation=登山家(Q9149093) 且有英文维基条目的人物

许可: Wikidata 主数据 CC0,可放心复用、免署名。
红区: image(P18)只存文件名,配图版权与文本解耦,用前必逐文件核 Commons extmetadata。

单位: P2044(海拔)/P2660(地形突起)用归一化值 psn:(统一换算成 SI 米),
      避免以英尺存储的美国山峰污染米制阈值过滤。
"""
import json
import sys
import time
import pathlib
import requests

ENDPOINT = "https://query.wikidata.org/sparql"
UA = "above-the-wind-mountaineering-archive/0.1 (personal research; huangsuxiang5@gmail.com)"
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "wikidata"

# 山峰类查询公共尾部:标签(en/zh) + 坐标/归一化地形突起/山脉/国家/配图
PEAK_TAIL = """
  OPTIONAL { ?item rdfs:label ?en FILTER(LANG(?en)="en") }
  OPTIONAL { ?item rdfs:label ?zh FILTER(LANG(?zh)="zh") }
  OPTIONAL { ?item wdt:P625 ?coord }
  OPTIONAL { ?item p:P2660/psn:P2660/wikibase:quantityAmount ?prominence }
  OPTIONAL { ?item wdt:P4552 ?range . ?range rdfs:label ?rangeLabel FILTER(LANG(?rangeLabel)="en") }
  OPTIONAL { ?item wdt:P17 ?country . ?country rdfs:label ?countryLabel FILTER(LANG(?countryLabel)="en") }
  OPTIONAL { ?item wdt:P18 ?image }
"""

QUERIES = {
    "eight_thousanders": """
SELECT ?item ?en ?zh ?elevation ?coord ?prominence ?rangeLabel ?countryLabel ?image WHERE {
  ?item wdt:P31 wd:Q8502 .
  ?item p:P2044/psn:P2044/wikibase:quantityAmount ?elevation .
  FILTER(?elevation >= 8000)
""" + PEAK_TAIL + "}",

    "notable_peaks": """
SELECT ?item ?en ?zh ?elevation ?coord ?prominence ?rangeLabel ?countryLabel ?image WHERE {
  ?item wdt:P31 wd:Q8502 .
  ?item p:P2044/psn:P2044/wikibase:quantityAmount ?elevation .
  FILTER(?elevation >= 3000)
  ?sitelink schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> .
""" + PEAK_TAIL + "}",

    "mountaineers": """
SELECT ?item ?en ?zh ?birth ?death ?citizenshipLabel ?image WHERE {
  ?item wdt:P106 wd:Q9149093 .
  ?sitelink schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> .
  OPTIONAL { ?item rdfs:label ?en FILTER(LANG(?en)="en") }
  OPTIONAL { ?item rdfs:label ?zh FILTER(LANG(?zh)="zh") }
  OPTIONAL { ?item wdt:P569 ?birth }
  OPTIONAL { ?item wdt:P570 ?death }
  OPTIONAL { ?item wdt:P27 ?citizenship . ?citizenship rdfs:label ?citizenshipLabel FILTER(LANG(?citizenshipLabel)="en") }
  OPTIONAL { ?item wdt:P18 ?image }
}""",
}


def run_query(query, retries=4):
    """POST 到 WDQS,带退避重试。返回 bindings 列表。"""
    for attempt in range(retries):
        resp = requests.post(
            ENDPOINT,
            data={"query": query, "format": "json"},
            headers={"User-Agent": UA, "Accept": "application/sparql-results+json"},
            timeout=180,
        )
        if resp.status_code == 200:
            return resp.json()["results"]["bindings"]
        if resp.status_code in (429, 500, 502, 503, 504):
            wait = 5 * (attempt + 1)
            print(f"  HTTP {resp.status_code},{wait}s 后重试 ({attempt + 1}/{retries})", file=sys.stderr)
            time.sleep(wait)
            continue
        print(f"  HTTP {resp.status_code}: {resp.text[:500]}", file=sys.stderr)
        resp.raise_for_status()
    raise RuntimeError(f"查询失败,重试 {retries} 次仍未成功")


def simplify(rows):
    """把 SPARQL binding 的 {value,type} 结构压平成纯 value dict。"""
    return [{k: v["value"] for k, v in row.items()} for row in rows]


def dedupe_by_item(rows):
    """多值 OPTIONAL 会让同一 item 出现多行 —— 收敛成一 item 一行:
    海拔取最大值,其余标量字段取首个非空值。"""
    by = {}
    for r in rows:
        it = r.get("item")
        if it is None:
            continue
        if it not in by:
            by[it] = dict(r)
            continue
        cur = by[it]
        for k, v in r.items():
            if not v:
                continue
            if k == "elevation":
                try:
                    if float(v) > float(cur.get("elevation") or 0):
                        cur[k] = v
                except ValueError:
                    pass
            elif not cur.get(k):
                cur[k] = v
    return list(by.values())


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    summary = {}
    for name, query in QUERIES.items():
        print(f"[wikidata] 查询 {name} ...")
        raw = simplify(run_query(query))
        rows = dedupe_by_item(raw)
        (OUT / f"{name}.json").write_text(
            json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        summary[name] = {"raw_rows": len(raw), "items": len(rows)}
        print(f"  -> {len(raw)} 原始行 收敛为 {len(rows)} 实体,写入 data/wikidata/{name}.json")
        time.sleep(2)  # 对 WDQS 客气点
    (OUT / "_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("完成:", json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
