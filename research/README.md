# research/ — 登山档案库数据地基

> 由 `mountain-data-recon` workflow（12 路并行网络侦察 + 逐源许可对抗核验 + 综合）产出。
> 目的：写任何代码前，先摸清「哪些登山数据免费可复用、怎么整批拿、红线在哪」。

## 三条法律地基（所有采集共同遵守）

1. **事实 vs 表达** —— 海拔 / 坐标 / 首登日期 / 登顶者 / 伤亡数 / 用氧标志是**事实，不受版权保护**，可从任何源（含 AVOID 源）提取并用自己的话重写入库。受保护的是：叙述文字、精编数据表的选择编排、照片 / 插图。**凡 AVOID 源只当「事实核验线索」，绝不搬正文与图。**
2. **图片是全库统一红区，与文本许可解耦** —— 即便条目来自 CC0/CC-BY-SA 源，配图各自独立授权。20 世纪探险 / 山难名照与在世登山家肖像大量仍在版权期。图片必须**逐文件**核 `extmetadata`，只收 PD/CC0/CC-BY(-SA)，其余走 `ae-image-decopyrighter` 重绘替代。
3. **查不清就从严（判 CAUTION），不乐观放行。**

## SAFE 骨架：先落这几层（全部 P0，可整批下、可商用、免/低署名）

- **Wikidata (CC0)** —— 全库**事实主键层**，以 QID 为主键；SPARQL 精准查 + 每周 RDF dump 建本地库。山峰 / 人物 / 远征 / 事件 / 首登 / 伤亡全域覆盖。
- **SRTM / NASADEM (CC0/PD)** —— 海拔真值 DEM，自渲等高线 / 地形剖面底图。
- **1786–1930 公有领域全文（Gutenberg + Internet Archive + Wikisource）** —— 最肥的**可全文商用叙事资产**：Whymper《Scrambles Amongst the Alps》、Mummery、1921/1922/1924 珠峰官方志等，含期内木刻插图，可整段收录、切片、再分发。
- 交叉校验层：GeoNames(CC-BY)、OSM(ODbL，注意传染)、DBpedia(CC-BY-SA)。

## 三个最大风险 / 缺口

- **喀喇昆仑 / 巴基斯坦侧 6 座 8000 米峰（K2 / Nanga Parbat / GI / GII / Broad Peak）是全库最大数据缺口** —— 唯一系统源 `8000ers.com` 判 **AVOID**（德国法 + EU sui generis 数据库权，明文禁商用 / 抓取 / 直链）。只能靠 Wikidata/Wikipedia 事实层 + AAJ / Himalayan Journal 逐案核验拼补，密度必然偏薄。
- **Himalayan Database** 是尼泊尔侧远征 / 死亡 / 用氧的绝对权威，但**专有免费、禁再分发** → CAUTION：下载抽事实入自研 schema、清晰致谢、**绝不整包镜像**；且只覆盖尼泊尔侧 8 座。
- **现代高原生理 / 医学**几乎全 AVOID（WMS / MSD / 期刊 all-rights-reserved）→ 只引事实 + 规范引注；可全文入库的仅 PD 老文本 + PMC OA「Commercial-Use-Allowed」子集。

## verdict 分布（24 个综合源）

**SAFE 8 · CAUTION 9 · AVOID 7**（AVOID 含：图片 / 8000ers.com / 现代医学文献 / 中文门户站）。完整逐源见 `SOURCES.md`。

## 文件索引

| 文件 | 内容 |
|---|---|
| `SOURCES.md` | 源-许可地图（SAFE→CAUTION→AVOID，人读） |
| `coverage.md` | 12 领域数据覆盖矩阵（富 / 中 / 薄 + 缺口） |
| `harvest-plan.md` | 批量采集蓝图（15 项，P0/P1/P2） |
| `synth.json` | 综合结果机读版（source_map / coverage / harvest / findings） |
| `recon-raw.json` | 12 路侦察原始返回（全部源 + 样本 + 头部条目） |
| `licenses.json` | 40 源逐源许可核验原始返回 |

## 已知瑕疵

- 41 个去重源中 **1 个许可核验 agent 触发 schema 重试超限失败**（未进 `licenses.json`）。不影响 P0——P0 全部落在已核验的 SAFE 源（Wikidata / SRTM / Gutenberg / IA / GeoNames / NASA EO）上。

## 下一步

按 `harvest-plan.md` 的 **6 个 P0**（全 SAFE）整批采集：Wikidata SPARQL 事实骨架 → SRTM/NASADEM DEM → GeoNames 底表 → Gutenberg/IA 公版全文 → 珠峰官方志 → NASA EO 底图。建议先做 **Wikidata 事实骨架**（全库主键），再叠 DEM 与公版文本。
