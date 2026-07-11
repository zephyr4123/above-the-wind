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
  for (int i = 0; i < 6; i++){ s += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return s;
}
float height(vec2 g){
  float ridge = fbm(g * 0.9 + 7.0);
  ridge = 1.0 - abs(ridge * 2.0 - 1.0);          // ridged noise，脊线更锐
  float base = fbm(g * 0.34 + 2.0);
  float massif = exp(-dot(g, g) * 0.052);        // 中央高耸山块
  return (massif * 1.05 + base * 0.42 + ridge * massif * 0.5) * uAmp;
}
void main(){
  vec2 g = position.xy;                          // 平面局部坐标 → 地面 XZ
  float h = height(g);
  float e = 0.06;
  float hx = height(g + vec2(e, 0.0));
  float hz = height(g + vec2(0.0, e));
  vNormal = normalize(vec3(-(hx - h) / e, 1.0, -(hz - h) / e)); // 解析法线
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
uniform vec3 uRock, uRockMid, uIce, uIceShadow, uAccent, uCanvas;
uniform float uThreshold;
out vec4 fragColor;
void main(){
  vec3 N = normalize(vNormal);
  float light = clamp(dot(N, normalize(vec3(0.32, 0.9, 0.28))) * 0.65 + 0.42, 0.0, 1.0);
  vec3 rock = mix(uRock, uRockMid, light * light);
  vec3 ice  = mix(uIceShadow, uIce, light);
  float t = smoothstep(uThreshold - 0.05, uThreshold + 0.06, vH);
  vec3 col = mix(rock, ice, t);
  // 8000m 橙色切面散射带
  float band = 1.0 - smoothstep(0.0, 0.1, abs(vH - uThreshold));
  col = mix(col, uAccent, band * 0.22);
  // 远处淡入冰川白画布（大气感）
  float haze = smoothstep(6.0, 15.0, -vPos.z);
  col = mix(col, uCanvas, haze * 0.55);
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
