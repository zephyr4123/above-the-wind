# Design · Archive Instrument「高海拔观测仪」

视觉系统单一真相源。实现于 `web/`（Vite + React + TS + OGL）。
所有内容切片共享同一套设计基建：视觉 token 在 `web/src/styles/archive.css`，
WebGL 与 JS 逻辑要读的数值常量在 `web/src/theme/archive.ts`。数据不同、呈现不同，
但风格严格对齐——本文所有色值 / 数字均逐条核自这两份源文件，改代码就改这里。

## 设计理念

把界面当作一台**安静、精确的测量仪器**来做。判据：把三维山体拿掉，
剩下的界面应像一台仪器的读数面板，而不是一张网页。

四个支柱：

- **冰川白 canvas**：页面与 WebGL 背景同为冷调近白 `#eef1ef`，山体从下半部升起、
  上方透明露出画布白，制造高海拔大气感。
- **黑岩实体**：8,000 米以下的山体是近黑岩 `#111312`，重、静、考据。
- **8,000 米橙色切面**：唯一的高饱和色 `#ff4b19`，只用来标记死亡地带切面、
  路线、选中节点。**橙色严格只占画面 2–4%**——它是仪器上的那一根红针，多一分就俗。
- **极简仪器标注**：标尺、刻度、引线、环、准星。信息靠位置和刻度传达，不靠装饰。

**反 AI 味硬约束**：无卡片、无药丸（pill）、无投影阴影、无圆角堆叠、无渐变滥用；
字体用系统字栈而非"设计感"web font；圆角上限 4px（`--archive-radius-sm`），
主要靠 0 圆角的直角与发丝线。

## Color

色彩 token 全部在 `styles/archive.css` 的 `:root`，`color-scheme: light`。
以下为逐条核实的真实色值与用途（不臆造）：

| token | 值 | 用途 |
|---|---|---|
| `--archive-canvas` | `#eef1ef` | 页面与 WebGL 背景 |
| `--archive-canvas-raised` | `#f7f9f8` | 极少量悬浮区域 |
| `--archive-rock` | `#111312` | 8,000 米以下山体（黑岩） |
| `--archive-rock-mid` | `#292d2b` | 岩石亮面 |
| `--archive-ink` | `#242927` | 主要文字 |
| `--archive-ink-muted` | `#5e6461` | 次要信息 |
| `--archive-line` | `rgb(17 19 18 / 24%)` | 标尺、时间轴、引导线 |
| `--archive-line-inverse` | `rgb(238 241 239 / 72%)` | 山体暗区上的线 |
| `--archive-ice` | `#f5fafc` | 8,000 米以上山体（冰白） |
| `--archive-ice-shadow` | `#c7d5dc` | 冰雪阴影 |
| `--archive-accent` | `#ff4b19` | 路线、切面、选中节点（橙，2–4% 面积上限） |
| `--archive-accent-soft` | `rgb(255 75 25 / 16%)` | 切面散射 |
| `--archive-scrim` | `rgb(10 12 11 / 72%)` | 底部文字可读性保护 |

WebGL 侧在 `theme/archive.ts` 的 `ARCHIVE_COLORS` 复制了其中 6 个 shader 要用的色值
（`canvas / rock / rockMid / ice / iceShadow / accent`），经 `hexToRgb01()` 转成
`[r,g,b]` 0–1 传给 GLSL uniform。**两处色值必须一致**，改一处要同步另一处。

## Typography

**刻意用系统字栈**，不引 web font——这既是反 AI 默认审美（不用 Inter/DM/Playfair 那套
"设计感"字体），也让仪器读数有原生、克制、无签名的质感。两个栈（源自 `archive.css`）：

- **UI / 正文** `--archive-font-ui`：`"PingFang SC", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif`
- **Data / 刻度 / 坐标** `--archive-font-data`：`ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace`
  —— 海拔、编号、年代、单位一律走等宽（`.mono` class），测量数据用等宽是有意义的仪器语义。

全套只用无衬线 + 等宽，**不用宋体 / 衬线 / 书法**。字号阶梯（`--archive-fs-*`）：

| token | 值 | 用途 |
|---|---|---|
| `--archive-fs-alt` | `clamp(2rem, 1.6rem + 1.4vw, 2.5rem)` | 山峰高度大数（32–40px） |
| `--archive-fs-name` | `clamp(1.25rem, 1.05rem + 0.7vw, 1.5rem)` | 山峰名称（20–24px） |
| `--archive-fs-event` | `1.0625rem` | 关键事件（16–18px） |
| `--archive-fs-body` | `0.9375rem` | 数据正文（14–16px） |
| `--archive-fs-label` | `0.8125rem` | 仪器标签（12–13px） |
| `--archive-fs-tick` | `0.6875rem` | 微型刻度（10–11px） |

英文大写标签字距 `--archive-tracking-caps: 0.08em`（`.caps`，如品牌 `ABOVE THE WIND`）。

## Layout

全屏定位式仪器（`.instrument`，`position: fixed; inset: 0`），四个仪器构件围合一个舞台：

- **顶部导航** `--archive-nav-h: 68px`（移动端 56px）——左：汉堡三划 + 品牌
  `ABOVE THE WIND / 风之上`；中：`十四座八千米 · 高海拔观测仪`；右：`NN / 14` 当前排名 + 准星 `✛`。
- **左侧高度标尺** `--archive-scale-width: 72px`——竖脊 + 41 根等距细刻度，
  4 个主刻度 `8,849 / 8,000 / 4,000 / 0 M`；其中 **8,000 M 一档为 accent 橙**，
  刻度更长、标签变橙，与屏幕上的橙色切面对齐。
- **底部时间轴** `--archive-timeline-h: 104px`——首登黄金年代 `1950 — 1964`，
  逐年细刻度 + 14 个峰节点 + 一个 45° 旋转的橙色菱形 marker 指当前选中峰。
- **中央舞台** `.stage`——环 + 峰名标注。

关键对齐常量：`App.css` 定义 `--horizon: 42%`，让「橙色切面线 + 标尺 8,000 档 +
shader 阈值」三者在屏幕同一高度对齐。安全边距 `--archive-safe-margin: 32px`
（tablet 20 / mobile 16，随媒体查询降级）。间距走 4px 基准网格（`--archive-space-1..16`）。

## Components（组件语言 = 仪器化标注）

界面语言是**标尺、环、刻度、引线、节点**，不是卡片和列表。核自 `App.tsx` / `PeakRing.tsx`：

- **`.instrument__plane`** —— 8,000 米橙色切面：`1.5px` 橙实线 + 两层柔和散射
  （`box-shadow` 用 `--archive-accent-soft`），是全屏唯一的强调线。
- **`PeakRing`** —— 14 座峰排成一个椭圆环（SVG `viewBox 0 0 100 100`，
  中心 `CX 50 / CY 48`，半径 `RX 40 / RY 30`，从 `START -70°` 顺时针均分）。
  每个节点是空心小圆点 `--archive-node-sm: 8px` + 等宽两位编号 `01…14`；
  选中态放大到 `--archive-node-md: 12px`、填橙、外发一圈 `accent-soft`。
  一条 `polyline` 引线（leader）从选中节点连到右上标注锚点 `CALLOUT_ANCHOR {x:80, y:19}`。
  触控热区 `--archive-node-hit: 44px`（≥44 无障碍下限）。
- **`AltitudeRuler`** —— 竖脊 `.ruler__spine` + 41 根 `.ruler__tick` + 4 个 `.ruler__mark`
  主刻度；8,000 档 `.is-accent`。
- **`PeakCallout`** —— 右上峰名标注：橙色等宽 rank + 峰名（中文，字距 0.06em）
  + 橙色大号等宽海拔数（`--archive-fs-alt`）+ muted 的首登年。**无卡片背板**，直接浮在画布上。
- **`Timeline`** —— 播放键 + 逐年刻度轨 + 峰节点 + 橙菱形 marker + `进入编年史 →` 入口。

形状 token：圆角只到 `--archive-radius-sm: 4px`，发丝线 `--archive-stroke-hairline: 1px`、
激活线 `--archive-stroke-active: 2px`。

## WebGL 场景（`TerrainCanvas.tsx` + `theme/archive.ts`）

**真实珠峰 DEM 地形**（ATW-16），用 **OGL** 渲染，**WebGL2 + GLSL `#version 300 es`**。地形几何在 **CPU 侧**从真实高程场建出（精确 float + 平滑法线，规避 16-bit PNG 被浏览器解码成 8-bit 丢精度）。核实的关键数值：

**数据源与许可**
- 高程场 = `web/public/everest-height.bin`（256² Float32 归一化，采集脚本 `harvest/everest_dem.py`），来自 **AWS Terrain Tiles**（terrarium 编码）的珠峰区块，底数据 = **SRTM**（美国公有领域）。免登录直取。
- 署名（轻量，见 README 数据来源段）：`SRTM data courtesy of the U.S. Geological Survey`。

**几何**（CPU 建于 `buildTerrain`）
- 网格 `GRID = 384`²，世界宽度 `EXTENT = 34`；高度 = **真实 DEM 双线性宏观**（`sampleDEM`）+ **程序微观脊线**（JS ridged fbm，`MICRO_F=48 / MICRO_AMP=0.5`，由 DEM 高度调制 → 高处起脊、谷地平滑）补嶙峋感。
- `WORLD_AMP = 14`（归一化 → 世界 Y，含垂直夸张补戏剧性）；边界顶点下沉成**裙边**（`SKIRT = -8`），相机拉远取景也不露画布。
- 法线 = 合成高度的中央差分（微观脊线也被上色感知）；Uint32 index。
- `Camera` FOV `32°`，位置 `(0, 9.5, 32)`，`lookAt (0, 4.6, 0)`；`.bin` 用 `fetch` 异步加载后建几何（StrictMode 用 `alive` 标志守护，避免卸载后仍建 renderer）。

**Vertex shader** —— 几何已带真实 Y 与法线，只做投影 + 透传 `vH / vPos / vNormal / vSlope`。

**Fragment shader** —— 高度 + 坡度材质（沿用 ATW-15 观测仪，只有阈值随 DEM 尺度改）：
- 定向光 `dir (0.35, 0.86, 0.30)`，岩色 `uRock↔uRockMid` 按 `light²`、冰色 `uIceShadow↔uIce` 按 `light` + 细颗粒（hash）破整块。
- **雪线与死亡地带解耦**：`uSnow`（真实雪线，归一化 `SNOWLINE_NORM=0.4` ≈ 6500m）驱动 `snowLine`；`uBand`（8000m 死亡地带，归一化 `DEATHZONE_NORM=0.8`）驱动橙色切面。陡壁挂不住雪 `steepShed`、雪为主 + 陡处露黑岩肋。
- **等高线母题** + **8000m 橙色切面**（`band` 落在真实峰顶上，精确标出哪些峰破 8000m）+ 远处 `haze` 淡入 `uCanvas` 冰川白。

**风雪粒子层**（`SnowField.tsx`，Canvas 2D 覆盖层，非 WebGL）—— 冰白 spindrift 压亮雪隐没、显于暗岩，`PARTICLE_OPACITY = 0.28`；`prefers-reduced-motion` 退化为静态单帧。

**高度阈值常量**（`theme/archive.ts`）：`DEATH_ZONE_ALTITUDE = 8000`、`SUMMIT_ALTITUDE = 8849`、`PARTICLE_OPACITY = 0.28`。

> 注：StrictMode 下 mount→unmount→mount 会毒化重挂载的 WebGL context，`TerrainCanvas` 卸载时**故意不调 `loseContext`**（见源码注释）。

## Motion

动效时长与缓动同源于 `archive.css`，`theme/archive.ts` 的 `MOTION` 与之对齐（fast 140 / base 220 / scene 800）：

| token | 值 | 用途 |
|---|---|---|
| `--archive-motion-fast` | `140ms` | UI hover（如节点缩放） |
| `--archive-motion-base` | `220ms` | 标签切换 |
| `--archive-motion-scene` | `800ms` | 总览进入详情 / 相机（= `CAMERA_TRANSITION_MS`） |
| `--archive-ease-ui` | `cubic-bezier(0.22, 1, 0.36, 1)` | UI 缓动 |
| `--archive-ease-camera` | `cubic-bezier(0.16, 1, 0.3, 1)` | 相机缓动 |

## Token 作为项目基建

`styles/archive.css`（视觉）+ `theme/archive.ts`（WebGL/JS 数值）是全项目的 UI infra
单一真相源。后续每个内容切片都复用这套 `--archive-*` token 与常量，色值 / 字体 / 间距 /
动效不各自另起——数据不同、呈现不同，但风格对齐。**改视觉从改 token 起，别在组件里写魔法值。**
