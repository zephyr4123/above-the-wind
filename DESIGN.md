# Design · Archive Instrument「高海拔观测仪」

视觉系统单一真相源。实现于 `web/`（Vite + React + TS）。
所有内容切片共享同一套设计基建：视觉 token 在 `web/src/styles/archive.css`。
数据不同、呈现不同，但风格严格对齐——本文所有色值 / 数字均逐条核自源文件，改代码就改这里。

## 设计理念

把界面当作一台**安静、精确的测量仪器**来做。判据：把三维山体拿掉，
剩下的界面应像一台仪器的读数面板，而不是一张网页。

四个支柱：

- **冰川白 canvas**：页面底色为冷调近白 `#eef1ef`，群山照片的浅色天空向上渐隐融入画布白，
  制造高海拔大气感。
- **群山影像实体**：暗调群山照片承担画面的"重"，静、考据；深色仪器构件用近黑 `#111312`。
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
| `--archive-canvas` | `#eef1ef` | 页面底色 · 照片浅天向上渐隐融接处 |
| `--archive-canvas-raised` | `#f7f9f8` | 极少量悬浮区域 |
| `--archive-rock` | `#111312` | 深色仪器构件（时间轴节点等） |
| `--archive-ink` | `#242927` | 主要文字 |
| `--archive-ink-muted` | `#5e6461` | 次要信息 |
| `--archive-line` | `rgb(17 19 18 / 24%)` | 标尺、时间轴、引导线 |
| `--archive-line-inverse` | `rgb(238 241 239 / 72%)` | 影像暗区上的线 |
| `--archive-line-inverse-faint` | `rgb(238 241 239 / 42%)` | 影像暗区上退后的量程线（时间轴基线/垂茎/年刻度），与亮底 24% 黑视觉对等 |
| `--archive-accent` | `#ff4b19` | 路线、切面、选中节点（橙，2–4% 面积上限） |
| `--archive-accent-text` | `#f04000` | 文字用深一档橙：对 canvas ≥3:1（大字 AA） |
| `--archive-accent-soft` | `rgb(255 75 25 / 16%)` | 切面散射 |

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

英文大写标签字距 `--archive-tracking-caps: 0.08em`（`.caps`，如来源标 `SOURCE · WIKIDATA CC0`）；
页眉铭牌是唯一的特调疏排：品牌 `ABOVE THE WIND` 0.18em、居中型号铭文 0.32em（末字字距用负 margin 抵掉）。

## Layout

全屏定位式仪器（`.instrument`，`position: fixed; inset: 0`），四个仪器构件围合一个舞台：

- **顶部导航** `--archive-nav-h: 68px`——页眉读作「铭牌 · 型号 · 计数窗」，无图标无分隔符：
  左 = 双层铭牌 lockup（`ABOVE THE WIND` 0.18em 疏排 600 + 中文题签**长风之上**两端对齐撑满英文行宽，
  `text-align-last: justify`）；中 = `十四座八千米` 0.32em 疏排型号铭文（fs-label）；
  右 = mono 计数窗（当前序号 ink 实色、`/ 14` 退灰）。层级只靠字重/墨色/字距——
  无功能的汉堡菜单、斜杠、`✛` 字符均已删除（仪器上不能有拨不动的旋钮）。
- **左侧高度标尺** `--archive-scale-width: 72px`——竖脊 + 41 根等距细刻度，
  主刻度 `9,000 / 8,500 / 8,000 / 7,500 … / 0 M`（死亡带 8000–9000 刻意放大占更多屏幕）；
  其中 **8,000 M 一档为 accent 橙**，刻度更长、标签变橙，与屏幕上的橙色切面对齐。
- **底部时间轴** `--archive-timeline-h: 104px`——首登黄金年代量程标尺：基线用
  `line-inverse-faint`（42%，与亮底 24% 黑对等），逐年细刻度下挂、每 5 年主刻度加长带年标
  （1950/1955/1960/1964，足色 + 暗晕过 AA）；14 个峰节点**悬浮于基线上方**（垂茎连回时刻，
  刻度与数据不再互相遮盖）+ 橙菱形 marker 垂下读数针穿过基线。
- **中央舞台** `.stage`——环 + 峰名标注。

关键对齐常量：`App.css` 的 `--horizon` 用与标尺同一公式推导（`nav-h + 30% ×（视口 − nav − timeline）`，
对应 RULER 里 8,000 档的 `top: 30`），让「橙色切面线」与「左侧标尺 8,000 档」数学上严格同高。
安全边距 `--archive-safe-margin: 32px`（tablet 20 / mobile 16，随媒体查询降级；
**nav-h 刻意不随断点变**——环线位点与切面都锚在 stage 几何上，nav 跳变会让它们相对照片漂移）。
间距走 4px 基准网格（`--archive-space-1..16`）。

## Components（组件语言 = 仪器化标注）

界面语言是**标尺、环、刻度、引线、节点**，不是卡片和列表。核自 `App.tsx` / `PeakRing.tsx`：

- **`.instrument__plane`** —— 8,000 米橙色切面：`--horizon` 处的 **1px 发丝线**（80% 橙），
  三层遮罩合成（`mask-composite: intersect`）：两层照片**亮度遮罩**相乘（= 亮度平方——天空清晰、
  亮雪若隐若现、暗岩全隐，峰体自然遮挡切面）+ 一层水平渐变（线在进入右侧读数面板前淡出，
  不与橙色大数字相撞）。是全屏唯一的强调线。
- **`PeakRing`** —— 14 座峰**不排成规整椭圆，而是贴着背景照片的可见峰脊布点**：`NODE_POS`
  是一组按海拔序（01→14）手调的 `{x, y}` 百分比位（对着照片视觉调准），用 **Catmull-Rom →
  三次贝塞尔**（`smoothClosedPath`）串成一条穿过所有节点的**平滑闭合环**——像一条绕山巅一圈的
  轨道，而非几何椭圆。SVG `viewBox 0 0 100 100`、`preserveAspectRatio="none"` 贴合满宽 `.stage`。
  每个节点是空心小圆点 `--archive-node-sm: 8px` + 等宽两位编号 `01…14`；选中态放大到
  `--archive-node-md: 12px`、填橙、外发一圈 `accent-soft`。环线用亮描边 + 暗晕（`drop-shadow`），
  跨亮天与暗岩都可读。触控热区 `--archive-node-hit: 44px`（≥44 无障碍下限）。
- **`AltitudeRuler`** —— 竖脊 `.ruler__spine` + 41 根 `.ruler__tick` + 11 个 `.ruler__mark`
  主刻度（9,000 / 8,500 / 8,000 / 7,500 … / 0 M，非线性——死亡带刻意放大）；8,000 档 `.is-accent`。
- **`PeakCallout`** —— 右上峰名信息面板（右对齐，**无卡片背板**，直接浮在影像上）：橙色等宽
  rank + 峰名（中文）+ 大写罗马名（`nameEn`）+ 橙色大号等宽海拔数 + 发丝分隔线 + 等宽经纬度
  （度分秒 `dms()`）+ 首登全日期（`29 MAY 1953`）+ 竖排来源标（`writing-mode: vertical-rl`）。
- **`Timeline`** —— 播放键（走带巡演：按首登时间序每 1.6s 自动切峰，再点暂停）+ 量程标尺轨
  （逐年细刻度 + 每 5 年主刻度带年标）+ 峰节点（按首登时间序渲染保 Tab 序 = 视觉序；悬浮基线上方，
  **同年多峰横向微散开**，步长 `min(11px, 2.2%)`——宽屏定像素不漂移、窄屏按年距 1/3 封顶防时序倒挂；
  纵向透明扩区补 44px 触控热区）+ 橙菱形 marker（`::before` 旋转菱形 + `::after` 垂直读数针）+
  `进入编年史 →` 入口。轨道带 `role="group"` 年代量程标签，读屏可感知时间语境。

形状 token：圆角只到 `--archive-radius-sm: 4px`，发丝线 `--archive-stroke-hairline: 1px`、
激活线 `--archive-stroke-active: 2px`。

## 背景影像（`App.tsx` · `web/src/assets/massif.jpg`）

观测仪的背景是一张**生成式群山影像**（`gpt-image-2` 文生图，AI 自生成、无第三方版权），
经 `import` 打包（Vite 自动加 hash + base 前缀，天然适配 GitHub Pages 子路径——不用绝对路径 `fetch`）。

- **`.instrument__photo`**：`position: absolute; inset: 0`，`background-size: cover`、
  `background-position: center bottom`——群山锚定视口底部，浅色天空在上。
- **`.instrument__sky`**：顶部 34% 高的线性渐变（`--archive-canvas` → 透明），把照片浅天
  渐隐进画布白，保证顶栏品牌与标题在任何裁切下都可读。
- 图片压成 JPEG（~340 KB）；灰度大气影像走 JPEG 几乎无可见质量损失。

> **为什么从「真实 DEM 程序化地形」改为影像**：早期观测仪（ATW-16，见 git 历史）用 OGL/WebGL2
> 从真实珠峰 SRTM DEM 建几何，但视觉达不到作品级。ATW-33 起整块推翻——改用一张构图讲究的
> 生成式群山影像做底，把精力放在仪器叠加层的精确与克制上。随之删除 `TerrainCanvas`、`SnowField`、
> `theme/archive.ts` 与全部 DEM 资产 / 采集脚本，并卸载 `ogl` 依赖：包体更小、无版权更干净。

## 编年记录仪（`Chronicle.tsx` · `#chronicle` 视图）

与观测仪成对的时间视角切片：**左暗右浅的分屏**——左列是暗色「时间 × 海拔记录仪」，
右列是浅色可滚动首登记录列表。核自 `Chronicle.tsx` / `Chronicle.css`：

- **分屏布局**：`.chronicle__stage` grid 两列（44% / 1fr），左 `.recorder` sticky 到
  stage 底（**不含页脚**——滚到记录末尾左图即停、黑色页脚全宽接管，不会盖住图）。
  ≤1024px 收成单列，左图变全宽 sticky 顶带（200px / ≤640 150px）。
- **左暗区**：底为 `--archive-rock` + 第二张生成式群山影像
  `web/src/assets/night-massif.jpg`（AI 生成、无第三方版权，暗调山脊锚底）。
  迹线语义 = 时间指针：**已走段白实线（canvas）、未走段灰虚线**；橙 8000 基线 +
  playhead 竖线 + **active 点橙发光 + 年份/海拔坐标读数 + 橙引线**（水平连到分屏
  分界线，指向右侧当前记录）。图幅眉注（左上仪器名·量程 / 右上记录数）、左沟槽竖排
  轴名（英文大号从下往上 + 中文小号正立，两列分层）、`SCROLL ↓`、**数据驱动的沉默
  括弧**（相邻首登年份差 ≥3 自动生成，两行标签：年份区间 + N 年无首登）。
- **active 同步 = hover 驱动（做减法）**：鼠标悬停 / 键盘聚焦哪条记录，左图就高亮
  哪条；点击图节点滚到对应记录（`scroll-margin-top` 避开吸顶栏）；展开（手风琴，
  同一时刻至多一条）同时置 active。**不用滚动位置判断**——展开会改变布局导致漂移。
- **右浅区记录**：active 记录橙左内边框 + 左侧橙三角指示 + 橙海拔；行内含队伍 /
  死亡率 / 溯源计数,展开后是全叙事 + 字段 + 三层来源。
- **页眉**：双行图名（首登编年 + `FIRST ASCENT CHRONICLE · 1950—1964`）+ 铭牌
  （`ABOVE THE WIND` + 长风之上）+ mono 计数窗 + SVG 准星;下接居中 masthead 统计条。
- **页脚（colophon）**：黑色「档案完成」区块——锯齿山脊分界（多频正弦确定性生成,
  向上咬进浅色记录区）+ `1950 — 1964` 大字 + 三栏（档案来源 / 使用与许可 CC BY-SA
  4.0 / 继续探索）+ `14/14 ARCHIVE COMPLETE` + 罗盘（橙芯发光）+ 四角定位十字。

## Motion

动效时长与缓动同源于 `archive.css`（fast 140 / base 220 / scene 800）：

| token | 值 | 用途 |
|---|---|---|
| `--archive-motion-fast` | `140ms` | UI hover（如节点缩放） |
| `--archive-motion-base` | `220ms` | 标签切换 |
| `--archive-motion-scene` | `800ms` | 总览进入详情 / 场景切换 |
| `--archive-ease-ui` | `cubic-bezier(0.22, 1, 0.36, 1)` | UI 缓动 |

## Token 作为项目基建

`styles/archive.css`（视觉 token）是全项目的 UI infra 单一真相源。后续每个内容切片都复用
这套 `--archive-*` token，色值 / 字体 / 间距 / 动效不各自另起——数据不同、呈现不同，但风格对齐。
**改视觉从改 token 起，别在组件里写魔法值。**
