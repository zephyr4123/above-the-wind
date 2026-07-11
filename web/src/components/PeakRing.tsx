import type { Peak } from "../data/peaks";

// 01–14 环几何（% 空间，与容器对齐）
const CX = 50;
const CY = 48;
const RX = 40;
const RY = 30;
const START = -70; // 01 起始角（度），顺时针分布
// 标注浮层锚点（与 PeakCallout 一致）
export const CALLOUT_ANCHOR = { x: 80, y: 19 };

function nodePos(rank: number, n: number) {
  const a = ((START + (rank - 1) * (360 / n)) * Math.PI) / 180;
  return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) };
}

export function PeakRing({
  peaks,
  selectedId,
  onSelect,
}: {
  peaks: Peak[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const n = peaks.length;
  const activeRank = peaks.findIndex((p) => p.id === selectedId) + 1;
  const ap = nodePos(activeRank, n);

  return (
    <div className="ring">
      <svg
        className="ring__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} className="ring__ellipse" />
        <polyline
          className="ring__leader"
          points={`${ap.x},${ap.y} ${(ap.x + CALLOUT_ANCHOR.x) / 2},${CALLOUT_ANCHOR.y} ${CALLOUT_ANCHOR.x},${CALLOUT_ANCHOR.y}`}
        />
      </svg>

      {peaks.map((p, i) => {
        const rank = i + 1;
        const { x, y } = nodePos(rank, n);
        const active = p.id === selectedId;
        return (
          <button
            key={p.id}
            type="button"
            className={`node${active ? " is-active" : ""}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={`${p.nameZh} 第 ${rank} 高，海拔 ${p.elevation} 米`}
            aria-pressed={active}
            onClick={() => onSelect(p.id)}
          >
            <span className="node__dot" aria-hidden="true" />
            <span className="node__num mono" aria-hidden="true">
              {String(rank).padStart(2, "0")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
