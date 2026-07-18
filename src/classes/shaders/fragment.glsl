uniform sampler2D uVelocity;
uniform vec2 uMouse;
uniform float uDecay;

varying vec2 vUv;

void main() {
  vec4 prev = texture2D(uVelocity, vUv);

  float dist = distance(vUv, uMouse);
  float mark = smoothstep(0.05, 0.0, dist);

  vec3 color = prev.rgb * uDecay + vec3(mark); // just add white where mouse is
  gl_FragColor = vec4(color, prev.a * uDecay);
}