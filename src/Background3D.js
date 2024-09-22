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
  PlaneGeometry,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { config } from "./config";
import { quadraticInOut } from "./utils";
import { createInspector } from "three-inspect/vanilla";
import { AjaxTextureLoader } from "./AjaxTextureLoader";

export class Background3D {
  constructor(canvas) {
    this._currentIndex = 0;

    // scene
    this.scene = new Scene();

    // renderer
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    this.renderer.setClearColor(new Color(0.5, 0.5, 0.5), 1);
    this.renderer.shadowMap.enabled = true;

    // camera
    this.camera = new PerspectiveCamera();
    const { position, quaternion } =
      this._computeCurrentCameraPositionQuaternion();
    this.camera.position.copy(position);
    this.camera.quaternion.copy(quaternion);
    this.camera.updateProjectionMatrix();

    // lighting
    const ambienLight = new AmbientLight("white", 0.1);
    this.scene.add(ambienLight);

    const directLight = new DirectionalLight(new Color("white"), 0.9);
    directLight.position.set(100, 100, 100);
    directLight.castShadow = true;
    directLight.shadow.mapSize.set(4096, 4096);
    directLight.shadow.camera.far = 200;
    const cameraSize = 10;
    directLight.shadow.camera.top = -cameraSize;
    directLight.shadow.camera.bottom = cameraSize;
    directLight.shadow.camera.left = -cameraSize;
    directLight.shadow.camera.right = cameraSize;
    directLight.lookAt(new Vector3()); //wip
    this.scene.add(directLight);

    // animation mixers
    this._animationMixers = [];

    // debug
    if (window.DEBUG_3D) {
      this.scene.add(new Mesh(new BoxGeometry(), new MeshBasicMaterial()));
      const controls = new OrbitControls(this.camera, this.renderer.domElement); // free camera not working on threlte
      window.onkeyup = (event) => {
        if (event.key == "a") controls.enabled = !controls.enabled;
      };
      const targetElement = document.createElement("div");
      document.getElementById("move_to_home").appendChild(targetElement);
      const inspector = createInspector(targetElement, {
        scene: this.scene,
        camera: this.camera,
        renderer: this.renderer,
      });
    }
    // debug
    window.onkeyup = (event) => {
      console.log(this.scene);
      console.log(this.camera);
    };

    this.moveCallback = null;
    this.isMoving = false;
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
      object.traverse((child) => (child.castShadow = true));
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
          config.materials[id].displacement,
          config.materials[id].scale,
          (texture) => {
            result.displacementMap = texture;
            result.displacementScale = 0.1;
          }
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
        // everything is loaded populate scene 3D

        /**
         *
         * @param {string} modelId
         * @param {string} animId
         * @returns {Object3D}
         */
        const createFromFBX = (modelId, animId) => {
          const result = models.get(modelId).clone();
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

            parallelTraverse(source, clone, function (sourceNode, clonedNode) {
              if (sourceNode.isSkinnedMesh) {
                meshSources[clonedNode.uuid] = sourceNode;
                clonedMeshes.push(clonedNode);
              }
              if (sourceNode.isBone) boneClones[sourceNode.uuid] = clonedNode;
            });

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

          const animClip = animations.get(animId).clone();
          result.animations.push(animClip);
          const animationMixer = new AnimationMixer(result);
          animationMixer.clipAction(animClip).play();
          this._animationMixers.push(animationMixer);

          result.name = modelId + "_" + animId;

          this.scene.add(result);
          return result;
        };

        // createFromFBX("pink_guy", "sitting_laughing").position.set(3, 0, 0);
        // createFromFBX("blue_guy", "rumba_dancing").position.set(2, 0, 0);
        // createFromFBX("pink_guy", "breakdance_1990").position.set(1, 0, 0);
        // createFromFBX("blue_guy", "start_plank").position.set(0, 0, 0);

        // create a parquet floor
        const floor = new Mesh(
          new PlaneGeometry(5, 5),
          materials.get("parquet").clone()
        );
        floor.uuid = "floor";
        floor.receiveShadow = true;
        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);

        // start rendering
        const maxFps = 30;
        let fps = maxFps;
        let now;
        let then = Date.now();
        let delta;

        // camera move
        const currentCameraMoveDirection = new Vector3(
          Math.random(),
          Math.random(),
          Math.random()
        );
        const maxDistCamera = 3;
        const cameraSpeed = 0.0004;
        const oldCameraPosition = new Vector3();
        const makeCameraDirectionValid = () => {
          // new direction vector have to be in half a space => dot should be positive with a certain plane

          // find normal of that plane if maxDist is met
          const planeNormal = new Vector3();
          const ccp = config.steps[this._currentIndex].camera_position;
          const cp = this.camera.position;
          let outOfMaxDist = false;
          if (Math.abs(cp.x - ccp.x) > maxDistCamera) {
            planeNormal.set(-(cp.x - ccp.x), 0, 0);
            outOfMaxDist = true;
          } else if (Math.abs(cp.y - ccp.y) > maxDistCamera) {
            planeNormal.set(0, -(cp.y - ccp.y), 0);
            outOfMaxDist = true;
          } else if (Math.abs(cp.z - ccp.z) > maxDistCamera) {
            planeNormal.set(0, 0, -(cp.z - ccp.z));
            outOfMaxDist = true;
          }

          if (outOfMaxDist) {
            currentCameraMoveDirection.set(
              Math.random(),
              Math.random(),
              Math.random()
            );

            // a bit naive but should works
            if (currentCameraMoveDirection.dot(planeNormal) < 0) {
              currentCameraMoveDirection.x *= -1;
              if (currentCameraMoveDirection.dot(planeNormal) < 0) {
                currentCameraMoveDirection.y *= -1;
                if (currentCameraMoveDirection.dot(planeNormal) < 0) {
                  currentCameraMoveDirection.z *= -1;
                }
              }
            }

            currentCameraMoveDirection.normalize();
            console.log(currentCameraMoveDirection);
          }

          return outOfMaxDist;
        };

        // looping function
        const tick = () => {
          // optimize fps
          if (delta > 2000 / fps) {
            // take two time more than expected to request frame
            fps = Math.max(fps * 0.9, 1); // lower a bit fps
            if (fps < (2 * maxFps) / 3) {
              console.log("ca lag pas mal");
              // baisser la quali de rendu
            }
          } else if (delta < 1000 / (fps * 2)) {
            // take two time less than expected to request frame
            fps = Math.min(maxFps, fps * 1.1);
            if (fps == maxFps) {
              // console.log("on est large");
              // augmenter la quali de rendu
            }
          }

          requestAnimationFrame(tick);
          now = Date.now();
          delta = now - then;
          if (delta > 1000 / fps) {
            then = now - (delta % 1000) / fps;

            this._animationMixers.forEach((a) => a.update(delta * 0.001));

            if (this.moveCallback) {
              this.moveCallback(delta);
            } else {
              oldCameraPosition.copy(this.camera.position);

              // make slowly move the camera
              this.camera.position.x +=
                currentCameraMoveDirection.x * delta * cameraSpeed;
              this.camera.position.y +=
                currentCameraMoveDirection.y * delta * cameraSpeed;
              this.camera.position.z +=
                currentCameraMoveDirection.z * delta * cameraSpeed;
              this.camera.lookAt(
                config.steps[this._currentIndex].camera_target
              );

              if (makeCameraDirectionValid()) {
                this.camera.position.copy(oldCameraPosition);
              }
            }

            config.steps[this._currentIndex].stepScene.tick(this, delta);

            this.renderer.render(this.scene, this.camera);
          }
        };
        tick();

        // a tiny wait allow to render well loading screen end transition
        setTimeout(() => {
          config.steps[this._currentIndex].stepScene.onFocus(this);
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

      console.log(startPosition, position);
      console.log(startQuaternion, quaternion);

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
          config.steps[this._currentIndex].stepScene.onFocus();
          resolve(true);
        }
      };
    });
  }

  _computeCurrentCameraPositionQuaternion() {
    const obj = new PerspectiveCamera();
    obj.position.copy(config.steps[this._currentIndex].camera_position);
    obj.lookAt(config.steps[this._currentIndex].camera_target);

    return { position: obj.position, quaternion: obj.quaternion };
  }

  async moveNext() {
    if (this.isMoving || this._currentIndex + 1 > config.steps.length - 1)
      return Promise.resolve;

    config.steps[this._currentIndex].stepScene.onLeave(this);
    this._currentIndex++;

    await this.move();
  }

  async movePrevious() {
    if (this.isMoving || this._currentIndex - 1 < 0) return Promise.resolve;

    config.steps[this._currentIndex].stepScene.onLeave(this);
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

    config.steps[this._currentIndex].stepScene.onLeave(this);
    this._currentIndex = index;

    await this.move();
  }
}
