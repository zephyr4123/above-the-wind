# Design

视觉系统。跟随 [DESIGN.md 规范](https://raw.githubusercontent.com/google-labs-code/design.md/main/docs/spec.md) 的精神；实现于 `web/`（Vite + React + TS）。

## Theme

**深色 · 敬畏感（reverent alpine archive）**。深空近黑底，让生成式雪峰剪影与海拔数据在暗处发光。基调是"站在死亡地带边缘"的庄严——不是户外品牌的明亮冰蓝，而是深、静、考据。品牌锚色为**苔绿（olive/moss，hue≈132）**，刻意避开"雪山=冰蓝"的品类反射；雪山感由发光峰形 + 冰川蓝点缀 + 主题本身承载。

## Color（OKLCH · full-palette 策略）

| role | value | 用途 |
|---|---|---|
| `--bg` | `oklch(0.16 0.014 220)` | 深空底（极淡冷调，冰影而非纯黑） |
| `--surface` | `oklch(0.205 0.016 220)` | 卡面/详情面板 |
| `--surface-2` | `oklch(0.245 0.018 220)` | 抬升层/hover |
| `--line` | `oklch(0.32 0.014 220)` | 发丝线/分隔 |
| `--ink` | `oklch(0.95 0.006 220)` | 正文（对 bg ≈15:1） |
| `--muted` | `oklch(0.71 0.012 220)` | 次级文字（≥4.5:1） |
| `--primary` | `oklch(0.76 0.15 132)` | 苔绿：品牌锚、强调、交互态 |
| `--accent` | `oklch(0.84 0.09 218)` | 冰川蓝：雪线、数据高亮、链接 |
| `--brass` | `oklch(0.78 0.11 74)` | 探险黄铜：首登/年代标记的暖点 |
| `--snow` | `oklch(0.975 0.006 220)` | 剪影雪冠 |
| `--rock` | `oklch(0.29 0.02 245)` | 剪影岩体 |

文字落在饱和色填充（primary/accent/brass 按钮、徽标）上用**白字**（Helmholtz–Kohlrausch，中亮度饱和色发亮）。

## Typography

选字避开训练集默认（不用 Inter/DM/Space Grotesk/Playfair/Fraunces）。品牌三词：**敬畏 · 测绘 · 精确**。

- **Display（峰名、海拔大数）**：`Archivo`（变体，含 `wdth` 宽度轴）——加宽加重 → 纪念碑式测绘感（"Archivo" 名字本身即"档案"）。
- **UI/正文**：`Archivo`（常规宽度，多字重）。同一超家族多轴 = 克制而统一。
- **Data（坐标、海拔单位、经纬）**：`JetBrains Mono`——测量数据用等宽是**有意义的**（仪器/测绘），非装饰性 costume；仅用于数字/坐标。

模块化比例，heading 用 `clamp()`，display 上限 ≤6rem，字距 ≥ -0.03em。tabular-nums 对齐海拔。

## Layout

**高度阶梯（altitude ladder）**：海拔即组织脊柱，不用卡片网格。14 座峰按海拔从珠峰 8850 降到希夏邦马 8027，每座一行——左侧共享 8000–8850 海拔轴，行内含生成式雪峰剪影（高度映射海拔）、峰名 en/zh、山脉、国别、首登年。点击展开详情（坐标/突起/首登者/编年故事）。两种排序：**海拔** / **首登编年**（1950→1964 黄金年代）。

## Imagery

**生成式 SVG 雪峰剪影**——每座峰由其数据确定性生成（种子=峰名哈希），岩体 + 雪冠 + 冰蓝棱线，高度反映海拔。100% 无版权、数据驱动、上主题。**不用许可照片**（图片是版权红区，且难保证"某图确为某峰"）。Wikidata 的 Commons 图片字段仅留作日后逐文件核验的线索，不直接引用。

## Motion

一次克制进场：行按海拔错峰淡入 + 微升。详情展开：高度+透明度平滑过渡（`motion`）。缓动用 ease-out-expo，无 bounce。全量 `prefers-reduced-motion` 降级为淡入/瞬切。

## Components

`PeakLadder`（列表+海拔轴+排序切换）· `PeakRow`（单峰行 + 内联剪影）· `PeakDetail`（展开详情）· `PeakSilhouette`（生成式 SVG，可复用于行内小图与详情大图）。
