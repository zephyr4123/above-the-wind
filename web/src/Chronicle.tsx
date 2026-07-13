import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Chronicle.css";
import nightMassifUrl from "./assets/night-massif.jpg";
import { PEAKS, type Peak } from "./data/peaks";
import { CITATIONS, TIER_LABEL, type Citation } from "./data/citations";

/* ── 时间×海拔 记录仪坐标系 ──────────────────────────────────────────
   与观测仪成对的姊妹仪器:x=连续时间(1950→1965)、y=海拔(8000→8849,倒置)。
   14 次首登按首登序连成一条诚实的锯齿迹线。坐标用 0–100 归一(SVG viewBox
   与 HTML % 同源对齐,preserveAspectRatio=none 让 x 填宽、y 填高)。 */
const TIME_MIN = 1950;
const TIME_MAX = 1965;
const ALT_MIN = 8000;
const ALT_MAX = 8849;
const PAD = { l: 12, r: 6, t: 8, b: 12 };

function fracYear(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const day0 = (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86_400_000;
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  return y + day0 / (leap ? 366 : 365);
}
const xPct = (iso: string) =>
  PAD.l + ((fracYear(iso) - TIME_MIN) / (TIME_MAX - TIME_MIN)) * (100 - PAD.l - PAD.r);
const yPct = (elev: number) =>
  PAD.t + ((ALT_MAX - elev) / (ALT_MAX - ALT_MIN)) * (100 - PAD.t - PAD.b);

const CN_NUM = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const firstSentence = (s: string) => {
  const i = s.indexOf("。");
  return i === -1 ? s : s.slice(0, i + 1);
};

export default function Chronicle() {
  // 按首登日期升序(ISO 可直接字典序)
  const peaks = useMemo(
    () => [...PEAKS].sort((a, b) => a.firstAscent.localeCompare(b.firstAscent)),
    [],
  );
  const coords = useMemo(
    () => peaks.map((p) => ({ x: xPct(p.firstAscent), y: yPct(p.elevation) })),
    [peaks],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  // 手风琴:同一时刻至多一条展开(openId=null 表示全折叠),避免多条同开的混乱
  const [openId, setOpenId] = useState<string | null>(null);
  const recordRefs = useRef<(HTMLLIElement | null)[]>([]);
  // 稳定的 ref setter:避免重渲染重挂 14 个 li 的 ref(点击图节点滚动定位用)
  const register = useCallback((i: number, el: HTMLLIElement | null) => {
    recordRefs.current[i] = el;
  }, []);

  // active 同步做减法:鼠标悬停哪条记录,左图就高亮哪条(hover 驱动)。
  // 不再用「滚动位置 + 视口高度」判断——那套会因展开改变布局而漂移,复杂且不稳。
  // hover / 点击图节点 / 展开都直接 setActive,焦点永远跟着用户实际指向的那一条。

  // 切到编年史:让 body 可滚动(观测仪那边 body 是 overflow:hidden)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const stats = useMemo(() => {
    const years = peaks.map((p) => +p.firstAscent.slice(0, 4));
    const minY = Math.min(...years);
    const maxY = Math.max(...years);
    const withAscent = new Set(years).size;
    const empty = maxY - minY + 1 - withAscent;
    const counts = new Map<number, number>();
    years.forEach((y) => counts.set(y, (counts.get(y) ?? 0) + 1));
    const [peakYear, peakCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return { minY, maxY, withAscent, empty, peakYear, peakCount };
  }, [peaks]);

  const active = peaks[activeIndex];
  const activeYear = active.firstAscent.slice(0, 4);

  // 点击图上节点:高亮并把对应记录滚到读出线处
  const focusRecord = (i: number) => {
    setActiveIndex(i);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    recordRefs.current[i]?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  // 展开:手风琴 + 同步高亮(鼠标已悬停在这条上,active 本就是它,这里保证移动端点击也一致)
  const toggleRecord = (id: string, i: number) => {
    const willOpen = openId !== id;
    setOpenId(willOpen ? id : null);
    if (willOpen) setActiveIndex(i);
  };

  return (
    <div className="chronicle">
      <h1 className="sr-only">
        首登编年 · 黄金年代记录仪 —— {stats.minY} 至 {stats.maxY} 十四座八千米峰首登
      </h1>
      <ChronicleNav
        rank={activeIndex + 1}
        total={peaks.length}
        year={activeYear}
        from={stats.minY}
        to={stats.maxY}
      />

      <p className="masthead mono">
        {peaks.length} 座首登 · {stats.minY} → {stats.maxY} · {stats.withAscent} 年有登顶 ·{" "}
        {stats.empty} 年空档 · 峰值 {stats.peakYear} 一年{CN_NUM[stats.peakCount] ?? stats.peakCount}登
      </p>

      {/* 分屏:左暗色记录仪图(sticky 到 stage 底,不含页脚——页脚全宽接管、不盖图)
          + 右浅色记录列表(滚动)。展开记录使 stage 变高,左图 sticky 空间随之增加,
          不会触底跳动 */}
      <div className="chronicle__stage">
        <div className="recorder">
          {/* 暗色群山影像作底(AI 生成、无第三方版权),山脊锚底、暗天在上,迹线叠加其上 */}
          <div
            className="recorder__massif"
            style={{ backgroundImage: `url(${nightMassifUrl})` }}
            aria-hidden="true"
          />
          <RecorderChart
            peaks={peaks}
            coords={coords}
            activeIndex={activeIndex}
            onPick={focusRecord}
          />
        </div>

        <main className="chronicle__main">
          <ol className="records">
            {peaks.map((p, i) => (
              <ChronicleRecord
                key={p.id}
                peak={p}
                index={i}
                rank={i + 1}
                total={peaks.length}
                active={i === activeIndex}
                open={openId === p.id}
                onToggle={() => toggleRecord(p.id, i)}
                onActivate={() => setActiveIndex(i)}
                citations={CITATIONS[p.id] ?? []}
                register={register}
              />
            ))}
          </ol>
        </main>
      </div>

      <ChronicleColophon from={stats.minY} to={stats.maxY} total={peaks.length} />
    </div>
  );
}

/* ── 记录仪主图(SVG 迹线 + HTML 节点)────────────────────────────── */
function RecorderChart({
  peaks,
  coords,
  activeIndex,
  onPick,
}: {
  peaks: Peak[];
  coords: { x: number; y: number }[];
  activeIndex: number;
  onPick: (i: number) => void;
}) {
  const years = Array.from({ length: TIME_MAX - TIME_MIN }, (_, i) => TIME_MIN + i);
  const altMarks = [
    { alt: 8849, accent: false },
    { alt: 8600, accent: false },
    { alt: 8400, accent: false },
    { alt: 8200, accent: false },
    { alt: 8000, accent: true },
  ];
  const pts = (arr: { x: number; y: number }[]) => arr.map((c) => `${c.x},${c.y}`).join(" ");
  const past = coords.slice(0, activeIndex + 1);
  const future = coords.slice(activeIndex); // 从 active 起,首尾相接

  // 从数据真正检测多年沉默(相邻两峰首登年份差 ≥3 = 中间空 ≥2 年),把「缺席」
  // 变成被测量的量。不再硬编码 ">=1953"/"1960" 魔法字符串——数据一改自动跟随。
  const silence = peaks.slice(0, -1).flatMap((p, i) => {
    const y1 = +p.firstAscent.slice(0, 4);
    const y2 = +peaks[i + 1].firstAscent.slice(0, 4);
    const empty = y2 - y1 - 1;
    if (empty < 2) return [];
    const cn = empty === 2 ? "两" : CN_NUM[empty] ?? String(empty);
    return [
      {
        from: p,
        to: peaks[i + 1],
        label: `${y1 + 1}–${String(y2 - 1).slice(2)} · ${cn}年无首登`,
      },
    ];
  });

  return (
    <div
      className="chart"
      role="group"
      aria-label={`${peaks[0].firstAscent.slice(0, 4)} 至 ${peaks[peaks.length - 1].firstAscent.slice(0, 4)} ${peaks.length} 座八千米峰首登的时间-海拔迹线图,含 ${peaks.length} 个可选峰节点`}
    >
      {/* 山峰背景图待用户提供资源后置入(占位:纯暗场) */}
      <svg className="chart__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {/* 年份竖网格 */}
        {years.map((y) => (
          <line key={y} className="chart__grid" x1={xPct(`${y}-01-01`)} x2={xPct(`${y}-01-01`)} y1={PAD.t} y2={100 - PAD.b} />
        ))}
        {/* 海拔横网格 + 8000 橙基线 */}
        {altMarks.map((m) => (
          <line
            key={m.alt}
            className={m.accent ? "chart__baseline" : "chart__grid"}
            x1={PAD.l}
            x2={100 - PAD.r}
            y1={yPct(m.alt)}
            y2={yPct(m.alt)}
          />
        ))}
        {/* 沉默括弧 */}
        {silence.map((s, i) => {
          const x1 = xPct(s.from.firstAscent);
          const x2 = xPct(s.to.firstAscent);
          const y = 100 - PAD.b + 4;
          return (
            <g key={i} className="chart__bracket">
              <line x1={x1} x2={x1} y1={y - 2} y2={y} />
              <line x1={x1} x2={x2} y1={y} y2={y} />
              <line x1={x2} x2={x2} y1={y - 2} y2={y} />
            </g>
          );
        })}
        {/* 迹线:未来段浅色虚线、已走段实心 ink */}
        <polyline className="chart__trace chart__trace--future" points={pts(future)} />
        <polyline className="chart__trace chart__trace--past" points={pts(past)} />
      </svg>

      {/* 海拔刻度标签 */}
      {altMarks.map((m) => (
        <span
          key={m.alt}
          className={`chart__alt mono${m.accent ? " is-accent" : ""}`}
          style={{ top: `${yPct(m.alt)}%` }}
        >
          {m.alt.toLocaleString("en-US")}
        </span>
      ))}
      {/* 年份刻度标签(每 2 年,防挤) */}
      {years.filter((y) => y % 2 === 0).map((y) => (
        <span key={y} className="chart__year mono" style={{ left: `${xPct(`${y}-06-01`)}%` }}>
          {`'${String(y).slice(2)}`}
        </span>
      ))}
      {/* 沉默括弧标签 */}
      {silence.map((s, i) => {
        const x = (xPct(s.from.firstAscent) + xPct(s.to.firstAscent)) / 2;
        return (
          <span key={i} className="chart__silence mono" style={{ left: `${x}%` }}>
            {s.label}
          </span>
        );
      })}

      {/* playhead:当下正在记录的时刻 */}
      <span className="chart__playhead" style={{ left: `${coords[activeIndex].x}%` }} aria-hidden="true" />

      {/* active 点坐标读数(橙),贴在当前峰节点旁 */}
      <span
        className="chart__readout mono"
        style={{
          left: `${coords[activeIndex].x}%`,
          top: `${coords[activeIndex].y}%`,
        }}
        aria-hidden="true"
      >
        <span className="chart__readout-year">
          {peaks[activeIndex].firstAscent.slice(0, 4)}
        </span>
        <span className="chart__readout-alt">
          {peaks[activeIndex].elevation.toLocaleString("en-US")} m
        </span>
      </span>

      {/* 14 个节点(HTML button,保持正圆 + 可交互) */}
      {peaks.map((p, i) => {
        const c = coords[i];
        const on = i === activeIndex;
        return (
          <button
            key={p.id}
            type="button"
            className={`chart-node${on ? " is-active" : ""}`}
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            aria-label={`${p.nameZh} 首登 ${p.firstAscent}，海拔 ${p.elevation} 米`}
            onClick={() => onPick(i)}
          >
            <span className="chart-node__dot" aria-hidden="true" />
            <span className="chart-node__probe mono" aria-hidden="true">
              {p.firstAscent} · {p.nameZh} · {p.elevation.toLocaleString("en-US")}M
            </span>
          </button>
        );
      })}

      {/* 竖排轴名 + 滚动提示(暗区装饰,呼应设计稿的仪器语言) */}
      <span className="chart__vaxis caps" aria-hidden="true">
        Altitude / First Ascent · 海拔 · 首次登顶
      </span>
      <span className="chart__scroll caps mono" aria-hidden="true">
        Scroll ↓
      </span>
    </div>
  );
}

/* ── 单条首登记录(collapsed 电报体 → 展开全叙事 + 三层来源)──────── */
function ChronicleRecord({
  peak,
  index,
  rank,
  total,
  active,
  open,
  onToggle,
  onActivate,
  citations,
  register,
}: {
  peak: Peak;
  index: number;
  rank: number;
  total: number;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  onActivate: () => void;
  citations: Citation[];
  register: (i: number, el: HTMLLIElement | null) => void;
}) {
  const panelId = `rec-${peak.id}`;
  const liRef = useCallback(
    (el: HTMLLIElement | null) => register(index, el),
    [index, register],
  );
  const label =
    `${peak.nameZh} ${peak.nameEn}，首登 ${peak.firstAscent}，海拔 ${peak.elevation.toLocaleString("en-US")} 米` +
    (peak.fatalityRate !== undefined ? `，历史死亡率 ${peak.fatalityRate}%` : "") +
    `。展开查看全文与 ${citations.length} 条来源`;

  return (
    // 悬停即聚焦:鼠标移到哪条,左图就高亮哪条(键盘 Tab 聚焦同理,见 button onFocus)
    <li
      ref={liRef}
      data-index={index}
      className={`record${active ? " is-active" : ""}`}
      onMouseEnter={onActivate}
    >
      <h2 className="record__heading">
        <button
          type="button"
          className="record__head"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={label}
          onClick={onToggle}
          onFocus={onActivate}
        >
          <span className="record__date mono">{peak.firstAscent}</span>
        <span className="record__seq mono">
          {String(rank).padStart(2, "0")} / {total}
        </span>
        <span className="record__name">
          {peak.nameZh}
          <span className="record__name-en caps mono">{peak.nameEn}</span>
        </span>
        <span className="record__elev mono">{peak.elevation.toLocaleString("en-US")} M</span>
        <span className="record__lede">{firstSentence(peak.blurb)}</span>
        <span className="record__meta">
          <span className="record__team">
            {peak.expedition.split(/[（(]/)[0].trim()}
          </span>
          {peak.fatalityRate !== undefined && (
            <>
              <span className="record__meta-sep" aria-hidden="true">
                ·
              </span>
              <span className="record__fatality mono">死亡率 {peak.fatalityRate}%</span>
            </>
          )}
          <span className="record__toggle mono" aria-hidden="true">
            溯源 {open ? "▾" : "▸"} {citations.length} 源
          </span>
        </span>
        </button>
      </h2>

      <div id={panelId} className="record__panel" hidden={!open}>
        <p className="record__blurb">{peak.blurb}</p>
        <dl className="record__fields">
          <div>
            <dt className="mono">首登者</dt>
            <dd>{peak.ascenders}</dd>
          </div>
          <div>
            <dt className="mono">远征队</dt>
            <dd>{peak.expedition}</dd>
          </div>
          <div>
            <dt className="mono">位置</dt>
            <dd>
              {peak.country} · {peak.range}
            </dd>
          </div>
        </dl>

        {citations.length > 0 && (
          <div className="sources">
            <div className="sources__label mono">来源</div>
            <ul className="sources__list">
              {citations.map((c, i) => (
                <li key={i} className="source">
                  <span className="source__tier mono">
                    {c.tier === 1 ? "①" : c.tier === 2 ? "②" : "③"} {TIER_LABEL[c.tier]}
                  </span>
                  {c.code && <span className="source__code mono">{c.code}</span>}
                  <a className="source__link" href={c.url} target="_blank" rel="noreferrer noopener">
                    {c.title} <span aria-hidden="true">↗</span>
                  </a>
                  <span className="source__license mono">[{c.license}]</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );
}

/* ── 导航:铭牌 · 双行图名 · 计数窗(与观测仪同语系,含年代副题)───────── */
function ChronicleNav({
  rank,
  total,
  year,
  from,
  to,
}: {
  rank: number;
  total: number;
  year: string;
  from: number;
  to: number;
}) {
  return (
    <header className="cnav">
      <div className="cnav__left">
        <a className="cnav__back" href="#observatory">
          ← 返回观测仪
        </a>
        <span className="cnav__slash">/</span>
        <span className="cnav__brand caps">ABOVE THE WIND</span>
        <span className="cnav__brand-zh">长风之上</span>
      </div>
      <div className="cnav__center">
        <span className="cnav__title">首登编年</span>
        <span className="cnav__title-en caps mono">
          First Ascent Chronicle · {from}—{to}
        </span>
      </div>
      {/* 计数窗是随滚动刷新的视觉读数,不加 aria-live——否则读屏会被 14 次进度轰炸 */}
      <div className="cnav__right mono">
        <span className="cnav__year">{year}</span>
        <span className="cnav__count">
          {String(rank).padStart(2, "0")} / {total} 已记录
        </span>
        <span className="cnav__reticle" aria-hidden="true">
          <svg viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="7" />
            <line x1="10" y1="1.5" x2="10" y2="18.5" />
            <line x1="1.5" y1="10" x2="18.5" y2="10" />
          </svg>
        </span>
      </div>
    </header>
  );
}

// 锯齿山脊分界:多频正弦叠加(确定性、无随机)模拟撕裂的山脊剖面,
// path 底边贴页脚上缘、锯齿峰向上咬进浅色记录区
function ridgePath() {
  const pts = Array.from({ length: 121 }, (_, i) => {
    const x = i / 120;
    const y =
      34 +
      9 * Math.sin(x * 7.3 + 1.2) +
      5 * Math.sin(x * 17.1 + 0.5) +
      3 * Math.sin(x * 39.7) +
      2.2 * Math.sin(x * 83.1 + 2.1);
    return `${(x * 1440).toFixed(1)},${y.toFixed(1)}`;
  });
  return `M0,80 L${pts.join(" L")} L1440,80 Z`;
}

function ChronicleColophon({
  from,
  to,
  total,
}: {
  from: number;
  to: number;
  total: number;
}) {
  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <footer className="colophon">
      <div className="colophon__ridge" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d={ridgePath()} />
        </svg>
      </div>

      <div className="colophon__inner">
        <span className="colophon__corner is-tl" aria-hidden="true" />
        <span className="colophon__corner is-tr" aria-hidden="true" />
        <span className="colophon__corner is-bl" aria-hidden="true" />
        <span className="colophon__corner is-br" aria-hidden="true" />

        <p className="colophon__eyebrow mono">
          FIRST ASCENT CHRONICLE / RECORD {total} OF {total}
        </p>

        <h2 className="colophon__years mono">
          {from} — {to}
        </h2>
        <p className="colophon__statement">
          十四座八千米峰的首登，至此全部记录。
        </p>

        <div className="colophon__cols">
          <section className="colophon__col">
            <h3 className="colophon__col-title mono">档案来源</h3>
            <p className="colophon__col-body mono">
              Himalayan Journal /<br />
              American Alpine Journal /<br />
              Alpine Journal
            </p>
          </section>
          <section className="colophon__col">
            <h3 className="colophon__col-title mono">使用与许可</h3>
            <p className="colophon__col-body">
              资料版权归原作者及出版方所有。本文公开可读，此处仅标来源不转载正文；地形影像由
              AI 生成，无第三方版权。
            </p>
            <span className="colophon__cc mono">CC · BY-SA 4.0</span>
          </section>
          <nav className="colophon__col" aria-label="继续探索">
            <h3 className="colophon__col-title mono">继续探索</h3>
            <a className="colophon__link" href="#observatory">
              ← 返回高海拔观测仪
            </a>
            <button type="button" className="colophon__link colophon__totop" onClick={toTop}>
              回到顶部 ↑
            </button>
          </nav>
        </div>

        <div className="colophon__seal">
          <div className="colophon__seal-count mono">
            {total} / {total}
          </div>
          <div className="colophon__seal-label caps">
            Archive
            <br />
            Complete
          </div>
          <div className="colophon__compass" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" />
              <circle cx="60" cy="60" r="32" />
              <line x1="60" y1="4" x2="60" y2="116" />
              <line x1="4" y1="60" x2="116" y2="60" />
              <circle className="colophon__compass-core" cx="60" cy="60" r="4.5" />
            </svg>
          </div>
        </div>
      </div>

      <div className="colophon__bar mono">
        <span>ABOVE THE WIND / 风之上</span>
        <span>© 2026 · HIGH ALTITUDE ARCHIVE</span>
      </div>
    </footer>
  );
}
