import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import { Clock } from "three";
import { GetSceneBounds } from "./utils";
import { GPGPU } from "./classes/gpgpu";
import { Uniform } from "three";
import { Texture } from "three";

const { PI } = Math;

const canvas = document.querySelector("canvas");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});

const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  1,
  1000,
);
camera.position.z = 5;

const Manager = new THREE.LoadingManager();
const Draco = new DRACOLoader(Manager);
const GLB = new GLTFLoader(Manager);
const TextureLoader = new THREE.TextureLoader(Manager);

Draco.setDecoderPath("/draco/");
Draco.setDecoderConfig({ type: "wasm" });
GLB.setDRACOLoader(Draco);

const { width: SceneWidth, height: SceneHeight } = GetSceneBounds(
  renderer,
  camera,
);

const gpgpu = {
  instance: new GPGPU(renderer),
};

// const material = new THREE.ShaderMaterial({
//   vertexShader,
//   fragmentShader,
//   uniforms: {
//     uComputed: { value: null },
//   },
// });

const material = new THREE.MeshBasicMaterial();

const Plane = new THREE.Mesh(
  new THREE.PlaneGeometry(SceneWidth, SceneHeight),
  material,
);

// Plane.material.uniforms.uComputed.value = gpgpu.instance.Computed();
Plane.material.map = gpgpu.instance.Computed();

Plane.material.onBeforeCompile = (shader) => {
  console.log(shader.fragmentShader);
  // shader.vertexShader = vertexShader;
  // shader.fragmentShader = fragmentShader;
};

scene.add(Plane);

const clock = new Clock();
let PrevTime = clock.getElapsedTime();

function Animate() {
  const CurrentTime = clock.getElapsedTime();
  const DT = CurrentTime - PrevTime;
  PrevTime = CurrentTime;

  gpgpu.instance.update(DT);
  // Plane.material.uniforms.uComputed.value = gpgpu.instance.Computed();

  renderer.render(scene, camera);
  requestAnimationFrame(Animate);
}

requestAnimationFrame(Animate);

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  renderer.setSize(innerWidth, innerHeight);
}

window.addEventListener("resize", resize);
