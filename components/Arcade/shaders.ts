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
