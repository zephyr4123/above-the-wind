import { useMemo, useState } from "react";
import "./App.css";
import { PEAKS, type Peak } from "./data/peaks";
import { TerrainCanvas } from "./components/TerrainCanvas";
import { SnowField } from "./components/SnowField";
import { PeakRing } from "./components/PeakRing";

const FA_FROM = 1950;
const FA_TO = 1964;

export default function App() {
  const peaks = useMemo(
    () => [...PEAKS].sort((a, b) => b.elevation - a.elevation),
    [],
  );
  const [selectedId, setSelectedId] = useState(peaks[0].id);
  const selected = peaks.find((p) => p.id === selectedId)!;
  const rank = peaks.findIndex((p) => p.id === selectedId) + 1;

  return (
    <div className="instrument">
      <TerrainCanvas className="instrument__terrain" />
      <SnowField className="instrument__snow" />
      <div className="instrument__plane" aria-hidden="true" />

      <TopNav rank={rank} total={peaks.length} />
      <AltitudeRuler />

      <div className="stage">
        <PeakRing peaks={peaks} selectedId={selectedId} onSelect={setSelectedId} />
        <PeakCallout peak={selected} rank={rank} />
      </div>

      <Timeline peaks={peaks} selectedId={selectedId} onSelect={setSelectedId} />
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

// 高度标尺（左）。死亡地带刻意放大，与 mockup 一致。
const RULER = [
  { alt: 8849, top: 13, label: "8,849 M" },
  { alt: 8000, top: 42, label: "8,000 M", accent: true },
  { alt: 4000, top: 66, label: "4,000 M" },
  { alt: 0, top: 85, label: "0 M" },
];

function AltitudeRuler() {
  return (
    <div className="ruler" aria-hidden="true">
      <div className="ruler__spine" />
      {Array.from({ length: 41 }).map((_, i) => (
        <span
          key={i}
          className="ruler__tick"
          style={{ top: `${10 + i * ((88 - 10) / 40)}%` }}
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
  return (
    <div className="callout">
      <span className="callout__rank mono">{String(rank).padStart(2, "0")}</span>
      <div className="callout__body">
        <div className="callout__name">{peak.nameZh}</div>
        <div className="callout__elev mono">
          {peak.elevation.toLocaleString("en-US")} M
        </div>
        <div className="callout__fa">
          首登 <span className="mono">{peak.firstAscent.slice(0, 4)}</span>
        </div>
      </div>
    </div>
  );
}

function Timeline({
  peaks,
  selectedId,
  onSelect,
}: {
  peaks: Peak[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const span = FA_TO - FA_FROM;
  const yearOf = (p: Peak) => Number(p.firstAscent.slice(0, 4));
  const pct = (y: number) => ((y - FA_FROM) / span) * 100;
  const selected = peaks.find((p) => p.id === selectedId)!;

  return (
    <footer className="timeline">
      <button className="timeline__play" type="button" aria-label="播放">
        ▶
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
              style={{ left: `${pct(yearOf(p))}%` }}
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
          style={{ left: `${pct(yearOf(selected))}%` }}
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
