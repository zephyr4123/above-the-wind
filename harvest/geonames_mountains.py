#!/usr/bin/env python3
"""GeoNames 高山要素采集 (P0)。

从 GeoNames allCountries.zip(CC-BY 4.0)流式抽取全球「山」类要素,作为
Wikidata 骨架的坐标/海拔交叉校验层 + 多语别名 + 未进维基的峰补漏。

许可: CC-BY 4.0 —— 可商用,需署名「GeoNames」。
过滤: feature_class == 'T'(山/丘/岩) 且 feature_code ∈ {MT,PK,PKS,MTS,VLC}
      且 max(elevation, dem) >= 2000m(留有意义的高山,砍掉海量小丘)。

只把 370MB zip 落盘,不解压 1.5GB 明文 —— 用 zipfile 流式逐行读。
"""
import csv
import io
import sys
import zipfile
import pathlib
import requests

URL = "https://download.geonames.org/export/dump/allCountries.zip"
UA = "above-the-wind-mountaineering-archive/0.1 (personal research; huangsuxiang5@gmail.com)"
DATA = pathlib.Path(__file__).resolve().parent.parent / "data" / "geonames"
ZIP_PATH = DATA / "allCountries.zip"
OUT_TSV = DATA / "mountains.tsv"

CODES = {"MT", "PK", "PKS", "MTS", "VLC"}  # mountain / peak / peaks / mountains / volcano
MIN_ELEV = 2000

# GeoNames geoname 表列序
C_ID, C_NAME, C_ASCII, C_ALT = 0, 1, 2, 3
C_LAT, C_LON, C_FCLASS, C_FCODE, C_COUNTRY = 4, 5, 6, 7, 8
C_ELEV, C_DEM = 15, 16
OUT_COLS = ["geonameid", "name", "asciiname", "alternatenames",
            "lat", "lon", "feature_code", "country", "elevation", "dem"]


def download():
    DATA.mkdir(parents=True, exist_ok=True)
    if ZIP_PATH.exists() and ZIP_PATH.stat().st_size > 100_000_000:
        print(f"[geonames] zip 已存在 ({ZIP_PATH.stat().st_size/1e6:.0f} MB),跳过下载")
        return
    print(f"[geonames] 下载 {URL} ...")
    with requests.get(URL, headers={"User-Agent": UA}, stream=True, timeout=600) as r:
        r.raise_for_status()
        total = int(r.headers.get("Content-Length", 0))
        got = 0
        with open(ZIP_PATH, "wb") as f:
            for chunk in r.iter_content(chunk_size=1 << 20):
                f.write(chunk)
                got += len(chunk)
                if total:
                    print(f"\r  {got/1e6:.0f}/{total/1e6:.0f} MB", end="", file=sys.stderr)
    print(f"\n[geonames] 下载完成 {got/1e6:.0f} MB")


def to_int(s):
    try:
        return int(s)
    except (ValueError, TypeError):
        return None


def extract():
    kept = 0
    scanned = 0
    with zipfile.ZipFile(ZIP_PATH) as zf, open(OUT_TSV, "w", encoding="utf-8", newline="") as out:
        writer = csv.writer(out, delimiter="\t")
        writer.writerow(OUT_COLS)
        with zf.open("allCountries.txt") as raw:
            text = io.TextIOWrapper(raw, encoding="utf-8")
            for line in text:
                scanned += 1
                if scanned % 2_000_000 == 0:
                    print(f"\r  已扫描 {scanned/1e6:.0f}M 行,留 {kept}", end="", file=sys.stderr)
                col = line.rstrip("\n").split("\t")
                if len(col) < 17 or col[C_FCLASS] != "T" or col[C_FCODE] not in CODES:
                    continue
                elev = to_int(col[C_ELEV]) or 0
                dem = to_int(col[C_DEM]) or 0
                if max(elev, dem) < MIN_ELEV:
                    continue
                writer.writerow([col[C_ID], col[C_NAME], col[C_ASCII], col[C_ALT],
                                 col[C_LAT], col[C_LON], col[C_FCODE], col[C_COUNTRY],
                                 col[C_ELEV], col[C_DEM]])
                kept += 1
    print(f"\n[geonames] 扫描 {scanned} 行,留下 {kept} 个高山要素 -> {OUT_TSV}")
    return kept


if __name__ == "__main__":
    download()
    extract()
    print("完成")
