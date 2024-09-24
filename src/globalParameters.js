import {
  MeshBasicMaterial,
  Mesh,
  SphereGeometry,
  Vector3,
  Raycaster,
  PlaneGeometry,
  AmbientLight,
  DirectionalLight,
  Color,
  SpotLight,
  TorusGeometry,
  CircleGeometry,
  Object3D,
  Quaternion,
  Euler,
  BoxGeometry,
} from "three";
import { Background3D } from "./Background3D";

/**
 * @callback StepCallback
 * @param {Step}
 */

export class Step {
  /**
   *
   * @param {Object} params
   * @param {StepCallback} params.onFocus
   * @param {StepCallback} params.onLeave
   * @param {StepCallback} params.tick
   * @param {StepCallback} params.init
   * @param {string} divId
   * @param {Vector3} cameraPosition
   * @param {Vector3} cameraTarget
   */
  constructor(params) {
    /**
     * @type {Background3D}
     */
    this.background3D = null;

    this.onFocus = params.onFocus.bind(this, this);
    this.onLeave = params.onLeave.bind(this, this);
    this.tick = params.tick.bind(this, this);
    this.init = (background3D) => {
      this.background3D = background3D;
      params.init(this);
    };

    this.divId = params.divId;
    this.cameraPosition = params.cameraPosition;
    this.cameraTarget = params.cameraTarget;

    this.nextStepId = params.nextStepId;
    this.previousStepId = params.previousStepId;
  }
}

const raycaster = new Raycaster();

const loopAction = (object, toActionId, duration, onLoopOnce) => {
  if (object.userData.currentActionId == toActionId) return;

  let a1, a2, idCurrent;
  for (const [id, action] of object.userData.actions) {
    if (id == object.userData.currentActionId) {
      a1 = action;
    } else if (id == toActionId) {
      a2 = action;
      idCurrent = id;
    }
  }
  object.userData.currentActionId = idCurrent;

  a2.enabled = true;
  a2.setEffectiveTimeScale(1);
  a2.setEffectiveWeight(1);
  a2.time = 0;
  a2.play();
  if (a1) {
    a1.play();
    a1.crossFadeTo(a2, duration / 1000, true);
  }

  if (onLoopOnce) {
    const c = () => {
      a2._mixer.removeEventListener("loop", c);
      onLoopOnce();
    };
    a2._mixer.addEventListener("loop", c);
  }
};

/**
 *
 * @param {Background3D} background3D
 */
const createMoveCameraCallback = (background3D, speed, maxDist) => {
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
    const ccp = background3D.currentStep.cameraPosition;
    const cp = background3D.camera.position;
    if (cp.distanceToSquared(ccp) > maxDist * maxDist) {
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

  return () => {
    oldCameraPosition.copy(background3D.camera.position);

    // move the camera
    background3D.camera.position.x +=
      currentCameraMoveDirection.x * background3D.dt * speed;
    background3D.camera.position.y +=
      currentCameraMoveDirection.y * background3D.dt * speed;
    background3D.camera.position.z +=
      currentCameraMoveDirection.z * background3D.dt * speed;
    background3D.camera.lookAt(background3D.currentStep.cameraTarget);

    if (makeCameraDirectionValid()) {
      background3D.camera.position.copy(oldCameraPosition);
    }
  };
};

const offsetYPlatform = 50;
const radiusOffsetXZPlatform = 40;

const positionBuffer = new Vector3();
const quaternionBuffer = new Quaternion();
const scaleBuffer = new Vector3();

const setWorldPosition = (object3D, position) => {
  object3D.parent.matrixWorld.decompose(
    positionBuffer,
    quaternionBuffer,
    scaleBuffer
  );

  quaternionBuffer.invert();
  object3D.position.copy(position);
  // in parent referential
  object3D.position.sub(positionBuffer).applyQuaternion(quaternionBuffer);
};

/**
 *
 * @param {Object3D} object3D
 * @param {Euler} euler
 */
const setWorldEuler = (object3D, euler) => {
  object3D.parent.matrixWorld.decompose(
    positionBuffer,
    quaternionBuffer,
    scaleBuffer
  );

  quaternionBuffer.invert();
  const quaternionWorld = new Quaternion().setFromEuler(euler);
  object3D.quaternion.multiplyQuaternions(quaternionBuffer, quaternionWorld);
};

/**
 * @typedef Platform
 * @property {string} name
 * @property {number} size
 * @property {Vector3} position
 * @property {Object3D} object3D
 * @property {SpotLight} spotLight
 */

/**
 * @type {Platform}
 */
const homePlatform = {
  size: 10,
  position: new Vector3(
    radiusOffsetXZPlatform * Math.cos(0),
    2 * offsetYPlatform,
    radiusOffsetXZPlatform * Math.sin(0)
  ),
};

/**
 * @type {Platform}
 */
const projectsPlatform = {
  size: 10,
  position: new Vector3(
    radiusOffsetXZPlatform * Math.cos((2 * Math.PI) / 3),
    offsetYPlatform,
    radiusOffsetXZPlatform * Math.sin((2 * Math.PI) / 3)
  ),
};

/**
 * @type {Platform}
 */
const aboutPlatform = {
  size: 10,
  position: new Vector3(
    radiusOffsetXZPlatform * Math.cos((4 * Math.PI) / 3),
    0,
    radiusOffsetXZPlatform * Math.sin((4 * Math.PI) / 3)
  ),
};

/**
 * @type {Mesh}
 */
let popupBuilderMesh,
  smaioIPlanMesh,
  openSourceContributionsMesh,
  udImuvMesh,
  galeri3Mesh;

/**
 *
 * @param {Background3D} background3D
 */
export const globalInit = (background3D) => {
  const ambienLight = new AmbientLight("white", 0.05);
  background3D.scene.add(ambienLight);

  /**
   *
   * @param {Platform} platform
   */
  const initPlatformScene = (platform) => {
    // ground
    const ground = new Mesh(
      new CircleGeometry(platform.size),
      background3D.materials.get("parquet").clone()
    );
    ground.name = "ground";
    ground.receiveShadow = true;
    ground.rotation.x = -Math.PI / 2;

    platform.object3D = new Object3D();
    platform.object3D.position.copy(platform.position);
    platform.object3D.add(ground);
    background3D.scene.add(platform.object3D);

    // lighting
    const spotLight = new SpotLight();
    spotLight.position
      .set(platform.size, platform.size, 0)
      .add(platform.position);
    spotLight.target.position.copy(platform.position);
    spotLight.castShadow = true;
    spotLight.power = 5;
    spotLight.decay = 0.35;
    spotLight.angle = 0.2;
    spotLight.penumbra = 0.27;
    spotLight.shadow.mapSize.set(4096, 4096);
    spotLight.shadow.camera.far = 20;
    spotLight.shadow.camera.focus = 1;
    platform.spotLight = spotLight;
    background3D.scene.add(spotLight);
  };

  initPlatformScene(homePlatform);
  initPlatformScene(projectsPlatform);

  // projects meshes
  popupBuilderMesh = new Mesh(
    new BoxGeometry(),
    background3D.materials.get("red")
  );
  popupBuilderMesh.position.set(
    0.8 * projectsPlatform.size * Math.cos(0),
    0,
    0.8 * projectsPlatform.size * Math.sin(0)
  );
  smaioIPlanMesh = new Mesh(
    new BoxGeometry(),
    background3D.materials.get("green")
  );
  smaioIPlanMesh.position.set(
    0.8 * projectsPlatform.size * Math.cos((2 * Math.PI) / 5),
    0,
    0.8 * projectsPlatform.size * Math.sin((2 * Math.PI) / 5)
  );
  openSourceContributionsMesh = new Mesh(
    new BoxGeometry(),
    background3D.materials.get("blue")
  );
  openSourceContributionsMesh.position.set(
    0.8 * projectsPlatform.size * Math.cos((4 * Math.PI) / 5),
    0,
    0.8 * projectsPlatform.size * Math.sin((4 * Math.PI) / 5)
  );
  udImuvMesh = new Mesh(
    new BoxGeometry(),
    background3D.materials.get("yellow")
  );
  udImuvMesh.position.set(
    0.8 * projectsPlatform.size * Math.cos((6 * Math.PI) / 5),
    0,
    0.8 * projectsPlatform.size * Math.sin((6 * Math.PI) / 5)
  );
  galeri3Mesh = new Mesh(
    new BoxGeometry(),
    background3D.materials.get("orange")
  );
  galeri3Mesh.position.set(
    0.8 * projectsPlatform.size * Math.cos((8 * Math.PI) / 5),
    0,
    0.8 * projectsPlatform.size * Math.sin((8 * Math.PI) / 5)
  );
  projectsPlatform.object3D.add(
    popupBuilderMesh,
    smaioIPlanMesh,
    openSourceContributionsMesh,
    udImuvMesh,
    galeri3Mesh
  );

  initPlatformScene(aboutPlatform);
};

export const globalParameters = {
  steps: new Map([
    [
      "home",
      new Step({
        init: function (_this) {
          // piano
          const piano = _this.background3D.createFromFBX("piano");
          piano.position.set(1.04, -0.01, 0.08);
          piano.rotation.set(-3.14, 0, -3.14);
          homePlatform.object3D.add(piano);

          // piano player
          const pianoPlayer = _this.background3D.createFromFBX("pink_guy", [
            "piano_playing",
          ]);
          homePlatform.object3D.add(pianoPlayer);

          // guy laying
          const guyLaying = _this.background3D.createFromFBX("blue_guy", [
            "laying_pose",
          ]);
          homePlatform.object3D.add(guyLaying);
          guyLaying.position.set(2, 0, -0.38);
          guyLaying.rotation.set(0, -0.97, 0);

          _this.moveCameraCallback = createMoveCameraCallback(
            _this.background3D,
            0.00005,
            1
          );

          _this.cursorMesh = new Mesh(
            new TorusGeometry(0.25, 0.05),
            new MeshBasicMaterial()
          );
          _this.cursorMesh.scale.set(1, 1, 0.01);
          _this.cursorMesh.rotation.x = -Math.PI * 0.5;
          homePlatform.object3D.add(_this.cursorMesh);

          _this.happyWalker = _this.background3D.createFromFBX("blue_guy", [
            "happy_walk",
            "happy_idle",
            "waving",
          ]);
          _this.happyWalker.position.x = homePlatform.size * 0.5;
          loopAction(_this.happyWalker, "happy_idle");
          homePlatform.object3D.add(_this.happyWalker);
          homePlatform.spotLight.target = _this.happyWalker;

          _this.happyWalkerDestination = null;
          _this.onClick = () => {
            if (!_this.cursorMesh.visible) return;
            _this.happyWalkerDestination = _this.cursorMesh.position.clone();
          };

          _this.onMouseMove = (event) => {
            raycaster.setFromCamera(
              _this.background3D.computeMouseCoord(event),
              _this.background3D.camera
            );
            const intersects = raycaster.intersectObject(
              homePlatform.object3D.getObjectByName("ground")
            );
            if (intersects.length) {
              setWorldPosition(_this.cursorMesh, intersects[0].point);
            }
          };
        },
        onFocus: function (_this) {
          homePlatform.spotLight.intensity = 0;
          _this.cursorMesh.visible = true;

          window.addEventListener("mousemove", _this.onMouseMove);
          window.addEventListener("mouseup", _this.onClick);
        },
        onLeave: function (_this) {
          _this.cursorMesh.visible = false;
          homePlatform.spotLight.intensity = 0;

          window.removeEventListener("mousemove", _this.onMouseMove);
          window.removeEventListener("mouseup", _this.onClick);
          loopAction(_this.happyWalker, "happy_idle", 700);
        },
        tick: function (_this) {
          homePlatform.spotLight.intensity = Math.min(
            1,
            homePlatform.spotLight.intensity + 0.0005 * _this.background3D.dt
          );
          _this.moveCameraCallback();
          homePlatform.object3D.rotation.y += 0.000005 * _this.background3D.dt;

          _this.cursorMesh.visible = !_this.happyWalkerDestination;

          // happy walker
          if (!_this.happyWalkerDestination) {
            loopAction(_this.happyWalker, "happy_idle", 700);
          } else {
            const dir = _this.happyWalkerDestination
              .clone()
              .sub(_this.happyWalker.position);

            if (dir.lengthSq() < 0.1) {
              const dirCam = _this.background3D.camera.position
                .clone()
                .sub(_this.happyWalker.getWorldPosition(positionBuffer));

              setWorldEuler(
                _this.happyWalker,
                new Euler(0, Math.atan2(dirCam.x, dirCam.z), 0)
              );

              loopAction(_this.happyWalker, "waving", 200, () => {
                loopAction(_this.happyWalker, "happy_idle", 100);
                _this.happyWalkerDestination = null;
              });
            } else {
              loopAction(_this.happyWalker, "happy_walk", 500);

              _this.happyWalker.rotation.y = Math.atan2(dir.x, dir.z);
              _this.happyWalker.rotation.x = _this.happyWalker.rotation.z = 0;

              dir.normalize();
              const speed = 0.001;
              _this.happyWalker.position.x +=
                dir.x * speed * _this.background3D.dt;
              _this.happyWalker.position.y +=
                dir.y * speed * _this.background3D.dt;
              _this.happyWalker.position.z +=
                dir.z * speed * _this.background3D.dt;
            }
          }
        },
        divId: "home",
        cameraPosition: new Vector3(
          homePlatform.size * 2.3,
          homePlatform.position.y + 4,
          0
        ),
        cameraTarget: homePlatform.position.clone(),
        nextStepId: "projects",
      }),
    ],
    [
      "projects",
      new Step({
        previousStepId: "home",
        nextStepId: "about",
        init: function (_this) {
          // by default target popup
          const offset = Math.PI / 2 + Math.PI / 8;
          _this.rotationYDest = offset;
          projectsPlatform.object3D.rotation.y = _this.rotationYDest;
          popupBuilderMesh.getWorldPosition(
            projectsPlatform.spotLight.target.position
          );
          projectsPlatform.spotLight.target.updateMatrixWorld();

          _this.selectProject3D = (id) => {
            switch (id) {
              case "popup_builder":
                _this.rotationYDest = 0;
                projectsPlatform.spotLight.target = popupBuilderMesh;
                break;
              case "smaio_i_plan":
                _this.rotationYDest = (2 * Math.PI) / 5;
                projectsPlatform.spotLight.target = smaioIPlanMesh;
                break;
              case "open_source_contributions":
                _this.rotationYDest = (4 * Math.PI) / 5;
                projectsPlatform.spotLight.target = openSourceContributionsMesh;
                break;
              case "ud_imuv":
                _this.rotationYDest = (6 * Math.PI) / 5;
                projectsPlatform.spotLight.target = udImuvMesh;
                break;
              case "galeri3":
                _this.rotationYDest = (8 * Math.PI) / 5;
                projectsPlatform.spotLight.target = galeri3Mesh;
                break;
              default:
                break;
            }
            _this.rotationYDest += offset;
            _this.rotationYDest %= 2 * Math.PI;

            const ry = projectsPlatform.object3D.rotation.y;
            const diff1 = Math.abs(ry + 2 * Math.PI - _this.rotationYDest);
            const diff2 = Math.abs(ry - 2 * Math.PI - _this.rotationYDest);
            const diff3 = Math.abs(ry - _this.rotationYDest);
            if (diff1 < diff2 && diff1 < diff3) {
              projectsPlatform.object3D.rotation.y += 2 * Math.PI;
            } else if (diff2 < diff1 && diff2 < diff3) {
              projectsPlatform.object3D.rotation.y -= 2 * Math.PI;
            }
          };
        },
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {
          const speed = 0.001;
          // _this.rotationYDest 0 => 2pi
          if (
            Math.abs(
              projectsPlatform.object3D.rotation.y - _this.rotationYDest
            ) >
            100 * speed
          ) {
            if (
              projectsPlatform.object3D.rotation.y - _this.rotationYDest <
              0
            ) {
              projectsPlatform.object3D.rotation.y +=
                speed * _this.background3D.dt;
            } else {
              projectsPlatform.object3D.rotation.y -=
                speed * _this.background3D.dt;
            }
            projectsPlatform.spotLight.target.updateMatrixWorld();
          }
        },
        divId: "projects",
        cameraPosition: new Vector3(
          projectsPlatform.size * 2.3 * Math.cos((2 * Math.PI) / 3),
          projectsPlatform.position.y + 4,
          projectsPlatform.size * 2.3 * Math.sin((2 * Math.PI) / 3)
        ),
        cameraTarget: projectsPlatform.position.clone(),
      }),
    ],
    [
      "about",
      new Step({
        previousStepId: "projects",
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "about",
        cameraPosition: new Vector3(
          aboutPlatform.size * 2.3 * Math.cos((4 * Math.PI) / 3),
          aboutPlatform.position.y + 4,
          aboutPlatform.size * 2.3 * Math.sin((4 * Math.PI) / 3)
        ),
        cameraTarget: aboutPlatform.position.clone(),
      }),
    ],
    [
      "popup_builder",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "popup_builder_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "smaio_i_plan",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "smaio_i_plan_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "ud_imuv",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "ud_imuv_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "open_source_contributions",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "open_source_contributions_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
    [
      "galeri3",
      new Step({
        init: function (_this) {},
        onFocus: function (_this) {},
        onLeave: function (_this) {},
        tick: function (_this) {},
        divId: "galeri3_step",
        cameraPosition: new Vector3(
          70.88385204449825,
          12.509098432068043,
          -6.149763100098089
        ),
        cameraTarget: new Vector3(
          35.62221594037345,
          -16.007222546768897,
          6.0484699638794295
        ),
      }),
    ],
  ]),
  initial_id: "home",
  duration_step_move: 1000,
  fbx: {
    models: {
      blue_guy: { scale: 0.01, path: "./assets/fbx/blue_guy_model.fbx" },
      pink_guy: { scale: 0.01, path: "./assets/fbx/pink_guy_model.fbx" },
      piano: { scale: 0.01, path: "./assets/fbx/piano_model.fbx" },
    },
    animations: {
      waving: { scale: 1, path: "./assets/fbx/waving_anim.fbx" },
      start_plank: { scale: 1, path: "./assets/fbx/start_plank_anim.fbx" },
      happy_walk: { scale: 1, path: "./assets/fbx/happy_walk_anim.fbx" },
      running: { scale: 1, path: "./assets/fbx/running_anim.fbx" },
      happy_idle: { scale: 1, path: "./assets/fbx/happy_idle_anim.fbx" },
      laying_pose: { scale: 1, path: "./assets/fbx/laying_pose_anim.fbx" },
      sitting_laughing: {
        scale: 1,
        path: "./assets/fbx/sitting_laughing_anim.fbx",
      },
      breakdance_1990: {
        scale: 1,
        path: "./assets/fbx/breakdance_1990_anim.fbx",
      },
      rumba_dancing: { scale: 1, path: "./assets/fbx/rumba_dancing_anim.fbx" },
      piano_playing: { scale: 1, path: "./assets/fbx/piano_playing_anim.fbx" },
    },
  },
  materials: {
    parquet: {
      scale: 4,
      color: "./assets/img/material/parquet/parquet_color.jpg",
      ao: "./assets/img/material/parquet/parquet_ao.jpg",
      normal: "./assets/img/material/parquet/parquet_normal.jpg",
      roughness: "./assets/img/material/parquet/parquet_roughness.jpg",
    },
  },
};
