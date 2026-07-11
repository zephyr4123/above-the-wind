// Archive Instrument · 场景/数值常量（与 styles/archive.css 同源同规范）
// CSS 管视觉 token；这里管 WebGL 与 JS 逻辑要读的数字。

/** 色彩（供 WebGL shader，OKLCH→线性 sRGB 用十六进制） */
export const ARCHIVE_COLORS = {
  canvas: "#eef1ef",
  rock: "#111312",
  rockMid: "#292d2b",
  ice: "#f5fafc",
  iceShadow: "#c7d5dc",
  accent: "#ff4b19",
} as const;

/** 高度阈值（米）——决定材质切换与切面位置 */
export const DEATH_ZONE_ALTITUDE = 8000;
export const SUMMIT_ALTITUDE = 8849;

/** 相机 */
export const CAMERA_FOV = 32; // deg
export const CAMERA_TRANSITION_MS = 800;
export const TERRAIN_EXAGGERATION = 1.04;

/** 渲染 */
export const DPR_DESKTOP = 1.5;
export const DPR_MOBILE = 1;
export const PARTICLE_OPACITY = 0.28;

/** 动效（毫秒，与 CSS --archive-motion-* 对齐） */
export const MOTION = {
  fast: 140,
  base: 220,
  scene: 800,
} as const;

/** 把 #rrggbb 转成 [r,g,b] 0-1，供 OGL 传 uniform */
export function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}
