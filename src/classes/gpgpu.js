import {
  ClampToEdgeWrapping,
  HalfFloatType,
  NearestFilter,
  PlaneGeometry,
} from "three";
import { Mesh } from "three";
import { WebGLRenderer } from "three";
import { GetSceneBounds } from "../utils";
import { OrthographicCamera } from "three";
import { ShaderMaterial } from "three";
import { RenderTarget } from "three";
import { Scene } from "three";
import { Uniform } from "three";

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { Vector2 } from "three";

export class GPGPU {
  renderer = new WebGLRenderer();
  scene = new Scene();

  maxVelocity = 100;

  currentMouse = new Vector2(0, 0);
  lastMouse = new Vector2(0, 0);
  uniforms = {
    uVelocity: new Uniform(),
    uMouse: new Uniform(new Vector2(100, 100)),
    uMouseVelocity: new Uniform(new Vector2(0, 0)),
    uDecay: new Uniform(0.9),
    uDelta: new Uniform(0),
  };
  mouse = {
    target: new Vector2(),
    current: new Vector2(),
    prev: new Vector2(),
  };
  mouseVelocity = {
    x: 0,
    y: 0,
  };
  material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: this.uniforms,
  });
  plane = new Mesh();

  // Render Targets;
  constructor(renderer) {
    this.renderer = renderer;
    this.read = this.createRT();
    this.write = this.createRT();

    this.Init();
    this.setupMouse();
  }

  createRT() {
    return new RenderTarget(256, 256, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      type: HalfFloatType,
      generateMipmaps: false,
    });
  }

  Compute() {
    this.renderer.setRenderTarget(this.write);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    // swap read/write
    const temp = this.read;
    this.read = this.write;
    this.write = temp;
  }

  Computed() {
    return this.read.texture;
  }

  Init() {
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1000);
    const Plane = new Mesh(new PlaneGeometry(2, 2), this.material);
    this.plane = Plane;

    this.scene.add(Plane);

    this.Compute();
  }

  setupMouse() {
    window.addEventListener("mousemove", (e) => {
      const x = e.clientX / innerWidth;
      const y = 1.0 - e.clientY / innerHeight;

      this.mouse.target.set(x, y);
    });
  }

  updateComputeData() {
    this.uniforms.uMouseVelocity.value.set(
      this.mouseVelocity.x,
      this.mouseVelocity.y,
    );
    this.uniforms.uMouse.value.copy(this.mouse.current);
    this.uniforms.uVelocity.value = this.read.texture;
    const deltaMouse = this.currentMouse.clone().sub(this.lastMouse);
  }

  update(dt) {
    this.mouse.prev.set(this.mouse.current.x, this.mouse.current.y);
    this.mouse.current.x += (this.mouse.target.x - this.mouse.current.x) * 0.1;
    this.mouse.current.y += (this.mouse.target.y - this.mouse.current.y) * 0.1;

    this.mouseVelocity.x = this.mouse.current.x - this.mouse.prev.x;
    this.mouseVelocity.y = this.mouse.current.y - this.mouse.prev.y;

    this.updateComputeData();
    this.Compute();
  }
}
