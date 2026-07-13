<div align="center">

# 风之上 · Above the Wind

**一个考据扎实、视觉出彩的登山编年档案库**

地球上仅有十四座逾 8000 米的山峰。这个项目把它们的尺度、首登史与探险故事，做成一份严肃的高山测绘档案——每条内容都可追溯到免费、无版权的公版事实源。

<br>

![React](https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61dafb)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)
![Data](https://img.shields.io/badge/data-CC0%20·%20CC--BY%20·%20Public%20Domain-2ea44f)
![License](https://img.shields.io/badge/code-MIT-informational)

</div>

---

## 目录

| 章节 | 说明 |
|---|---|
| [是什么](#是什么) | 项目定位与首个切片 |
| [项目亮点](#项目亮点) | 为什么值得一看 |
| [技术栈](#技术栈) | 前端与采集两条链 |
| [目录结构](#目录结构) | 东西都在哪 |
| [快速开始](#快速开始) | 装依赖 + 跑起来 |
| [数据来源与许可](#数据来源与许可) | 每条数据从哪来、怎么署名 |
| [许可与致谢](#许可与致谢) | 代码许可与鸣谢 |

---

## 是什么

**风之上**是一个登山编年档案库——把登山的历史、故事与高海拔科普，做成一个可长期生长的数字档案。它的立场是**档案而非营销**：克制、密度高、可追溯，让真实的尺度与史实自己承载重量，不靠形容词煽情。

第一个前端切片是 **「十四座八千米」浏览器**：地球上仅有的十四座逾 8000 米山峰，以及它们横跨 **1950（安纳普尔纳）→ 1964（希夏邦马）** 的喜马拉雅登山黄金年代首登史。

数据地基已就位——八千米峰事实骨架、六千余座知名山峰、一千余位登山家、十三万条高山地理要素、五十二部公版登山文学全文，全部取自免费、可复用的公开源。

---

## 项目亮点

- **Archive Instrument「高海拔观测仪」视觉体系** — 自研的仪器化界面：冰川白空间画布 + 生成式群山影像 + 8000 米橙色切面 + 极简测绘标注，克制而敬畏。刻意避开"雪山=冰蓝渐变"的品类反射与 AI 默认的米色编辑风。
- **生成式群山影像 + 数据驱动仪器层** — 观测仪以一张**生成式群山影像**（`gpt-image-2` 文生图，AI 自生成、无第三方版权）为背景，叠 SVG 仪器叠加：**贴照片山巅的 01–14 峰环**、海拔标尺、8000 米橙色切面。**不用任何受版权的第三方照片**——图片是版权红区，AI 自生成图无此风险。
- **海拔即秩序** — 用真实海拔数据当组织脊柱（从珠峰 8849 m 到希夏邦马 8027 m），而非任意网格。数据驱动结构，而非套模板。
- **事实与许可分离的采集纪律** — 海拔、日期、登顶者、伤亡数等**事实**不受版权，可从任何源提取重写；叙述文字、精编表格、图片受保护，逐条核许可。全库数据的源—许可判定沉淀在 [`research/`](research/)。
- **可追溯到公版源** — 每条内容都能指回一个免费、无版权的一手事实源。

---

## 技术栈

**前端（`web/`）**

| 用途 | 选型 |
|---|---|
| 框架 | React 19 + TypeScript 6 |
| 构建 | Vite 8 |
| 背景 | 生成式群山影像（`gpt-image-2`）+ SVG 仪器叠加 |
| 动效 | CSS transition（节点缩放 / 峰切换） |
| 字体 | 系统字栈（PingFang SC / SF Mono）——刻意用系统字反 AI 默认审美 |
| Lint | oxlint |

**数据采集（`harvest/`）** — Python 3 + `requests`，每个脚本独立可跑，产物落 `data/`（gitignore，可由脚本复现）。

---

## 目录结构

```
above-the-wind/
├── web/            前端应用（React + Vite + TS）
│   ├── src/
│   │   ├── components/   PeakRing —— 贴山巅的 01–14 峰环
│   │   ├── data/         peaks.ts —— 14 座峰的策展数据
│   │   ├── assets/       massif.jpg —— 生成式群山背景影像
│   │   └── styles/       archive.css —— Archive Instrument 设计 token
│   └── package.json
├── harvest/        数据采集脚本（Python，各自独立可跑）
│   ├── wikidata_backbone.py    事实骨架（CC0）
│   ├── geonames_mountains.py   高山地理要素（CC-BY）
│   ├── public_domain_texts.py  公版登山文学全文
│   └── nasa_nps_media.py       NASA/NPS 底图（⚠️ WIP）
├── research/       源—许可地图、覆盖矩阵、采集蓝图
│   ├── SOURCES.md      每个数据源的许可判定（SAFE/CAUTION/AVOID）
│   └── coverage.md     12 领域数据覆盖矩阵
├── data/           采集产物（gitignore，由脚本复现）
├── PRODUCT.md      产品定位与品牌
└── DESIGN.md       视觉系统规范
```

---

## 快速开始

> 前置：Node ≥ 20（开发用 Node 26 / npm 11）、Python 3。

### 跑前端

```bash
cd web
npm install
npm run dev        # 启动 Vite 开发服务器
```

`web/package.json` 中的全部脚本：

| 命令 | 作用 |
|---|---|
| `npm run dev` | Vite 开发服务器（热更新） |
| `npm run build` | 类型检查 + 生产构建（`tsc -b && vite build`） |
| `npm run preview` | 本地预览生产构建产物 |
| `npm run lint` | oxlint 静态检查 |

### 复现数据（可选）

数据采集独立于前端，仅在想重新采集时需要。各脚本互不依赖，可单独运行。

```bash
python3 -m venv .venv && .venv/bin/pip install requests   # 一次性
.venv/bin/python harvest/wikidata_backbone.py             # 采集八千米峰事实骨架
.venv/bin/python harvest/geonames_mountains.py            # 采集 GeoNames 高山要素
.venv/bin/python harvest/public_domain_texts.py           # 采集公版登山文学全文
```

产物落在 `data/`（已 gitignore；大体量原始 dump 不入库）。采集方法论与源—许可判定见 [`harvest/README.md`](harvest/README.md) 与 [`research/`](research/)。

---

## 数据来源与许可

全库遵守一条纪律：**事实可复用，表达受保护，图片是独立红区**。海拔、日期、登顶者、伤亡数等事实不受版权，可从任何源提取并重写；叙述文字、精编表格、配图逐条核许可。

| 数据源 | 许可 | 用于 | 义务 |
|---|---|---|---|
| **Wikidata** | CC0 1.0 | 八千米峰 / 知名山峰 / 登山家的事实骨架（全库以 QID 为主键） | 无（公有领域，免署名） |
| **GeoNames** | CC-BY 4.0 | 坐标 / 海拔 / 多语别名底表 | **必须署名「GeoNames」** |
| **Project Gutenberg** | 美国公有领域 | 公版登山文学全文（Whymper、Mummery、1922 珠峰官方志等） | 剥离 PG boilerplate 后使用 |

> **署名声明**：本项目地理数据部分来自 [GeoNames](https://www.geonames.org/)（CC-BY 4.0）。
>
> 配图策略：**不使用受版权的第三方照片**。观测仪背景为**生成式群山影像**（`gpt-image-2` 文生图，AI 自生成、无第三方版权），叠数据驱动的 SVG 仪器层。Wikidata 指向的 Commons 图片字段仅作日后逐文件核验的线索，不直接引用。

完整的源—许可地图（含 CAUTION / AVOID 判定、每域覆盖矩阵）见 [`research/SOURCES.md`](research/SOURCES.md) 与 [`research/coverage.md`](research/coverage.md)。

<details>
<summary>为什么这么讲究许可？</summary>

<br>

登山史料散落在大量专有数据库（如某些统计站、期刊、商业地图）中。这些源可以作为**事实核验线索**，但正文与图片绝不搬用。项目只把无争议的**事实**（谁、何时、何地、发生了什么）落入自研 schema，叙述自行重写，配图改用生成式渲染或已进入公有领域的历史版画。这样整库才能在署名 GeoNames 的前提下自由复用。

</details>

---

## 许可与致谢

- **代码**：MIT。
- **数据**：各源许可如上表，以各自条款为准；使用地理数据须署名 GeoNames。
- **致谢**：感谢 Wikidata、GeoNames、Project Gutenberg 及无数将登山史料带入公共领域的整理者与档案工作者。

<div align="center">
<br>
<em>站在死亡地带的边缘，让真实的尺度自己说话。</em>
</div>
