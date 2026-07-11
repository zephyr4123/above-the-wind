import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Peak } from "../data/peaks";
import { PeakSilhouette } from "./PeakSilhouette";
import { PeakDetail } from "./PeakDetail";

interface Props {
  peak: Peak;
  rank: number; // 海拔名次(1 = 珠峰),与排序模式无关
  index: number; // 当前渲染顺序,用于进场错峰
  open: boolean;
  onToggle: () => void;
  elFraction: number; // (海拔-8000)/(8849-8000),用于高度条
}

export function PeakRow({ peak, rank, index, open, onToggle, elFraction }: Props) {
  const reduce = useReducedMotion();
  const year = peak.firstAscent.slice(0, 4);

  return (
    <motion.li
      className={`peak${open ? " is-open" : ""}`}
      style={{ "--i": index } as CSSProperties}
      layout={reduce ? false : "position"}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        className="peak__head"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="peak__rank mono">{String(rank).padStart(2, "0")}</span>

        <span className="peak__thumb">
          <PeakSilhouette peak={peak} width={132} height={74} />
        </span>

        <span className="peak__id">
          <span className="peak__name">{peak.nameZh}</span>
          <span className="peak__name-en">{peak.nameEn}</span>
          <span className="peak__meta">
            {peak.range} · {peak.country}
          </span>
        </span>

        <span className="peak__figures">
          <span className="peak__elev">
            <b className="mono">{peak.elevation.toLocaleString("en-US")}</b>
            <i>m</i>
          </span>
          <span className="peak__year mono">首登 {year}</span>
          <span className="peak__bar" aria-hidden>
            <span style={{ width: `${Math.max(elFraction * 100, 3)}%` }} />
          </span>
        </span>

        <span className="peak__chev" aria-hidden>
          {open ? "–" : "+"}
        </span>
      </button>

      <PeakDetail peak={peak} open={open} />
    </motion.li>
  );
}
