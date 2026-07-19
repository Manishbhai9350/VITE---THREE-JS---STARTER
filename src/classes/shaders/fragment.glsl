uniform sampler2D uVelocity;
uniform vec2 uMouseVelocity;
uniform vec2 uMouse;
uniform float uDecay;

varying vec2 vUv;

void main() {
  vec4 prev = texture2D(uVelocity, vUv);

  vec2 prevVel = prev.xy;

  float speed = length(prevVel);

  float decayRate = mix(.8, .95, smoothstep(0.0, 0.02, speed));
  vec2 vel = prevVel * uDecay;

  float dist = distance(vUv, uMouse);
  float falloff = smoothstep(0.05, 0.0, dist);
  vel += uMouseVelocity * falloff;

  vec2 color = vec2(vel); // just add white where mouse is
  gl_FragColor = vec4(color,0.0, 1.0);
}