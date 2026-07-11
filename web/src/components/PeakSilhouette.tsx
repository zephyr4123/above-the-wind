import { useId, useMemo } from "react";
import type { Peak } from "../data/peaks";
import { mountainSilhouette } from "../lib/silhouette";

interface Props {
  peak: Peak;
  width: number;
  height: number;
  className?: string;
}

/** 生成式雪峰剪影:岩体渐变 + 雪冠 + 冰蓝棱线。由峰名确定性生成,无版权。 */
export function PeakSilhouette({ peak, width, height, className }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const sil = useMemo(() => {
    // 海拔 8000–8849 归一化 → 强度 0.80–0.92(越高越尖耸)
    const t = (peak.elevation - 8000) / (8849 - 8000);
    return mountainSilhouette(peak.nameEn, width, height, 0.8 + t * 0.12);
  }, [peak.nameEn, peak.elevation, width, height]);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`${peak.nameZh}示意剪影`}
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id={`rock-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--rock)" />
          <stop
            offset="1"
            stopColor="color-mix(in oklch, var(--rock) 45%, var(--bg))"
          />
        </linearGradient>
        <linearGradient id={`snow-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--snow)" />
          <stop
            offset="1"
            stopColor="color-mix(in oklch, var(--snow) 25%, transparent)"
          />
        </linearGradient>
        <clipPath id={`clip-${uid}`}>
          <path d={sil.path} />
        </clipPath>
      </defs>

      <path d={sil.path} fill={`url(#rock-${uid})`} />
      <g clipPath={`url(#clip-${uid})`}>
        <rect x="0" y="0" width={width} height={sil.snowY} fill={`url(#snow-${uid})`} />
      </g>
      <path
        d={sil.ridge}
        fill="none"
        stroke="var(--accent)"
        strokeOpacity="0.5"
        strokeWidth="1"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
