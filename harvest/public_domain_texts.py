#!/usr/bin/env python3
"""P0 #4+#5:公有领域登山文学全文采集(Project Gutenberg + Internet Archive)。

PD 文本可整段收录 / 切片 / 再分发,是档案库最肥的「可全文商用叙事资产」。
产出 data/texts/{gutenberg,ia}/*.txt + data/texts/manifest.json。

许可:
  - Gutenberg: 明确公有领域(copyright=false 过滤)。
  - Internet Archive: 逐项核 rights —— 1929 前出版按美国公有领域处理,
    近卷可能 borrow-only,manifest 标 license_note,商用再分发前逐本确认。
"""
import json
import re
import sys
import time
import pathlib
import requests

UA = "above-the-wind-mountaineering-archive/0.1 (personal research; huangsuxiang5@gmail.com)"
DATA = pathlib.Path(__file__).resolve().parent.parent / "data" / "texts"
GUT_DIR = DATA / "gutenberg"
IA_DIR = DATA / "ia"

GUTENDEX = "https://gutendex.com/books/"
GUT_TERMS = ["mountaineering", "mountains alps", "Everest", "Himalaya", "alpine climbing"]
GUT_CAP = 60

IA_SEARCH = "https://archive.org/advancedsearch.php"
IA_QUERIES = [
    'subject:(mountaineering) AND mediatype:texts AND year:[1786 TO 1928]',
    '(title:(Everest) OR title:(Alps) OR title:(Himalaya)) AND mediatype:texts AND year:[1900 TO 1928]',
]
# recon 点名的一手珠峰官方志(dli 扫描件,美国公有领域)
IA_CURATED = ["in.ernet.dli.2015.170876"]
IA_CAP = 40

session = requests.Session()
session.headers.update({"User-Agent": UA})


def strip_pg(text):
    """剥 Project Gutenberg 头尾 boilerplate,只留正文。"""
    s = re.search(r"\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG.*?\*\*\*", text, re.I | re.S)
    e = re.search(r"\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG", text, re.I)
    if s and e:
        return text[s.end():e.start()].strip()
    return text.strip()


def harvest_gutenberg(manifest):
    GUT_DIR.mkdir(parents=True, exist_ok=True)
    seen = set()
    for term in GUT_TERMS:
        if len(seen) >= GUT_CAP:
            break
        try:
            r = session.get(GUTENDEX, params={"search": term, "languages": "en"}, timeout=60)
            r.raise_for_status()
            books = r.json().get("results", [])
        except Exception as ex:
            print(f"  [gutenberg] 搜索 '{term}' 失败: {ex}", file=sys.stderr)
            continue
        for b in books:
            if len(seen) >= GUT_CAP:
                break
            bid = b["id"]
            if bid in seen or b.get("copyright") is True:
                continue
            fmts = b.get("formats", {})
            txt_url = next((u for m, u in fmts.items()
                            if m.startswith("text/plain") and not u.endswith(".zip")), None)
            if not txt_url:
                continue
            try:
                tr = session.get(txt_url, timeout=120)
                tr.raise_for_status()
                body = strip_pg(tr.text)
            except Exception as ex:
                print(f"  [gutenberg] 下载 {bid} 失败: {ex}", file=sys.stderr)
                continue
            (GUT_DIR / f"{bid}.txt").write_text(body, encoding="utf-8")
            seen.add(bid)
            manifest.append({
                "source": "gutenberg", "id": bid, "title": b.get("title"),
                "author": ", ".join(a["name"] for a in b.get("authors", [])),
                "language": ",".join(b.get("languages", [])),
                "license_note": "public domain (Project Gutenberg)",
                "chars": len(body), "path": f"data/texts/gutenberg/{bid}.txt",
            })
            print(f"  [gutenberg] {bid} {b.get('title','')[:60]} ({len(body)} 字符)")
            time.sleep(0.5)


def ia_ids():
    ids, seen = [], set()
    for cid in IA_CURATED:
        if cid not in seen:
            ids.append(cid); seen.add(cid)
    for q in IA_QUERIES:
        try:
            r = session.get(IA_SEARCH, params={
                "q": q, "fl[]": ["identifier", "title", "year", "creator"],
                "rows": 60, "page": 1, "output": "json"}, timeout=60)
            r.raise_for_status()
            for d in r.json()["response"]["docs"]:
                cid = d["identifier"]
                if cid not in seen:
                    ids.append(cid); seen.add(cid)
        except Exception as ex:
            print(f"  [ia] 搜索失败: {ex}", file=sys.stderr)
    return ids[:IA_CAP]


def harvest_ia(manifest):
    IA_DIR.mkdir(parents=True, exist_ok=True)
    for cid in ia_ids():
        try:
            meta = session.get(f"https://archive.org/metadata/{cid}", timeout=60).json()
        except Exception as ex:
            print(f"  [ia] {cid} 元数据失败: {ex}", file=sys.stderr)
            continue
        files = meta.get("files", [])
        txt = next((f["name"] for f in files if f["name"].endswith("_djvu.txt")), None)
        if not txt:
            continue
        try:
            tr = session.get(f"https://archive.org/download/{cid}/{txt}", timeout=180)
            tr.raise_for_status()
            body = tr.text.strip()
        except Exception as ex:
            print(f"  [ia] {cid} 下载失败: {ex}", file=sys.stderr)
            continue
        if len(body) < 2000:  # 跳过空壳
            continue
        m = meta.get("metadata", {})
        (IA_DIR / f"{cid}.txt").write_text(body, encoding="utf-8")
        manifest.append({
            "source": "internet_archive", "id": cid, "title": m.get("title"),
            "author": m.get("creator"), "year": m.get("year") or m.get("date"),
            "license_note": "IA: 逐项核 rights;1929 前按美国 PD,商用再分发前确认",
            "chars": len(body), "path": f"data/texts/ia/{cid}.txt",
        })
        print(f"  [ia] {cid} {str(m.get('title',''))[:60]} ({len(body)} 字符)")
        time.sleep(1)


def main():
    DATA.mkdir(parents=True, exist_ok=True)
    manifest = []
    print("[texts] Project Gutenberg ...")
    harvest_gutenberg(manifest)
    print("[texts] Internet Archive ...")
    harvest_ia(manifest)
    (DATA / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    g = sum(1 for x in manifest if x["source"] == "gutenberg")
    i = sum(1 for x in manifest if x["source"] == "internet_archive")
    chars = sum(x["chars"] for x in manifest)
    print(f"完成:{g} 部 Gutenberg + {i} 部 IA,共 {chars/1e6:.1f}M 字符 -> data/texts/manifest.json")


if __name__ == "__main__":
    main()
