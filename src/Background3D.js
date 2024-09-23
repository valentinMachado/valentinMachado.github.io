import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  Vector3,
  DirectionalLight,
  Color,
  AnimationMixer,
  Mesh,
  Object3D,
  MeshStandardMaterial,
  RepeatWrapping,
  Vector2,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { config, Step } from "./config";
import { quadraticInOut } from "./utils";
import { createInspector } from "three-inspect/vanilla";
import { AjaxTextureLoader } from "./AjaxTextureLoader";

export class Background3D {
  constructor(canvas) {
    this._currentIndex = config.initial_index;

    // scene
    this.scene = new Scene();

    // renderer
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    this.renderer.setClearColor(new Color(0.25, 0.25, 0.25), 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);

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
      const controls = new OrbitControls(this.camera, this.renderer.domElement); // free camera not working on threlte
      controls.target.copy(this.currentStep.cameraTarget);
      controls.update();
      window.addEventListener("keyup", (event) => {
        if (event.key == "a") {
          controls.enabled = !controls.enabled;
        }
        console.log(this.camera.position, controls.target);
        const string =
          "cameraPosition: new Vector3(" +
          this.camera.position.x +
          "," +
          this.camera.position.y +
          "," +
          this.camera.position.z +
          "),cameraTarget: new Vector3(" +
          controls.target.x +
          "," +
          controls.target.y +
          "," +
          controls.target.z +
          ")";
        navigator.clipboard.writeText(string);
      });
      const targetElement = document.createElement("div");
      targetElement.id = "inspector";
      document.getElementById("move_to_home").appendChild(targetElement);
      const inspector = createInspector(targetElement, {
        scene: this.scene,
        camera: this.camera,
        renderer: this.renderer,
      });
    }
    // debug
    window.addEventListener("keyup", (event) => {
      console.log(this.scene);
      console.log(this.camera);
    });

    this.moveCallback = null;
    this.isMoving = false;
    this._lastStep = null;
    this.dt = 0;
  }

  get currentStep() {
    return config.steps[this._currentIndex];
  }

  async load(onProgress) {
    // loading fbx models and bones
    let progress = new Map();

    const computeTotalProgress = () => {
      let result = 0;
      for (let [, value] of progress) {
        result += value / progress.size;
      }
      return result;
    };

    const models = new Map();
    const materials = new Map();
    const animations = new Map();
    const fbxLoader = new FBXLoader();
    const ajaxTextureLoader = new AjaxTextureLoader();
    const promises = [];

    const loadFbxs = (configObject, onLoad) => {
      for (let id in configObject) {
        const path = configObject[id].path;
        progress.set(path, 0);
        promises.push(
          new Promise((resolve, reject) => {
            fbxLoader.load(
              path,
              (object) => {
                object.scale.set(
                  configObject[id].scale,
                  configObject[id].scale,
                  configObject[id].scale
                );
                onLoad(id, object);
                resolve();
              },
              (xhr) => {
                progress.set(path, xhr.loaded / xhr.total);
                onProgress(computeTotalProgress());
              },
              (error) => {
                console.log(error);
                reject();
              }
            );
          })
        );
      }
    };

    loadFbxs(config.fbx.models, (id, object) => {
      object.traverse((child) => {
        child.castShadow = true;
        child.receiveShadow = true;
      });
      models.set(id, object);
    });
    loadFbxs(config.fbx.animations, (id, object) => {
      const anim = object.animations[0];
      anim.name = id;
      animations.set(id, anim);
    });

    const loadTexture = (path, scale, onLoad) => {
      progress.set(path, 0);
      return new Promise((resolve, reject) => {
        ajaxTextureLoader.load(
          path,
          (texture) => {
            texture.wrapS = texture.wrapT = RepeatWrapping;
            texture.offset.set(0, 0);
            texture.repeat.set(scale, scale);
            onLoad(texture);
            resolve();
          },
          (xhr) => {
            progress.set(path, xhr.loaded / xhr.total);
            onProgress(computeTotalProgress());
          },
          (error) => {
            console.log(error);
            reject();
          }
        );
      });
    };
    for (let id in config.materials) {
      const result = new MeshStandardMaterial();
      promises.push(
        loadTexture(
          config.materials[id].color,
          config.materials[id].scale,
          (texture) => (result.map = texture)
        )
      );
      promises.push(
        loadTexture(
          config.materials[id].ao,
          config.materials[id].scale,
          (texture) => (result.aoMap = texture)
        )
      );
      promises.push(
        loadTexture(
          config.materials[id].normal,
          config.materials[id].scale,
          (texture) => (result.normalMap = texture)
        )
      );
      promises.push(
        loadTexture(
          config.materials[id].roughness,
          config.materials[id].scale,
          (texture) => (result.roughnessMap = texture)
        )
      );
      materials.set(id, result);
    }

    return new Promise((resolve, reject) => {
      Promise.all(promises).then(() => {
        // everything is loaded

        let fbxId = 0;
        /**
         *
         * @param {string} modelId
         * @param {string[]} animIds
         * @returns {Object3D}
         */
        this.createFromFBX = (modelId, animIds) => {
          const result = models.get(modelId).clone();

          if (animIds) {
            function parallelTraverse(a, b, callback) {
              callback(a, b);

              for (let i = 0; i < a.children.length; i++) {
                parallelTraverse(a.children[i], b.children[i], callback);
              }
            }
            function resetClonedSkinnedMeshes(source, clone) {
              const clonedMeshes = [];
              const meshSources = {};
              const boneClones = {};

              parallelTraverse(
                source,
                clone,
                function (sourceNode, clonedNode) {
                  if (sourceNode.isSkinnedMesh) {
                    meshSources[clonedNode.uuid] = sourceNode;
                    clonedMeshes.push(clonedNode);
                  }
                  if (sourceNode.isBone)
                    boneClones[sourceNode.uuid] = clonedNode;
                }
              );

              for (let i = 0, l = clonedMeshes.length; i < l; i++) {
                const clone = clonedMeshes[i];
                const sourceMesh = meshSources[clone.uuid];
                const sourceBones = sourceMesh.skeleton.bones;

                clone.skeleton = sourceMesh.skeleton.clone();
                clone.bindMatrix.copy(sourceMesh.bindMatrix);

                clone.skeleton.bones = sourceBones.map(function (bone) {
                  return boneClones[bone.uuid];
                });

                clone.bind(clone.skeleton, clone.bindMatrix);
              }
            }

            resetClonedSkinnedMeshes(models.get(modelId), result);

            result.userData.actions = new Map();
            const animationMixer = new AnimationMixer(result);

            animIds.forEach((id) => {
              const animClip = animations.get(id).clone();
              result.animations.push(animClip);
              const action = animationMixer.clipAction(animClip);
              if (animIds.length == 1) action.play();
              result.userData.actions.set(id, action);
            });

            this._animationMixers.push(animationMixer);
          }
          result.name = modelId + "_" + fbxId;
          fbxId++;
          this.scene.add(result);
          return result;
        };

        this.materials = materials;

        const ambienLight = new AmbientLight("white", 0.1);
        this.scene.add(ambienLight);

        // initialize step scene
        config.steps.forEach((s) => s.init(this));

        // start rendering
        {
          const maxFps = 30;
          let fps = maxFps;
          let now;
          let then = Date.now();

          // camera move
          const currentCameraMoveDirection = new Vector3(
            Math.random(),
            Math.random(),
            Math.random()
          );
          const oldCameraPosition = new Vector3();
          const makeCameraDirectionValid = () => {
            // new direction vector have to be in half a space
            let normal;
            const ccp = this.currentStep.cameraPosition;
            const cp = this.camera.position;
            if (
              cp.distanceToSquared(ccp) >
              this.currentStep.maxMovingDistCamera *
                this.currentStep.maxMovingDistCamera
            ) {
              normal = ccp.clone().sub(cp);
              currentCameraMoveDirection.set(
                Math.random(),
                Math.random(),
                Math.random()
              );

              // a bit naive but should works
              if (currentCameraMoveDirection.dot(normal) < 0) {
                currentCameraMoveDirection.x *= -1;
                if (currentCameraMoveDirection.dot(normal) < 0) {
                  currentCameraMoveDirection.y *= -1;
                  if (currentCameraMoveDirection.dot(normal) < 0) {
                    currentCameraMoveDirection.z *= -1;
                  }
                }
              }

              currentCameraMoveDirection.normalize();
              return true;
            }

            return false;
          };

          // looping function
          const tick = () => {
            // optimize fps
            if (this.dt > 2000 / fps) {
              // take two time more than expected to request frame
              fps = Math.max(fps * 0.9, 1); // lower a bit fps
              if (fps < (2 * maxFps) / 3) {
                console.log("ca lag pas mal");
                // baisser la quali de rendu
              }
            } else if (this.dt < 1000 / (fps * 2)) {
              // take two time less than expected to request frame
              fps = Math.min(maxFps, fps * 1.1);
              if (fps == maxFps) {
                // console.log("on est large");
                // augmenter la quali de rendu
              }
            }

            requestAnimationFrame(tick);
            now = Date.now();
            this.dt = now - then;
            if (this.dt > 1000 / fps) {
              then = now - (this.dt % 1000) / fps;

              this._animationMixers.forEach((a) => {
                a.update(this.dt * 0.001);
              });

              if (this.moveCallback) {
                this.moveCallback(this.dt);
              } else if (!window.DEBUG_3D) {
                oldCameraPosition.copy(this.camera.position);

                // move the camera
                this.camera.position.x +=
                  currentCameraMoveDirection.x *
                  this.dt *
                  this.currentStep.movingSpeedCamera;
                this.camera.position.y +=
                  currentCameraMoveDirection.y *
                  this.dt *
                  this.currentStep.movingSpeedCamera;
                this.camera.position.z +=
                  currentCameraMoveDirection.z *
                  this.dt *
                  this.currentStep.movingSpeedCamera;
                this.camera.lookAt(this.currentStep.cameraTarget);

                if (makeCameraDirectionValid()) {
                  this.camera.position.copy(oldCameraPosition);
                }
              }

              this.currentStep.tick();

              this.renderer.render(this.scene, this.camera);
            }
          };
          tick();
        }

        // a tiny wait allow to render well loading screen end transition
        setTimeout(() => {
          this.currentStep.onFocus();
          resolve();
        }, 50);
      });
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
          this._lastStep.onLeave();
          this.currentStep.onFocus();
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
    if (this.isMoving || this._currentIndex + 1 > config.steps.length - 1)
      return Promise.resolve;

    this._lastStep = this.currentStep;
    this._currentIndex++;

    await this.move();
  }

  async movePrevious() {
    if (this.isMoving || this._currentIndex - 1 < 0) return Promise.resolve;

    this._lastStep = this.currentStep;
    this._currentIndex--;

    await this.move();
  }

  async moveToIndex(index) {
    if (
      this._currentIndex == index ||
      this.isMoving ||
      index < 0 ||
      index > config.steps.length - 1
    )
      return Promise.resolve;

    this._lastStep = this.currentStep;
    this._currentIndex = index;

    await this.move();
  }

  computeMouseCoord(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new Vector2(
      ((event.clientX - rect.left) * this.renderer.domElement.width) /
        rect.width,
      ((event.clientY - rect.top) * this.renderer.domElement.height) /
        rect.height
    );
    mouse.x = (mouse.x / this.renderer.domElement.width) * 2 - 1;
    mouse.y = (mouse.y / this.renderer.domElement.height) * -2 + 1; // note we flip Y
    return mouse;
  }
}
