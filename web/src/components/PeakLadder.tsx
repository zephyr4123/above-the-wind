import { useMemo, useState } from "react";
import { LayoutGroup } from "motion/react";
import type { Peak } from "../data/peaks";
import { PeakRow } from "./PeakRow";

type Mode = "altitude" | "chronicle";
const MIN_EL = 8000;
const MAX_EL = 8849;

export function PeakLadder({ peaks }: { peaks: Peak[] }) {
  const [mode, setMode] = useState<Mode>("altitude");
  const [openId, setOpenId] = useState<string | null>(peaks[0]?.id ?? null);

  // 海拔名次:与排序模式无关,珠峰恒为 01
  const rankById = useMemo(() => {
    const m = new Map<string, number>();
    [...peaks]
      .sort((a, b) => b.elevation - a.elevation)
      .forEach((p, i) => m.set(p.id, i + 1));
    return m;
  }, [peaks]);

  const ordered = useMemo(() => {
    const arr = [...peaks];
    arr.sort((a, b) =>
      mode === "altitude"
        ? b.elevation - a.elevation
        : a.firstAscent.localeCompare(b.firstAscent),
    );
    return arr;
  }, [peaks, mode]);

  return (
    <section className="ladder" aria-label="十四座八千米峰">
      <div className="ladder__controls">
        <div className="segmented" role="tablist" aria-label="排序方式">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "altitude"}
            className="segmented__btn"
            onClick={() => setMode("altitude")}
          >
            按海拔
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "chronicle"}
            className="segmented__btn"
            onClick={() => setMode("chronicle")}
          >
            按首登编年
          </button>
        </div>
        <p className="ladder__axis mono" aria-hidden>
          {mode === "altitude" ? "8849 — 8027 m" : "1950 — 1964"}
        </p>
      </div>

      <LayoutGroup>
        <ol className="ladder__list">
          {ordered.map((peak, i) => (
            <PeakRow
              key={peak.id}
              peak={peak}
              rank={rankById.get(peak.id)!}
              index={i}
              open={openId === peak.id}
              onToggle={() => setOpenId(openId === peak.id ? null : peak.id)}
              elFraction={(peak.elevation - MIN_EL) / (MAX_EL - MIN_EL)}
            />
          ))}
        </ol>
      </LayoutGroup>
    </section>
  );
}
