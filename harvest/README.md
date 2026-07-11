# harvest/ — 数据地基采集脚本

登山编年档案库的 P0 数据采集工具。方法论与源-许可判定见 [`../research/`](../research/)。

## 运行

```bash
python3 -m venv .venv && .venv/bin/pip install requests   # 一次性
.venv/bin/python harvest/wikidata_backbone.py             # 各脚本独立可跑
```

数据落 `data/`（已 gitignore，可由脚本复现；大体量原始 dump 不入库）。

## 脚本 · 产出 · 许可

| 脚本 | 产出 | 许可 / 署名义务 |
|---|---|---|
| `wikidata_backbone.py` | `data/wikidata/` — 八千米峰(15)、知名山峰(6461)、登山家(1494) | **CC0**，可商用、免署名。全库以 Wikidata QID 为主键 |
| `geonames_mountains.py` | `data/geonames/mountains.tsv` — 13 万高山要素(≥2000m，含多语别名) | **CC-BY 4.0**，可商用，**必须署名「GeoNames」** |
| `public_domain_texts.py` | `data/texts/` — 52 部公版全文(44M 字符) + manifest | Gutenberg=公有领域；**IA 逐项核 rights**（1929 前按美国 PD，商用再分发前确认） |
| `nasa_nps_media.py` | `data/media/` — NASA/NPS 底图 | PD（美国联邦作品）。**⚠️ WIP**：源 URL 需修正（NPS 页 404、NASA scrape 过宽），延到做视觉层时精确取 |

## 两条采集铁律（详见 research/README.md）

1. **事实 vs 表达**：海拔/日期/登顶者/伤亡数等事实不受版权，可从任何源提取重写；叙述文字、精编表编排、图片受保护。
2. **图片是独立红区**：即便条目来自 CC0 源，配图各自授权，逐文件核 Commons `extmetadata`，不安全的走 `ae-image-decopyrighter` 重绘。

## P0 采集状态

- ✅ #1 Wikidata 事实骨架 · ✅ #3 GeoNames · ✅ #4+#5 公版全文（含 1921/22/24 珠峰官方志、Whymper《Scrambles》、早期 Alpine Journal）
- ⏸️ #2 SRTM/NASADEM DEM、⚠️ #6 NASA/NPS 底图 —— 均为可视化资产（非事实数据），延到有前端、做地形/视觉层时用精确方法补
- 已知缺口：喀喇昆仑侧 6 座八千米峰细节（唯一系统源 8000ers.com=AVOID，靠事实层拼补，密度偏薄）

## 数据量级速览

八千米峰 15 · 知名山峰 6461 · 登山家 1494 · GeoNames 高山 13 万 · 公版全文 52 部 / 44M 字符
