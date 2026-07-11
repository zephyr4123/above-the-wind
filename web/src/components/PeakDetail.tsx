import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Peak } from "../data/peaks";
import { PeakSilhouette } from "./PeakSilhouette";

function fmtCoord(lat: number, lon: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}°${ns}  ${Math.abs(lon).toFixed(3)}°${ew}`;
}

export function PeakDetail({ peak, open }: { peak: Peak; open: boolean }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className="detail"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={
            reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
          }
        >
          <div className="detail__inner">
            <div className="detail__scene">
              <PeakSilhouette
                peak={peak}
                width={560}
                height={220}
                className="detail__silhouette"
              />
              <span className="detail__scale mono" aria-hidden>
                {peak.elevation.toLocaleString("en-US")} m
              </span>
            </div>
            <div className="detail__body">
              <p className="detail__blurb">{peak.blurb}</p>
              <dl className="specs">
                <div className="spec">
                  <dt>坐标</dt>
                  <dd className="mono">{fmtCoord(peak.lat, peak.lon)}</dd>
                </div>
                <div className="spec">
                  <dt>地形突起</dt>
                  <dd className="mono">
                    {peak.prominence.toLocaleString("en-US")} m
                  </dd>
                </div>
                <div className="spec">
                  <dt>首登日期</dt>
                  <dd className="mono">{peak.firstAscent}</dd>
                </div>
                <div className="spec">
                  <dt>首登者</dt>
                  <dd>{peak.ascenders}</dd>
                </div>
                <div className="spec">
                  <dt>探险队</dt>
                  <dd>{peak.expedition}</dd>
                </div>
                {peak.fatalityRate != null && (
                  <div className="spec spec--warn">
                    <dt>历史死亡率</dt>
                    <dd className="mono">≈ {peak.fatalityRate}%</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
