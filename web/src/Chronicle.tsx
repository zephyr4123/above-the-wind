import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Chronicle.css";
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
  const recordRefs = useRef<(HTMLLIElement | null)[]>([]);
  // 稳定的 ref setter:避免每次滚动重渲染都重挂 14 个 li 的 ref
  const register = useCallback((i: number, el: HTMLLIElement | null) => {
    recordRefs.current[i] = el;
  }, []);

  // 记录纸的「笔尖读出线」在视口约 40vh 处:滚动耦合,过线者置为 active
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.index);
            if (!Number.isNaN(i)) setActiveIndex(i);
          }
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }, // 阅读线在视口中线,与 scrollIntoView(center) 对齐
    );
    recordRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [peaks]);

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

  const focusRecord = (i: number) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    recordRefs.current[i]?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <div className="chronicle">
      <h1 className="sr-only">
        首登编年 · 黄金年代记录仪 —— {stats.minY} 至 {stats.maxY} 十四座八千米峰首登
      </h1>
      <ChronicleNav rank={activeIndex + 1} total={peaks.length} year={activeYear} />

      <p className="masthead mono">
        {peaks.length} 座首登 · {stats.minY} → {stats.maxY} · {stats.withAscent} 年有登顶 ·{" "}
        {stats.empty} 年空档 · 峰值 {stats.peakYear} 一年{CN_NUM[stats.peakCount] ?? stats.peakCount}登
      </p>

      <div className="chronicle__stage">
        <div className="recorder">
          <RecorderChart
            peaks={peaks}
            coords={coords}
            activeIndex={activeIndex}
            onPick={focusRecord}
          />
        </div>

        <ol className="records">
          {peaks.map((p, i) => (
            <ChronicleRecord
              key={p.id}
              peak={p}
              index={i}
              rank={i + 1}
              total={peaks.length}
              active={i === activeIndex}
              citations={CITATIONS[p.id] ?? []}
              register={register}
            />
          ))}
        </ol>
      </div>

      <ChronicleColophon from={stats.minY} to={stats.maxY} />
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

  // 两段最长沉默,做成尺寸标注括弧(把「缺席」变成被测量的量)
  const silence = [
    { from: peaks[0], to: peaks.find((p) => p.firstAscent >= "1953") ?? peaks[0], label: "1951–52 · 两年无首登" },
    {
      from: peaks.find((p) => p.firstAscent.startsWith("1960")) ?? peaks[0],
      to: peaks[peaks.length - 1],
      label: "1961–63 · 三年无首登",
    },
  ];

  return (
    <div className="chart" role="group" aria-label="1950 至 1964 十四座八千米峰首登的时间-海拔迹线图,含 14 个可选峰节点">
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
  citations,
  register,
}: {
  peak: Peak;
  index: number;
  rank: number;
  total: number;
  active: boolean;
  citations: Citation[];
  register: (i: number, el: HTMLLIElement | null) => void;
}) {
  const [open, setOpen] = useState(false);
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
    <li ref={liRef} data-index={index} className={`record${active ? " is-active" : ""}`}>
      <h3 className="record__heading">
        <button
          type="button"
          className="record__head"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={label}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="record__date mono">{peak.firstAscent}</span>
        <span className="record__seq mono">
          {String(rank).padStart(2, "0")} / {total}
        </span>
        <span className="record__name">
          {peak.nameZh}
          <span className="record__name-en mono">{peak.nameEn}</span>
        </span>
        <span className="record__elev mono">{peak.elevation.toLocaleString("en-US")} M</span>
        <span className="record__lede">{firstSentence(peak.blurb)}</span>
        <span className="record__meta">
          {peak.fatalityRate !== undefined && (
            <span className="record__fatality mono">死亡率 {peak.fatalityRate}%</span>
          )}
          <span className="record__toggle mono" aria-hidden="true">
            溯源 {open ? "▾" : "▸"} {citations.length} 源
          </span>
        </span>
        </button>
      </h3>

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

/* ── 导航 ─────────────────────────────────────────────────────────── */
function ChronicleNav({ rank, total, year }: { rank: number; total: number; year: string }) {
  return (
    <header className="cnav">
      <div className="cnav__left">
        <a className="cnav__back" href="#observatory">
          ← 返回观测仪
        </a>
        <span className="cnav__slash">/</span>
        <span className="cnav__brand caps">ABOVE THE WIND</span>
      </div>
      <div className="cnav__center">
        <span className="cnav__title">首登编年</span>
        <span className="cnav__divider" aria-hidden="true" />
        <span className="cnav__sub">黄金年代记录仪</span>
      </div>
      <div className="cnav__right" aria-live="polite">
        <span className="mono">{year}</span>
        <span className="cnav__count mono">
          {String(rank).padStart(2, "0")} / {total} 已记录
        </span>
        <span className="cnav__cross" aria-hidden="true">
          ✛
        </span>
      </div>
    </header>
  );
}

function ChronicleColophon({ from, to }: { from: number; to: number }) {
  return (
    <footer className="colophon">
      <p className="colophon__line">
        {from} 年安纳普尔纳落笔，{to} 年希夏邦马收束——十四座八千米峰的首登，一台记录仪走完了黄金年代的整卷纸。
      </p>
      <p className="colophon__note mono">
        引用可点击溯源。同期期刊(Himalayan Journal / American Alpine Journal / Alpine
        Journal)版权归各俱乐部所有、官方公开可读，此处仅标来源不转载正文；Wikipedia 条目为
        CC-BY-SA 4.0;纪录方(Guinness World Records 等)为专有,仅作 who/when 佐证。
      </p>
      <a className="colophon__back" href="#observatory">
        ← 返回观测仪
      </a>
    </footer>
  );
}
