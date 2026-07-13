import { useEffect, useMemo, useState, type CSSProperties } from "react";
import "./App.css";
import massifUrl from "./assets/massif.jpg";
import { GOLDEN_AGE, PEAKS, type Peak } from "./data/peaks";
import { PeakRing } from "./components/PeakRing";

const FA_FROM = GOLDEN_AGE.from;
const FA_TO = GOLDEN_AGE.to;

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

// ISO 日期 → 观测仪读数体（29 MAY 1953）
function faDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// 十进制度 → 度分秒（27°59′17″N）。先取整到总角秒再拆分,60 进位自然正确
// (逐位 round 会产出 55′60″ 这类非法值,如洛子峰 86.9333°E)
function dms(dec: number, pos: string, neg: string) {
  const dir = dec >= 0 ? pos : neg;
  const total = Math.round(Math.abs(dec) * 3600);
  const deg = Math.floor(total / 3600);
  const min = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return `${deg}°${String(min).padStart(2, "0")}′${String(sec).padStart(2, "0")}″${dir}`;
}

export default function App() {
  const peaks = useMemo(
    () => [...PEAKS].sort((a, b) => b.elevation - a.elevation),
    [],
  );
  const [selectedId, setSelectedId] = useState(peaks[0].id);
  const [playing, setPlaying] = useState(false);
  const selected = peaks.find((p) => p.id === selectedId)!;
  const rank = peaks.findIndex((p) => p.id === selectedId) + 1;

  // 播放 = 走带:按首登时间顺序自动巡演 14 峰,再点暂停
  const byAscent = useMemo(
    () => [...peaks].sort((a, b) => a.firstAscent.localeCompare(b.firstAscent)),
    [peaks],
  );
  useEffect(() => {
    if (!playing) return;
    const tick = setInterval(() => {
      setSelectedId((cur) => {
        const i = byAscent.findIndex((p) => p.id === cur);
        return byAscent[(i + 1) % byAscent.length].id;
      });
    }, 1600);
    return () => clearInterval(tick);
  }, [playing, byAscent]);

  return (
    <div
      className="instrument"
      style={{ "--massif": `url(${massifUrl})` } as CSSProperties}
    >
      <div
        className="instrument__photo"
        style={{ backgroundImage: `url(${massifUrl})` }}
        aria-hidden="true"
      />
      <div className="instrument__sky" aria-hidden="true" />
      <div className="instrument__plane" aria-hidden="true" />

      <TopNav rank={rank} total={peaks.length} />
      <AltitudeRuler />

      <div className="stage">
        <PeakRing peaks={peaks} selectedId={selectedId} onSelect={setSelectedId} />
        <PeakCallout peak={selected} rank={rank} />
      </div>

      <Timeline
        peaks={peaks}
        selectedId={selectedId}
        onSelect={setSelectedId}
        playing={playing}
        onTogglePlay={() => setPlaying((v) => !v)}
      />
    </div>
  );
}

function TopNav({ rank, total }: { rank: number; total: number }) {
  return (
    <header className="topnav">
      <div className="topnav__left">
        <span className="topnav__menu" aria-hidden="true">
          <i /> <i /> <i />
        </span>
        <span className="topnav__brand caps">ABOVE THE WIND</span>
        <span className="topnav__slash">/</span>
        <span className="topnav__brand-zh">风之上</span>
      </div>
      <div className="topnav__center">
        <span className="topnav__title">十四座八千米</span>
        <span className="topnav__divider" aria-hidden="true" />
        <span className="topnav__sub">高海拔观测仪</span>
      </div>
      <div className="topnav__right">
        <span className="mono">
          {String(rank).padStart(2, "0")} / {total}
        </span>
        <span className="topnav__cross" aria-hidden="true">
          ✛
        </span>
      </div>
    </header>
  );
}

// 高度标尺（左）。0–9000 m，单调排列；死亡带(8000–9000)刻意放大，8000 m 对齐橙色切面。
const RULER = [
  { alt: 9000, top: 13, label: "9,000 M" },
  { alt: 8500, top: 21, label: "8,500 M" },
  { alt: 8000, top: 30, label: "8,000 M", accent: true },
  { alt: 7500, top: 37, label: "7,500 M" },
  { alt: 7000, top: 44, label: "7,000 M" },
  { alt: 6500, top: 51, label: "6,500 M" },
  { alt: 6000, top: 58, label: "6,000 M" },
  { alt: 5000, top: 66, label: "5,000 M" },
  { alt: 4500, top: 72, label: "4,500 M" },
  { alt: 4000, top: 78, label: "4,000 M" },
  { alt: 0, top: 88, label: "0 M" },
];

function AltitudeRuler() {
  return (
    <div className="ruler" aria-hidden="true">
      <div className="ruler__spine" />
      {Array.from({ length: 41 }).map((_, i) => (
        <span
          key={i}
          className="ruler__tick"
          style={{ top: `${10 + i * ((90 - 10) / 40)}%` }}
        />
      ))}
      {RULER.map((r) => (
        <div
          key={r.alt}
          className={`ruler__mark${r.accent ? " is-accent" : ""}`}
          style={{ top: `${r.top}%` }}
        >
          <span className="ruler__major" />
          <span className="ruler__label mono">{r.label}</span>
        </div>
      ))}
    </div>
  );
}

function PeakCallout({ peak, rank }: { peak: Peak; rank: number }) {
  const roman = peak.nameEn.replace(/^Mount\s+/i, "").toUpperCase();
  return (
    // role=status:选峰后屏幕阅读器播报新读数(面板内容随选中峰更新)
    <div className="callout" role="status">
      <span className="callout__rank mono">{String(rank).padStart(2, "0")}</span>
      <div className="callout__body">
        <div className="callout__name">{peak.nameZh}</div>
        <div className="callout__roman caps">{roman}</div>
        <div className="callout__elev mono">
          {peak.elevation.toLocaleString("en-US")} M
        </div>
        <div className="callout__rule" aria-hidden="true" />
        <div className="callout__coord mono">
          {dms(peak.lat, "N", "S")} &nbsp; {dms(peak.lon, "E", "W")}
        </div>
        <div className="callout__fa">
          首登 <span className="mono">{faDate(peak.firstAscent)}</span>
        </div>
      </div>
      <div className="callout__source caps" aria-hidden="true">
        SOURCE · WIKIDATA CC0 · 策展首登史
      </div>
    </div>
  );
}

function Timeline({
  peaks,
  selectedId,
  onSelect,
  playing,
  onTogglePlay,
}: {
  peaks: Peak[];
  selectedId: string;
  onSelect: (id: string) => void;
  playing: boolean;
  onTogglePlay: () => void;
}) {
  const span = FA_TO - FA_FROM;
  const yearOf = (p: Peak) => Number(p.firstAscent.slice(0, 4));
  const selected = peaks.find((p) => p.id === selectedId)!;

  // 同年多峰按当年日期序横向微散开,避免节点完全重叠导致只有最上层可点
  // (1953/1954/1955 各 2 峰,1956 有 3 峰)
  const posOf = useMemo(() => {
    const byYear = new Map<number, Peak[]>();
    for (const p of peaks) {
      const y = yearOf(p);
      byYear.set(y, [...(byYear.get(y) ?? []), p]);
    }
    const pos = new Map<string, number>();
    for (const [y, group] of byYear) {
      group.sort((a, b) => a.firstAscent.localeCompare(b.firstAscent));
      group.forEach((p, i) => {
        const offset = (i - (group.length - 1) / 2) * 1.1;
        pos.set(p.id, ((y - FA_FROM) / span) * 100 + offset);
      });
    }
    return pos;
  }, [peaks, span]);

  return (
    <footer className="timeline">
      <button
        className="timeline__play"
        type="button"
        aria-label={playing ? "暂停" : "播放"}
        aria-pressed={playing}
        onClick={onTogglePlay}
      >
        {playing ? "⏸" : "▶"}
      </button>

      <div className="timeline__track">
        <span className="timeline__baseline" aria-hidden="true" />
        {Array.from({ length: span + 1 }).map((_, i) => (
          <span
            key={i}
            className="timeline__tick"
            style={{ left: `${(i / span) * 100}%` }}
            aria-hidden="true"
          />
        ))}
        {peaks.map((p) => {
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              className={`timeline__node${active ? " is-active" : ""}`}
              style={{ left: `${posOf.get(p.id)}%` }}
              aria-label={`${p.nameZh} 首登 ${yearOf(p)}`}
              aria-pressed={active}
              onClick={() => onSelect(p.id)}
            />
          );
        })}
        <span className="timeline__caption mono">
          {FA_FROM} — {FA_TO}
        </span>
        <span
          className="timeline__marker"
          style={{ left: `${posOf.get(selected.id)}%` }}
          aria-hidden="true"
        />
        <span className="timeline__end timeline__end--l mono">{FA_FROM}</span>
        <span className="timeline__end timeline__end--r mono">{FA_TO}</span>
      </div>

      <a className="timeline__enter" href="#chronicle">
        进入编年史 →
      </a>
    </footer>
  );
}
