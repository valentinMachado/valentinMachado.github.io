import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  Vector3,
  DirectionalLight,
  Color,
  Matrix4,
  Quaternion,
  AnimationMixer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { config } from "./config";
import { quadraticInOut } from "./utils";

export class Background3D {
  constructor(canvas) {
    this.currentIndex = 0;

    // scene
    this.scene = new Scene();

    // renderer
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    this.renderer.setClearColor(new Color(0.5, 0.6, 0.2), 1);

    // camera
    this.camera = new PerspectiveCamera();
    const { position, quaternion } =
      this._computeCurrentCameraPositionQuaternion();
    this.camera.position.copy(position);
    this.camera.quaternion.copy(quaternion);
    this.camera.updateProjectionMatrix();

    // animation mixers
    this._animationMixers = [];

    // debug
    if (window.DEBUG_3D) {
      new OrbitControls(this.camera, this.renderer.domElement);
      window.onkeyup = () => console.log(this.camera.matrix);
    }

    this.moveCallback = null;
    this.isMoving = false;

    // rendering loop
    const maxFps = 30;
    let fps = maxFps;
    let now;
    let then = Date.now();
    let delta;
    const tick = () => {
      // optimize fps
      if (delta > 2000 / fps) {
        // take two time more than expected to request frame
        console.info("lag", fps);
        fps = Math.max(fps * 0.9, 1); // lower a bit fps
      } else if (delta < 1000 / (fps * 2)) {
        // take two time less than expected to request frame
        console.log("ca roule ma poule", fps);
        fps = Math.min(maxFps, fps * 1.1);
      }

      requestAnimationFrame(tick);
      now = Date.now();
      delta = now - then;
      if (delta > 1000 / fps) {
        then = now - (delta % 1000) / fps;

        this._animationMixers.forEach((a) => a.update(delta * 0.001));

        if (this.moveCallback) this.moveCallback(delta);

        this.renderer.render(this.scene, this.camera);
      }
    };
    tick();
  }

  async load(onProgress) {
    // lighting
    const ambienLight = new AmbientLight("white", 0.1);
    this.scene.add(ambienLight);

    const directLight = new DirectionalLight(new Color("white"), 0.9);
    directLight.position.set(100, 100, 100);
    directLight.lookAt(new Vector3());
    this.scene.add(directLight);

    return new Promise((resolve, reject) => {
      const fbxLoader = new FBXLoader();

      fbxLoader.load(
        "./assets/fbx/Brooklyn Uprock.fbx",
        (object) => {
          // object.traverse(function (child) {
          //     if ((child as THREE.Mesh).isMesh) {
          //         // (child as THREE.Mesh).material = material
          //         if ((child as THREE.Mesh).material) {
          //             ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
          //         }
          //     }
          // })
          // object.scale.set(.01, .01, .01)

          if (object.animations && object.animations.length) {
            const animationMixer = new AnimationMixer(object);
            object.animations.forEach((animClip) => {
              const action = animationMixer.clipAction(animClip);
              action.play(); // Play action is default behaviour
            });
            this._animationMixers.push(animationMixer);
          }

          this.scene.add(object);
          resolve();
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          //temporary
          onProgress(xhr.loaded / xhr.total);
        },
        (error) => {
          console.log(error);
          reject();
        }
      );
    });
  }

  async move() {
    if (this.isMoving) return Promise.resolve;

    this.isMoving = true;

    return new Promise((resolve) => {
      const startPosition = this.camera.position.clone();
      const startQuaternion = this.camera.quaternion.clone();
      let currentTime = 0;

      const { position, quaternion } =
        this._computeCurrentCameraPositionQuaternion();

      this.moveCallback = (dt) => {
        currentTime += dt;
        let ratio = currentTime / config.duration_step_move;
        ratio = quadraticInOut(Math.min(Math.max(0, ratio), 1));

        const p = position.clone().lerp(startPosition, 1 - ratio);
        const q = quaternion.clone().slerp(startQuaternion, 1 - ratio);

        this.camera.position.copy(p);
        this.camera.quaternion.copy(q);
        this.camera.updateProjectionMatrix();

        if (ratio >= 1) {
          this.moveCallback = null;
          this.isMoving = false;
          resolve(true);
        }
      };
    });
  }

  _computeCurrentCameraPositionQuaternion() {
    const currentMatrix = new Matrix4().fromArray(
      config.steps[this.currentIndex]["camera_matrix"]
    );
    const currentPosition = new Vector3();
    const currentQuaternion = new Quaternion();
    currentMatrix.decompose(currentPosition, currentQuaternion, new Vector3());

    return { position: currentPosition, quaternion: currentQuaternion };
  }

  async moveNext() {
    if (this.isMoving || this.currentIndex + 1 > config.steps.length - 1)
      return Promise.resolve;

    this.currentIndex++;

    await this.move();
  }

  async movePrevious() {
    if (this.isMoving || this.currentIndex - 1 < 0) return Promise.resolve;

    this.currentIndex--;

    await this.move();
  }

  async moveToIndex(index) {
    if (
      this.currentIndex == index ||
      this.isMoving ||
      index < 0 ||
      index > config.steps.length - 1
    )
      return Promise.resolve;

    this.currentIndex = index;

    await this.move();
  }
}
