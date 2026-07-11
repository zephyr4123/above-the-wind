// 生成式雪峰剪影 —— 由峰名种子确定性生成一条山脊线,岩体 + 雪冠。
// 100% 无版权、数据驱动。同一峰每次渲染稳定一致。

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Silhouette {
  /** 闭合多边形路径(含到基线的收尾),用于填充岩体 */
  path: string;
  /** 山脊折线(不闭合),用于描边棱线 */
  ridge: string;
  /** 主峰顶的 x 坐标 */
  summitX: number;
  /** 主峰顶的 y 坐标 */
  summitY: number;
  /** 建议雪线 y(此值以上为雪冠) */
  snowY: number;
}

/**
 * 生成一条可信的山峰轮廓:两侧上升的肩、若干锯齿次峰、一个尖锐主峰。
 * @param seed  确定性种子(用峰名)
 * @param w     画布宽
 * @param h     画布高
 * @param intensity 主峰相对高度(0-1),可用海拔归一化传入,越高峰越尖耸
 */
export function mountainSilhouette(
  seed: string,
  w: number,
  h: number,
  intensity = 0.86,
): Silhouette {
  const rand = mulberry32(hashSeed(seed));
  const steps = 44;
  const margin = h * (1 - intensity) * 0.5; // 顶部留白,越高的峰越靠上
  const peakY = margin + h * 0.04;
  // 主峰位置略偏离正中,增加个性
  const summitX = w * (0.4 + rand() * 0.22);

  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w;
    const d = Math.abs(x - summitX) / Math.max(summitX, w - summitX);
    // 帐篷包络:主峰处最高,向两侧衰减(带轻微指数使肩部更陡)
    const env = Math.pow(1 - Math.min(d, 1), 1.35);
    // 锯齿:越靠近山脊上部越明显,基部平缓
    const jag = (rand() - 0.5) * h * 0.13 * (0.35 + env);
    // 次峰:在肩部随机抬起一两处,制造多峰轮廓
    const shoulder = rand() < 0.16 ? rand() * h * 0.14 * (1 - env) : 0;
    let y = h - env * (h - peakY) - jag - shoulder;
    y = Math.max(peakY, Math.min(h, y));
    pts.push([x, y]);
  }
  // 强制主峰点为最高、尖锐
  pts.push([summitX, peakY]);
  pts.sort((a, b) => a[0] - b[0]);

  const ridge =
    "M " + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  const path = `${ridge} L ${w},${h} L 0,${h} Z`;
  const snowY = peakY + (h - peakY) * (0.34 + rand() * 0.1);

  return { path, ridge, summitX, summitY: peakY, snowY };
}
