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

程序化 3D 地形 + 高度材质 shader，用 **OGL** 渲染，**WebGL2 + GLSL `#version 300 es`**。
当前为 PoC（程序化噪声地形），真实珠峰 DEM 为后续升级项。核实的关键数值：

**几何 / 相机**（`TerrainCanvas.tsx`）
- `Plane` 网格 `34 × 30`，细分 `260 × 230`。
- `Camera` FOV `CAMERA_FOV = 32°`（`theme/archive.ts`），`near 0.1 / far 100`；
  位置 `(0, 3.4, 13.5)`，`lookAt (0, 1.9, 0)`。
- DPR 上限 `DPR_DESKTOP = 1.5`（`DPR_MOBILE = 1`），`alpha: true`（画布透出 CSS 背景），
  `antialias: true`，`powerPreference: "high-performance"`。

**Vertex shader** —— 程序化高度场，追求嶙峋高山而非平滑圆丘：
- value noise + fbm（5 层，`p = p*2.03 + 1.7`）做大尺度起伏；
- **ridged multifractal**（6 octave，每层 `n = (1-|2·noise-1|)²`、`s += a·n·prev`）让脊线尖锐、细节向脊线聚集；
- `massif = exp(-d²·0.055)` 造中央高耸山块；
- `height = (massif·1.06 + r·(0.20+0.46·massif) + base·0.17 − 0.045·(1−massif)·fbm(g·3.2)) · uAmp`，末项在侧翼刻蚀侵蚀沟槽、破整块感；`uAmp = 5.0`。
- 法线用 `e = 0.05` 步长解析差分求出；另导出 `vSlope = 1 − N.y`（0 平坦 → 1 陡壁）供 fragment 用。

**Fragment shader** —— 高度 + 坡度材质：
- 定向光 `dir (0.35, 0.86, 0.30)`，岩色在 `uRock↔uRockMid` 间按 `light²` 混合，冰色在 `uIceShadow↔uIce` 间按 `light` 混合并叠细颗粒（hash）破整块。
- **雪线 = 高度阈值 + 坡度**：`uThreshold = 3.05`（对应 8,000 米切面），`snowLine = smoothstep(thr−0.05, thr+0.10, h)`；陡壁挂不住雪 `steepShed = smoothstep(0.70, 0.40, vSlope)`，`snow = snowLine·(0.42 + 0.58·steepShed)` —— 雪为主、陡处露黑岩肋，打破"冰白整块墙"。
- **等高线母题**：`contour = smoothstep(0.05, 0, |fract(h·3.0) − 0.5|)·0.06`，一圈圈极淡测绘等高线裹住三维体。
- **橙色切面**：`band = 1 − smoothstep(0, 0.05, abs(h − thr))`，以 `band·0.42` 混入 `uAccent` —— 收紧成一条精确散射线（橙色被 shader 严格约束在这条窄带里）。
- 远处大气：`haze = smoothstep(7, 16, -vPos.z)`，以 `haze·0.42` 淡入 `uCanvas` 冰川白。

**风雪粒子层**（`SnowField.tsx`，Canvas 2D 覆盖层，非 WebGL）—— 冰白 spindrift 短 streak 被高空风吹过场景，`PARTICLE_OPACITY = 0.28` 为不透明度上限；压在亮雪上自然隐没、显现于暗岩与岩肋，给暗色下半部一点死亡地带的风动。`prefers-reduced-motion` 下退化为静态单帧。

**高度阈值常量**（`theme/archive.ts`）：`DEATH_ZONE_ALTITUDE = 8000`、
`SUMMIT_ALTITUDE = 8849`、`TERRAIN_EXAGGERATION = 1.04`、`PARTICLE_OPACITY = 0.28`。

> 注：StrictMode 下 mount→unmount→mount 会毒化重挂载的 WebGL context，
> `TerrainCanvas` 卸载时**故意不调 `loseContext`**，让 GC 随 canvas 回收（见源码注释）。

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
