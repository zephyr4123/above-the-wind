import { useEffect, useRef } from "react";
import { PARTICLE_OPACITY } from "../theme/archive";

/**
 * 风雪粒子（spindrift）——冰白细流被高空风吹过观测场景。
 * 白色短 streak、低不透明度：压在亮雪上自然隐没、显现在暗岩与岩肋区，
 * 给死寂的暗色下半部一点死亡地带的风动。尊重 prefers-reduced-motion（静态单帧）。
 */
type Flake = { x: number; y: number; len: number; vx: number; vy: number; a: number };

export function SnowField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    let w = 0;
    let h = 0;
    let flakes: Flake[] = [];

    const spawn = (anywhere: boolean): Flake => {
      const speed = rand(0.4, 1.5); // 主风速（横向）
      return {
        x: anywhere ? rand(0, w) : rand(-48, -4),
        y: rand(0, h),
        len: rand(6, 22), // streak 长度
        vx: speed,
        vy: speed * rand(0.08, 0.26), // 略微下沉
        a: rand(0.04, PARTICLE_OPACITY),
      };
    };

    const seed = () => {
      const target = Math.round(Math.min((w * h) / 15000, 150)); // 密度按面积,上限克制
      flakes = Array.from({ length: target }, () => spawn(true));
    };

    const resize = () => {
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineWidth = 1;
      for (const f of flakes) {
        const sp = Math.hypot(f.vx, f.vy) || 1;
        const ux = f.vx / sp;
        const uy = f.vy / sp;
        ctx.strokeStyle = `rgba(255,255,255,${f.a})`;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x - ux * f.len, f.y - uy * f.len);
        ctx.stroke();
      }
    };

    let raf = 0;
    const loop = (t: number) => {
      const gust = 1 + 0.3 * Math.sin(t * 0.0005); // 缓慢阵风,给风一点呼吸
      for (const f of flakes) {
        f.x += f.vx * gust;
        f.y += f.vy * gust;
        if (f.x - f.len > w || f.y - f.len > h) Object.assign(f, spawn(false));
      }
      draw();
      raf = requestAnimationFrame(loop);
    };

    if (reduce) {
      draw(); // 降级：静态单帧,不动
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
