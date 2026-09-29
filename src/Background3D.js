import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { globalParameters, globalInit } from "./globalParameters";
import { quadraticInOut } from "./utils";

export class Background3D {
  constructor(canvas) {
    this._currentStepId = globalParameters.initialStepId;

    // scene
    this.scene = new Scene();

    // renderer
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setClearColor(new Color(), 0);
    this.renderer.shadowMap.enabled = true;
    // capped: rendering above 2x costs a lot for no visible gain
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // camera
    this.camera = new PerspectiveCamera();
    const { position, quaternion } =
      this._computeCurrentCameraPositionQuaternion();
    this.camera.position.copy(position);
    this.camera.quaternion.copy(quaternion);
    this.camera.updateProjectionMatrix();

    // debug
    if (window.DEBUG_3D) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement); // free camera not working on threlte
      this.controls.target.copy(this.currentStep.cameraTarget);
      this.controls.update();
      window.addEventListener("keyup", (event) => {
        if (event.key == "a") {
          this.controls.enabled = !this.controls.enabled;
        }
        console.log(this.camera.position, this.controls.target);
        const string =
          "cameraPosition: new Vector3(" +
          this.camera.position.x +
          "," +
          this.camera.position.y +
          "," +
          this.camera.position.z +
          "),cameraTarget: new Vector3(" +
          this.controls.target.x +
          "," +
          this.controls.target.y +
          "," +
          this.controls.target.z +
          ")";
        navigator.clipboard.writeText(string);
      });
      const targetElement = document.createElement("div");
      targetElement.id = "inspector";
      document.getElementById("move_to_home").appendChild(targetElement);
      // loaded on demand so this debug-only UI stays out of the production bundle
      import(/* webpackChunkName: "three-inspect" */ "three-inspect/vanilla").then(({ createInspector }) =>
        createInspector(targetElement, {
          scene: this.scene,
          camera: this.camera,
          renderer: this.renderer,
        })
      );
    }

    this.moveCallback = null;
    this.isMoving = false;
    this._lastStep = null;
    this.dt = 0;
  }

  get currentStep() {
    return globalParameters.steps.get(this._currentStepId);
  }

  async load() {
    globalInit(this);

    // initialize step scene
    for (const [, step] of globalParameters.steps) {
      step.init(this);
    }

    // start rendering
    {
      const maxFps = 30;
      let fps = maxFps;
      let now;
      let then = Date.now();

      // looping function
      const tick = () => {
        // optimize fps
        if (this.dt > 2000 / fps) {
          // frames take twice as long as expected: lower the target fps
          fps = Math.max(fps * 0.9, 1);
        } else if (this.dt < 1000 / (fps * 2)) {
          // plenty of headroom: raise it back
          fps = Math.min(maxFps, fps * 1.1);
        }

        requestAnimationFrame(tick);
        now = Date.now();
        this.dt = now - then;
        if (this.dt > 1000 / fps) {
          // keep the remainder so frames stay aligned on the 1000 / fps interval
          then = now - (this.dt % (1000 / fps));

          if (this.moveCallback) {
            this.moveCallback(this.dt);
          } else {
            this.currentStep.tick();
          }

          this.renderer.render(this.scene, this.camera);
        }
      };
      tick();
    }

    // a tiny wait allow to render well loading screen end transition
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.currentStep.onFocus();
  }

  async move() {
    if (this.isMoving) return;

    this.isMoving = true;

    return new Promise((resolve) => {
      const startPosition = this.camera.position.clone();
      const startQuaternion = this.camera.quaternion.clone();
      let currentTime = 0;

      const { position, quaternion } =
        this._computeCurrentCameraPositionQuaternion();

      this.moveCallback = (dt) => {
        currentTime += dt;
        let ratio = currentTime / globalParameters.stepMoveDuration;
        ratio = quadraticInOut(Math.min(Math.max(0, ratio), 1));

        const p = position.clone().lerp(startPosition, 1 - ratio);
        const q = quaternion.clone().slerp(startQuaternion, 1 - ratio);

        this.camera.position.copy(p);
        this.camera.quaternion.copy(q);
        this.camera.updateProjectionMatrix();

        if (ratio >= 1) {
          this.moveCallback = null;
          this.isMoving = false;
          this._lastStep.onLeave();
          this.currentStep.onFocus();
          if (this.controls)
            this.controls.target.copy(this.currentStep.cameraTarget);
          resolve(true);
        }
      };
    });
  }

  _computeCurrentCameraPositionQuaternion() {
    const obj = new PerspectiveCamera();
    obj.position.copy(this.currentStep.cameraPosition);
    obj.lookAt(this.currentStep.cameraTarget);

    return { position: obj.position, quaternion: obj.quaternion };
  }

  async moveNext() {
    return this.moveToStep(this.currentStep.nextStepId);
  }

  async movePrevious() {
    return this.moveToStep(this.currentStep.previousStepId);
  }

  async moveToStep(id) {
    if (
      this._currentStepId == id ||
      this.isMoving ||
      !globalParameters.steps.has(id)
    )
      return;

    this._lastStep = this.currentStep;
    this._currentStepId = id;

    await this.move();
  }
}
