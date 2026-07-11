import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Program, Mesh, Plane } from "ogl";
import { ARCHIVE_COLORS, CAMERA_FOV, DPR_DESKTOP, hexToRgb01 } from "../theme/archive";

/**
 * Archive Instrument 的 WebGL 地形（程序化 PoC）。
 * 高度材质：低于阈值=黑岩、高于=冰白、阈值附近=橙色切面散射。
 * 真实珠峰 DEM 为后续升级（对应延后的 DEM #2）。
 */
const vertex = /* glsl */ `#version 300 es
precision highp float;
in vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uAmp;
out float vH;
out vec3 vPos;
out vec3 vNormal;
out float vSlope;

float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = h21(i), b = h21(i + vec2(1.0, 0.0));
  float c = h21(i + vec2(0.0, 1.0)), d = h21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = p * 2.03 + 1.7; a *= 0.5; }
  return s;
}
// ridged multifractal：脊线尖锐、细节向脊线聚集 → 嶙峋高山感
float ridged(vec2 p){
  float s = 0.0, a = 0.5, prev = 1.0;
  for (int i = 0; i < 6; i++){
    float n = 1.0 - abs(vnoise(p) * 2.0 - 1.0);
    n *= n;                                       // 锐化脊
    s += a * n * prev;                            // 乘上一八度 → 脊上叠细节
    prev = n;
    p = p * 2.02 + 1.3;
    a *= 0.5;
  }
  return s;
}
float height(vec2 g){
  float d = length(g);
  float massif = exp(-d * d * 0.055);            // 中央高耸山块(~1.0 峰心)
  float r = ridged(g * 0.95 + 7.0);              // 尖锐高山脊
  float base = fbm(g * 0.32 + 2.0);              // 大尺度起伏
  float h = massif * 1.06 + r * (0.20 + 0.46 * massif) + base * 0.17;
  h -= 0.045 * (1.0 - massif) * fbm(g * 3.2 + 4.0); // 侧翼侵蚀沟槽,破整块感
  return h * uAmp;
}
void main(){
  vec2 g = position.xy;                          // 平面局部坐标 → 地面 XZ
  float h = height(g);
  float e = 0.05;
  float hx = height(g + vec2(e, 0.0));
  float hz = height(g + vec2(0.0, e));
  vNormal = normalize(vec3(-(hx - h) / e, 1.0, -(hz - h) / e)); // 解析法线
  vSlope = 1.0 - vNormal.y;                      // 0 平坦 → 1 垂直陡壁
  vec3 pos = vec3(g.x, h, g.y);
  vH = h;
  vPos = pos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragment = /* glsl */ `#version 300 es
precision highp float;
in float vH;
in vec3 vPos;
in vec3 vNormal;
in float vSlope;
uniform vec3 uRock, uRockMid, uIce, uIceShadow, uAccent, uCanvas;
uniform float uThreshold;
out vec4 fragColor;

float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main(){
  vec3 N = normalize(vNormal);
  vec3 L = normalize(vec3(0.35, 0.86, 0.30));
  float diff = clamp(dot(N, L), 0.0, 1.0);
  float light = diff * 0.70 + 0.34;

  // 岩石：暗面近黑、亮面抬起,让黑岩有体积而非死黑
  vec3 rock = mix(uRock, uRockMid, light * light * 0.95 + 0.10);
  // 雪线以上的岩肋提亮一档,免得雪面里的岩肋黑得刺眼
  vec3 rockHi = mix(rock, uRockMid, 0.35);

  // 冰雪：细颗粒破整块感,亮面纯白、背光冰蓝阴影
  float grain = h21(floor(vPos.xz * 24.0)) * 0.07 - 0.035;
  vec3 ice = mix(uIceShadow, uIce, clamp(light + grain, 0.0, 1.0));

  // 雪线：高于阈值挂雪,但陡壁挂不住雪 → 露岩,打破"冰墙"
  float snowLine = smoothstep(uThreshold - 0.05, uThreshold + 0.10, vH);
  float steepShed = smoothstep(0.70, 0.40, vSlope);   // 仅陡壁露岩,雪仍为主
  float snow = snowLine * (0.42 + 0.58 * steepShed);  // 雪为主 + 陡处岩肋
  vec3 rockBed = mix(rock, rockHi, snowLine);         // 雪区岩肋提亮,免刺眼
  vec3 col = mix(rockBed, ice, snow);

  // 等高线母题：每隔一定海拔一道极淡的测绘等高线(裹住三维体)
  float cont = abs(fract(vH * 3.0) - 0.5);
  float contour = smoothstep(0.05, 0.0, cont) * 0.06;
  col *= (1.0 - contour);

  // 8000m 橙色切面：收紧为一条精确散射线,不再糊成一片
  float band = 1.0 - smoothstep(0.0, 0.05, abs(vH - uThreshold));
  col = mix(col, uAccent, band * 0.42);

  // 远处淡入冰川白画布(大气感,轻一点别糊白)
  float haze = smoothstep(7.0, 16.0, -vPos.z);
  col = mix(col, uCanvas, haze * 0.42);

  fragColor = vec4(col, 1.0);
}
`;

export function TerrainCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;

    const renderer = new Renderer({
      canvas,
      dpr: Math.min(window.devicePixelRatio || 1, DPR_DESKTOP),
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: CAMERA_FOV, near: 0.1, far: 100 });
    camera.position.set(0, 3.4, 13.5);
    camera.lookAt([0, 1.9, 0]);

    const scene = new Transform();
    const geometry = new Plane(gl, {
      width: 34,
      height: 30,
      widthSegments: 260,
      heightSegments: 230,
    });
    const program = new Program(gl, {
      vertex,
      fragment,
      cullFace: null,
      uniforms: {
        uAmp: { value: 5.0 },
        uThreshold: { value: 3.05 },
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
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    let raf = 0;
    const loop = () => {
      renderer.render({ scene, camera });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      // 不强制 loseContext：StrictMode 的 mount→unmount→mount 下会毒化重挂载的
      // context（getContext 返回同一个已丢失的上下文）。让 GC 随 canvas 回收即可。
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
