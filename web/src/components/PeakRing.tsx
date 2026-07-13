import type { Peak } from "../data/peaks";

// ── 14 峰环线：贴照片山巅手调的节点位（stage 百分比坐标）──────────
// 不是规整椭圆——按海拔序 01→14 绕山体一圈，顶点落在群山照片的可见峰脊上。
// x/y 均为 stage(满宽 · nav 与 timeline 之间) 的百分比，对着背景照片视觉调准。
const NODE_POS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 38, y: 16 }, // 01 珠峰（主峰顶）
  { x: 51, y: 25 }, // 02
  { x: 66, y: 29 }, // 03
  { x: 85, y: 58 }, // 04（右翼下沉）
  { x: 80, y: 70 }, // 05
  { x: 58, y: 82 }, // 06（谷底中央）
  { x: 46, y: 75 }, // 07
  { x: 28, y: 69 }, // 08
  { x: 20, y: 60 }, // 09
  { x: 14, y: 51 }, // 10
  { x: 11, y: 40 }, // 11（左肩）
  { x: 18, y: 30 }, // 12
  { x: 25, y: 25 }, // 13
  { x: 33, y: 23 }, // 14（回到主峰左侧，闭合）
];

// Catmull-Rom → 三次贝塞尔，生成穿过所有节点的平滑闭合环。
function smoothClosedPath(pts: ReadonlyArray<{ x: number; y: number }>) {
  const n = pts.length;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return `${d} Z`;
}

const ORBIT = smoothClosedPath(NODE_POS);

export function PeakRing({
  peaks,
  selectedId,
  onSelect,
}: {
  peaks: Peak[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  // 手调位点与峰数据强耦合:数量不一致时越界节点会静默叠在末位,开发期显式暴露
  if (import.meta.env.DEV && NODE_POS.length !== peaks.length) {
    console.warn(
      `PeakRing: NODE_POS(${NODE_POS.length}) 与 peaks(${peaks.length}) 数量不一致`,
    );
  }
  return (
    <div className="ring">
      <svg
        className="ring__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className="ring__orbit" d={ORBIT} />
      </svg>

      {peaks.map((p, i) => {
        const rank = i + 1;
        const pos = NODE_POS[i] ?? NODE_POS[NODE_POS.length - 1];
        const active = p.id === selectedId;
        return (
          <button
            key={p.id}
            type="button"
            className={`node${active ? " is-active" : ""}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
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
