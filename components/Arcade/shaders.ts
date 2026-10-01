// Small procedural shaders. No texture files.

export const screenVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/**
 * Calm attract-mode screen: a dark glass with a soft tinted disc and a faint
 * moving highlight. No scanlines, no grid, nothing that flickers.
 */
export const attractFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uBoost;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  vec3 base = mix(vec3(0.06, 0.08, 0.12), uColor * 0.45, (1.0 - uv.y) * 0.55);
  float d = length((uv - vec2(0.5, 0.56)) * vec2(1.15, 1.0));
  float disc = smoothstep(0.27, 0.25, d);
  float pulse = 0.9 + 0.1 * sin(uTime * 1.4);
  base = mix(base, mix(uColor, vec3(1.0), 0.3), disc * pulse);
  float band = smoothstep(0.1, 0.0, abs(fract(uv.y * 0.7 - uTime * 0.04) - 0.5) - 0.4);
  base += band * 0.035;
  base *= 1.0 - 0.3 * smoothstep(0.45, 0.85, length(uv - 0.5));
  gl_FragColor = vec4(base * (1.0 + uBoost * 0.3), 1.0);
  #include <colorspace_fragment>
}
`

/** Scrolling road: asphalt, dashed lane lines and solid edge lines (Sunny Drive). */
export const roadVertex = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

export const roadFragment = /* glsl */ `
uniform vec3 uRoad;
uniform vec3 uLine;
uniform float uScroll;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
varying vec3 vWorld;
void main() {
  float x = vWorld.x;
  float z = vWorld.z + uScroll;
  float aa = fwidth(x) * 1.2;
  // Edge lines at x = +-3.2, dashed lane dividers at x = +-1.
  float edge = 1.0 - smoothstep(0.08, 0.08 + aa, abs(abs(x) - 3.2));
  float dash = step(0.5, fract(z / 4.0));
  float lane = (1.0 - smoothstep(0.05, 0.05 + aa, abs(abs(x) - 1.0))) * dash;
  float inRoad = 1.0 - step(3.6, abs(x));
  vec3 color = mix(uRoad, uLine, clamp(edge + lane, 0.0, 1.0) * inRoad);
  color = mix(color, uFogColor, smoothstep(uFogNear, uFogFar, distance(vWorld, cameraPosition)));
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`
