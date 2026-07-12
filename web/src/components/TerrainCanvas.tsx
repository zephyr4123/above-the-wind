import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Program, Mesh, Geometry } from "ogl";
import { ARCHIVE_COLORS, CAMERA_FOV, DPR_DESKTOP, hexToRgb01 } from "../theme/archive";

/**
 * Archive Instrument 的 WebGL 地形 —— 真实珠峰 DEM(ATW-16)。
 * 高度场 = web/public/everest-height.bin(AWS Terrain Tiles / SRTM,公有领域;
 * 采集脚本 harvest/everest_dem.py 可复现)。CPU 侧从归一化高度场建几何(精确 float +
 * 平滑法线,规避 16-bit PNG 被浏览器解码成 8-bit 丢精度);材质/上色沿用 ATW-15 观测仪
 * shader(岩肋 / 等高线母题 / 雪线露岩 / 8000m 橙切面)——只换了「高度从哪来」。
 */
const DIM = 256; // everest-height.bin 边长(DEM 高度场)
const GRID = 384; // 几何网格分辨率(高于 DEM,给程序微观脊线留空间)
const EXTENT = 34; // 地形平面世界宽度(x / z)
const WORLD_AMP = 14.0; // 归一化高度 → 世界 Y(含垂直夸张补戏剧性)
const DEATHZONE_NORM = 0.8; // 8000m 死亡地带橙切面(harvest 算出 0.800)
const SNOWLINE_NORM = 0.4; // 真实雪线(~6500m)—— 雪从这里往上,与死亡地带线解耦
const MICRO_F = 48.0; // 程序微观脊线频率(周期 / 全幅)
const MICRO_AMP = 0.5; // 微观脊线振幅(世界单位,由 DEM 高度调制:高处起脊、谷地平滑)
const SKIRT = -8; // 裙边:边界顶点下沉成幕布,相机拉远取景时也不露出背后的画布

// 顶点着色器:几何已带真实 Y 与法线,这里只做投影 + 透传(材质靠 fragment)
const vertex = /* glsl */ `#version 300 es
precision highp float;
in vec3 position;
in vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
out float vH;
out vec3 vPos;
out vec3 vNormal;
out float vSlope;
void main(){
  vH = position.y;
  vPos = position;
  vNormal = normal;
  vSlope = 1.0 - normalize(normal).y; // 0 平坦 → 1 陡壁
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// 高度材质 —— 与 ATW-15 观测仪同源(只有 uThreshold 随 DEM 高度尺度改)
const fragment = /* glsl */ `#version 300 es
precision highp float;
in float vH;
in vec3 vPos;
in vec3 vNormal;
in float vSlope;
uniform vec3 uRock, uRockMid, uIce, uIceShadow, uAccent, uCanvas;
uniform float uSnow, uBand;
out vec4 fragColor;

float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main(){
  vec3 N = normalize(vNormal);
  vec3 L = normalize(vec3(0.35, 0.86, 0.30));
  float diff = clamp(dot(N, L), 0.0, 1.0);
  float light = diff * 0.70 + 0.34;

  vec3 rock = mix(uRock, uRockMid, light * light * 0.95 + 0.10);
  vec3 rockHi = mix(rock, uRockMid, 0.35);

  float grain = h21(floor(vPos.xz * 24.0)) * 0.07 - 0.035;
  vec3 ice = mix(uIceShadow, uIce, clamp(light + grain, 0.0, 1.0));

  float snowLine = smoothstep(uSnow - 0.6, uSnow + 1.2, vH);
  float steepShed = smoothstep(0.70, 0.40, vSlope);
  float snow = snowLine * (0.42 + 0.58 * steepShed);
  vec3 rockBed = mix(rock, rockHi, snowLine);
  vec3 col = mix(rockBed, ice, snow);

  // 等高线母题
  float cont = abs(fract(vH * 1.1) - 0.5);
  float contour = smoothstep(0.05, 0.0, cont) * 0.06;
  col *= (1.0 - contour);

  // 8000m 死亡地带橙色切面
  float band = 1.0 - smoothstep(0.0, 0.18, abs(vH - uBand));
  col = mix(col, uAccent, band * 0.42);

  // 裙边(vH<0)压成暗岩,免竖直帘子被地形法线错误打亮
  col = mix(col, uRock, smoothstep(0.0, -1.5, vH));

  // 远处大气
  float haze = smoothstep(6.0, 17.0, -vPos.z);
  col = mix(col, uCanvas, haze * 0.42);

  fragColor = vec4(col, 1.0);
}
`;

// —— 程序微观脊线(JS 值噪声 → ridged fbm),叠在真实 DEM 宏观地形上补嶙峋感 ——
function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy;
}
function ridged(x: number, y: number): number {
  let s = 0, amp = 0.5, freq = 1.0;
  for (let o = 0; o < 4; o++) {
    let nn = 1 - Math.abs(vnoise(x * freq, y * freq) * 2 - 1);
    nn *= nn;
    s += amp * nn;
    amp *= 0.5;
    freq *= 2.03;
  }
  return s;
}
// 双线性采样 DEM 高度场(归一化 0-1)
function sampleDEM(h: Float32Array, u: number, v: number): number {
  const x = u * (DIM - 1), y = v * (DIM - 1);
  const ix = Math.min(DIM - 2, Math.floor(x)), iy = Math.min(DIM - 2, Math.floor(y));
  const fx = x - ix, fy = y - iy;
  const h00 = h[iy * DIM + ix], h10 = h[iy * DIM + ix + 1];
  const h01 = h[(iy + 1) * DIM + ix], h11 = h[(iy + 1) * DIM + ix + 1];
  return (h00 * (1 - fx) + h10 * fx) * (1 - fy) + (h01 * (1 - fx) + h11 * fx) * fy;
}

function buildTerrain(gl: Renderer["gl"], heights: Float32Array): Geometry {
  const n = GRID;
  const cell = EXTENT / (n - 1);
  // 1) 合成高度网格:真实 DEM 宏观(双线性)+ 程序微观脊线(由 DEM 高度调制,高处起脊、谷地平滑)
  const hg = new Float32Array(n * n);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), v = j / (n - 1);
      const macro = sampleDEM(heights, u, v); // 0-1
      const micro = ridged(u * MICRO_F, v * MICRO_F) * MICRO_AMP * macro;
      hg[j * n + i] = macro * WORLD_AMP + micro;
    }
  }
  // 2) positions + 中央差分法线(法线取自合成高度 → 微观脊线也被上色感知)
  const pos = new Float32Array(n * n * 3);
  const nrm = new Float32Array(n * n * 3);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const o = (j * n + i) * 3;
      const border = i === 0 || i === n - 1 || j === 0 || j === n - 1;
      pos[o] = (i / (n - 1) - 0.5) * EXTENT;
      pos[o + 1] = border ? SKIRT : hg[j * n + i];
      pos[o + 2] = (j / (n - 1) - 0.5) * EXTENT;
      const iL = Math.max(0, i - 1), iR = Math.min(n - 1, i + 1);
      const jU = Math.max(0, j - 1), jD = Math.min(n - 1, j + 1);
      const dx = (hg[j * n + iR] - hg[j * n + iL]) / ((iR - iL) * cell);
      const dz = (hg[jD * n + i] - hg[jU * n + i]) / ((jD - jU) * cell);
      const nx = -dx, ny = 1.0, nz = -dz;
      const len = Math.hypot(nx, ny, nz) || 1;
      nrm[o] = nx / len; nrm[o + 1] = ny / len; nrm[o + 2] = nz / len;
    }
  }

  const index = new Uint32Array((n - 1) * (n - 1) * 6);
  let k = 0;
  for (let j = 0; j < n - 1; j++) {
    for (let i = 0; i < n - 1; i++) {
      const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
      index[k++] = a; index[k++] = c; index[k++] = b;
      index[k++] = b; index[k++] = c; index[k++] = d;
    }
  }

  return new Geometry(gl, {
    position: { size: 3, data: pos },
    normal: { size: 3, data: nrm },
    index: { data: index },
  });
}

export function TerrainCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    let alive = true;
    let raf = 0;
    let ro: ResizeObserver | null = null;
    let rendererRef: Renderer | null = null;

    (async () => {
      let heights: Float32Array;
      try {
        const resp = await fetch("/everest-height.bin");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const buf = await resp.arrayBuffer();
        if (buf.byteLength !== DIM * DIM * 4) throw new Error(`意外字节长度 ${buf.byteLength}`);
        heights = new Float32Array(buf);
      } catch (e) {
        // 拉不到 DEM:留空,由 CSS 冰白底兜底(不抛异常留透明白屏)
        console.error("[TerrainCanvas] DEM 高度场加载失败,地形降级留空:", e);
        return;
      }
      if (!alive) return;

      const renderer = new Renderer({
        canvas,
        dpr: Math.min(window.devicePixelRatio || 1, DPR_DESKTOP),
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      rendererRef = renderer;
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      const camera = new Camera(gl, { fov: CAMERA_FOV, near: 0.1, far: 200 });
      camera.position.set(0, 9.5, 32);
      camera.lookAt([0, 4.6, 0]);

      const scene = new Transform();
      const geometry = buildTerrain(gl, heights);
      const program = new Program(gl, {
        vertex,
        fragment,
        cullFace: null,
        uniforms: {
          uSnow: { value: SNOWLINE_NORM * WORLD_AMP },
          uBand: { value: DEATHZONE_NORM * WORLD_AMP },
          uRock: { value: hexToRgb01(ARCHIVE_COLORS.rock) },
          uRockMid: { value: hexToRgb01(ARCHIVE_COLORS.rockMid) },
          uIce: { value: hexToRgb01(ARCHIVE_COLORS.ice) },
          uIceShadow: { value: hexToRgb01(ARCHIVE_COLORS.iceShadow) },
          uAccent: { value: hexToRgb01(ARCHIVE_COLORS.accent) },
          uCanvas: { value: hexToRgb01(ARCHIVE_COLORS.canvas) },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });
      mesh.setParent(scene);

      const resize = () => {
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        renderer.setSize(w, h);
        camera.perspective({ aspect: w / h });
      };
      ro = new ResizeObserver(resize);
      ro.observe(parent);
      resize();

      const loop = () => {
        renderer.render({ scene, camera });
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    })();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      // 真实卸载时释放 GPU context(观测仪↔编年史往返不累积 context)。StrictMode 下
      // mount1 的 async fetch 未完成前就 alive=false、根本没建 renderer,故此处不会
      // 毒化重挂载的 context(见 ATW-15 教训)。
      rendererRef?.gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
