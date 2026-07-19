
uniform sampler2D map;

varying vec2 vUv;


void main(){
    vec4 computed = texture(map,vUv);
    gl_FragColor = vec4(vUv,0.0,1.0);
}