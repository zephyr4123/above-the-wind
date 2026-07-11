#!/usr/bin/env python3
"""P0 #6:NASA Earth Observatory 卫星底图 + NPS Denali 登山统计(均美国联邦 PD)。

尽力抓取型:PD 政府作品可放心复用。产出 data/media/ 下资产 + manifest.json。
注意:仅 NASA/NPS 自产内容是 PD;页面若内嵌第三方图不在此列(本脚本只取
nasa.gov / nps.gov 同域资产)。
"""
import json
import re
import sys
import pathlib
from urllib.parse import urljoin, urlparse
import requests

UA = "above-the-wind-mountaineering-archive/0.1 (personal research; huangsuxiang5@gmail.com)"
DATA = pathlib.Path(__file__).resolve().parent.parent / "data" / "media"

NASA_EO_PAGES = [
    "https://earthobservatory.nasa.gov/images/151060/the-eight-thousanders",
    "https://science.nasa.gov/earth/earth-observatory/the-eight-thousanders/",
]
NPS_DENALI_PAGES = [
    "https://www.nps.gov/dena/planyourvisit/mountaineering-statistics.htm",
    "https://www.nps.gov/dena/learn/management/mountaineering-statistics.htm",
]

session = requests.Session()
session.headers.update({"User-Agent": UA})


def fetch(url):
    try:
        r = session.get(url, timeout=60)
        r.raise_for_status()
        return r
    except Exception as ex:
        print(f"  取 {url} 失败: {ex}", file=sys.stderr)
        return None


def download_asset(url, outdir, manifest, source, license_note):
    name = pathlib.Path(urlparse(url).path).name
    if not name:
        return
    try:
        r = session.get(url, timeout=120)
        r.raise_for_status()
    except Exception as ex:
        print(f"  下载 {url} 失败: {ex}", file=sys.stderr)
        return
    outdir.mkdir(parents=True, exist_ok=True)
    (outdir / name).write_bytes(r.content)
    manifest.append({"source": source, "url": url, "path": str((outdir / name).relative_to(DATA.parent.parent)),
                     "bytes": len(r.content), "license_note": license_note})
    print(f"  [{source}] {name} ({len(r.content)/1024:.0f} KB)")


def harvest_nasa(manifest):
    for page in NASA_EO_PAGES:
        r = fetch(page)
        if not r:
            continue
        # 抓同域大图(jpg/png),含 <img src> 与全分辨率链接
        urls = set(re.findall(r'https?://[^\s"\'<>]+?\.(?:jpg|jpeg|png)', r.text, re.I))
        urls |= {urljoin(page, m) for m in re.findall(r'(?:src|href)="([^"]+?\.(?:jpg|jpeg|png))"', r.text, re.I)}
        keep = [u for u in urls if "nasa.gov" in urlparse(u).netloc and "icon" not in u.lower() and "logo" not in u.lower()]
        print(f"  [nasa] {page} -> {len(keep)} 张候选图")
        for u in sorted(keep)[:30]:
            download_asset(u, DATA / "nasa_eo", manifest, "nasa_eo",
                           "public domain (NASA, US federal work)")
        if keep:
            break


def harvest_nps(manifest):
    for page in NPS_DENALI_PAGES:
        r = fetch(page)
        if not r:
            continue
        links = {urljoin(page, m) for m in re.findall(r'href="([^"]+?\.(?:xlsx|xls|pdf|csv))"', r.text, re.I)}
        links = {u for u in links if "nps.gov" in urlparse(u).netloc}
        print(f"  [nps] {page} -> {len(links)} 个统计文件")
        for u in sorted(links)[:20]:
            download_asset(u, DATA / "nps_denali", manifest, "nps_denali",
                           "public domain (NPS, US federal work)")
        if links:
            break


def main():
    DATA.mkdir(parents=True, exist_ok=True)
    manifest = []
    print("[media] NASA Earth Observatory ...")
    harvest_nasa(manifest)
    print("[media] NPS Denali 统计 ...")
    harvest_nps(manifest)
    (DATA / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"完成:{len(manifest)} 个 PD 资产 -> data/media/manifest.json")
    if not manifest:
        print("(未抓到资产 —— 页面结构可能已变,标记 #6 待人工复核)", file=sys.stderr)


if __name__ == "__main__":
    main()
