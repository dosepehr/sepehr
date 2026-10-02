// Small procedural shaders. No texture files.

export const gridVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

export const gridFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uScroll;
uniform float uSize;
uniform float uFade;
varying vec3 vWorld;
void main() {
  vec2 coord = vec2(vWorld.x, vWorld.z + uScroll) / uSize;
  vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  float line = 1.0 - min(min(grid.x, grid.y), 1.0);
  float fade = 1.0 - smoothstep(uFade * 0.4, uFade, length(vWorld.xz));
  vec3 color = uColor * line * 2.2 * fade;
  gl_FragColor = vec4(color, line * fade);
}
`

export const attractFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uBoost;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  // Scrolling perspective grid in the lower half.
  float horizon = 0.45;
  vec3 color = vec3(0.02, 0.0, 0.06);
  if (uv.y < horizon) {
    float depth = (horizon - uv.y) / horizon;
    float z = 1.0 / max(depth, 0.02);
    float gx = abs(fract((uv.x - 0.5) * z * 2.0) - 0.5);
    float gz = abs(fract(z * 0.6 - uTime * 0.8) - 0.5);
    float line = step(gx, 0.04 * z * 0.3) + step(gz, 0.05);
    color += uColor * min(line, 1.0) * depth * 1.5;
  } else {
    // Striped sun.
    vec2 c = uv - vec2(0.5, 0.62);
    float sun = smoothstep(0.24, 0.23, length(c * vec2(1.4, 1.0)));
    float stripes = step(0.5, fract((uv.y - 0.5) * 18.0 + uTime * 0.3)) + step(uv.y, 0.62);
    color += mix(vec3(1.0, 0.85, 0.2), uColor, uv.y * 1.2 - 0.4) * sun * min(stripes, 1.0);
  }
  // Scanlines and vignette.
  color *= 0.8 + 0.2 * sin(uv.y * 400.0);
  color *= smoothstep(0.75, 0.2, length(uv - 0.5));
  gl_FragColor = vec4(color * (1.2 + uBoost), 1.0);
}
`

export const sunFragment = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uBottom;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 c = vUv - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float bands = step(0.5, fract(vUv.y * 14.0 - uTime * 0.15));
  float gap = vUv.y < 0.5 ? bands : 1.0;
  if (gap < 0.5) discard;
  vec3 color = mix(uBottom, uTop, vUv.y);
  gl_FragColor = vec4(color * 1.6, 1.0);
}
`

export const screenVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/** Cabinet side art: dark lacquer with neon racing stripes and a fading grid. */
export const sideArtFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uBoost;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  vec3 base = mix(vec3(0.03, 0.01, 0.07), vec3(0.09, 0.03, 0.16), uv.y);
  // Three diagonal stripes, thinning toward the top.
  float d = uv.x * 0.9 + uv.y * 0.55;
  float stripes = 0.0;
  for (int i = 0; i < 3; i++) {
    float c = 0.55 + float(i) * 0.12;
    float w = 0.035 - float(i) * 0.008;
    stripes += smoothstep(w, w * 0.6, abs(d - c));
  }
  // Perspective grid in the lower third.
  float g = 0.0;
  if (uv.y < 0.32) {
    float depth = (0.32 - uv.y) / 0.32;
    vec2 cell = vec2(uv.x * 10.0, 1.0 / max(depth, 0.05));
    vec2 f = abs(fract(cell) - 0.5);
    g = (step(0.46, f.x) + step(0.46, f.y)) * depth;
  }
  vec3 color = base + uColor * (stripes * (1.4 + uBoost) + min(g, 1.0) * 0.6);
  gl_FragColor = vec4(color, 1.0);
}
`

/** Back-wall window: outrun panorama with a striped sun, neon mountains, a city and a scrolling grid. */
export const skylineFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uPink;
uniform vec3 uCyan;
uniform vec3 uPurple;
uniform float uAspect;
varying vec2 vUv;

float hash(float n) { return fract(sin(n) * 43758.5453); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float ridge(float x, float seed) {
  float h = 0.0;
  h += abs(sin(x * 3.1 + seed)) * 0.5;
  h += abs(sin(x * 7.3 + seed * 2.1)) * 0.25;
  h += abs(sin(x * 17.0 + seed * 3.7)) * 0.08;
  return h;
}

void main() {
  vec2 uv = vUv;
  float horizon = 0.36;
  vec3 color;

  if (uv.y > horizon) {
    // Sky: deep purple overhead, hot pink at the horizon.
    float k = (uv.y - horizon) / (1.0 - horizon);
    color = mix(uPink * 0.55, vec3(0.03, 0.01, 0.09), pow(k, 0.55));
    color += uPurple * 0.18 * (1.0 - k);

    // Stars.
    vec2 cell = floor(uv * vec2(120.0 * uAspect, 120.0));
    float s = hash2(cell);
    float twinkle = 0.6 + 0.4 * sin(uTime * 2.0 + s * 50.0);
    color += vec3(1.0) * step(0.985, s) * k * twinkle * 0.9;

    // Sun with scrolling cut-out bands in its lower half.
    vec2 c = (uv - vec2(0.5, horizon + 0.17)) * vec2(uAspect, 1.0);
    float d = length(c);
    float r = 0.3;
    float sun = smoothstep(r, r - 0.006, d);
    float yIn = (c.y + r) / (2.0 * r);
    float bands = step(0.5 - (0.5 - yIn) * 0.9, fract(yIn * 11.0 - uTime * 0.12));
    if (yIn < 0.5) sun *= bands;
    vec3 sunColor = mix(uBottom, uTop, clamp(yIn * 1.2, 0.0, 1.0));
    color = mix(color, sunColor * 1.8, sun);
    // Halo.
    color += uPink * 0.35 * exp(-max(d - r, 0.0) * 9.0) * (1.0 - sun);

    // Far mountains with a neon rim.
    float x = uv.x * uAspect;
    float m1 = horizon + ridge(x * 0.6, 1.3) * 0.16;
    float m2 = horizon + ridge(x * 0.9 + 4.0, 7.1) * 0.09;
    if (uv.y < m1) color = mix(vec3(0.05, 0.01, 0.12), uPurple * 0.25, (m1 - uv.y) * 2.0);
    color += uCyan * smoothstep(0.004, 0.0, abs(uv.y - m1)) * 1.4;
    if (uv.y < m2) color = vec3(0.025, 0.005, 0.06);
    color += uPink * smoothstep(0.004, 0.0, abs(uv.y - m2)) * 1.6;

    // City skyline in front.
    float col = floor(uv.x * 46.0 * uAspect / 3.0);
    float bh = horizon + 0.02 + pow(hash(col * 1.7), 2.4) * 0.16;
    if (abs(uv.x - 0.5) > 0.16 || hash(col) > 0.55) {
      if (uv.y < bh) {
        color = vec3(0.015, 0.0, 0.035);
        vec2 w = fract(vec2(uv.x * 46.0 * uAspect, uv.y * 90.0));
        vec2 wid = floor(vec2(uv.x * 46.0 * uAspect, uv.y * 90.0));
        float lit = step(0.72, hash2(wid + col)) * step(0.3, w.x) * step(w.x, 0.7) * step(0.3, w.y) * step(w.y, 0.75);
        color += mix(uCyan, vec3(1.0, 0.8, 0.4), hash(wid.y + col)) * lit * 0.9;
        // Rooftop beacon.
        color += vec3(1.0, 0.1, 0.2) * smoothstep(0.004, 0.0, length((uv - vec2((col + 0.5) / (46.0 * uAspect / 3.0), bh)) * vec2(uAspect, 1.0))) * (0.5 + 0.5 * sin(uTime * 3.0 + col));
      }
    }
  } else {
    // Ground: perspective grid racing toward the viewer.
    float depth = (horizon - uv.y) / horizon;
    float z = 1.0 / max(depth, 0.015);
    float gx = abs(fract((uv.x - 0.5) * uAspect * z * 1.4) - 0.5);
    float gz = abs(fract(z * 0.5 - uTime * 0.9) - 0.5);
    float wx = fwidth((uv.x - 0.5) * uAspect * z * 1.4);
    float line = smoothstep(wx * 1.5, 0.0, gx) + smoothstep(0.06, 0.0, gz) * depth;
    color = vec3(0.04, 0.0, 0.08) + uPink * min(line, 1.0) * (0.4 + depth * 1.6);
    color += uPink * 0.35 * exp(-depth * 10.0);
  }

  // Glass: diagonal reflection streaks.
  float streak = smoothstep(0.03, 0.0, abs(fract(uv.x * 0.8 + uv.y * 0.6) - 0.35)) * 0.06;
  color += vec3(streak);
  gl_FragColor = vec4(color, 1.0);
}
`

/** Soft radial pool of colored light on the floor (additive). */
export const glowFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = pow(max(1.0 - d, 0.0), 2.2) * uStrength;
  gl_FragColor = vec4(uColor * a, a);
}
`

/** Retro poster art. uVariant picks one of three designs. */
export const posterFragment = /* glsl */ `
uniform float uTime;
uniform float uVariant;
uniform vec3 uA;
uniform vec3 uB;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  vec3 color = mix(vec3(0.03, 0.01, 0.08), vec3(0.1, 0.02, 0.18), uv.y);
  if (uVariant < 0.5) {
    // Wireframe prism over a grid.
    vec2 p = uv - vec2(0.5, 0.55);
    float tri = max(abs(p.x) * 1.732 + p.y, -p.y * 2.0) - 0.22;
    color += uA * smoothstep(0.012, 0.0, abs(tri)) * 1.8;
    color += uB * smoothstep(0.012, 0.0, abs(tri + 0.06)) * 1.2;
    float g = step(0.96, fract(uv.x * 10.0)) + step(0.96, fract(uv.y * 14.0 - uTime * 0.2));
    color += uB * min(g, 1.0) * 0.18 * (1.0 - uv.y);
  } else if (uVariant < 1.5) {
    // Concentric rings, slowly pulsing.
    float d = length(uv - vec2(0.5, 0.58));
    float rings = smoothstep(0.1, 0.0, abs(fract(d * 9.0 - uTime * 0.4) - 0.5) - 0.38);
    color += mix(uA, uB, d * 2.0) * rings * smoothstep(0.45, 0.1, d) * 1.4;
  } else {
    // Stacked sine waves.
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float y = 0.2 + fi * 0.11 + sin(uv.x * 9.0 + uTime + fi) * 0.03;
      color += mix(uA, uB, fi / 5.0) * smoothstep(0.008, 0.0, abs(uv.y - y)) * 1.6;
    }
  }
  // Border.
  vec2 e = min(uv, 1.0 - uv);
  color += uA * smoothstep(0.02, 0.012, min(e.x, e.y)) * 1.5;
  gl_FragColor = vec4(color, 1.0);
}
`
