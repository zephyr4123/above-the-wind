"""ATW-16 · 珠峰真实 DEM 采集 → 16-bit 高度图(可复现)

数据源:AWS Terrain Tiles(bucket elevation-tiles-prod)的 terrarium 编码瓦片,
**免登录 / 无账号 / 无 API key**,纯 HTTPS 直取。珠峰区块底数据 = SRTM。

许可:SRTM 为美国政府公有领域,可商用;需轻量署名:
    "SRTM data courtesy of the U.S. Geological Survey"

珠峰 27.9881N / 86.925E · zoom 12 的 2×2 瓦片(x∈{3036,3037} × y∈{1715,1716}),
拼成 512×512、约 34 m/px、覆盖约 17 km,罩住整个马哈兰古尔山群。
terrarium 高程解码:elevation_m = R*256 + G + B/256 - 32768。

产物(入库、运行时不依赖 S3):
    web/public/everest-heightmap.png   —— 归一化到 [0,65535] 的 16-bit 灰度高度图
    web/public/everest-heightmap.json  —— {min_m, max_m, ...} 供 shader 还原真实米

用法:python harvest/everest_dem.py   (在装了 Pillow + numpy 的环境里)
"""
import io
import json
import os
import time
import urllib.error
import urllib.request

import numpy as np
from PIL import Image

Z = 12
# 2×2 拼图顺序:左上(西北)→ 右上 → 左下 → 右下(slippy XYZ:y 越大越南)
GRID = [(3036, 1715, 0, 0), (3037, 1715, 256, 0), (3036, 1716, 0, 256), (3037, 1716, 256, 256)]
URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT_PNG = os.path.join(ROOT, "web", "public", "everest-heightmap.png")
OUT_BIN = os.path.join(ROOT, "web", "public", "everest-height.bin")
OUT_META = os.path.join(ROOT, "web", "public", "everest-heightmap.json")
DS = 256  # 前端用的降采样边长(512→256 均值降采样)


def fetch(x: int, y: int, retries: int = 3) -> Image.Image:
    url = URL.format(z=Z, x=x, y=y)
    req = urllib.request.Request(url, headers={"User-Agent": "above-the-wind/atw-16"})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return Image.open(io.BytesIO(r.read())).convert("RGB")
        except (urllib.error.URLError, TimeoutError):
            if attempt == retries - 1:
                raise
            time.sleep(2**attempt)  # 指数退避,抗瞬时网络抖动
    raise RuntimeError("unreachable")


def main() -> None:
    canvas = Image.new("RGB", (512, 512))
    for x, y, ox, oy in GRID:
        canvas.paste(fetch(x, y), (ox, oy))
        print(f"  fetched terrarium/{Z}/{x}/{y}")

    rgb = np.asarray(canvas, dtype=np.float64)  # (512,512,3)
    elev = rgb[:, :, 0] * 256.0 + rgb[:, :, 1] + rgb[:, :, 2] / 256.0 - 32768.0  # 米
    mn, mx = float(elev.min()), float(elev.max())

    # 归一化 → 16-bit(0-8800m 用 8-bit 会出台阶,必须 16-bit)
    norm = (elev - mn) / (mx - mn if mx > mn else 1.0)
    h16 = np.clip(norm * 65535.0, 0, 65535).round().astype(np.uint16)

    os.makedirs(os.path.dirname(OUT_PNG), exist_ok=True)
    Image.fromarray(h16).save(OUT_PNG)  # uint16 → PIL 'I;16' → 16-bit 灰度 PNG(留作人眼核对)

    # 前端真正吃的:Float32 归一化高度场(512→256 均值降采样),规避 16-bit PNG 浏览器解码丢精度
    norm32 = norm.reshape(DS, 2, DS, 2).mean(axis=(1, 3)).astype("<f4")  # 小端 float32
    norm32.tofile(OUT_BIN)

    snow01 = (8000.0 - mn) / (mx - mn)  # 8000m 雪线在归一化空间的位置(供 shader 阈值)
    with open(OUT_META, "w", encoding="utf-8") as f:
        json.dump(
            {
                "min_m": round(mn, 1),
                "max_m": round(mx, 1),
                "snowline_8000m_norm": round(snow01, 4),
                "dim": DS,
                "bin": "everest-height.bin (Float32 LE, normalized 0-1, row-major, DIM*DIM)",
                "zoom": Z,
                "center_latlon": [27.9881, 86.925],
                "ground_res_m_per_px": 33.7,
                "source": "AWS Terrain Tiles (terrarium encoding, SRTM under Everest) — public domain",
                "attribution": "SRTM data courtesy of the U.S. Geological Survey",
            },
            f,
            ensure_ascii=False,
            indent=2,
        )
    print(f"baked {OUT_PNG} + {OUT_BIN} ({DS}x{DS} f32)")
    print(f"elevation range: {mn:.0f} – {mx:.0f} m · 8000m 雪线归一化={snow01:.3f}")


if __name__ == "__main__":
    main()
